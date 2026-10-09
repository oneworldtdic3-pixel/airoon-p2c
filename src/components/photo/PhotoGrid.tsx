import { useApp } from '../../mock/store'
import Icon from '../ui/Icon'
import type { Photo } from '../../mock/types'

const isNew = (iso: string) => Date.now() - new Date(iso).getTime() < 30 * 60000

export default function PhotoGrid({ list, onOpen }: { list: Photo[]; onOpen: (p: Photo) => void }) {
  const { likedIds, toggleLike } = useApp()
  if (!list.length) return <p className="py-16 text-center text-[14px] text-sub">아직 사진이 없어요. 첫 사진을 올려 보세요!</p>
  return (
    <ul className="grid grid-cols-3 gap-1.5">
      {list.map((p) => (
        <li key={p.id} className="relative aspect-square overflow-hidden rounded-2xl bg-mint">
          <button onClick={() => onOpen(p)} className="block h-full w-full" aria-label={`${p.spot_tag} 사진 크게 보기`}>
            <img src={p.url} alt="" loading="lazy" className="h-full w-full object-cover" />
          </button>
          {isNew(p.created_at) && <span className="absolute left-1.5 top-1.5 rounded-full bg-sun px-2 py-0.5 text-[10px] font-extrabold text-ink">NEW</span>}
          <button onClick={() => toggleLike(p.id)} aria-pressed={likedIds.has(p.id)} aria-label="좋아요" className="absolute bottom-1 right-1 flex items-center gap-1 rounded-full bg-ink/45 px-2 py-1 text-[11px] font-bold text-white backdrop-blur">
            <Icon name="heart" size={13} fill={likedIds.has(p.id)} className={likedIds.has(p.id) ? 'text-red-400' : ''} />{p.likes_count}
          </button>
        </li>
      ))}
    </ul>
  )
}
