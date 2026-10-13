import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { toMessage } from '../../data/errors'
import { Toggle } from '../../components/ui'
import type { PressArticle } from '../../data/types'
import { fmtPressDate } from '../../components/more/PressNews'

type Draft = { url: string; title: string; outlet: string; image_url: string | null; published_at: string }
const EMPTY: Draft = { url: '', title: '', outlet: '', image_url: null, published_at: '' }

/** 언론 보도 관리 — 기사 링크를 붙여 넣으면 제목·언론사·이미지·날짜를 자동으로 채운다 */
export default function Press({ toast }: { toast: (m: string) => void }) {
  const qc = useQueryClient()
  const [d, setD] = useState<Draft>(EMPTY)
  const [step, setStep] = useState<'url' | 'edit'>('url')
  const [busy, setBusy] = useState(false)
  const q = useQuery({
    queryKey: ['admin-press'],
    queryFn: async () => {
      const { data, error } = await supabase.from('press_articles').select('*').order('published_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false })
      if (error) throw error
      return data as PressArticle[]
    },
  })
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ['admin-press'] }), qc.invalidateQueries({ queryKey: ['press'] })])

  const preview = async () => {
    const url = d.url.trim()
    if (!/^https?:\/\/\S+$/i.test(url)) return toast(toMessage('URL_INVALID'))
    setBusy(true)
    const { data, error } = await supabase.functions.invoke('press-preview', { body: { url } })
    setBusy(false)
    if (error || !data || data.error) {
      toast(toMessage(data?.error ?? 'FETCH_FAILED'))
      setD({ ...d, url })
    } else {
      setD({ url: data.url ?? url, title: data.title ?? '', outlet: data.outlet ?? '', image_url: data.image_url ?? null, published_at: data.published_at ?? new Date().toISOString().slice(0, 10) })
    }
    setStep('edit')
  }
  const save = async () => {
    if (d.title.trim().length < 2) return toast('기사 제목을 입력해 주세요')
    setBusy(true)
    const { error } = await supabase.from('press_articles').insert({
      url: d.url.trim(), title: d.title.trim(), outlet: d.outlet.trim().slice(0, 40), image_url: d.image_url, published_at: d.published_at || null,
    })
    setBusy(false)
    if (error) return toast(toMessage(error.code === '23505' ? 'press_articles_url_key' : error))
    toast('기사를 등록했습니다. 더보기에 바로 보입니다')
    setD(EMPTY); setStep('url')
    await refresh()
  }
  const setHidden = async (id: string, hidden: boolean) => {
    const { error } = await supabase.from('press_articles').update({ is_hidden: hidden }).eq('id', id)
    if (error) return toast(toMessage(error))
    await refresh()
  }

  return (
    <div>
      <p className="mb-3 text-[12px] text-sub">기사 주소를 붙여 넣고 ‘불러오기’를 누르면 제목·언론사·사진·날짜가 채워집니다. 확인 후 등록하면 더보기 ‘산사캠프 소식’에 즉시 올라갑니다.</p>
      <div className="rounded-tile border border-line p-4">
        <label htmlFor="press-url" className="eyebrow mb-2 block">기사 주소</label>
        <div className="flex gap-2">
          <input id="press-url" value={d.url} onChange={(e) => { setD({ ...d, url: e.target.value }); setStep('url') }} placeholder="https://" inputMode="url" className="field min-w-0 flex-1" />
          <button type="button" onClick={() => void preview()} disabled={busy || !d.url.trim()} className="btn shrink-0 !px-4">{busy && step === 'url' ? '읽는 중…' : '불러오기'}</button>
        </div>
        {step === 'edit' && (
          <div className="mt-4 space-y-3">
            {d.image_url && <img src={d.image_url} alt="" referrerPolicy="no-referrer" className="h-32 w-full rounded-xl bg-mint object-cover" onError={() => setD({ ...d, image_url: null })} />}
            <div>
              <label htmlFor="press-title" className="eyebrow mb-1.5 block">제목</label>
              <textarea id="press-title" value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} rows={2} maxLength={200} className="field resize-none" />
            </div>
            <div className="flex gap-2">
              <div className="min-w-0 flex-1">
                <label htmlFor="press-outlet" className="eyebrow mb-1.5 block">언론사</label>
                <input id="press-outlet" value={d.outlet} onChange={(e) => setD({ ...d, outlet: e.target.value })} maxLength={40} className="field" />
              </div>
              <div className="w-[9.5em] shrink-0">
                <label htmlFor="press-date" className="eyebrow mb-1.5 block">보도일</label>
                <input id="press-date" type="date" value={d.published_at} onChange={(e) => setD({ ...d, published_at: e.target.value })} className="field" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => { setD(EMPTY); setStep('url') }} className="btn-ghost flex-1">취소</button>
              <button type="button" onClick={() => void save()} disabled={busy} className="btn flex-[2]">{busy ? '등록 중…' : '등록'}</button>
            </div>
          </div>
        )}
      </div>

      <p className="eyebrow mb-1 mt-6">등록된 기사 <span className="tnum">{q.data?.length ?? 0}</span></p>
      <ul className="divide-y hairline">
        {(q.data ?? []).map((a) => (
          <li key={a.id} className={`flex items-center gap-3 py-3 ${a.is_hidden ? 'opacity-50' : ''}`}>
            <div className="min-w-0 flex-1">
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="line-clamp-2 text-[14px] font-bold leading-snug">{a.title}</a>
              <p className="mt-0.5 truncate text-[12px] text-sub">{a.outlet} · <span className="tnum">{fmtPressDate(a.published_at, a.created_at)}</span>{a.is_hidden && ' · 숨김'}</p>
            </div>
            <Toggle on={!a.is_hidden} label={`${a.title} 노출`} onChange={(v) => void setHidden(a.id, !v)} />
          </li>
        ))}
        {q.data?.length === 0 && <li className="py-6 text-center text-[13px] text-sub">아직 등록된 기사가 없습니다</li>}
      </ul>
    </div>
  )
}
