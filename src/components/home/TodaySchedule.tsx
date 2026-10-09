import { Link } from 'react-router-dom'
import { useApp } from '../../data/AppProvider'
import { EVENT_DAYS } from '../../data/constants'
import { dayKey, fmtTime } from '../../lib/format'
import { todayEventDay, daysUntilStart } from '../../lib/dday'
import { SectionTitle } from '../ui'

export default function TodaySchedule() {
  const { programs, sessions } = useApp()
  const di = todayEventDay()
  const day = EVENT_DAYS[di ?? 0]
  const title = di !== null ? '오늘의 일정' : daysUntilStart() > 0 ? '첫날 일정' : '일정'
  const list = sessions
    .filter((s) => dayKey(s.starts_at) === day)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .slice(0, 6)
  return (
    <section className="px-5 pt-12">
      <SectionTitle eyebrow={`11월 ${Number(day.slice(-2))}일 · Day ${(di ?? 0) + 1}`} right={<Link to="/reserve" className="text-[13px] font-bold text-deep">전체 보기</Link>}>{title}</SectionTitle>
      <ol>
        {list.map((s) => {
          const p = programs.find((x) => x.id === s.program_id)
          const left = s.capacity - s.booked_count
          return (
            <li key={s.id} className="flex items-baseline gap-4 border-t hairline py-3.5 first:border-t-0">
              <span className="tnum w-12 text-[17px] font-extrabold text-ink">{fmtTime(s.starts_at)}</span>
              <span className="flex-1 text-[15px] font-semibold">{p?.title}</span>
              <span className={`tnum text-[12px] font-bold ${left ? 'text-deep' : 'text-gray-400'}`}>{left ? `${left}석` : '마감'}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
