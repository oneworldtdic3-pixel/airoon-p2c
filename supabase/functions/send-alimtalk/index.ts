// 카카오 알림톡 발송 — DB 크론/트리거가 호출 → 솔라피 알림톡 API
//
//  POST { kind: 'reminder' }                      매 분 크론: 10분 뒤 시작하는 프로그램 예약자(동의+휴대폰)에게 리마인드
//  POST { kind: 'notice', notification_id }       알림 발행 트리거: 동의자 전원에게 공지
//  인증: 헤더 x-cron-secret 을 DB Vault 의 값과 대조 (alimtalk_check_secret)
//
//  시크릿(대시보드 Edge Functions → Secrets):
//    SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER_NUMBER   (SMS 인증과 공용)
//    SOLAPI_PF_ID             카카오 비즈니스 채널 ID (솔라피 콘솔 → 카카오 채널 연동 후 발급)
//    SOLAPI_TPL_REMINDER      승인된 '예약 리마인드' 템플릿 ID
//    SOLAPI_TPL_NOTICE        승인된 '운영 공지' 템플릿 ID
//    ALIMTALK_SMS_FALLBACK    'true' 면 알림톡 실패 시 문자로 대체 발송(과금). 기본 false
//  템플릿 ID 가 없으면 아무것도 보내지 않고 skipped 로 응답한다 (승인 전 안전).
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const API_KEY = Deno.env.get('SOLAPI_API_KEY') ?? ''
const API_SECRET = Deno.env.get('SOLAPI_API_SECRET') ?? ''
const SENDER = (Deno.env.get('SOLAPI_SENDER_NUMBER') ?? '').replace(/\D/g, '')
const PF_ID = Deno.env.get('SOLAPI_PF_ID') ?? ''
const TPL = { reminder: Deno.env.get('SOLAPI_TPL_REMINDER') ?? '', notice: Deno.env.get('SOLAPI_TPL_NOTICE') ?? '' }
const SMS_FALLBACK = Deno.env.get('ALIMTALK_SMS_FALLBACK') === 'true'
const APP_URL = 'https://sansacamp.com'
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })

type Kind = 'reminder' | 'notice'
type Target = { user_id: string; phone: string; ref_id: string; variables: Record<string, string> }

const enc = new TextEncoder()
const hex = (b: ArrayBuffer) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('')
async function solapiAuth() {
  const date = new Date().toISOString()
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)).buffer)
  const k = await crypto.subtle.importKey('raw', enc.encode(API_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = hex(await crypto.subtle.sign('HMAC', k, enc.encode(date + salt)))
  return `HMAC-SHA256 apiKey=${API_KEY}, date=${date}, salt=${salt}, signature=${sig}`
}
const toDomestic = (p: string) => { const d = p.replace(/\D/g, ''); return d.startsWith('82') ? '0' + d.slice(2) : d }
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { 'Content-Type': 'application/json' } })
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false })

// ---- 대상 조회 ---------------------------------------------------------------------------------
async function reminderTargets(): Promise<Target[]> {
  // 크론이 매 분 돌므로 [지금+9분30초, 지금+10분30초) 창에 시작하는 회차만 — 한 예약당 한 번
  const from = new Date(Date.now() + 9.5 * 60_000).toISOString()
  const to = new Date(Date.now() + 10.5 * 60_000).toISOString()
  const { data, error } = await admin
    .from('bookings')
    .select('id, user_id, program_sessions!inner(starts_at, programs!inner(title, location)), profiles!inner(phone, nickname, kakao_alimtalk_consent)')
    .eq('status', 'confirmed')
    .gte('program_sessions.starts_at', from).lt('program_sessions.starts_at', to)
    .eq('profiles.kakao_alimtalk_consent', true).not('profiles.phone', 'is', null)
  if (error) throw error
  type Row = { id: string; user_id: string; program_sessions: { starts_at: string; programs: { title: string; location: string } }; profiles: { phone: string; nickname: string } }
  return ((data ?? []) as unknown as Row[]).map((r) => ({
    user_id: r.user_id, phone: r.profiles.phone, ref_id: r.id,
    variables: { '#{닉네임}': r.profiles.nickname, '#{프로그램}': r.program_sessions.programs.title, '#{시간}': fmtTime(r.program_sessions.starts_at), '#{장소}': r.program_sessions.programs.location || '행사장' },
  }))
}
async function noticeTargets(notificationId: string): Promise<Target[]> {
  const { data: n, error: e1 } = await admin.from('notifications').select('id, title, body').eq('id', notificationId).single()
  if (e1 || !n) throw e1 ?? new Error('notification not found')
  const { data, error } = await admin.from('profiles').select('id, phone').eq('kakao_alimtalk_consent', true).not('phone', 'is', null)
  if (error) throw error
  return (data ?? []).map((p) => ({ user_id: p.id, phone: p.phone as string, ref_id: n.id, variables: { '#{제목}': n.title, '#{내용}': n.body || n.title } }))
}

// ---- 발송 + 기록 -------------------------------------------------------------------------------
async function send(kind: Kind, targets: Target[]) {
  // 이미 보낸 것 제외
  const { data: done } = await admin.from('alimtalk_log').select('user_id, ref_id').eq('kind', kind).in('ref_id', [...new Set(targets.map((t) => t.ref_id))])
  const doneKey = new Set((done ?? []).map((d) => `${d.ref_id}:${d.user_id}`))
  const todo = targets.filter((t) => !doneKey.has(`${t.ref_id}:${t.user_id}`))
  if (!todo.length) return { sent: 0, failed: 0, skipped: targets.length }

  const messages = todo.map((t) => ({
    to: toDomestic(t.phone), from: SENDER,
    kakaoOptions: { pfId: PF_ID, templateId: TPL[kind], variables: { ...t.variables, '#{링크}': APP_URL }, disableSms: !SMS_FALLBACK },
  }))
  const res = await fetch('https://api.solapi.com/messages/v4/send-many/detail', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: await solapiAuth() },
    body: JSON.stringify({ messages }), signal: AbortSignal.timeout(15000),
  })
  const body = (await res.json().catch(() => ({}))) as { failedMessageList?: { to?: string; statusMessage?: string; errorMessage?: string }[]; errorCode?: string; errorMessage?: string }
  const failedByTo = new Map((body.failedMessageList ?? []).map((f) => [f.to ?? '', f.errorMessage ?? f.statusMessage ?? 'failed']))
  const allFailed = !res.ok ? `${res.status} ${body.errorCode ?? ''} ${body.errorMessage ?? ''}`.trim() : null

  const rows = todo.map((t) => {
    const err = allFailed ?? failedByTo.get(toDomestic(t.phone)) ?? null
    return { kind, ref_id: t.ref_id, user_id: t.user_id, phone: toDomestic(t.phone), status: err ? 'failed' : 'sent', error: err }
  })
  const { error } = await admin.from('alimtalk_log').upsert(rows, { onConflict: 'kind,ref_id,user_id' })
  if (error) console.error('alimtalk_log upsert', error.message)
  const failed = rows.filter((r) => r.status === 'failed').length
  if (failed) console.error(`send-alimtalk ${kind}: ${failed}/${rows.length} 실패`, allFailed ?? [...failedByTo.values()].slice(0, 3))
  return { sent: rows.length - failed, failed, skipped: targets.length - todo.length }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405)
  const secret = req.headers.get('x-cron-secret') ?? ''
  const { data: ok } = await admin.rpc('alimtalk_check_secret', { p: secret })
  if (!ok) return json({ error: 'unauthorized' }, 401)

  let payload: { kind?: Kind; notification_id?: string } = {}
  try { payload = await req.json() } catch { /* empty body */ }
  const kind = payload.kind
  if (kind !== 'reminder' && kind !== 'notice') return json({ error: 'bad kind' }, 400)

  if (!API_KEY || !API_SECRET || !SENDER || !PF_ID || !TPL[kind]) {
    return json({ skipped: 'not_configured', missing: { pf: !PF_ID, template: !TPL[kind] } })
  }
  try {
    const targets = kind === 'reminder' ? await reminderTargets() : await noticeTargets(payload.notification_id ?? '')
    if (!targets.length) return json({ sent: 0 })
    return json(await send(kind, targets))
  } catch (e) {
    console.error('send-alimtalk', e instanceof Error ? e.message : e)
    return json({ error: 'internal' }, 500)
  }
})
