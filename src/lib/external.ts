import type { MouseEvent } from 'react'

export const isStandalone = () =>
  typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true)
const isAndroid = () => typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)

/** 안드로이드용 중간 페이지 주소 — /go 가 먼저 뜬 뒤 스크립트로 넘어가므로 '열기' 앱 선택창이 뜨지 않는다 */
const viaGo = (url: string) => `/go?u=${encodeURIComponent(url)}`

/** 외부 링크 열기. 안드로이드: 홈 화면 앱이면 같은 창에서 /go 경유, 브라우저면 새 탭에서 /go 경유. 그 외: 새 탭 */
export function openExternal(url: string) {
  if (isAndroid()) {
    if (isStandalone()) window.location.href = viaGo(url)
    else window.open(viaGo(url), '_blank', 'noopener,noreferrer')
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
