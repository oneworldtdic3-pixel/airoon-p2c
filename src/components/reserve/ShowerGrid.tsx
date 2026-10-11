import { useMemo, useState } from 'react'
import { useApp } from '../../data/AppProvider'
import { EVENT_DAYS, SHOWER_BUILDINGS } from '../../data/constants'
import { dayKey, fmtTime } from '../../lib/format'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { Chip } from '../ui'

const DAILY_MAX = 2 // 1인당 하루 예약 가능 횟수 (DB book_shower 와 동일)

export default function ShowerGrid({ toast }: { toast: (m: string) => void }) {
  const { user, slots, showerBookings, bookShower, cancelShower } = useApp()
  const requireAuth = useRequireAuth()
  const [day, setDay] = useState<string>(EVENT_DAYS[0])
  const [bld, setBld] = useState(SHOWER_BUILDINGS[0].building)
  const list = useMemo(() => slots.filter((s) => s.building === bld && dayKey(s.starts_at) === day), [slots, bld, day])
  const mineBy = (sid: string) => showerBookings.find((b) => b.slot_id === sid && b.status === 'confirmed')
  // 오늘(선택한 일차) 내 예약 수 — 동과 상관없이 하루 기준
  const slotById = useMemo(() => new Map(slots.map((s) => [s.id, s])), [slots])
  const myToday = showerBookings.filter((b) => b.status === 'confirmed' && dayKey(slotById.get(b.slot_id)?.starts_at ?? '') === day)
  const atLimit = !!user && myToday.length >= DAILY_MAX
  const gender = SHOWER_BUILDINGS.find((b) => b.building === bld)!.gender

  return (
    <div>
      <dl className="mb-6 grid grid-cols-3 gap-3 border-y hairline py-4 text-center">
        {[['30분', '슬롯 단위'], [`${DAILY_MAX}회`, '1인당 하루'], ['2회', '노쇼 시 당일 제한']].map(([v, k]) => (
          <div key={k}><dt className="text-[11px] text-sub">{k}</dt><dd className="tnum text-[20px] font-extrabold">{v}</dd></div>
        ))}
      </dl>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {EVENT_DAYS.map((d, i) => <Chip key={d} active={day === d} onClick={() => setDay(d)}>{i + 1}일차</Chip>)}
        <span className="w-px shrink-0 bg-line" />
        {SHOWER_BUILDINGS.map((b) => <Chip key={b.building} active={bld === b.building} onClick={() => setBld(b.building)}>{b.building.slice(-1)}동 {b.gender === 'F' ? '여' : '남'}</Chip>)}
      </div>
      <div className="mt-5 flex items-end justify-between">
        <p className="text-[13px] text-sub">{bld} · {gender === 'F' ? '여성' : '남성'} · 슬롯당 {list[0]?.capacity ?? 4}명</p>
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
              {/* 정원 점: 찬 칸은 진하게 — 다른 사람 예약이 얼마나 찼는지 한눈에 */}
              <span className="mt-1 flex justify-center gap-[3px]" aria-hidden="true">
                {Array.from({ length: s.capacity }, (_, i) => (
                  <span key={i} className={`h-1 w-1 rounded-full ${i < s.booked_count ? (mine ? 'bg-onbrand' : 'bg-deep') : mine ? 'bg-onbrand/30' : 'bg-gray-200'}`} />
                ))}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
