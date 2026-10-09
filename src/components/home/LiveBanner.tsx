import { Link } from 'react-router-dom'
import { useApp } from '../../mock/store'
import { timeAgo } from '../../lib/format'
import Icon from '../ui/Icon'

export default function LiveBanner() {
  const { notifications } = useApp()
  const n = notifications[0]
  if (!n) return null
  return (
    <Link to="/notifications" className="mx-5 mt-3 flex items-center gap-3 rounded-card bg-mint p-4 active:scale-[0.99]">
      <span className="flex items-center gap-1.5 rounded-full bg-deep px-2.5 py-1 text-[11px] font-extrabold text-white">
        <span className="h-1.5 w-1.5 rounded-full bg-sun" style={{ animation: 'glow 1.4s infinite' }} />LIVE
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold">{n.title}</p>
        <p className="text-[12px] text-sub">{timeAgo(n.created_at)}</p>
      </div>
      <Icon name="back" size={18} className="rotate-180 text-deep" />
    </Link>
  )
}
