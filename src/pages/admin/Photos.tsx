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
  const remove = async (id: string) => {
    if (!window.confirm('이 사진을 완전히 삭제할까요? 되돌릴 수 없습니다.')) return
    const { data: path, error } = await supabase.rpc('admin_delete_photo', { p_photo: id })
    if (error) return toast(toMessage(error))
    // DB 행은 지워졌다. 저장소 파일은 Storage API 로 (SQL 직접 삭제는 Supabase 가 막는다)
    if (typeof path === 'string' && !path.startsWith('seed:')) await supabase.storage.from('photos').remove([path])
    await qc.invalidateQueries({ queryKey: ['photos'] })
    toast('삭제했습니다')
  }
  const removeAll = async () => {
    if (!window.confirm(`사진 ${photos.length}장과 좋아요, 저장된 파일을 모두 삭제할까요?\n되돌릴 수 없습니다. 테스트 데이터 정리용입니다.`)) return
    if (!window.confirm('정말 전체 삭제합니다. 계속할까요?')) return
    const paths = photos.map((p) => p.storage_path).filter((x) => !x.startsWith('seed:'))
    const { data, error } = await supabase.rpc('admin_delete_all_photos')
    if (error) return toast(toMessage(error))
    if (paths.length) {
      const r = await supabase.storage.from('photos').remove(paths)
      if (r.error) toast(`사진 ${data ?? 0}장을 지웠지만 파일 일부는 남았습니다: ${r.error.message}`)
    }
    await qc.invalidateQueries({ queryKey: ['photos'] })
    toast(`${data ?? 0}장을 삭제했습니다`)
  }
  const hidden = photos.filter((p) => p.is_hidden).length
  return (
    <div>
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="text-[12px] text-sub">전체 {photos.length}장 · 숨김 {hidden}장. 숨긴 사진은 작성자 본인과 관리자에게만 보입니다. 삭제는 되돌릴 수 없습니다.</p>
        {photos.length > 0 && <button type="button" onClick={() => void removeAll()} className="shrink-0 rounded-full border border-red-200 px-3 py-1.5 text-[12px] font-bold text-red-500">전체 삭제</button>}
      </div>
      <ul className="grid grid-cols-3 gap-[3px]">
        {photos.map((p) => (
          <li key={p.id} className="relative aspect-square overflow-hidden bg-mint">
            <img src={p.url} alt={`${p.spot_tag} · ${p.nickname}`} loading="lazy" className={`h-full w-full object-cover ${p.is_hidden ? 'opacity-30 grayscale' : ''}`} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-1.5 text-[10px] leading-tight text-white">
              <p className="truncate font-bold">{p.nickname}</p>
              <p className="opacity-80">{p.spot_tag} · {timeAgo(p.created_at)} · ♥{p.likes_count}</p>
            </div>
            <button
              type="button"
              onClick={() => void remove(p.id)}
              aria-label="삭제"
              className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-500/85 text-white"
            >
              <Icon name="close" size={14} />
            </button>
            <button
              onClick={() => void setHidden(p.id, !p.is_hidden)}
              aria-pressed={p.is_hidden}
              aria-label={p.is_hidden ? '다시 공개' : '숨기기'}
              className={`absolute right-1.5 top-1.5 flex h-7 items-center justify-center rounded-full px-2 ${p.is_hidden ? 'bg-brand-grad text-onbrand' : 'bg-ink/55 text-white'}`}
            >
              <span className="text-[10px] font-extrabold">{p.is_hidden ? '공개' : '숨김'}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
