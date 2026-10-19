// 네이버 광고 전환추적(공통키 s_40bcb541af17). wcslog.js 와 첫 PV 는 index.html 공통 스크립트에서 처리한다.
// 가이드: https://navercts.gitbook.io/guide/script_guide
const NAVER_WA = 's_40bcb541af17'
const NAVER_INFLOW = 'sansacamp.com'

type NaverWcsWindow = Window & {
  wcs?: { inflow: (domain?: string) => void; trans: (conv: Record<string, unknown>) => void }
  wcs_add?: Record<string, string>
  wcs_do?: () => void
}

const getWin = () => (typeof window === 'undefined' ? undefined : (window as NaverWcsWindow))

/** SPA 라우트 이동 시 PV 이벤트 전송 */
export function naverPageView() {
  const w = getWin()
  if (!w?.wcs || typeof w.wcs_do !== 'function') return
  try {
    w.wcs_add = w.wcs_add || {}
    w.wcs_add.wa = NAVER_WA
    w.wcs.inflow(NAVER_INFLOW)
    w.wcs_do()
  } catch { /* 추적 실패는 서비스에 영향 주지 않음 */ }
}

/** 전환 이벤트 전송. type: 'schedule'(예약완료) | 'lead'(신청완료) | 'custom001'(스마트스토어 예매 버튼) 등 */
export function naverConversion(type: string, extra?: Record<string, unknown>) {
  const w = getWin()
  if (!w?.wcs) return
  try {
    w.wcs_add = w.wcs_add || {}
    w.wcs_add.wa = NAVER_WA
    w.wcs.trans({ type, ...(extra ?? {}) })
  } catch { /* 추적 실패는 서비스에 영향 주지 않음 */ }
}
