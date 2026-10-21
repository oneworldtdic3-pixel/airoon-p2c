// 네이버 광고 전환추적(공통키 s_40bcb541af17). wcslog.js 와 첫 PV 는 index.html 공통 스크립트에서 처리한다.
// 가이드: https://navercts.gitbook.io/guide/script_guide
// 같은 지점에서 Google Ads 전환(AW-18516198571)도 함께 보낸다. gtag.js 와 config 는 index.html 에서 로드한다.
const NAVER_WA = 's_40bcb541af17'
const NAVER_INFLOW = 'sansacamp.com'

// 네이버 전환 type -> Google Ads 전환 send_to
const GOOGLE_ADS_SEND_TO: Record<string, string> = {
  custom001: 'AW-18516198571/29m_CJae_6MdEKuJm_1E', // 스마트스토어 예매 클릭(결제 시작)
  schedule: 'AW-18516198571/JTlvCJme_6MdEKuJm_1E', // 현장 예약 완료(프로그램·샤워)
  lead: 'AW-18516198571/yScLCJye_6MdEKuJm_1E', // 주차 등록 완료(리드)
}

type NaverWcsWindow = Window & {
  wcs?: { inflow: (domain?: string) => void; trans: (conv: Record<string, unknown>) => void }
  wcs_add?: Record<string, string>
  wcs_do?: () => void
  gtag?: (...args: unknown[]) => void
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

/** Google Ads 전환 전송 (외부 이동 클릭도 유실되지 않게 beacon 사용) */
export function googleAdsConversion(type: string) {
  const w = getWin()
  const sendTo = GOOGLE_ADS_SEND_TO[type]
  if (!sendTo || typeof w?.gtag !== 'function') return
  try {
    w.gtag('event', 'conversion', { send_to: sendTo, transport_type: 'beacon' })
  } catch { /* 추적 실패는 서비스에 영향 주지 않음 */ }
}

/** 전환 이벤트 전송. type: 'schedule'(예약완료) | 'lead'(신청완료) | 'custom001'(스마트스토어 예매 버튼) 등 */
export function naverConversion(type: string, extra?: Record<string, unknown>) {
  googleAdsConversion(type)
  const w = getWin()
  if (!w?.wcs) return
  try {
    w.wcs_add = w.wcs_add || {}
    w.wcs_add.wa = NAVER_WA
    w.wcs.trans({ type, ...(extra ?? {}) })
  } catch { /* 추적 실패는 서비스에 영향 주지 않음 */ }
}
