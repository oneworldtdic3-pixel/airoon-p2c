import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { PressArticle } from '../../data/types'

const SHOW = 4

export const fmtPressDate = (d: string | null, created: string) => {
  const s = d ?? created.slice(0, 10)
  const [y, m, dd] = s.split('-')
  return `${y}.${m}.${dd}`
}

export function usePress() {
  return useQuery({
    queryKey: ['press'],
    queryFn: async () => {
      const { data, error } = await supabase.from('press_articles').select('*').eq('is_hidden', false)
        .order('published_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false }).limit(30)
      if (error) throw error
      return data as PressArticle[]
    },
    staleTime: 60_000,
  })
}

/** 더보기 '산사캠프 소식' — 운영자가 등록한 언론 보도. 등록·숨김 즉시 반영(Realtime) */
export default function PressNews() {
  const { data = [] } = usePress()
  const [all, setAll] = useState(false)
  if (!data.length) return null
  const list = all ? data : data.slice(0, SHOW)
  return (
    <div className="mt-6">
      <p className="eyebrow mb-2">언론 보도 <span className="tnum text-deep">{data.length}</span></p>
      <ul className="divide-y divide-line border-y border-line">
        {list.map((a) => (
          <li key={a.id}>
            <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-3 active:opacity-70">
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[14px] font-bold leading-snug">{a.title}</p>
                <p className="mt-1 truncate text-[12px] text-sub">
                  <span className="font-bold text-deep">{a.outlet || '언론'}</span> · <span className="tnum">{fmtPressDate(a.published_at, a.created_at)}</span>
                </p>
              </div>
              {a.image_url && (
                <img src={a.image_url} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                  className="h-16 w-20 shrink-0 rounded-xl bg-mint object-cover" />
              )}
            </a>
          </li>
        ))}
      </ul>
      {data.length > SHOW && (
        <button type="button" onClick={() => setAll((v) => !v)} className="mt-2 w-full py-2 text-[13px] font-bold text-sub">
          {all ? '접기' : `기사 ${data.length - SHOW}개 더 보기`}
        </button>
      )}
    </div>
  )
}
