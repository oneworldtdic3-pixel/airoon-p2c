import { useMemo, useState } from 'react'
import { useApp } from '../../mock/store'
import { EVENT_DAYS, SHOWER_BUILDINGS } from '../../mock/data'
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
    <div className="space-y-4">
      <div className="rounded-card bg-mint p-4 text-[13px] leading-relaxed text-deep">
        <b>이용 안내</b><br />30분 단위 예약 · 팀당 1일 2회까지 · 노쇼 2회 시 당일 예약이 제한돼요.
      </div>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {EVENT_DAYS.map((d, i) => <Chip key={d} active={day === d} onClick={() => setDay(d)}>DAY {i + 1}</Chip>)}
      </div>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {SHOWER_BUILDINGS.map((b) => <Chip key={b.building} active={bld === b.building} onClick={() => setBld(b.building)}>{b.building} · {b.gender === 'F' ? '여' : '남'}</Chip>)}
      </div>
      <p className="text-[13px] font-bold text-sub">{bld} ({gender === 'F' ? '여성' : '남성'}) · 슬롯당 {list[0]?.capacity ?? 4}명</p>
      <div className="grid grid-cols-3 gap-2.5">
        {list.map((s) => {
          const left = s.capacity - s.booked_count
          const mine = mineBy(s.id)
          const full = left === 0 && !mine
          return (
            <button
              key={s.id}
              disabled={full}
              onClick={() => requireAuth(() => {
                if (mine) { cancelShower(mine.id); return toast('예약을 취소했어요') }
                const r = bookShower(s.id)
                toast(r.ok ? '샤워실 예약이 완료되었어요' : r.error)
              })}
              className={`rounded-2xl px-2 py-3 text-center transition active:scale-95 ${mine ? 'bg-deep text-white shadow-card' : full ? 'bg-gray-100 text-gray-400' : 'bg-mint text-ink'}`}
            >
              <span className="block text-[15px] font-extrabold tabular-nums">{fmtTime(s.starts_at)}</span>
              <span className={`block text-[11px] font-semibold ${mine ? 'text-white/90' : full ? '' : 'text-deep'}`}>{mine ? '내 예약' : full ? '마감' : `${left}자리`}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
