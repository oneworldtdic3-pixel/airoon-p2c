import type { MouseEvent } from 'react'

export const isStandalone = () =>
  typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true)
const ua = () => (typeof navigator !== 'undefined' ? navigator.userAgent : '')
const isAndroid = () => /Android/i.test(ua())

/** 지금 쓰는 안드로이드 브라우저의 앱 이름(패키지). 모르는 브라우저면 null */
export function androidBrowserPackage(userAgent = ua()): string | null {
  if (!/Android/i.test(userAgent)) return null
  if (/SamsungBrowser\//i.test(userAgent)) return 'com.sec.android.app.sbrowser'
  // 웨일·엣지·오페라·파이어폭스·인앱 웹뷰(; wv)는 Chrome 이 아니다
  if (/Chrome\//.test(userAgent) && !/(EdgA|OPR|Whale|Firefox|YaBrowser|; wv\))/i.test(userAgent)) return 'com.android.chrome'
  return null
}

/** 안드로이드 intent 주소: 어떤 앱으로 열지(package)를 정해 주면 '열기' 앱 선택창이 뜨지 않는다.
 *  그 브라우저가 없으면 browser_fallback_url 로 그냥 연다. */
export function androidIntentUrl(url: string, pkg: string): string {
  const u = new URL(url)
  return `intent://${u.host}${u.pathname}${u.search}#Intent;scheme=${u.protocol.replace(':', '')};package=${pkg};S.browser_fallback_url=${encodeURIComponent(url)};end`
}

/** 안드로이드용 중간 페이지 주소 — /go 가 먼저 뜬 뒤 스크립트로 넘어간다 (브라우저 탭에서 쓰는 방식) */
const viaGo = (url: string) => `/go?u=${encodeURIComponent(url)}`

/** 외부 링크 열기.
 *  · 안드로이드 홈 화면 앱: 지금 쓰는 브라우저(삼성 인터넷·Chrome)를 지정해서 연다.
 *    앱 밖 주소를 그냥 넘기면 휴대폰이 'Chrome / 삼성 브라우저 / NAVER' 중 고르라는 창을 띄우기 때문
 *  · 안드로이드 브라우저: 새 탭에서 /go 경유
 *  · 그 외: 새 탭 */
export function openExternal(url: string) {
  if (isAndroid()) {
    if (isStandalone()) {
      const pkg = androidBrowserPackage()
      window.location.href = pkg && /^https?:\/\//i.test(url) ? androidIntentUrl(url, pkg) : viaGo(url)
    } else window.open(viaGo(url), '_blank', 'noopener,noreferrer')
    return
  }
  window.open(url, '_blank', 'noopener,noreferrer')
}

/** <a href target="_blank"> 에 onClick 으로 붙이면 위와 같은 동작 */
export function extClick(e: MouseEvent<HTMLAnchorElement>) {
  if (!isAndroid()) return
  e.preventDefault()
  openExternal(e.currentTarget.href)
}
