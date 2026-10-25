import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useApp } from '../../data/AppProvider'
import { toMessage } from '../../data/errors'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { BottomSheet } from '../ui'
import Icon from '../ui/Icon'

export type Quote = { id: string; user_id: string; body: string; likes_count: number; is_hidden: boolean; created_at: string; profiles: { nickname: string } | null }
const MAX = 40

/** 캠퍼 문구 목록 + 내 좋아요. 홈 헤드라인(가장 많은 좋아요)과 시트가 같이 쓴다. */
export function useQuotes() {
  const { user } = useApp()
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['quotes'],
    staleTime: 0,
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.from('quotes').select('*, profiles!quotes_user_id_fkey(nickname)').order('likes_count', { ascending: false }).order('created_at', { ascending: false }).limit(50)
      if (error) throw error
      return (data ?? []) as unknown as Quote[]
    },
  })
  const liked = useQuery({
    queryKey: ['quote-likes', user?.id],
    enabled: !!user,
    queryFn: async () => new Set((((await supabase.from('quote_likes').select('quote_id').eq('user_id', user!.id).eq('active', true)).data ?? []) as { quote_id: string }[]).map((x) => x.quote_id)),
  })
  // 실시간 갱신은 AppProvider 의 공용 채널(quotes 테이블)이 담당한다 — 훅을 여러 곳에서 써도 채널이 중복되지 않게
  const visible = (q.data ?? []).filter((x) => !x.is_hidden)
  const top = visible.find((x) => x.likes_count > 0) ?? visible[0] ?? null
  const mine = user ? (q.data ?? []).find((x) => x.user_id === user.id) ?? null : null
  const likedIds = liked.data ?? new Set<string>()

  const toggle = async (id: string) => {
    const was = likedIds.has(id)
    qc.setQueryData<Set<string>>(['quote-likes', user?.id], (s) => { const n = new Set(s ?? []); if (was) n.delete(id); else n.add(id); return n })
    qc.setQueryData<Quote[]>(['quotes'], (list) => (list ?? []).map((x) => (x.id === id ? { ...x, likes_count: Math.max(0, x.likes_count + (was ? -1 : 1)) } : x)))
    const { error } = await supabase.rpc('toggle_quote_like', { p_quote: id })
    if (error) { await Promise.all([qc.invalidateQueries({ queryKey: ['quotes'] }), qc.invalidateQueries({ queryKey: ['quote-likes', user?.id] })]); return toMessage(error) }
    return null
  }
  const save = async (body: string) => {
    const { error } = await supabase.rpc('upsert_quote', { p_body: body })
    if (error) return toMessage(error)
    await qc.invalidateQueries({ queryKey: ['quotes'] })
    return null
  }
  const hide = async (id: string, hidden: boolean) => {
    const { error } = await supabase.rpc('admin_set_quote_hidden', { p_quote: id, p_hidden: hidden })
    if (error) return toMessage(error)
    await qc.invalidateQueries({ queryKey: ['quotes'] })
    return null
  }
  return { list: q.data ?? [], visible, top, mine, likedIds, toggle, save, hide, loading: q.isLoading }
}

export default function QuoteSheet({ open, onClose, toast }: { open: boolean; onClose: () => void; toast: (m: string) => void }) {
  const { user } = useApp()
  const requireAuth = useRequireAuth()
  const { list, mine, likedIds, toggle, save, hide } = useQuotes()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (open) setText(mine?.body ?? '') }, [open, mine?.body])

  const submit = async () => {
    const body = text.trim()
    if (body.length < 2) return toast('두 글자 이상 적어 주세요')
    setBusy(true)
    const err = await save(body)
    setBusy(false)
    toast(err ?? (mine ? '문구를 바꿨습니다' : '문구를 올렸습니다. 좋아요를 많이 받으면 메인에 걸려요'))
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="산사에서 한 줄">
      <p className="text-[13px] leading-relaxed text-sub">이번 가을 산사에 대한 마음을 한 줄로 남겨 주세요. 좋아요를 가장 많이 받은 문구가 앱 맨 위에 걸립니다. 1인 1문구, 다시 쓰면 바뀝니다.</p>
      <form className="mt-4" onSubmit={(e) => { e.preventDefault(); requireAuth(() => { void submit() }) }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.replace(/\n/g, ' ').slice(0, MAX))}
          onFocus={() => { if (!user) requireAuth(() => {}) }}
          rows={2}
          placeholder={user ? '예) 바람 소리만 남기고 다 두고 왔다' : '로그인하고 한 줄 남겨요'}
          className="field resize-none text-[16px] font-semibold leading-snug"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="tnum text-[12px] text-gray-500">{text.length}/{MAX}</span>
          <button type="submit" disabled={busy || text.trim().length < 2} className="btn !px-5 !py-2.5 !text-[13px]">{busy ? '…' : mine ? '바꾸기' : '올리기'}</button>
        </div>
      </form>

      <p className="eyebrow mb-2 mt-6">좋아요 순 {list.length ? <span className="tnum text-deep">{list.filter((x) => !x.is_hidden).length}</span> : null}</p>
      {list.length ? (
        <ol className="max-h-[40dvh] divide-y hairline overflow-y-auto border-y">
          {list.map((qt, i) => {
            const on = likedIds.has(qt.id)
            return (
              <li key={qt.id} className={`flex items-center gap-3 py-3 ${qt.is_hidden ? 'opacity-40' : ''}`}>
                <span className={`tnum min-w-[1.4em] shrink-0 text-[12px] font-extrabold ${i === 0 ? 'text-ember' : 'text-gray-500'}`}>{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold leading-snug">{qt.body}</p>
                  <p className="text-[12px] text-sub">{qt.profiles?.nickname ?? '산사러'}{qt.user_id === user?.id ? ' · 내 문구' : ''}{qt.is_hidden ? ' · 숨김' : ''}</p>
                </div>
                {user?.is_admin && (
                  <button type="button" onClick={async () => { const e = await hide(qt.id, !qt.is_hidden); if (e) toast(e) }} className="shrink-0 text-[12px] font-bold text-sub underline">{qt.is_hidden ? '공개' : '숨김'}</button>
                )}
                <button type="button" onClick={() => requireAuth(async () => { const e = await toggle(qt.id); if (e) toast(e) })} aria-pressed={on} className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[13px] font-bold ${on ? 'bg-pink/10 text-pink' : 'bg-gray-100 text-sub'}`}>
                  <Icon name="heart" size={14} fill={on} className="text-pink" />{qt.likes_count}
                </button>
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="py-3 text-[13px] text-sub">아직 올라온 문구가 없어요. 첫 문구의 주인공이 되어 보세요.</p>
      )}
    </BottomSheet>
  )
}
