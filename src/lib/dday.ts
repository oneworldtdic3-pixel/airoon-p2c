const EVENT_START = '2026-11-06'

function seoulToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date())
}

/** 입재(2026-11-06) 기준 D-day. 양수=남은 일수, 0=당일, 음수=지남 (Asia/Seoul) */
export function daysUntilStart(): number {
  const a = Date.parse(seoulToday() + 'T00:00:00Z')
  const b = Date.parse(EVENT_START + 'T00:00:00Z')
  return Math.round((b - a) / 86400000)
}

export function ddayLabel(): string {
  const d = daysUntilStart()
  if (d > 0) return `D-${d}`
  if (d === 0) return 'D-DAY'
  return `D+${-d}`
}

/** 행사 일자 인덱스(0,1,2) — 행사 기간 밖이면 null */
export function todayEventDay(): number | null {
  const d = -daysUntilStart()
  return d >= 0 && d <= 2 ? d : null
}
