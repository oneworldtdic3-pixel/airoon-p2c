import { Link } from 'react-router-dom'
import { useApp } from '../../data/AppProvider'
import { timeAgo } from '../../lib/format'
import Icon from '../ui/Icon'

export default function LiveBanner() {
  const { notifications } = useApp()
  const n = notifications[0]
  if (!n) return null
  return (
    <Link to="/notifications" className="mx-5 flex items-center gap-3 border-l-2 border-deep py-1 pl-4">
      <div className="min-w-0 flex-1">
        <p className="eyebrow text-deep">지금 · {timeAgo(n.created_at)}</p>
        <p className="mt-0.5 truncate text-[15px] font-bold">{n.title}</p>
      </div>
      <Icon name="chevron" size={18} className="text-gray-400" />
    </Link>
  )
}
