import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../data/AppProvider'
import { EVENT_DAYS, MEALS, mealAt, mealTag, timeTbd } from '../../data/constants'
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
      return s && p ? { id: b.id, at: s.starts_at, title: p.title, sub: p.location, kind: 'program' as const, tag: '', tbd: timeTbd(p) } : null
    }),
    ...showerBookings.filter((b) => b.status === 'confirmed').map((b) => {
      const s = slots.find((x) => x.id === b.slot_id)
      return s ? { id: b.id, at: s.starts_at, title: '샤워실', sub: `${s.building} 부스 · ${s.gender === 'F' ? '여성' : '남성'}`, kind: 'shower' as const, tag: '', tbd: false } : null
    }),
    ...MEALS.map((m) => ({ id: m.id, at: mealAt(m), title: m.title, sub: `${m.location} · ${m.note}`, kind: 'meal' as const, tag: mealTag(m) })),
  ].filter((x): x is NonNullable<typeof x> => !!x).sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
  // 직접 고르기 전까지는 로그인 상태면 내 일정, 아니면 전체 프로그램 (데이터가 늦게 와도 맞게 따라간다)
  const myBookings = mine.filter((m) => m.kind !== 'meal')
  const [picked, setTab] = useState<Tab | null>(null)
  const tab: Tab = picked ?? (user ? 'mine' : 'all')
  const byDay = EVENT_DAYS.map((d) => ({ d, items: mine.filter((m) => dayKey(m.at) === d) })).filter((g) => g.items.length)

  const all = [
    ...sessions.filter((s) => dayKey(s.starts_at) === day).map((s) => ({ kind: 'session' as const, at: s.starts_at, s })),
    ...MEALS.filter((m) => m.day === day).map((m) => ({ kind: 'meal' as const, at: mealAt(m), m })),
  ]
  // 시각 미정 회차는 시각이 정해진 일정(공양·예불·확정 프로그램) 뒤로 보낸다
  const untimed = (r: (typeof all)[number]) => (r.kind === 'session' && timeTbd(programs.find((x) => x.id === r.s.program_id)) ? 1 : 0)
  all.sort((a, b) => untimed(a) - untimed(b) || Date.parse(a.at) - Date.parse(b.at))
  const LIMIT = 10
  const shown = all.slice(0, LIMIT)
  const allTitle = di !== null ? '오늘의 프로그램' : daysUntilStart() > 0 ? '첫날 프로그램' : '프로그램'

  return (
    <section className="px-5 pt-12">
      <SectionTitle eyebrow={tab === 'mine' ? '내 스케줄' : `11월 ${Number(day.slice(-2))}일 · Day ${(di ?? 0) + 1}`} right={<Link to="/reserve" className="-my-3 -mr-2 inline-flex min-h-[44px] items-center px-2 text-[13px] font-bold text-deep">{tab === 'mine' ? '예약 관리' : '전체 보기'}</Link>}>
        {tab === 'mine' ? '내 일정' : allTitle}
      </SectionTitle>
      <div className="-mt-2 mb-2">
        <Segmented<Tab> value={tab} onChange={setTab} options={[{ value: 'mine', label: `내 일정${myBookings.length ? ` ${myBookings.length}` : ''}` }, { value: 'all', label: '전체 프로그램' }]} />
      </div>

      {tab === 'mine' ? (
        !user ? (
          <div className="rounded-tile bg-mint px-4 py-5 text-center">
            <p className="text-[14px] font-bold">로그인하면 내가 예약한 일정이 여기에 모입니다</p>
            <Link to="/login" state={{ from: '/' }} className="btn mt-3 !px-5 !py-2.5 !text-[13px]">로그인</Link>
          </div>
        ) : !myBookings.length ? (
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
                    {m.kind === 'meal' ? (
                      <div className="flex items-baseline gap-4 border-t hairline py-3.5 first:border-t-0">
                        <span className="tnum min-w-[3.4em] shrink-0 text-[17px] font-extrabold text-ink">{fmtTime(m.at)}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-semibold">{m.title} <span className={`ml-1 rounded-md px-1.5 py-0.5 text-[12px] font-extrabold ${m.tag === '공양' ? 'bg-sun/50 text-ink' : m.tag === '입장' ? 'bg-sky/30 text-ink' : 'bg-mint text-deep'}`}>{m.tag}</span></span>
                          <span className="block truncate text-[12px] text-sub">{m.sub}</span>
                        </span>
                      </div>
                    ) : (
                    <Link to={`/reserve?tab=${m.kind}`} className="flex items-baseline gap-4 border-t hairline py-3.5 first:border-t-0">
                      <span className={`tnum min-w-[3.4em] shrink-0 font-extrabold ${m.kind === 'program' && m.tbd ? 'text-[12px] text-sub' : 'text-[17px] text-ink'}`}>{m.kind === 'program' && m.tbd ? '시간 협의중' : fmtTime(m.at)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold">{m.title}</span>
                        <span className="block truncate text-[12px] text-sub">{m.sub}</span>
                      </span>
                      <Icon name="chevron" size={16} className="self-center text-gray-300" />
                    </Link>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          ))
        )
      ) : (
        <ol>
          {shown.map((row) => {
            if (row.kind === 'meal') return (
              <li key={row.m.id} className="flex items-baseline gap-4 border-t hairline py-3.5 first:border-t-0">
                <span className="tnum min-w-[3.4em] shrink-0 text-[17px] font-extrabold text-ink">{row.m.time}</span>
                <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{row.m.title} <span className={`ml-1 rounded-md px-1.5 py-0.5 text-[12px] font-extrabold ${row.m.kind === 'meal' ? 'bg-sun/50 text-ink' : row.m.kind === 'info' ? 'bg-sky/30 text-ink' : 'bg-mint text-deep'}`}>{mealTag(row.m)}</span></span>
                <span className="shrink-0 text-[12px] font-bold text-sub">{row.m.kind === 'ritual' ? row.m.note : row.m.location}</span>
              </li>
            )
            const s = row.s
            const p = programs.find((x) => x.id === s.program_id)
            const left = s.capacity - s.booked_count
            const booked = bookings.some((b) => b.session_id === s.id && b.status === 'confirmed')
            return (
              <li key={s.id}>
                <Link to="/reserve?tab=program" className="flex items-baseline gap-4 border-t hairline py-3.5 first:border-t-0">
                  <span className={`tnum min-w-[3.4em] shrink-0 font-extrabold ${timeTbd(p) ? 'text-[12px] text-sub' : 'text-[17px] text-ink'}`}>{timeTbd(p) ? '시간 협의중' : fmtTime(s.starts_at)}</span>
                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold">{p?.title}</span>
                  <span className={`tnum shrink-0 text-[12px] font-bold ${booked ? 'text-deep' : left ? 'text-deep' : 'text-gray-500'}`}>{booked ? '내 예약' : left ? `${left}석` : '마감'}</span>
                </Link>
              </li>
            )
          })}
          {all.length > LIMIT && <li className="border-t hairline py-3 text-center"><Link to="/reserve?tab=program" className="text-[13px] font-bold text-deep">이 날 일정 {all.length - LIMIT}개 더 보기</Link></li>}
          {!all.length && <li className="py-6 text-center text-[13px] text-sub">이 날의 프로그램이 아직 없습니다</li>}
        </ol>
      )}
    </section>
  )
}
