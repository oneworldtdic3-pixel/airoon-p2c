import { Link } from 'react-router-dom'
import { useApp } from '../../mock/store'
import { programs, EVENT_DAYS } from '../../mock/data'
import { dayKey, fmtTime } from '../../lib/format'
import { todayEventDay, daysUntilStart } from '../../lib/dday'
import { SectionTitle } from '../ui'

export default function TodaySchedule() {
  const { sessions } = useApp()
  const di = todayEventDay()
  const day = EVENT_DAYS[di ?? 0]
  const label = di !== null ? '오늘의 일정' : daysUntilStart() > 0 ? '입재일 일정 미리보기' : '일정'
  const list = sessions
    .filter((s) => dayKey(s.starts_at) === day)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .slice(0, 5)
  return (
    <section className="px-5 pt-8">
      <SectionTitle sub={`11월 ${Number(day.slice(-2))}일`} right={<Link to="/reserve" className="text-[13px] font-bold text-deep">예약하기</Link>}>{label}</SectionTitle>
      <ol className="card divide-y divide-gray-100 px-4">
        {list.map((s) => {
          const p = programs.find((x) => x.id === s.program_id)!
          return (
            <li key={s.id} className="flex items-center gap-3 py-3.5">
              <span className="w-12 text-[15px] font-extrabold text-deep tabular-nums">{fmtTime(s.starts_at)}</span>
              <span className="flex-1 text-[14px] font-semibold">{p.emoji} {p.title}</span>
              <span className="text-[12px] text-sub">{s.capacity - s.booked_count > 0 ? `잔여 ${s.capacity - s.booked_count}` : '마감'}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
