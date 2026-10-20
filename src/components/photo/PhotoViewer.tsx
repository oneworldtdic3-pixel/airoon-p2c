import { useEffect } from 'react'
import { useApp } from '../../data/AppProvider'
import { useMyNotifications } from '../../data/myNotifications'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { timeAgo } from '../../lib/format'
import { BottomSheet } from '../ui'
import Icon from '../ui/Icon'
import PhotoComments from './PhotoComments'

/** 사진 크게 보기 시트: 이미지 · 작성자 · 좋아요 · 댓글. 포토 탭과 홈 실시간 포토가 같이 쓴다. */
export default function PhotoViewer({ photoId, onClose, toast }: { photoId: string | null; onClose: () => void; toast: (m: string) => void }) {
  const { photos, likedIds, toggleLike } = useApp()
  const requireAuth = useRequireAuth()
  const current = photoId ? photos.find((p) => p.id === photoId) : undefined
  // 이 사진의 댓글 알림은 사진을 열면 읽은 것으로
  const { markRead } = useMyNotifications()
  useEffect(() => { if (current) void markRead({ photoId: current.id }) }, [current, markRead])
  return (
    <BottomSheet open={!!current} onClose={onClose} title={current?.spot_tag}>
      {current && (
        <div>
          <img src={current.url} alt={`${current.spot_tag} 사진`} className="w-full rounded-tile" />
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[13px] text-sub">{current.nickname} · {timeAgo(current.created_at)}</span>
            <button type="button" onClick={() => requireAuth(() => { void toggleLike(current.id) })} aria-pressed={likedIds.has(current.id)} className="btn-ghost gap-1.5">
              <Icon name="heart" fill={likedIds.has(current.id)} size={18} className="text-pink" />{current.likes_count}
            </button>
          </div>
          <PhotoComments photoId={current.id} toast={toast} />
        </div>
      )}
    </BottomSheet>
  )
}
