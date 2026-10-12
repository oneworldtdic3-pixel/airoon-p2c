import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../data/AppProvider'
import { timeAgo } from '../../lib/format'
import { SectionTitle, Toast } from '../ui'
import PhotoViewer from '../photo/PhotoViewer'
import { useToast } from '../../hooks/useToast'
import Icon from '../ui/Icon'

const LIMIT = 9

/** 홈 · 실시간 포토: 방금 올라온 사진을 가로로 흘려 보여준다. photos 테이블 Realtime 으로 새 사진이 오면 앞에 끼워 넣는다. */
export default function LivePhotos() {
  const { photos } = useApp()
  const list = photos.filter((p) => !p.is_hidden).slice(0, LIMIT)
  // 새로 들어온 사진 id 를 잠깐 기억해 '새 사진' 강조를 준다
  const seen = useRef<Set<string> | null>(null)
  const [fresh, setFresh] = useState<Set<string>>(new Set())
  const [view, setView] = useState<string | null>(null)
  const { msg, show } = useToast()
  useEffect(() => {
    // 첫 데이터가 도착하기 전(빈 목록)에는 기준을 잡지 않는다 — 안 그러면 처음 받은 사진이 전부 NEW 로 뜬다
    if (!seen.current) { if (list.length) seen.current = new Set(list.map((p) => p.id)); return }
    const added = list.filter((p) => !seen.current!.has(p.id)).map((p) => p.id)
    if (!added.length) return
    added.forEach((id) => seen.current!.add(id))
    setFresh(new Set(added))
    const t = window.setTimeout(() => setFresh(new Set()), 6000)
    return () => window.clearTimeout(t)
  }, [list])

  return (
    <section className="pt-12">
      <div className="px-5">
        <SectionTitle
          eyebrow={<span className="inline-flex items-center gap-1.5"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-ember" /></span>Live</span>}
          right={<Link to="/photo" className="text-[13px] font-bold text-deep">포토 전체</Link>}
        >
          실시간 포토
        </SectionTitle>
      </div>
      {list.length ? (
        <ul className="no-scrollbar -mt-1 flex snap-x gap-2.5 overflow-x-auto px-5 pb-1 scroll-px-5">
          {list.map((p, i) => (
            <li key={p.id} className="w-[132px] shrink-0 snap-start" style={{ animation: fresh.has(p.id) ? 'rise .5s' : undefined }}>
              <button type="button" onClick={() => setView(p.id)} className="block w-full text-left" aria-label={`${p.spot_tag} 사진 크게 보기`}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-mint">
                  <img src={p.url} alt={`${p.spot_tag} · ${p.nickname}`} loading={i < 3 ? 'eager' : 'lazy'} className="h-full w-full object-cover" />
                  {fresh.has(p.id) && <span className="absolute left-2 top-2 rounded-md bg-ember px-1.5 py-0.5 text-[10px] font-extrabold text-white">NEW</span>}
                  <span className="absolute bottom-2 right-2 inline-flex items-center gap-0.5 rounded-full bg-ink/55 px-1.5 py-0.5 text-[10.5px] font-bold text-white"><Icon name="heart" size={11} fill className="text-pink" />{p.likes_count}</span>
                </div>
                <p className="mt-1.5 truncate text-[12.5px] font-bold">{p.spot_tag}</p>
                <p className="truncate text-[11px] text-sub">{p.nickname} · {timeAgo(p.created_at)}</p>
              </button>
            </li>
          ))}
          <li className="w-[132px] shrink-0 snap-start">
            <Link to="/photo" className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line text-sub">
              <Icon name="camera" size={22} className="text-deep" />
              <span className="text-[12px] font-bold">내 사진 올리기</span>
            </Link>
          </li>
        </ul>
      ) : (
        <div className="mx-5 rounded-tile bg-mint px-4 py-6 text-center">
          <p className="text-[14px] font-bold">아직 올라온 사진이 없습니다</p>
          <p className="mt-1 text-[12.5px] text-sub">첫 사진을 올리면 여기에 바로 보입니다.</p>
          <Link to="/photo" className="btn mt-3 !px-5 !py-2.5 !text-[13px]">사진 올리기</Link>
        </div>
      )}
      <PhotoViewer photoId={view} onClose={() => setView(null)} toast={show} />
      <Toast msg={msg} />
    </section>
  )
}
