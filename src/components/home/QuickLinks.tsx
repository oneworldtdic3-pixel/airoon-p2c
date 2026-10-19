import { Link } from 'react-router-dom'
import Icon from '../ui/Icon'

// 타일마다 브랜드 팔레트(민트·스카이·선·엠버)에서 한 색씩 — 같은 채도·명도로 맞춰 한 세트로 읽히게 한다.
const items = [
  { to: '/reserve?tab=program', label: '프로그램', icon: 'lantern', grad: 'linear-gradient(155deg, #5EE6C6 0%, #22CDB8 55%, #0AB5B0 100%)', glow: 'rgba(10,181,176,0.45)' },
  { to: '/reserve?tab=shower', label: '샤워실', icon: 'shower', grad: 'linear-gradient(155deg, #7FD8FF 0%, #4DB8F5 55%, #3399E8 100%)', glow: 'rgba(51,153,232,0.42)' },
  { to: '/reserve?tab=parking', label: '주차장', icon: 'car', grad: 'linear-gradient(155deg, #FFCB52 0%, #FBAE2C 55%, #F29312 100%)', glow: 'rgba(242,147,18,0.42)' },
  { to: '/more#map', label: '행사장 맵', icon: 'map', grad: 'linear-gradient(155deg, #FF9F86 0%, #FF7A5C 55%, #F0552A 100%)', glow: 'rgba(240,85,42,0.4)' },
]

export default function QuickLinks() {
  return (
    <section className="px-5 pt-12">
      <h2 className="mb-4 flex items-end gap-1.5">
        <img src="/now-sansa.png?v=2" alt="NOW Sansa" width={166} height={94} className="h-[46px] w-auto" />
        <span className="pb-0.5 text-[15px] font-extrabold tracking-[-0.02em]">사전 예약하기</span>
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {items.map((it) => (
          <Link
            key={it.label}
            to={it.to}
            style={{ backgroundImage: it.grad, boxShadow: `0 14px 26px -12px ${it.glow}, inset 0 1px 0 rgba(255,255,255,0.35)` }}
            className="relative flex aspect-[1.2] flex-col items-center justify-center gap-3 overflow-hidden rounded-card text-white transition duration-200 active:scale-[0.96]"
          >
            {/* 좌상단 광택 — 평면 색면에 입체감 */}
            <span aria-hidden="true" className="pointer-events-none absolute -left-6 -top-10 h-28 w-28 rounded-full bg-white/25 blur-2xl" />
            <span className="relative grid h-14 w-14 place-items-center rounded-[18px] bg-white/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_6px_14px_-6px_rgba(0,0,0,0.18)] ring-1 ring-white/30">
              <Icon name={it.icon} size={30} strokeWidth={2.1} className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.12)]" />
            </span>
            <span className="relative text-[16px] font-extrabold tracking-[-0.02em] [text-shadow:0_1px_2px_rgba(0,0,0,0.12)]">{it.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
