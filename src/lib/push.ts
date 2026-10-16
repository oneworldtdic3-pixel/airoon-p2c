import { supabase } from './supabase'
import { isStandalone } from './external'

// 앱 푸시 알림(Web Push) — 기기 구독/해제. 발송은 서버(send-push)가 한다.
export type PushState = 'unsupported' | 'ios-install' | 'denied' | 'off' | 'on'

const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
export const pushSupported = () => typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window

async function registration() {
  const reg = (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.register('/sw.js'))
  await navigator.serviceWorker.ready
  return reg
}
const currentSub = async () => (await (await navigator.serviceWorker.getRegistration())?.pushManager.getSubscription()) ?? null

export async function getPushState(): Promise<PushState> {
  // 아이폰은 홈 화면에 추가한 앱(16.4+)에서만 푸시가 된다
  if (!pushSupported()) return isIOS() && !isStandalone() ? 'ios-install' : 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  return (await currentSub()) ? 'on' : 'off'
}

const keyBytes = (b64u: string) => {
  const s = atob(b64u.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((b64u.length + 3) % 4))
  return Uint8Array.from(s, (c) => c.charCodeAt(0))
}

async function save(sub: PushSubscription) {
  const j = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } }
  const { error } = await supabase.rpc('push_subscribe', { p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth, p_ua: navigator.userAgent })
  if (error) throw error
}

export async function enablePush(): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    if (!pushSupported()) return { ok: false, error: '이 브라우저는 알림을 지원하지 않습니다' }
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') return { ok: false, error: perm === 'denied' ? '알림이 차단되어 있습니다. 브라우저 설정에서 허용해 주세요' : '알림 허용을 눌러 주세요' }
    const { data: key, error } = await supabase.rpc('push_vapid_public')
    if (error || !key) return { ok: false, error: '알림 서버 준비 중입니다. 잠시 후 다시 시도해 주세요' }
    const reg = await registration()
    const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(key as string) }))
    await save(sub)
    void supabase.functions.invoke('send-push', { body: { kind: 'self-test', endpoint: sub.endpoint } })
    return { ok: true }
  } catch (e) {
    console.error('enablePush', e)
    return { ok: false, error: '알림을 켜지 못했습니다. 잠시 후 다시 시도해 주세요' }
  }
}

export async function disablePush() {
  const sub = await currentSub()
  if (!sub) return
  await supabase.rpc('push_unsubscribe', { p_endpoint: sub.endpoint })
  await sub.unsubscribe().catch(() => {})
}

export async function testPush() {
  const sub = await currentSub()
  if (!sub) return false
  const { data } = await supabase.functions.invoke('send-push', { body: { kind: 'self-test', endpoint: sub.endpoint } })
  return !!(data as { ok?: boolean } | null)?.ok
}

/** 로그인/로그아웃이 바뀌면 이 기기 구독을 그 계정에 다시 묶는다 (예약 리마인드용) */
export async function syncPush() {
  if (!pushSupported() || Notification.permission !== 'granted') return
  const sub = await currentSub()
  if (sub) await save(sub).catch(() => {})
}

export const clearAppBadge = () => { (navigator as Navigator & { clearAppBadge?: () => Promise<void> }).clearAppBadge?.().catch(() => {}) }
