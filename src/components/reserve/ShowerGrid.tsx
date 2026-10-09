import { useMemo, useState } from 'react'
import { useApp } from '../../data/AppProvider'
import { EVENT_DAYS, SHOWER_BUILDINGS } from '../../data/constants'
import { dayKey, fmtTime } from '../../lib/format'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { Chip } from '../ui'

export default function ShowerGrid({ toast }: { toast: (m: string) => void }) {
  const { slots, showerBookings, bookShower, cancelShower } = useApp()
  const requireAuth = useRequireAuth()
  const [day, setDay] = useState<string>(EVENT_DAYS[0])
  const [bld, setBld] = useState(SHOWER_BUILDINGS[0].building)
  const list = useMemo(() => slots.filter((s) => s.building === bld && dayKey(s.starts_at) === day), [slots, bld, day])
  const mineBy = (sid: string) => showerBookings.find((b) => b.slot_id === sid && b.status === 'confirmed')
  const gender = SHOWER_BUILDINGS.find((b) => b.building === bld)!.gender

  return (
    <div>
      <dl className="mb-6 grid grid-cols-3 gap-3 border-y hairline py-4 text-center">
        {[['30분', '슬롯 단위'], ['2회', '팀당 하루'], ['2회', '노쇼 시 당일 제한']].map(([v, k]) => (
          <div key={k}><dt className="text-[11px] text-sub">{k}</dt><dd className="tnum text-[20px] font-extrabold">{v}</dd></div>
        ))}
      </dl>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {EVENT_DAYS.map((d, i) => <Chip key={d} active={day === d} onClick={() => setDay(d)}>{i + 1}일차</Chip>)}
        <span className="w-px shrink-0 bg-line" />
        {SHOWER_BUILDINGS.map((b) => <Chip key={b.building} active={bld === b.building} onClick={() => setBld(b.building)}>{b.building.slice(-1)}동 {b.gender === 'F' ? '여' : '남'}</Chip>)}
      </div>
      <p className="mt-5 text-[13px] text-sub">{bld} · {gender === 'F' ? '여성' : '남성'} · 슬롯당 {list[0]?.capacity ?? 4}명</p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {list.map((s) => {
          const left = s.capacity - s.booked_count
          const mine = mineBy(s.id)
          const full = left === 0 && !mine
          return (
            <button
              key={s.id}
              disabled={full}
              onClick={() => requireAuth(async () => {
                if (mine) { const r = await cancelShower(mine.id); return toast(r.ok ? '예약을 취소했습니다' : r.error) }
                const r = await bookShower(s.id)
                toast(r.ok ? '샤워실을 예약했습니다' : r.error)
              })}
              className={`rounded-xl border py-2.5 text-center transition duration-150 active:scale-95 ${mine ? 'border-deep bg-deep text-white' : full ? 'border-transparent bg-gray-50 text-gray-300' : 'border-line bg-white text-ink'}`}
            >
              <span className="tnum block text-[14px] font-bold">{fmtTime(s.starts_at)}</span>
              <span className={`tnum block text-[10.5px] ${mine ? 'text-white/80' : full ? '' : 'text-deep'}`}>{mine ? '내 예약' : full ? '마감' : `${left}`}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
