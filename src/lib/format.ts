const tz = 'Asia/Seoul'
export const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat('ko-KR', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso))
export const fmtDay = (iso: string) =>
  new Intl.DateTimeFormat('ko-KR', { timeZone: tz, month: 'numeric', day: 'numeric', weekday: 'short' }).format(new Date(iso))
export const dayKey = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date(iso))
export function timeAgo(iso: string) {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (m < 1) return '방금 전'
  if (m < 60) return `${m}분 전`
  if (m < 1440) return `${Math.floor(m / 60)}시간 전`
  return `${Math.floor(m / 1440)}일 전`
}

/** '821012345678' / '+821012345678' → '010-1234-5678' */
export function fmtPhone(p: string | null | undefined) {
  if (!p) return ''
  const d = p.replace(/\D/g, '').replace(/^82/, '0')
  return d.length === 11 ? `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}` : d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : p
}

/** 참가비: 0 → 무료, 10000 → 1만원, 4000 → 4천원, 12500 → 12,500원 */
export function fmtPrice(won: number | null | undefined) {
  if (!won) return '무료'
  if (won % 10000 === 0) return `${won / 10000}만원`
  if (won < 10000 && won % 1000 === 0) return `${won / 1000}천원`
  return `${won.toLocaleString('ko-KR')}원`
}
