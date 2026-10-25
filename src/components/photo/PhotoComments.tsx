import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useApp } from '../../data/AppProvider'
import { toMessage } from '../../data/errors'
import { timeAgo } from '../../lib/format'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import Icon from '../ui/Icon'

type Comment = { id: string; photo_id: string; user_id: string; body: string; created_at: string; profiles: { nickname: string } | null }
const MAX = 300

/** 사진 뷰어 안의 댓글 목록 + 입력. Realtime(photo_comments) 로 다른 사람 댓글이 바로 붙는다. */
export default function PhotoComments({ photoId, toast }: { photoId: string; toast: (m: string) => void }) {
  const { user } = useApp()
  const qc = useQueryClient()
  const requireAuth = useRequireAuth()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const listEnd = useRef<HTMLDivElement>(null)

  const q = useQuery({
    queryKey: ['comments', photoId],
    queryFn: async () => {
      const { data, error } = await supabase.from('photo_comments').select('*, profiles!photo_comments_user_id_fkey(nickname)').eq('photo_id', photoId).order('created_at')
      if (error) throw error
      return (data ?? []) as unknown as Comment[]
    },
    staleTime: 0,
  })
  useEffect(() => {
    const ch = supabase.channel(`comments:${photoId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photo_comments', filter: `photo_id=eq.${photoId}` }, () => qc.invalidateQueries({ queryKey: ['comments', photoId] }))
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [photoId, qc])

  const submit = async () => {
    const body = text.trim()
    if (!body || !user) return
    setBusy(true)
    const { data, error } = await supabase.from('photo_comments').insert({ photo_id: photoId, user_id: user.id, body }).select('*').single()
    setBusy(false)
    if (error) return toast(toMessage(error))
    // 바로 보이게 끼워 넣고, 이후 refetch 로 정합
    qc.setQueryData<Comment[]>(['comments', photoId], (prev) => [...(prev ?? []), { ...(data as Omit<Comment, 'profiles'>), profiles: { nickname: user.nickname } }])
    setText('')
    setTimeout(() => listEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
  }
  const remove = async (id: string) => {
    if (!window.confirm('이 댓글을 삭제할까요?')) return
    const { error } = await supabase.from('photo_comments').delete().eq('id', id)
    if (error) return toast(toMessage(error))
    qc.setQueryData<Comment[]>(['comments', photoId], (prev) => (prev ?? []).filter((c) => c.id !== id))
  }

  const list = q.data ?? []
  return (
    <section className="mt-5 border-t hairline pt-4">
      <p className="eyebrow mb-2">댓글 {list.length ? <span className="tnum text-deep">{list.length}</span> : null}</p>
      {q.isLoading ? (
        <p className="py-3 text-[13px] text-sub">불러오는 중</p>
      ) : list.length ? (
        <ul className="max-h-[32dvh] space-y-3 overflow-y-auto pr-1">
          {list.map((c) => {
            const mine = user?.id === c.user_id
            return (
              <li key={c.id} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mint text-[12px] font-extrabold text-deep">{(c.profiles?.nickname ?? '산')[0]}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] text-sub"><span className="font-bold text-ink">{c.profiles?.nickname ?? '산사러'}</span> · <span className="tnum">{timeAgo(c.created_at)}</span></p>
                  <p className="mt-0.5 whitespace-pre-wrap break-words text-[14px] leading-snug">{c.body}</p>
                </div>
                {(mine || user?.is_admin) && (
                  <button type="button" onClick={() => void remove(c.id)} aria-label="댓글 삭제" className="-mr-1 shrink-0 p-1 text-gray-300"><Icon name="close" size={14} /></button>
                )}
              </li>
            )
          })}
          <div ref={listEnd} />
        </ul>
      ) : (
        <p className="py-2 text-[13px] text-sub">첫 댓글을 남겨 보세요.</p>
      )}
      <form className="mt-3 flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); requireAuth(() => { void submit() }) }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          onFocus={() => { if (!user) requireAuth(() => {}) }}
          rows={1}
          placeholder={user ? '댓글을 남겨요' : '로그인하고 댓글을 남겨요'}
          className="field min-h-[44px] flex-1 resize-none py-2.5 text-[14px]"
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); requireAuth(() => { void submit() }) } }}
        />
        <button type="submit" disabled={busy || !text.trim()} className="btn !px-4 !py-2.5 !text-[13px]">{busy ? '…' : '올리기'}</button>
      </form>
      <p className="tnum mt-1 text-right text-[12px] text-gray-500">{text.length}/{MAX}</p>
    </section>
  )
}
