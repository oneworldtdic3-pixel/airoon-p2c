// Web Push 발송 — 외부 라이브러리 없이 WebCrypto 만 사용 (Deno·Node 공용)
//  · 본문 암호화: RFC 8291 (aes128gcm)
//  · 서버 인증: RFC 8292 (VAPID, ES256 JWT)

export type PushSub = { endpoint: string; p256dh: string; auth: string }
export type VapidKeys = { publicKey: string; privateJwk: JsonWebKey }

const enc = new TextEncoder()
export const b64u = (buf: ArrayBuffer | Uint8Array) => {
  const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  for (const x of b) s += String.fromCharCode(x)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
export const unb64u = (s: string) => {
  const t = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)
  return Uint8Array.from(atob(t), (c) => c.charCodeAt(0))
}
const concat = (...parts: Uint8Array[]) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0))
  let o = 0
  for (const p of parts) { out.set(p, o); o += p.length }
  return out
}

/** VAPID 키 한 쌍 생성 — 공개키는 브라우저 구독에 쓰는 raw(65바이트) base64url */
export async function generateVapidKeys(): Promise<VapidKeys> {
  const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']) as CryptoKeyPair
  const raw = await crypto.subtle.exportKey('raw', kp.publicKey)
  const privateJwk = await crypto.subtle.exportKey('jwk', kp.privateKey)
  return { publicKey: b64u(raw), privateJwk }
}

async function vapidHeader(endpoint: string, keys: VapidKeys, subject: string) {
  const aud = new URL(endpoint).origin
  const header = b64u(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })))
  const payload = b64u(enc.encode(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject })))
  const key = await crypto.subtle.importKey('jwk', keys.privateJwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(`${header}.${payload}`))
  return `vapid t=${header}.${payload}.${b64u(sig)}, k=${keys.publicKey}`
}

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, bytes: number) {
  const k = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits'])
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, k, bytes * 8))
}

/** 구독자 공개키로 본문을 암호화해 aes128gcm 레코드 하나로 만든다 */
export async function encryptPayload(sub: PushSub, plaintext: Uint8Array) {
  const uaPublic = unb64u(sub.p256dh)
  const authSecret = unb64u(sub.auth)
  const as = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']) as CryptoKeyPair
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', as.publicKey))
  const uaKey = await crypto.subtle.importKey('raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, [])
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, as.privateKey, 256))

  const ikm = await hkdf(authSecret, ecdh, concat(enc.encode('WebPush: info\0'), uaPublic, asPublic), 32)
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16)
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12)

  const key = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt'])
  const padded = concat(plaintext, new Uint8Array([2])) // 마지막 레코드 구분자
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, padded))

  const rs = new Uint8Array(4); new DataView(rs.buffer).setUint32(0, 4096)
  return concat(salt, rs, new Uint8Array([asPublic.length]), asPublic, cipher)
}

/** 한 기기로 발송. 404/410 이면 구독이 만료된 것 → gone=true */
export async function sendPush(sub: PushSub, data: unknown, keys: VapidKeys, subject: string, ttl = 24 * 3600) {
  const body = await encryptPayload(sub, enc.encode(JSON.stringify(data)))
  const res = await fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      Authorization: await vapidHeader(sub.endpoint, keys, subject),
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      TTL: String(ttl),
      Urgency: 'high',
    },
    body,
    signal: AbortSignal.timeout(10000),
  })
  const text = res.ok ? '' : (await res.text().catch(() => '')).slice(0, 200)
  return { ok: res.ok, status: res.status, gone: res.status === 404 || res.status === 410, error: res.ok ? null : `${res.status} ${text}`.trim() }
}

// 테스트용
export const _internal = { vapidHeader }
