import { useState } from 'react'
import { useApp } from '../../mock/store'
import { EVENT_DAYS } from '../../mock/data'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { Chip } from '../ui'
import Icon from '../ui/Icon'

const zones = [
  { id: 'P1' as const, name: '제1주차장', how: '도보 이동', desc: '입구에서 도보 약 10분' },
  { id: 'P2' as const, name: '제2주차장', how: '셔틀 이동', desc: '셔틀버스 상시 운행' },
]

export default function ParkingForm({ toast }: { toast: (m: string) => void }) {
  const { parking, saveParking } = useApp()
  const requireAuth = useRequireAuth()
  const [zone, setZone] = useState<'P1' | 'P2'>(parking?.zone ?? 'P1')
  const [car, setCar] = useState(parking?.car_number ?? '')
  const [dates, setDates] = useState<string[]>(parking?.dates ?? [...EVENT_DAYS])

  return (
    <div className="space-y-5">
      <div className="flex gap-3 rounded-card bg-sun/25 p-4 text-[14px] font-bold leading-snug">
        <Icon name="car" className="mt-0.5 shrink-0 text-deep" />
        <span>쌍계사 경내 차량 진입 불가<span className="mt-0.5 block text-[12px] font-medium text-sub">반드시 지정 주차장을 이용해 주세요.</span></span>
      </div>

      <div>
        <p className="mb-2 text-[14px] font-extrabold">구역 선택</p>
        <div className="grid grid-cols-2 gap-3">
          {zones.map((z) => (
            <button key={z.id} onClick={() => setZone(z.id)} aria-pressed={zone === z.id} className={`rounded-card p-4 text-left transition active:scale-[0.97] ${zone === z.id ? 'bg-deep text-white shadow-float' : 'card'}`}>
              <span className="block text-[16px] font-extrabold">{z.name}</span>
              <span className={`mt-1 block text-[12px] font-bold ${zone === z.id ? 'text-sun' : 'text-deep'}`}>{z.how}</span>
              <span className={`mt-1 block text-[12px] ${zone === z.id ? 'text-white/85' : 'text-sub'}`}>{z.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="car" className="mb-2 block text-[14px] font-extrabold">차량번호</label>
        <input id="car" value={car} onChange={(e) => setCar(e.target.value)} placeholder="예) 123가 4567" autoComplete="off" className="w-full rounded-2xl border-2 border-transparent bg-mint px-4 py-3.5 font-semibold outline-none focus:border-brand" />
      </div>

      <div>
        <p className="mb-2 text-[14px] font-extrabold">이용 일자</p>
        <div className="flex gap-2">
          {EVENT_DAYS.map((d, i) => (
            <Chip key={d} active={dates.includes(d)} onClick={() => setDates((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort()))}>DAY {i + 1}</Chip>
          ))}
        </div>
      </div>

      <button
        className="pill-btn w-full"
        onClick={() => requireAuth(() => {
          const r = saveParking(zone, car, dates)
          toast(r.ok ? '주차 등록이 완료되었어요' : r.error)
        })}
      >
        {parking ? '주차 정보 수정' : '주차 등록하기'}
      </button>
      {parking && (
        <p className="rounded-2xl bg-mint px-4 py-3 text-[13px] font-semibold text-deep">
          등록됨 · {zones.find((z) => z.id === parking.zone)!.name} · {parking.car_number}
        </p>
      )}
    </div>
  )
}
