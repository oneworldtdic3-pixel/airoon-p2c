import type { MouseEvent } from 'react'

export const isStandalone = () =>
  typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true)
const isAndroid = () => typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)

/**
 * 외부 링크 열기.
 * 안드로이드 홈 화면 앱(standalone)에서 window.open / target=_blank 는 시스템 '열기(앱 선택)' 창을 띄운다.
 * 그 경우엔 같은 창에서 이동시켜 앱 안의 브라우저 탭으로 바로 열리게 한다(뒤로 가기로 복귀). 그 외에는 새 탭.
 */
export function openExternal(url: string) {
  if (isStandalone() && isAndroid()) window.location.href = url
  else window.open(url, '_blank', 'noopener,noreferrer')
}

/** <a href target="_blank"> 에 onClick 으로 붙이면 위와 같은 동작 */
export function extClick(e: MouseEvent<HTMLAnchorElement>) {
  if (isStandalone() && isAndroid()) { e.preventDefault(); window.location.href = e.currentTarget.href }
}
