import { useState } from 'react'
import { useApp } from '../../data/AppProvider'
import { EVENT_DAYS } from '../../data/constants'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { Chip } from '../ui'
import Icon from '../ui/Icon'
import { naverConversion } from '../../lib/naverWcs'

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
      <div className="rounded-tile bg-sun/30 px-4 py-3.5">
        <p className="text-[15px] font-extrabold leading-snug">주차 무료 · 사전등록제(1팀 1대) · 미등록 차량 진입 불가</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-sub">차량번호와 이용 일자를 미리 등록해 주세요. 등록하지 않은 차량은 주차장에 들어올 수 없습니다. 쌍계사 경내는 차량이 들어갈 수 없으니 아래 두 곳 중 한 곳에 세워 주세요.</p>
      </div>

      <fieldset>
        <legend className="eyebrow mb-3">주차 구역</legend>
        <div className="grid grid-cols-2 gap-2.5">
          {zones.map((z) => (
            <button key={z.id} type="button" onClick={() => setZone(z.id)} aria-pressed={zone === z.id} className={`rounded-tile border p-4 text-left transition duration-200 active:scale-[0.97] ${zone === z.id ? 'border-deep bg-brand-grad text-onbrand' : 'border-line bg-white'}`}>
              <span className="block text-[17px] font-extrabold">{z.name}</span>
              <span className={`mt-3 block text-[13px] font-bold ${zone === z.id ? 'text-onbrand' : 'text-deep'}`}>{z.how}</span>
              <span className={`block text-[12px] ${zone === z.id ? 'text-onbrand/75' : 'text-sub'}`}>{z.desc}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="car" className="eyebrow mb-3 block">차량번호</label>
        <input id="car" value={car} onChange={(e) => setCar(e.target.value)} placeholder="123가 4567" autoComplete="off" className="field tnum text-[18px] font-bold tracking-wider" />
      </div>

      <div>
        <p className="eyebrow mb-3">이용 일자 <span className="ml-1 font-semibold normal-case tracking-normal text-sub">(날짜를 체크해 주세요.)</span></p>
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
          if (r.ok) naverConversion('lead')
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
