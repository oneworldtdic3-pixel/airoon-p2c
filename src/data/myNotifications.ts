import { useCallback, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useApp } from './AppProvider'

// '내 소식' — 나에게만 오는 알림 (지금은 사진 댓글). DB user_notifications, 댓글 트리거가 쌓는다.
export interface MyNotification {
  id: string
  kind: 'comment'
  photo_id: string | null
  on_my_photo: boolean
  actor_nickname: string
  body: string
  read_at: string | null
  created_at: string
}

/** subscribe=true 는 앱에서 한 곳(AppShell)만 — 실시간으로 새 알림을 받아 목록을 갱신한다 */
export function useMyNotifications({ subscribe = false }: { subscribe?: boolean } = {}) {
  const { user } = useApp()
  const uid = user?.id ?? null
  const qc = useQueryClient()
  const key = ['my-noti', uid]
  const q = useQuery({
    queryKey: key,
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase.from('user_notifications').select('*').order('created_at', { ascending: false }).limit(50)
      if (error) throw error
      return (data ?? []) as MyNotification[]
    },
  })
  useEffect(() => {
    if (!subscribe || !uid) return
    const ch = supabase.channel(`my-noti:${uid}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_notifications', filter: `user_id=eq.${uid}` }, () => qc.invalidateQueries({ queryKey: ['my-noti', uid] }))
      .subscribe()
    const onVisible = () => { if (document.visibilityState === 'visible') void qc.invalidateQueries({ queryKey: ['my-noti', uid] }) }
    document.addEventListener('visibilitychange', onVisible)
    return () => { document.removeEventListener('visibilitychange', onVisible); supabase.removeChannel(ch) }
  }, [subscribe, uid, qc])

  const items = q.data ?? []
  const unread = items.filter((n) => !n.read_at).length

  /** 읽음 처리: ids 를 주면 그것만, photoId 를 주면 그 사진 알림 전부, 아무것도 없으면 전부 */
  const markRead = useCallback(async (opt: { ids?: string[]; photoId?: string } = {}) => {
    if (!uid) return
    let req = supabase.from('user_notifications').update({ read_at: new Date().toISOString() }).eq('user_id', uid).is('read_at', null)
    if (opt.ids) req = req.in('id', opt.ids)
    if (opt.photoId) req = req.eq('photo_id', opt.photoId)
    const { error } = await req
    if (!error) void qc.invalidateQueries({ queryKey: ['my-noti', uid] })
  }, [uid, qc])

  return { items, unread, markRead, loading: q.isLoading }
}
