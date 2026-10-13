import { useMemo, useState } from 'react'
import { useApp } from '../../data/AppProvider'
import { EVENT_DAYS, SHOWER_BOOTHS, SHOWER_BOOTH_CAPACITY } from '../../data/constants'
import { dayKey, fmtTime } from '../../lib/format'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { Chip } from '../ui'

const DAILY_MAX = 2 // 1인당 하루 예약 가능 횟수 (DB book_shower 와 동일)

export default function ShowerGrid({ toast }: { toast: (m: string) => void }) {
  const { user, slots, showerBookings, bookShower, cancelShower } = useApp()
  const requireAuth = useRequireAuth()
  const [day, setDay] = useState<string>(EVENT_DAYS[0])
  const [bld, setBld] = useState<string>(SHOWER_BOOTHS[0].building)
  const [gender, setGender] = useState<'F' | 'M'>('F')
  const list = useMemo(() => slots.filter((s) => s.building === bld && s.gender === gender && dayKey(s.starts_at) === day), [slots, bld, gender, day])
  const mineBy = (sid: string) => showerBookings.find((b) => b.slot_id === sid && b.status === 'confirmed')
  // 오늘(선택한 일차) 내 예약 수 — 동과 상관없이 하루 기준
  const slotById = useMemo(() => new Map(slots.map((s) => [s.id, s])), [slots])
  const myToday = showerBookings.filter((b) => b.status === 'confirmed' && dayKey(slotById.get(b.slot_id)?.starts_at ?? '') === day)
  const atLimit = !!user && myToday.length >= DAILY_MAX

  return (
    <div>
      <dl className="mb-6 grid grid-cols-3 gap-3 border-y hairline py-4 text-center">
        {[['5개', '샤워 부스'], [`남${SHOWER_BOOTH_CAPACITY}·여${SHOWER_BOOTH_CAPACITY}`, '부스당 30분'], [`${DAILY_MAX}회`, '1인당 하루']].map(([v, k]) => (
          <div key={k}><dt className="text-[11px] text-sub">{k}</dt><dd className="tnum text-[20px] font-extrabold">{v}</dd></div>
        ))}
      </dl>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {EVENT_DAYS.map((d, i) => <Chip key={d} active={day === d} onClick={() => setDay(d)}>{i + 1}일차</Chip>)}
      </div>
      <div className="no-scrollbar -mx-5 mt-2 flex gap-2 overflow-x-auto px-5">
        {(['F', 'M'] as const).map((g) => <Chip key={g} active={gender === g} onClick={() => setGender(g)}>{g === 'F' ? '여성' : '남성'}</Chip>)}
        <span className="w-px shrink-0 bg-line" />
        {SHOWER_BOOTHS.map((b) => <Chip key={b.building} active={bld === b.building} onClick={() => setBld(b.building)}>{b.building}</Chip>)}
      </div>
      <div className="mt-5 flex items-end justify-between">
        <p className="text-[13px] text-sub">{bld} 부스 · {gender === 'F' ? '여성' : '남성'} · 30분당 {list[0]?.capacity ?? SHOWER_BOOTH_CAPACITY}명</p>
        {user && (
          <p className={`tnum text-[12.5px] font-bold ${atLimit ? 'text-ember' : 'text-deep'}`}>
            오늘 내 예약 {myToday.length}/{DAILY_MAX}{atLimit ? ' · 더 예약하려면 하나를 취소하세요' : ''}
          </p>
        )}
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {list.map((s) => {
          const left = Math.max(0, s.capacity - s.booked_count)
          const mine = mineBy(s.id)
          const full = left === 0 && !mine
          const blocked = !mine && (full || atLimit)
          return (
            <button
              key={s.id}
              type="button"
              disabled={full}
              aria-label={`${fmtTime(s.starts_at)} ${mine ? '내 예약, 취소' : full ? '예약 완료, 마감' : `${left}자리 남음`}`}
              onClick={() => requireAuth(async () => {
                if (mine) { const r = await cancelShower(mine.id); return toast(r.ok ? '예약을 취소했습니다' : r.error) }
                if (atLimit) return toast(`샤워실은 1인당 하루 ${DAILY_MAX}회까지 예약할 수 있습니다`)
                const r = await bookShower(s.id)
                toast(r.ok ? '샤워실을 예약했습니다' : r.error)
              })}
              className={`rounded-xl border py-2.5 text-center transition duration-150 active:scale-95 ${mine ? 'border-deep bg-brand-grad text-onbrand' : full ? 'border-transparent bg-gray-50 text-gray-300' : blocked ? 'border-line bg-white text-gray-400' : 'border-line bg-white text-ink'}`}
            >
              <span className="tnum block text-[14px] font-bold">{fmtTime(s.starts_at)}</span>
              <span className={`tnum block text-[10.5px] ${mine ? 'text-onbrand/80' : full ? '' : blocked ? 'text-gray-400' : 'text-deep'}`}>
                {mine ? '내 예약' : full ? '예약 완료' : `${left}자리`}
              </span>
              {/* 채움 막대: 다른 사람 예약이 얼마나 찼는지 한눈에 (정원이 커도 칸을 넘지 않게) */}
              <span className={`mx-auto mt-1.5 block h-1 w-[70%] overflow-hidden rounded-full ${mine ? 'bg-onbrand/25' : 'bg-gray-200'}`} aria-hidden="true">
                <span className={`block h-full rounded-full ${mine ? 'bg-onbrand' : full ? 'bg-gray-300' : 'bg-deep'}`} style={{ width: `${Math.min(100, (s.booked_count / Math.max(1, s.capacity)) * 100)}%` }} />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
