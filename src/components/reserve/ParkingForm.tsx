import { useState } from 'react'
import { useApp } from '../../data/AppProvider'
import { EVENT_DAYS } from '../../data/constants'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { Chip } from '../ui'
import Icon from '../ui/Icon'

const zones = [
  { id: 'P1' as const, name: '제1주차장', how: '도보 10분', desc: '일주문 입구까지 걸어서' },
  { id: 'P2' as const, name: '제2주차장', how: '셔틀 7분', desc: '20분 간격 상시 운행' },
]

export default function ParkingForm({ toast }: { toast: (m: string) => void }) {
  const { parking, saveParking } = useApp()
  const requireAuth = useRequireAuth()
  const [zone, setZone] = useState<'P1' | 'P2'>(parking?.zone ?? 'P1')
  const [car, setCar] = useState(parking?.car_number ?? '')
  const [dates, setDates] = useState<string[]>(parking?.dates ?? [...EVENT_DAYS])

  return (
    <div className="space-y-7">
      <p className="border-l-2 border-ember pl-4 text-[15px] font-bold leading-snug">
        쌍계사 경내는 차량이 들어갈 수 없습니다.<span className="mt-1 block text-[13px] font-medium text-sub">아래 두 곳 중 한 곳에 세워 주세요.</span>
      </p>

      <fieldset>
        <legend className="eyebrow mb-3">주차 구역</legend>
        <div className="grid grid-cols-2 gap-2.5">
          {zones.map((z) => (
            <button key={z.id} type="button" onClick={() => setZone(z.id)} aria-pressed={zone === z.id} className={`rounded-tile border p-4 text-left transition duration-200 active:scale-[0.97] ${zone === z.id ? 'border-deep bg-brand-grad text-white' : 'border-line bg-white'}`}>
              <span className="block text-[17px] font-extrabold">{z.name}</span>
              <span className={`mt-3 block text-[13px] font-bold ${zone === z.id ? 'text-sun' : 'text-deep'}`}>{z.how}</span>
              <span className={`block text-[12px] ${zone === z.id ? 'text-white/80' : 'text-sub'}`}>{z.desc}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="car" className="eyebrow mb-3 block">차량번호</label>
        <input id="car" value={car} onChange={(e) => setCar(e.target.value)} placeholder="123가 4567" autoComplete="off" className="field tnum text-[18px] font-bold tracking-wider" />
      </div>

      <div>
        <p className="eyebrow mb-3">이용 일자</p>
        <div className="flex gap-2">
          {EVENT_DAYS.map((d, i) => (
            <Chip key={d} active={dates.includes(d)} onClick={() => setDates((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d].sort()))}>{i + 1}일차 · 11.{Number(d.slice(-2))}</Chip>
          ))}
        </div>
      </div>

      <button
        className="btn w-full"
        onClick={() => requireAuth(async () => {
          const r = await saveParking(zone, car, dates)
          toast(r.ok ? '주차 정보를 등록했습니다' : r.error)
        })}
      >
        {parking ? '주차 정보 수정' : '등록하기'}
      </button>
      {parking && (
        <p className="flex items-center gap-2 text-[13px] text-sub"><Icon name="check" size={16} className="text-deep" />{zones.find((z) => z.id === parking.zone)!.name} · {parking.car_number} 등록됨</p>
      )}
    </div>
  )
}
