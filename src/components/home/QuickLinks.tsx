import { Link } from 'react-router-dom'
import Icon from '../ui/Icon'

const items = [
  { to: '/reserve?tab=program', label: '프로그램', icon: 'lantern' },
  { to: '/reserve?tab=shower', label: '샤워실', icon: 'shower' },
  { to: '/reserve?tab=parking', label: '주차장', icon: 'car' },
  { to: '/more#map', label: '행사장 맵', icon: 'map' },
]

export default function QuickLinks() {
  return (
    <section className="px-5 pt-12">
      <h2 className="mb-4 flex items-end gap-1.5">
        <img src="/now-sansa.png?v=2" alt="NOW Sansa" width={166} height={94} className="h-[46px] w-auto" />
        <span className="pb-0.5 text-[15px] font-extrabold tracking-[-0.02em]">사전 예약하기</span>
      </h2>
      <div className="grid grid-cols-2 gap-2.5">
        {items.map((it, i) => (
          <Link key={it.label} to={it.to} className={`flex aspect-[1.55] flex-col justify-between rounded-tile p-4 transition duration-200 active:scale-[0.97] ${i === 0 ? 'bg-brand-grad text-onbrand font-extrabold' : 'border border-line bg-white text-ink'}`}>
            <Icon name={it.icon} size={28} className={i === 0 ? 'text-onbrand' : 'text-deep'} />
            <span className="text-[15px] font-bold">{it.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
