import { Link } from 'react-router-dom'
import Icon from '../ui/Icon'
import { SectionTitle } from '../ui'

const items = [
  { to: '/reserve?tab=program', label: '프로그램', sub: '체험 예약', icon: 'ticket' },
  { to: '/reserve?tab=shower', label: '샤워실', sub: '30분 슬롯', icon: 'shower' },
  { to: '/reserve?tab=parking', label: '주차장', sub: '구역·차량등록', icon: 'car' },
  { to: '/more#map', label: '행사장맵', sub: '한눈에 보기', icon: 'map' },
]

export default function QuickLinks() {
  return (
    <section className="px-5 pt-8">
      <SectionTitle>바로가기</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {items.map((it) => (
          <Link key={it.label} to={it.to} className="card flex items-center gap-3 p-4 transition active:scale-[0.97]">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mint text-deep"><Icon name={it.icon} /></span>
            <span>
              <span className="block text-[15px] font-extrabold">{it.label}</span>
              <span className="block text-[12px] text-sub">{it.sub}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
