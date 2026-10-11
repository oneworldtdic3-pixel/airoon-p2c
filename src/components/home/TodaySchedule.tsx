import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../data/AppProvider'
import { EVENT_DAYS } from '../../data/constants'
import { dayKey, fmtDay, fmtTime } from '../../lib/format'
import { todayEventDay, daysUntilStart } from '../../lib/dday'
import { SectionTitle, Segmented } from '../ui'
import Icon from '../ui/Icon'

type Tab = 'mine' | 'all'

/** 홈 일정: "내 일정"(내가 예약한 프로그램·샤워) / "전체 프로그램"(오늘 또는 첫날 회차) */
export default function TodaySchedule() {
  const { user, programs, sessions, bookings, slots, showerBookings } = useApp()
  const di = todayEventDay()
  const day = EVENT_DAYS[di ?? 0]

  // 내 일정: 프로그램 예약 + 샤워 예약을 시간순으로, 날짜별로 묶는다
  const mine = [
    ...bookings.filter((b) => b.status === 'confirmed').map((b) => {
      const s = sessions.find((x) => x.id === b.session_id)
      const p = s && programs.find((x) => x.id === s.program_id)
      return s && p ? { id: b.id, at: s.starts_at, title: p.title, sub: p.location, kind: 'program' as const } : null
    }),
    ...showerBookings.filter((b) => b.status === 'confirmed').map((b) => {
      const s = slots.find((x) => x.id === b.slot_id)
      return s ? { id: b.id, at: s.starts_at, title: '샤워실', sub: s.building, kind: 'shower' as const } : null
    }),
  ].filter((x): x is NonNullable<typeof x> => !!x).sort((a, b) => a.at.localeCompare(b.at))
  // 직접 고르기 전까지는 로그인 상태면 내 일정, 아니면 전체 프로그램 (데이터가 늦게 와도 맞게 따라간다)
  const [picked, setTab] = useState<Tab | null>(null)
  const tab: Tab = picked ?? (user ? 'mine' : 'all')
  const byDay = EVENT_DAYS.map((d) => ({ d, items: mine.filter((m) => dayKey(m.at) === d) })).filter((g) => g.items.length)

  const all = sessions.filter((s) => dayKey(s.starts_at) === day).sort((a, b) => a.starts_at.localeCompare(b.starts_at)).slice(0, 6)
  const allTitle = di !== null ? '오늘의 프로그램' : daysUntilStart() > 0 ? '첫날 프로그램' : '프로그램'

  return (
    <section className="px-5 pt-12">
      <SectionTitle eyebrow={tab === 'mine' ? '내 스케줄' : `11월 ${Number(day.slice(-2))}일 · Day ${(di ?? 0) + 1}`} right={<Link to="/reserve" className="text-[13px] font-bold text-deep">{tab === 'mine' ? '예약 관리' : '전체 보기'}</Link>}>
        {tab === 'mine' ? '내 일정' : allTitle}
      </SectionTitle>
      <div className="-mt-2 mb-2">
        <Segmented<Tab> value={tab} onChange={setTab} options={[{ value: 'mine', label: `내 일정${mine.length ? ` ${mine.length}` : ''}` }, { value: 'all', label: '전체 프로그램' }]} />
      </div>

      {tab === 'mine' ? (
        !user ? (
          <div className="rounded-tile bg-mint px-4 py-5 text-center">
            <p className="text-[14px] font-bold">로그인하면 내가 예약한 일정이 여기에 모입니다</p>
            <Link to="/login" state={{ from: '/' }} className="btn mt-3 !px-5 !py-2.5 !text-[13px]">로그인</Link>
          </div>
        ) : !mine.length ? (
          <div className="rounded-tile bg-mint px-4 py-5 text-center">
            <p className="text-[14px] font-bold">아직 예약한 일정이 없습니다</p>
            <p className="mt-1 text-[12.5px] text-sub">프로그램·샤워실을 예약하면 시간순으로 보여 드립니다.</p>
            <Link to="/reserve" className="btn mt-3 !px-5 !py-2.5 !text-[13px]">예약하러 가기</Link>
          </div>
        ) : (
          byDay.map((g) => (
            <div key={g.d} className="mt-2">
              <p className="eyebrow mb-1 mt-3 text-deep">{fmtDay(g.items[0].at)}</p>
              <ol>
                {g.items.map((m) => (
                  <li key={m.id}>
                    <Link to={`/reserve?tab=${m.kind}`} className="flex items-baseline gap-4 border-t hairline py-3.5 first:border-t-0">
                      <span className="tnum w-12 text-[17px] font-extrabold text-ink">{fmtTime(m.at)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold">{m.title}</span>
                        <span className="block truncate text-[12px] text-sub">{m.sub}</span>
                      </span>
                      <Icon name="chevron" size={16} className="self-center text-gray-300" />
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          ))
        )
      ) : (
        <ol>
          {all.map((s) => {
            const p = programs.find((x) => x.id === s.program_id)
            const left = s.capacity - s.booked_count
            const booked = bookings.some((b) => b.session_id === s.id && b.status === 'confirmed')
            return (
              <li key={s.id}>
                <Link to="/reserve?tab=program" className="flex items-baseline gap-4 border-t hairline py-3.5 first:border-t-0">
                  <span className="tnum w-12 text-[17px] font-extrabold text-ink">{fmtTime(s.starts_at)}</span>
                  <span className="flex-1 truncate text-[15px] font-semibold">{p?.title}</span>
                  <span className={`tnum text-[12px] font-bold ${booked ? 'text-deep' : left ? 'text-deep' : 'text-gray-400'}`}>{booked ? '내 예약' : left ? `${left}석` : '마감'}</span>
                </Link>
              </li>
            )
          })}
          {!all.length && <li className="py-6 text-center text-[13px] text-sub">이 날의 프로그램이 아직 없습니다</li>}
        </ol>
      )}
    </section>
  )
}
