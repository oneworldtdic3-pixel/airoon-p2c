import { useEffect, useState } from 'react'

// 홈 화면에 추가(PWA 설치) 상태.
//  - installed : 이미 홈 화면에서 실행 중(standalone)
//  - canPrompt : 크롬(안드로이드)처럼 beforeinstallprompt 를 받아 바로 설치창을 띄울 수 있음
//  - platform  : ios | android | other   /  inApp : 카카오·네이버·인스타 등 인앱 브라우저(설치 불가 → 외부 브라우저 안내)
type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

let deferred: BIP | null = null
const listeners = new Set<() => void>()
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e as BIP; listeners.forEach((l) => l()) })
  window.addEventListener('appinstalled', () => { deferred = null; listeners.forEach((l) => l()) })
}

const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
const isIos = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1)
const isAndroid = /Android/i.test(ua)
const inApp = /KAKAOTALK|NAVER\(inapp|Instagram|FBAN|FBAV|Line\//i.test(ua)
const isStandalone = () =>
  typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true)

export function useInstall() {
  const [, bump] = useState(0)
  useEffect(() => { const l = () => bump((n) => n + 1); listeners.add(l); return () => { listeners.delete(l) } }, [])
  const prompt = async () => {
    if (!deferred) return false
    await deferred.prompt()
    const { outcome } = await deferred.userChoice
    if (outcome === 'accepted') deferred = null
    return outcome === 'accepted'
  }
  return { installed: isStandalone(), canPrompt: !!deferred, platform: isIos ? 'ios' : isAndroid ? 'android' : 'other', inApp, prompt } as const
}
