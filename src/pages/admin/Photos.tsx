import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useApp } from '../../data/AppProvider'
import { toMessage } from '../../data/errors'
import { timeAgo } from '../../lib/format'
import Icon from '../../components/ui/Icon'

export default function Photos({ toast }: { toast: (m: string) => void }) {
  const { photos } = useApp() // 관리자는 RLS 상 숨긴 사진도 받는다
  const qc = useQueryClient()
  const setHidden = async (id: string, hidden: boolean) => {
    const { error } = await supabase.rpc('admin_set_photo_hidden', { p_photo: id, p_hidden: hidden })
    if (error) return toast(toMessage(error))
    await qc.invalidateQueries({ queryKey: ['photos'] })
    toast(hidden ? '숨겼습니다' : '다시 공개했습니다')
  }
  const hidden = photos.filter((p) => p.is_hidden).length
  return (
    <div>
      <p className="mb-3 text-[12px] text-sub">전체 {photos.length}장 · 숨김 {hidden}장. 숨긴 사진은 작성자 본인과 관리자에게만 보입니다.</p>
      <ul className="grid grid-cols-3 gap-[3px]">
        {photos.map((p) => (
          <li key={p.id} className="relative aspect-square overflow-hidden bg-mint">
            <img src={p.url} alt={`${p.spot_tag} · ${p.nickname}`} loading="lazy" className={`h-full w-full object-cover ${p.is_hidden ? 'opacity-30 grayscale' : ''}`} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-1.5 text-[10px] leading-tight text-white">
              <p className="truncate font-bold">{p.nickname}</p>
              <p className="opacity-80">{p.spot_tag} · {timeAgo(p.created_at)} · ♥{p.likes_count}</p>
            </div>
            <button
              onClick={() => void setHidden(p.id, !p.is_hidden)}
              aria-pressed={p.is_hidden}
              aria-label={p.is_hidden ? '다시 공개' : '숨기기'}
              className={`absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full text-white ${p.is_hidden ? 'bg-deep' : 'bg-ink/55'}`}
            >
              <Icon name={p.is_hidden ? 'check' : 'close'} size={14} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
