import { useMemo, useState } from 'react'
import PageHeader from '../components/layout/PageHeader'
import PhotoGrid from '../components/photo/PhotoGrid'
import UploadSheet from '../components/photo/UploadSheet'
import { BottomSheet, Chip, Toast } from '../components/ui'
import Icon from '../components/ui/Icon'
import { MoonGlyph } from '../components/illust'
import { SPOTS } from '../mock/data'
import { useApp } from '../mock/store'
import { useToast } from '../hooks/useToast'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { timeAgo } from '../lib/format'
import type { Photo as PhotoT, SpotTag } from '../mock/types'

export default function Photo() {
  const { photos, likedIds, toggleLike } = useApp()
  const [spot, setSpot] = useState<SpotTag | 'ALL'>('ALL')
  const [upload, setUpload] = useState(false)
  const [view, setView] = useState<PhotoT | null>(null)
  const { msg, show } = useToast()
  const requireAuth = useRequireAuth()
  const list = useMemo(
    () => photos.filter((p) => !p.is_hidden && (spot === 'ALL' || p.spot_tag === spot)).sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [photos, spot],
  )
  const current = view && photos.find((p) => p.id === view.id)
  return (
    <>
      <PageHeader eyebrow={`${photos.filter((p) => !p.is_hidden).length}장의 기록`} title="포토" glyph={<MoonGlyph className="w-11" />}>
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
          <Chip active={spot === 'ALL'} onClick={() => setSpot('ALL')}>전체</Chip>
          {SPOTS.map((s) => <Chip key={s} active={spot === s} onClick={() => setSpot(s)}>{s}</Chip>)}
        </div>
      </PageHeader>
      <PhotoGrid list={list} onOpen={setView} />

      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(88px+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-[430px] justify-end px-5">
        <button onClick={() => requireAuth(() => setUpload(true))} className="btn pointer-events-auto gap-2 shadow-card">
          <Icon name="plus" size={18} />사진 올리기
        </button>
      </div>

      <UploadSheet open={upload} onClose={() => setUpload(false)} toast={show} />
      <BottomSheet open={!!current} onClose={() => setView(null)} title={current?.spot_tag}>
        {current && (
          <div>
            <img src={current.url} alt={`${current.spot_tag} 사진`} className="w-full rounded-tile" />
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[13px] text-sub">{current.nickname} · {timeAgo(current.created_at)}</span>
              <button onClick={() => toggleLike(current.id)} aria-pressed={likedIds.has(current.id)} className="btn-ghost gap-1.5">
                <Icon name="heart" fill={likedIds.has(current.id)} size={18} className={likedIds.has(current.id) ? 'text-deep' : ''} />{current.likes_count}
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
      <Toast msg={msg} />
    </>
  )
}
