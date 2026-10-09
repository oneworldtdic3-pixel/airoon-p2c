import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { resolveSeedArt } from '../../data/art'
import { toMessage } from '../../data/errors'
import { Toggle } from '../../components/ui'
import type { Banner } from '../../data/types'

export default function Banners({ toast }: { toast: (m: string) => void }) {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const { data, error } = await supabase.from('banners').select('*').order('sort')
      if (error) throw error
      return (data as Omit<Banner, 'image'>[]).map((b) => ({ ...b, image: resolveSeedArt(b.image_path) }))
    },
  })
  const setActive = async (id: string, v: boolean) => {
    const { error } = await supabase.from('banners').update({ is_active: v }).eq('id', id)
    if (error) return toast(toMessage(error))
    await Promise.all([qc.invalidateQueries({ queryKey: ['admin-banners'] }), qc.invalidateQueries({ queryKey: ['banners'] })])
  }
  return (
    <div>
      <p className="mb-3 text-[12px] text-sub">홈 덱에 돌아가는 광고 배너. 꺼 두면 즉시 사라집니다. 등록·이미지 교체는 Supabase 대시보드 banners 테이블에서.</p>
      <ul className="divide-y hairline">
        {(q.data ?? []).map((b) => (
          <li key={b.id} className="flex items-center gap-3 py-3">
            <img src={b.image} alt="" className="h-12 w-16 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-bold">{b.title}</p>
              <p className="truncate text-[12px] text-sub">{b.sponsor} · {b.sub}</p>
            </div>
            <Toggle on={b.is_active} label={`${b.title} 노출`} onChange={(v) => void setActive(b.id, v)} />
          </li>
        ))}
      </ul>
    </div>
  )
}
