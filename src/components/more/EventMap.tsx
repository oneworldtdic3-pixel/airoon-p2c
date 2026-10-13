import { useEffect, useRef, useState, type TouchEvent as RTouchEvent } from 'react'
import { createPortal } from 'react-dom'

// 행사장 약도 — 운영팀 행사 안내도(2026 산사캠프) 기준. 배치가 바뀌면 이미지와 POINTS 만 교체.
const MAP = '/map/site-map.jpg'
const MAP_HI = '/map/site-map@2x.jpg'

// 번호는 약도 위 숫자와 같다 (운영팀 행사 안내도 기준)
const POINTS: { n: number; name: string; info: string }[] = [
  { n: 1, name: '메인 무대 · 공연장', info: 'Main Stage' },
  { n: 2, name: '체험·판매·홍보부스 8동 · 인포데스크 2동', info: 'Craft, Market & Promotion Booths' },
  { n: 3, name: '푸드트럭 · 박물관 북쪽', info: 'Food Trucks' },
  { n: 4, name: 'B 쌍계초 · Pet & Kids zone 85동', info: '반려견·아이 동반 캠핑' },
  { n: 5, name: 'A 쌍계사 경내 캠핑 · 30동', info: 'Temple camping' },
  { n: 6, name: 'C 주차장·언덕 캠핑 · 135동', info: 'Parking & Hill camping' },
  { n: 7, name: '템플스테이', info: 'Temple Stay' },
  { n: 8, name: '하동야생차박물관', info: 'Hadong Wild Tea Museum' },
  { n: 9, name: '하동야생차밭', info: 'Hadong Wild Tea Field' },
  { n: 10, name: '방사(숙소) ① · C 주차장 옆', info: 'Temple Lodging' },
  { n: 11, name: '방사(숙소) ② · 전통불교문화예술관', info: 'Temple Lodging · Buddhist Art Hall' },
]
const FACILITIES: [string, string][] = [['화장실', 'Toilet'], ['샤워실', 'Shower'], ['종합안내소', 'Information'], ['의무실', 'First Aid'], ['주차장 · 정류소', 'Parking · Bus'], ['도보 동선', 'Walking Route']]
const STATS: [string, string][] = [['A 쌍계사 경내', '30'], ['B 쌍계초', '85'], ['C 주차장', '135']]
const WALKS: [string, string][] = [['무대 → 일주문', '864m · 도보 12분'], ['쌍계초 → 일주문', '501m · 도보 7분']]

/** 전체 화면 약도: 두 손가락으로 확대, 두 번 탭하면 2.5배 ↔ 맞춤 */
function MapViewer({ onClose }: { onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const pinch = useRef<{ d: number; z: number } | null>(null)
  const lastTap = useRef(0)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [onClose])

  // 확대 배율이 바뀌어도 보던 지점(화면 가운데)이 그대로 가운데에 오도록 스크롤 보정
  const zoomTo = (next: number, cx?: number, cy?: number) => {
    const el = box.current
    const z = Math.min(4, Math.max(1, next))
    if (!el) return setZoom(z)
    const r = el.getBoundingClientRect()
    const px = (cx ?? r.left + r.width / 2) - r.left
    const py = (cy ?? r.top + r.height / 2) - r.top
    const fx = (el.scrollLeft + px) / el.scrollWidth
    const fy = (el.scrollTop + py) / el.scrollHeight
    setZoom(z)
    requestAnimationFrame(() => {
      el.scrollLeft = fx * el.scrollWidth - px
      el.scrollTop = fy * el.scrollHeight - py
    })
  }
  const dist = (e: RTouchEvent) => Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
  const onTouchStart = (e: RTouchEvent) => {
    if (e.touches.length === 2) pinch.current = { d: dist(e), z: zoom }
    else if (e.touches.length === 1) {
      const now = Date.now()
      if (now - lastTap.current < 280) { zoomTo(zoom > 1.2 ? 1 : 2.5, e.touches[0].clientX, e.touches[0].clientY); lastTap.current = 0 }
      else lastTap.current = now
    }
  }
  const onTouchMove = (e: RTouchEvent) => {
    if (e.touches.length !== 2 || !pinch.current) return
    const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2
    const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2
    zoomTo(pinch.current.z * (dist(e) / pinch.current.d), cx, cy)
  }

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="행사장 약도 크게 보기" className="fixed inset-0 z-[60] flex flex-col bg-[#14201A] animate-[fade-in_.2s_ease-out]">
      <div className="flex items-center justify-between px-4 pb-2 pt-[calc(env(safe-area-inset-top)+10px)] text-white">
        <p className="text-[14px] font-bold">행사장 약도</p>
        <button type="button" onClick={onClose} className="rounded-full bg-white/15 px-3.5 py-1.5 text-[13px] font-bold active:scale-95">닫기</button>
      </div>
      <div
        ref={box}
        className="no-scrollbar relative min-h-0 flex-1 overflow-auto overscroll-contain"
        style={{ touchAction: zoom > 1 ? 'pan-x pan-y' : 'pan-y' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={() => { pinch.current = null }}
        onDoubleClick={(e) => zoomTo(zoom > 1.2 ? 1 : 2.5, e.clientX, e.clientY)}
      >
        <div className="flex min-h-full items-center" style={{ width: `${zoom * 100}%` }}>
          <img src={MAP_HI} alt="2026 산사캠프 행사장 약도" draggable={false} className="block h-auto w-full select-none" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-3 px-4 pb-[calc(env(safe-area-inset-bottom)+14px)] pt-3 text-white">
        <button type="button" aria-label="축소" onClick={() => zoomTo(zoom - 0.75)} disabled={zoom <= 1} className="h-10 w-10 rounded-full bg-white/15 text-[20px] font-bold disabled:opacity-40 active:scale-95">−</button>
        <span className="tnum w-14 text-center text-[13px] font-bold">{Math.round(zoom * 100)}%</span>
        <button type="button" aria-label="확대" onClick={() => zoomTo(zoom + 0.75)} disabled={zoom >= 4} className="h-10 w-10 rounded-full bg-white/15 text-[20px] font-bold disabled:opacity-40 active:scale-95">+</button>
      </div>
    </div>,
    document.body,
  )
}

export default function EventMap() {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)} className="group relative block w-full overflow-hidden rounded-tile border border-line bg-[#2E6B2A] active:scale-[0.99] transition">
        <img src={MAP} srcSet={`${MAP} 1000w, ${MAP_HI} 2200w`} sizes="(max-width: 430px) 100vw, 430px" alt="2026 산사캠프 행사장 약도" width={1000} height={776} loading="lazy" decoding="async" className="block h-auto w-full" />
      </button>
      <p className="mt-2 text-center text-[12px] font-bold text-deep">약도를 누르면 크게 볼 수 있어요 · 두 손가락으로 확대</p>

      {/* 텐트 수 요약 */}
      <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <p className="flex items-baseline gap-1.5"><span className="tnum text-[30px] font-black leading-none">250</span><span className="text-[12.5px] text-sub">동 · 전체 텐트</span></p>
        {STATS.map(([k, v]) => (
          <p key={k} className="text-[12.5px] text-sub">{k} <span className="tnum font-extrabold text-ink">{v}</span></p>
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
        {WALKS.map(([k, v]) => (
          <p key={k} className="text-[12.5px] text-sub">{k} <span className="tnum font-bold text-ink">{v}</span></p>
        ))}
      </div>

      {/* 번호 안내 — 약도 위 숫자와 동일 */}
      <ul className="mt-4 divide-y divide-line rounded-tile border border-line">
        {POINTS.map((z) => (
          <li key={z.n} className="flex items-center gap-3 px-4 py-2.5">
            <span className="tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1F7A8C] text-[12px] font-black text-white">{z.n}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-bold leading-snug">{z.name}</p>
              <p className="mt-0.5 text-[11.5px] text-sub">{z.info}</p>
            </div>
          </li>
        ))}
      </ul>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {FACILITIES.map(([k, v]) => (
          <li key={k} className="text-[12.5px]"><span className="font-bold">{k}</span> <span className="text-sub">{v}</span></li>
        ))}
      </ul>
      <p className="mt-3 text-[11.5px] text-gray-400">쌍계사 · 하동군 화개면 쌍계사길 59 · 캠핑 사이트 3곳 · 텐트 250동. 거리는 줄여서 그린 안내도이며 현장 사정에 따라 바뀔 수 있습니다.</p>

      {open && <MapViewer onClose={() => setOpen(false)} />}
    </div>
  )
}
