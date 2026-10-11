// 전화번호 인증 SMS 발송 — Supabase Auth "Send SMS Hook" → 이 함수 → 솔라피(SOLAPI) API
//
//  Supabase Auth 가 OTP 를 만들면 Standard Webhooks 서명과 함께 POST 로 호출한다.
//    body: { user: { phone, phone_change, … }, sms: { otp, sms_type? } }
//  성공: 200 {}          실패: 4xx/5xx { error: { http_code, message } }  → 앱에서 "잠시 후 다시 시도해주세요" 안내
//
//  시크릿(대시보드 Edge Functions → Secrets 에서 직접 입력, 코드에 넣지 않는다)
//    SOLAPI_API_KEY, SOLAPI_API_SECRET  솔라피 API 키/시크릿
//    SOLAPI_SENDER_NUMBER               솔라피에 등록된 발신번호 (예: 01012345678)
//    SEND_SMS_HOOK_SECRET               Auth → Hooks → Send SMS 에서 생성한 비밀 (v1,whsec_… 형식, 여러 개면 | 구분)
//
//  테스트 번호(대시보드 Phone → Test OTPs)는 Auth 가 훅을 부르지 않으므로 실제 문자 없이 그대로 동작한다.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const API_KEY = Deno.env.get('SOLAPI_API_KEY') ?? ''
const API_SECRET = Deno.env.get('SOLAPI_API_SECRET') ?? ''
const SENDER = (Deno.env.get('SOLAPI_SENDER_NUMBER') ?? '').replace(/\D/g, '')
const HOOK_SECRETS = (Deno.env.get('SEND_SMS_HOOK_SECRET') ?? '').split('|').map((s) => s.trim()).filter(Boolean)
const SOLAPI_URL = 'https://api.solapi.com/messages/v4/send'
const TIMESTAMP_TOLERANCE_S = 5 * 60

type Payload = { user?: { phone?: string; phone_change?: string }; sms?: { otp?: string; sms_type?: string } }

const enc = new TextEncoder()
const b64 = (bytes: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(bytes)))
const hex = (bytes: ArrayBuffer) => [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('')
async function hmac(key: Uint8Array | string, data: string) {
  const raw = typeof key === 'string' ? enc.encode(key) : key
  const k = await crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return crypto.subtle.sign('HMAC', k, enc.encode(data))
}
const timingSafeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// ---- Standard Webhooks 서명 검증 (webhook-id / webhook-timestamp / webhook-signature) ----------------
async function verifyHook(req: Request, body: string): Promise<boolean> {
  const id = req.headers.get('webhook-id')
  const ts = req.headers.get('webhook-timestamp')
  const sigHeader = req.headers.get('webhook-signature')
  if (!id || !ts || !sigHeader || !HOOK_SECRETS.length) return false
  const now = Math.floor(Date.now() / 1000)
  if (!/^\d+$/.test(ts) || Math.abs(now - Number(ts)) > TIMESTAMP_TOLERANCE_S) return false
  const given = sigHeader.split(' ').map((s) => s.trim()).filter((s) => s.startsWith('v1,')).map((s) => s.slice(3))
  if (!given.length) return false
  for (const secret of HOOK_SECRETS) {
    const keyB64 = secret.replace(/^v1,/, '').replace(/^whsec_/, '')
    let key: Uint8Array
    try { key = Uint8Array.from(atob(keyB64), (c) => c.charCodeAt(0)) } catch { continue }
    const expected = b64(await hmac(key, `${id}.${ts}.${body}`))
    if (given.some((g) => timingSafeEqual(g, expected))) return true
  }
  return false
}

// ---- 솔라피 발송 ---------------------------------------------------------------------------------
// 인증 헤더: HMAC-SHA256 apiKey=…, date=ISO8601, salt=random, signature=hex(hmac_sha256(secret, date+salt))
async function sendViaSolapi(to: string, text: string) {
  const date = new Date().toISOString()
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)).buffer)
  const signature = hex(await hmac(API_SECRET, date + salt))
  const res = await fetch(SOLAPI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `HMAC-SHA256 apiKey=${API_KEY}, date=${date}, salt=${salt}, signature=${signature}`,
    },
    body: JSON.stringify({ message: { to, from: SENDER, text, type: 'SMS' } }),
    signal: AbortSignal.timeout(8000),
  })
  const data = (await res.json().catch(() => ({}))) as { statusCode?: string; errorCode?: string; errorMessage?: string }
  // 접수 성공은 HTTP 200 + statusCode "2000"
  if (!res.ok || (data.statusCode && data.statusCode !== '2000')) {
    throw new Error(`solapi ${res.status} ${data.errorCode ?? data.statusCode ?? ''} ${data.errorMessage ?? ''}`.trim())
  }
}

// 82 10 1234 5678 → 010 1234 5678 (솔라피는 국내번호를 0 으로 시작하는 형식으로 받는다)
const toDomestic = (phone: string) => {
  const d = phone.replace(/\D/g, '')
  return d.startsWith('82') ? '0' + d.slice(2) : d
}

const fail = (status: number, message: string) =>
  new Response(JSON.stringify({ error: { http_code: status, message } }), { status, headers: { 'Content-Type': 'application/json' } })

Deno.serve(async (req) => {
  if (req.method !== 'POST') return fail(405, 'method not allowed')
  const body = await req.text()
  if (!(await verifyHook(req, body))) return fail(401, 'invalid hook signature')
  if (!API_KEY || !API_SECRET || !SENDER) {
    console.error('send-sms: SOLAPI_API_KEY / SOLAPI_API_SECRET / SOLAPI_SENDER_NUMBER 가 설정되지 않았습니다')
    return fail(500, 'SMS_NOT_CONFIGURED')
  }
  let payload: Payload
  try { payload = JSON.parse(body) } catch { return fail(400, 'invalid payload') }
  const otp = payload.sms?.otp
  // 번호 변경(연결) 인증은 새 번호(phone_change)로, 그 외는 user.phone 으로
  const u = payload.user ?? {}
  const rawPhone = payload.sms?.sms_type === 'phone_change' ? u.phone_change : (u.phone || u.phone_change)
  if (!otp || !rawPhone) return fail(400, 'missing otp or phone')
  const to = toDomestic(rawPhone)
  if (!/^01\d{8,9}$/.test(to)) return fail(400, 'unsupported phone number')

  try {
    await sendViaSolapi(to, `[산사캠프] 인증번호 ${otp}\n5분 안에 입력해 주세요.`)
    return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    console.error('send-sms: 발송 실패', e instanceof Error ? e.message : e)
    return fail(502, 'SMS_SEND_FAILED')
  }
})
