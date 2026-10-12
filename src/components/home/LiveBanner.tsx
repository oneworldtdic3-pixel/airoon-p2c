import { Link } from 'react-router-dom'
import { useApp } from '../../data/AppProvider'
import { timeAgo } from '../../lib/format'
import Icon from '../ui/Icon'

/** 최신 알림 한 줄 + 둥둥 뜨는 핫핑크 "SOON" 말풍선 */
export default function LiveBanner() {
  const { notifications } = useApp()
  const n = notifications[0]
  if (!n) return null
  return (
    <Link to="/notifications" className="relative mx-5 flex items-center gap-3 border-l-2 border-deep py-1 pl-4">
      <div className="min-w-0 flex-1">
        <p className="eyebrow text-deep">지금 · {timeAgo(n.created_at)}</p>
        <p className="mt-0.5 truncate pr-16 text-[15px] font-bold">{n.title}</p>
      </div>
      {/* SOON 말풍선: 위아래로 살짝 떠다니고, 꼬리는 왼쪽 아래 */}
      <span aria-hidden className="pointer-events-none absolute right-9 -top-3 animate-[float_2.4s_ease-in-out_infinite]">
        <span className="relative block rounded-full bg-[#FF2D8A] px-2.5 py-1 text-[11px] font-black tracking-[0.12em] text-white shadow-[0_6px_16px_rgba(255,45,138,0.45)]">
          SOON
          <span className="absolute -bottom-1.5 left-3 h-3 w-3 rotate-45 rounded-[2px] bg-[#FF2D8A]" />
        </span>
      </span>
      <Icon name="chevron" size={18} className="text-gray-400" />
    </Link>
  )
}
