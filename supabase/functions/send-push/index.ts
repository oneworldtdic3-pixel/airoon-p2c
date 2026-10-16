// 앱 푸시 알림 발송 (Web Push) — DB 크론/트리거, 또는 기기 자체 테스트가 호출
//
//  POST { kind: 'init' }                          VAPID 키가 없으면 만들어 Vault 에 저장 (개인키는 서버 밖으로 나가지 않음)
//  POST { kind: 'reminder' }                      매 분 크론: 10분 뒤 시작하는 프로그램 예약자의 기기로
//  POST { kind: 'notice', notification_id }       알림 발행 트리거: 구독한 모든 기기로
//  POST { kind: 'self-test', endpoint }           기기 스스로 테스트 (이미 등록된 그 endpoint 로만 보냄)
//  인증: init·reminder·notice 는 헤더 x-cron-secret 을 Vault 값과 대조 (alimtalk_check_secret 공용)
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { generateVapidKeys, sendPush, type PushSub, type VapidKeys } from './webpush.ts'

const SUBJECT = 'mailto:info@airoon.kr'
const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info' } })
const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false })

type Sub = PushSub & { id: string }
type Msg = { title: string; body: string; url: string; tag: string }
type Job = { sub: Sub; msg: Msg; ref_id: string }

let cachedKeys: VapidKeys | null = null
async function vapid(create = false): Promise<VapidKeys | null> {
  if (cachedKeys) return cachedKeys
  const { data } = await admin.rpc('push_vapid_get')
  const got = data as { public_key: string | null; private_jwk: string | null } | null
  if (got?.public_key && got.private_jwk) return (cachedKeys = { publicKey: got.public_key, privateJwk: JSON.parse(got.private_jwk) })
  if (!create) return null
  const k = await generateVapidKeys()
  const { error } = await admin.rpc('push_vapid_set', { p_public: k.publicKey, p_private: JSON.stringify(k.privateJwk) })
  if (error) throw error
  return vapid(false)
}

// ---- 대상 ---------------------------------------------------------------------------------------
async function reminderJobs(): Promise<Job[]> {
  const from = new Date(Date.now() + 9.5 * 60_000).toISOString()
  const to = new Date(Date.now() + 10.5 * 60_000).toISOString()
  const { data, error } = await admin
    .from('bookings')
    .select('id, user_id, program_sessions!inner(starts_at, programs!inner(title, location))')
    .eq('status', 'confirmed')
    .gte('program_sessions.starts_at', from).lt('program_sessions.starts_at', to)
  if (error) throw error
  type Row = { id: string; user_id: string; program_sessions: { starts_at: string; programs: { title: string; location: string } } }
  const rows = (data ?? []) as unknown as Row[]
  if (!rows.length) return []
  const { data: subs, error: e2 } = await admin.from('push_subscriptions').select('id, endpoint, p256dh, auth, user_id').in('user_id', [...new Set(rows.map((r) => r.user_id))])
  if (e2) throw e2
  return rows.flatMap((r) => (subs ?? []).filter((s) => s.user_id === r.user_id).map((s) => ({
    sub: s as Sub, ref_id: r.id,
    msg: { title: `10분 뒤 시작 · ${r.program_sessions.programs.title}`, body: `${fmtTime(r.program_sessions.starts_at)} ${r.program_sessions.programs.location || '행사장'} · QR 팔찌로 체크인해 주세요`, url: '/reserve?tab=program', tag: `reminder-${r.id}` },
  })))
}
async function noticeJobs(notificationId: string): Promise<Job[]> {
  const { data: n, error } = await admin.from('notifications').select('id, title, body').eq('id', notificationId).single()
  if (error || !n) throw error ?? new Error('notification not found')
  const subs: Sub[] = []
  for (let from = 0; ; from += 1000) {
    const { data, error: e2 } = await admin.from('push_subscriptions').select('id, endpoint, p256dh, auth').range(from, from + 999)
    if (e2) throw e2
    subs.push(...((data ?? []) as Sub[]))
    if (!data || data.length < 1000) break
  }
  return subs.map((s) => ({ sub: s, ref_id: n.id, msg: { title: n.title, body: n.body || '', url: '/notifications', tag: `notice-${n.id}` } }))
}

// ---- 발송 + 기록 -------------------------------------------------------------------------------
async function run(kind: 'reminder' | 'notice', jobs: Job[], keys: VapidKeys) {
  if (!jobs.length) return { sent: 0, failed: 0, skipped: 0 }
  const { data: done } = await admin.from('push_log').select('ref_id, subscription_id').eq('kind', kind).in('ref_id', [...new Set(jobs.map((j) => j.ref_id))])
  const doneKey = new Set((done ?? []).map((d) => `${d.ref_id}:${d.subscription_id}`))
  const todo = jobs.filter((j) => !doneKey.has(`${j.ref_id}:${j.sub.id}`))
  const logs: { kind: string; ref_id: string; subscription_id: string; status: string; error: string | null }[] = []
  const gone: string[] = []
  for (let i = 0; i < todo.length; i += 25) {
    await Promise.all(todo.slice(i, i + 25).map(async (j) => {
      try {
        const r = await sendPush(j.sub, j.msg, keys, SUBJECT)
        if (r.gone) gone.push(j.sub.id)
        else logs.push({ kind, ref_id: j.ref_id, subscription_id: j.sub.id, status: r.ok ? 'sent' : 'failed', error: r.error })
      } catch (e) {
        logs.push({ kind, ref_id: j.ref_id, subscription_id: j.sub.id, status: 'failed', error: e instanceof Error ? e.message.slice(0, 200) : 'error' })
      }
    }))
  }
  if (logs.length) {
    const { error } = await admin.from('push_log').upsert(logs, { onConflict: 'kind,ref_id,subscription_id' })
    if (error) console.error('push_log upsert', error.message)
  }
  // 만료된 구독(앱 삭제·권한 해제)은 정리
  if (gone.length) await admin.from('push_subscriptions').delete().in('id', gone)
  const failed = logs.filter((l) => l.status === 'failed').length
  if (failed) console.error(`send-push ${kind}: ${failed}/${todo.length} 실패`, logs.filter((l) => l.error).slice(0, 3).map((l) => l.error))
  return { sent: logs.length - failed, failed, expired: gone.length, skipped: jobs.length - todo.length }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return json({})
  if (req.method !== 'POST') return json({ error: 'method' }, 405)
  let payload: { kind?: string; notification_id?: string; endpoint?: string } = {}
  try { payload = await req.json() } catch { /* empty body */ }
  const kind = payload.kind

  try {
    if (kind === 'self-test') {
      // 기기 자신의 endpoint 로만 보낸다 — 이미 구독된 endpoint 가 아니면 거절
      const { data: s } = await admin.from('push_subscriptions').select('id, endpoint, p256dh, auth').eq('endpoint', payload.endpoint ?? '').maybeSingle()
      if (!s) return json({ error: 'not_subscribed' }, 404)
      const keys = await vapid()
      if (!keys) return json({ error: 'not_configured' }, 503)
      const r = await sendPush(s as Sub, { title: '산사캠프 알림이 켜졌어요', body: '행사 공지와 예약 10분 전 안내를 이렇게 보내 드립니다.', url: '/notifications', tag: 'self-test' }, keys, SUBJECT)
      if (r.gone) await admin.from('push_subscriptions').delete().eq('id', s.id)
      return json({ ok: r.ok, status: r.status })
    }

    const { data: ok } = await admin.rpc('alimtalk_check_secret', { p: req.headers.get('x-cron-secret') ?? '' })
    if (!ok) return json({ error: 'unauthorized' }, 401)
    if (kind === 'init') { const k = await vapid(true); return json({ ok: true, publicKey: k?.publicKey }) }
    if (kind !== 'reminder' && kind !== 'notice') return json({ error: 'bad kind' }, 400)
    const keys = await vapid()
    if (!keys) return json({ skipped: 'not_configured' })
    const jobs = kind === 'reminder' ? await reminderJobs() : await noticeJobs(payload.notification_id ?? '')
    return json(await run(kind, jobs, keys))
  } catch (e) {
    console.error('send-push', e instanceof Error ? e.message : e)
    return json({ error: 'internal' }, 500)
  }
})
