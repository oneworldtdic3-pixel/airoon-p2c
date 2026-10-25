import { Link } from 'react-router-dom'
import Icon from '../ui/Icon'

// 단색 픽토그램 + 강조색 하나: 다섯 타일 모두 같은 민트 바탕, 같은 deep 아이콘. 그라데이션·그림자 없음.
const items = [
  { to: '/reserve?tab=camp', label: '캠핑 사이트', icon: 'pin' },
  { to: '/reserve?tab=program', label: '프로그램', icon: 'lantern' },
  { to: '/reserve?tab=shower', label: '샤워실', icon: 'shower' },
  { to: '/reserve?tab=parking', label: '주차장', icon: 'car' },
  { to: '/more#map', label: '행사장 맵', icon: 'map' },
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
            <span className="grid h-[52px] w-[52px] place-items-center rounded-[17px] bg-mint text-deep">
              <Icon name={it.icon} size={25} strokeWidth={2} />
            </span>
            <span className="whitespace-nowrap text-[12px] font-bold tracking-[-0.02em] text-ink">{it.label}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
