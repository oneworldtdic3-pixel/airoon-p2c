// 네이버 로그인 — Supabase 기본 공급자에 네이버가 없어 Edge Function 으로 처리한다.
//
//  POST /naver-auth  { return_to, origin, link }  (+ Authorization: Bearer <user jwt> 이면 "연결" 모드)
//     → { url }  네이버 인가 URL.  시크릿 미설정 시 { error: "not_configured" }
//  GET  /naver-auth?code=&state=        네이버 → 여기로 복귀
//     → 코드 교환 → 프로필 → naver_identities 매핑 → magic-link 토큰 → 앱 /login?naver_token=… 으로 리다이렉트
//
//  시크릿: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET, APP_URL(허용 오리진, 쉼표 구분)
//  자동 제공: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const CLIENT_ID = Deno.env.get('NAVER_CLIENT_ID') ?? ''
const CLIENT_SECRET = Deno.env.get('NAVER_CLIENT_SECRET') ?? ''
const APP_URLS = (Deno.env.get('APP_URL') ?? '').split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean)
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STATE_TTL_MS = 10 * 60 * 1000
const SYNTH_DOMAIN = 'naver.sansacamp.invalid' // 네이버 가입자용 내부 이메일(발송 안 됨, 표시 안 됨)

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
const configured = () => !!(CLIENT_ID && CLIENT_SECRET && APP_URLS.length)
const callbackUrl = () => `${SUPABASE_URL}/functions/v1/naver-auth`

const cors = (origin: string | null) => ({
  'Access-Control-Allow-Origin': origin && APP_URLS.includes(origin) ? origin : APP_URLS[0] ?? '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  Vary: 'Origin',
})
const json = (body: unknown, status = 200, origin: string | null = null) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...cors(origin) } })

// ---- state: base64url(payload).hmac — CSRF 방지 + 복귀 경로/연결 대상 보관 -------------------------
const enc = new TextEncoder()
const b64u = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const unb64u = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))
async function hmac(data: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(SERVICE_KEY), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return b64u(new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(data))))
}
type State = { rt: string; o: string; uid?: string; n: string; ts: number }
async function signState(s: State) { const p = b64u(enc.encode(JSON.stringify(s))); return `${p}.${await hmac(p)}` }
async function readState(raw: string | null): Promise<State | null> {
  if (!raw) return null
  const [p, sig] = raw.split('.')
  if (!p || !sig || sig !== (await hmac(p))) return null
  try {
    const s = JSON.parse(new TextDecoder().decode(unb64u(p))) as State
    if (!APP_URLS.includes(s.o) || Date.now() - s.ts > STATE_TTL_MS || !s.rt.startsWith('/')) return null
    return s
  } catch { return null }
}

const redirectApp = (origin: string, path: string, params: Record<string, string>) => {
  const u = new URL(path, origin)
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v)
  return Response.redirect(u.toString(), 302)
}

// ---- POST: 인가 URL 발급 -------------------------------------------------------------------------
async function start(req: Request) {
  const origin = req.headers.get('origin')
  if (!configured()) return json({ error: 'not_configured' }, 200, origin)
  if (!origin || !APP_URLS.includes(origin)) return json({ error: 'origin_not_allowed' }, 403, origin)
  const body = (await req.json().catch(() => ({}))) as { return_to?: string; link?: boolean }
  const rt = typeof body.return_to === 'string' && body.return_to.startsWith('/') ? body.return_to : '/'

  // 연결 모드: 로그인한 사용자의 JWT 로 본인 확인
  let uid: string | undefined
  if (body.link) {
    const jwt = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (!jwt) return json({ error: 'auth_required' }, 401, origin)
    const { data, error } = await admin.auth.getUser(jwt)
    if (error || !data.user) return json({ error: 'auth_required' }, 401, origin)
    uid = data.user.id
  }
  const state = await signState({ rt, o: origin, uid, n: crypto.randomUUID(), ts: Date.now() })
  const url = new URL('https://nid.naver.com/oauth2.0/authorize')
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', CLIENT_ID)
  url.searchParams.set('redirect_uri', callbackUrl())
  url.searchParams.set('state', state)
  return json({ url: url.toString() }, 200, origin)
}

// ---- GET: 네이버 복귀 -----------------------------------------------------------------------------
async function callback(req: Request) {
  const q = new URL(req.url).searchParams
  const state = await readState(q.get('state'))
  if (!state) return new Response('잘못되었거나 만료된 요청입니다. 앱에서 다시 시도해 주세요.', { status: 400 })
  const back = (code: string) => redirectApp(state.o, '/login', { naver_error: code, rt: state.rt })
  if (q.get('error') || !q.get('code')) return back(q.get('error') === 'access_denied' ? 'cancelled' : 'naver_error')

  // 1) 코드 → 토큰
  const tokenUrl = new URL('https://nid.naver.com/oauth2.0/token')
  tokenUrl.search = new URLSearchParams({ grant_type: 'authorization_code', client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code: q.get('code')!, state: q.get('state')! }).toString()
  const tok = (await (await fetch(tokenUrl)).json()) as { access_token?: string; error?: string }
  if (!tok.access_token) return back('naver_error')

  // 2) 프로필
  const me = (await (await fetch('https://openapi.naver.com/v1/nid/me', { headers: { Authorization: `Bearer ${tok.access_token}` } })).json()) as
    { resultcode?: string; response?: { id: string; nickname?: string; name?: string; email?: string } }
  const p = me.response
  if (me.resultcode !== '00' || !p?.id) return back('naver_error')
  const nickname = (p.nickname || p.name || '').trim() || '산사러'

  // 3) 매핑 조회
  const { data: ident } = await admin.from('naver_identities').select('user_id').eq('naver_id', p.id).maybeSingle()

  // 연결 모드: 로그인한 계정에 네이버를 붙인다 (자동 병합 없음 — 본인 JWT 로 시작한 요청만)
  if (state.uid) {
    if (ident && ident.user_id !== state.uid) return redirectApp(state.o, state.rt, { naver: 'already_linked' })
    if (!ident) {
      const { data: u } = await admin.auth.admin.getUserById(state.uid)
      if (!u.user) return back('naver_error')
      const { error: e1 } = await admin.from('naver_identities').insert({ naver_id: p.id, user_id: state.uid })
      if (e1) return back('naver_error')
      await admin.auth.admin.updateUserById(state.uid, {
        app_metadata: { ...(u.user.app_metadata ?? {}), naver_id: p.id, providers: [...new Set([...(u.user.app_metadata?.providers ?? []), 'naver'])] },
        ...(u.user.email ? {} : { email: `${state.uid}@${SYNTH_DOMAIN}`, email_confirm: true }),
      })
    }
    return redirectApp(state.o, state.rt, { naver: 'linked' })
  }

  // 로그인 모드
  let userId = ident?.user_id
  let email: string | null = null
  if (userId) {
    const { data: u } = await admin.auth.admin.getUserById(userId)
    email = u.user?.email ?? null
    if (!email) {
      email = `${userId}@${SYNTH_DOMAIN}`
      await admin.auth.admin.updateUserById(userId, { email, email_confirm: true })
    }
  } else {
    email = `naver-${p.id.toLowerCase().replace(/[^a-z0-9]/g, '')}@${SYNTH_DOMAIN}`
    const { data: created, error } = await admin.auth.admin.createUser({
      email, email_confirm: true,
      user_metadata: { nickname, provider: 'naver' },
      app_metadata: { provider: 'naver', providers: ['naver'], naver_id: p.id },
    })
    if (error || !created.user) return back('naver_error')
    userId = created.user.id
    const { error: e2 } = await admin.from('naver_identities').insert({ naver_id: p.id, user_id: userId })
    if (e2) return back('naver_error')
  }

  // 4) magic-link 토큰 → 앱에서 verifyOtp(token_hash) 로 세션 확립
  const { data: link, error: e3 } = await admin.auth.admin.generateLink({ type: 'magiclink', email: email! })
  const tokenHash = link?.properties?.hashed_token
  if (e3 || !tokenHash) return back('naver_error')
  return redirectApp(state.o, '/login', { naver_token: tokenHash, rt: state.rt })
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) })
  try {
    if (req.method === 'POST') return await start(req)
    if (req.method === 'GET') return await callback(req)
    return json({ error: 'method_not_allowed' }, 405, origin)
  } catch (e) {
    console.error(e)
    return json({ error: 'internal' }, 500, origin)
  }
})
