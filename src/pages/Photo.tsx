import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import PhotoGrid from '../components/photo/PhotoGrid'
import UploadSheet from '../components/photo/UploadSheet'
import PhotoViewer from '../components/photo/PhotoViewer'
import { Chip, Toast } from '../components/ui'
import Icon from '../components/ui/Icon'
import { MoonGlyph } from '../components/illust'
import { SPOTS } from '../data/constants'
import { useApp } from '../data/AppProvider'
import { useToast } from '../hooks/useToast'
import { useRequireAuth } from '../hooks/useRequireAuth'
import type { Photo as PhotoT, SpotTag } from '../data/types'

export default function Photo() {
  const { photos } = useApp()
  const [spot, setSpot] = useState<SpotTag | 'ALL'>('ALL')
  const [upload, setUpload] = useState(false)
  // 열어 둔 사진은 주소(?p=사진id)에 담는다 — 댓글 알림을 누르면 그 사진이 바로 열린다
  const [sp, setSp] = useSearchParams()
  const viewId = sp.get('p')
  const setView = (p: PhotoT | null) => setSp(p ? { p: p.id } : {}, { replace: !p })
  const { msg, show } = useToast()
  const requireAuth = useRequireAuth()
  const list = useMemo(
    () => photos.filter((p) => !p.is_hidden && (spot === 'ALL' || p.spot_tag === spot)).sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [photos, spot],
  )
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
      <PhotoViewer photoId={viewId} onClose={() => setView(null)} toast={show} />
      <Toast msg={msg} />
    </>
  )
}
