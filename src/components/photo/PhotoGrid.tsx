import { useApp } from '../../data/AppProvider'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import Icon from '../ui/Icon'
import type { Photo } from '../../data/types'

const isNew = (iso: string) => Date.now() - new Date(iso).getTime() < 30 * 60000

export default function PhotoGrid({ list, onOpen }: { list: Photo[]; onOpen: (p: Photo) => void }) {
  const { likedIds, toggleLike } = useApp()
  const requireAuth = useRequireAuth()
  if (!list.length) return <p className="py-20 text-center text-[14px] text-sub">아직 사진이 없습니다.<br />첫 장면을 올려 주세요.</p>
  return (
    <ul className="grid grid-cols-3 gap-[3px]">
      {list.map((p, i) => (
        <li key={p.id} className={`relative overflow-hidden bg-mint ${i === 0 ? 'col-span-2 row-span-2' : 'aspect-square'}`}>
          <button onClick={() => onOpen(p)} className="block h-full w-full" aria-label={`${p.spot_tag} 사진 크게 보기`}>
            <img src={p.url} alt="" loading="lazy" className="h-full w-full object-cover" />
          </button>
          {isNew(p.created_at) && <span className="absolute left-2 top-2 h-2 w-2 rounded-full bg-ember ring-2 ring-white" aria-label="새 사진" />}
          <button onClick={() => requireAuth(() => { void toggleLike(p.id) })} aria-pressed={likedIds.has(p.id)} aria-label="좋아요" className="absolute bottom-1.5 right-1.5 flex items-center gap-1 text-[11px] font-bold text-white drop-shadow">
            <Icon name="heart" size={14} fill={likedIds.has(p.id)} />{p.likes_count}
          </button>
        </li>
      ))}
    </ul>
  )
}
