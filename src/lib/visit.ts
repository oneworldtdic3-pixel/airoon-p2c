// 첫 방문에 시트가 연달아 뜨지 않게 하는 방문 기록.
//  · 이번 방문(세션)에 공지 팝업이 떴는지 → 떴으면 알림 권유 시트는 쉰다
//  · 방문 횟수(세션당 1회 증가) → 두 번째 방문부터 알림 권유
//  · 예매 버튼을 눌렀는지 → 스마트스토어에서 돌아오면 알림 권유
const POPUP_SHOWN = 'sansa:popup-shown'
const VISIT_COUNTED = 'sansa:visit-counted'
const VISITS = 'sansa:visits'
const BUY_CLICKED = 'sansa:buy-clicked'

const ss = {
  get: (k: string) => { try { return sessionStorage.getItem(k) } catch { return null } },
  set: (k: string, v: string) => { try { sessionStorage.setItem(k, v) } catch { /* 저장소를 못 쓰면 무시 */ } },
}
const ls = {
  get: (k: string) => { try { return localStorage.getItem(k) } catch { return null } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* 저장소를 못 쓰면 무시 */ } },
}

export const markPopupShown = () => ss.set(POPUP_SHOWN, '1')
export const popupShownThisSession = () => ss.get(POPUP_SHOWN) === '1'

/** 세션마다 한 번만 올린다. 반환값 = 지금까지 방문 횟수(이번 포함) */
export function countVisit(): number {
  const n = Number(ls.get(VISITS) || 0)
  if (ss.get(VISIT_COUNTED)) return n
  ss.set(VISIT_COUNTED, '1')
  ls.set(VISITS, String(n + 1))
  return n + 1
}

export const markBuyClick = () => ss.set(BUY_CLICKED, '1')
export const buyClickedThisSession = () => ss.get(BUY_CLICKED) === '1'
