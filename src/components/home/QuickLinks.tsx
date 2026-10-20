import { Link } from 'react-router-dom'
import Icon from '../ui/Icon'

// 타일마다 브랜드 팔레트(민트·스카이·선·엠버)에서 한 색씩 — 같은 채도·명도로 맞춰 한 세트로 읽히게 한다.
const items = [
  { to: '/reserve?tab=camp', label: '캠핑 사이트', icon: 'pin', grad: 'linear-gradient(155deg, #7CE0A0 0%, #3DBF6E 55%, #1E8E5A 100%)', glow: 'rgba(30,142,90,0.42)' },
  { to: '/reserve?tab=program', label: '프로그램', icon: 'lantern', grad: 'linear-gradient(155deg, #5EE6C6 0%, #22CDB8 55%, #0AB5B0 100%)', glow: 'rgba(10,181,176,0.45)' },
  { to: '/reserve?tab=shower', label: '샤워실', icon: 'shower', grad: 'linear-gradient(155deg, #7FD8FF 0%, #4DB8F5 55%, #3399E8 100%)', glow: 'rgba(51,153,232,0.42)' },
  { to: '/reserve?tab=parking', label: '주차장', icon: 'car', grad: 'linear-gradient(155deg, #FFCB52 0%, #FBAE2C 55%, #F29312 100%)', glow: 'rgba(242,147,18,0.42)' },
  { to: '/more#map', label: '행사장 맵', icon: 'map', grad: 'linear-gradient(155deg, #FF9F86 0%, #FF7A5C 55%, #F0552A 100%)', glow: 'rgba(240,85,42,0.4)' },
]

export default function QuickLinks() {
  return (
    <section className="px-5 pt-10">
      <h2 className="mb-3 flex items-end gap-1.5">
        <img src="/now-sansa.png?v=2" alt="NOW Sansa" width={166} height={94} className="h-[46px] w-auto" />
        <span className="pb-0.5 text-[15px] font-extrabold tracking-[-0.02em]">사전 예약하기</span>
      </h2>
      {/* 다른 앱의 퀵메뉴처럼: 작은 아이콘 타일 + 아래 라벨, 한 줄에 다섯 개 */}
      <div className="grid grid-cols-5 gap-x-1.5">
        {items.map((it) => (
          <Link key={it.label} to={it.to} className="flex flex-col items-center gap-1.5 py-1 transition duration-200 active:scale-[0.94]">
            <span
              style={{ backgroundImage: it.grad, boxShadow: `0 8px 16px -8px ${it.glow}, inset 0 1px 0 rgba(255,255,255,0.4)` }}
              className="grid h-[52px] w-[52px] place-items-center rounded-[17px] text-white"
            >
              <Icon name={it.icon} size={25} strokeWidth={2.1} className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]" />
            </span>
            <span className="whitespace-nowrap text-[12px] font-bold tracking-[-0.02em] text-ink">{it.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
