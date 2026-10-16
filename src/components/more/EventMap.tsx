import { useEffect, useRef, useState, type TouchEvent as RTouchEvent } from 'react'
import { createPortal } from 'react-dom'

// 행사장 약도 — 운영팀 행사 안내도(2026 산사캠프) 기준. 배치가 바뀌면 이미지와 POINTS 만 교체.
const MAP = '/map/site-map.jpg'
const MAP_HI = '/map/site-map@2x.jpg'

// 약도 원본 크기(@2x). 아래 좌표는 이 크기 기준 픽셀
const MAP_W = 1894
const MAP_H = 1468

// 번호는 약도 위 숫자와 같다 (운영팀 행사 안내도 기준)
//  bx,by: 약도 위 번호 동그라미 위치 · fx,fy: 눌렀을 때 화면 가운데로 올 지점 · z: 확대 배율
type Point = { n: number; name: string; info: string; bx: number; by: number; fx: number; fy: number; z: number }
const POINTS: Point[] = [
  { n: 1, name: '메인 무대 · 공연장', info: 'Main Stage', bx: 752, by: 1140, fx: 700, fy: 1170, z: 2.6 },
  { n: 2, name: '체험·판매·홍보부스 8동 · 인포데스크 2동', info: 'Craft, Market & Promotion Booths', bx: 524, by: 1386, fx: 570, fy: 1230, z: 2.2 },
  { n: 3, name: '푸드트럭 · 박물관 북쪽', info: 'Food Trucks', bx: 696, by: 824, fx: 610, fy: 830, z: 3 },
  { n: 4, name: 'B 쌍계초 · Pet & Kids zone 85동', info: '반려견·아이 동반 캠핑', bx: 791, by: 326, fx: 935, fy: 420, z: 2.4 },
  { n: 5, name: 'A 쌍계사 경내 캠핑 · 30동', info: 'Temple camping', bx: 1350, by: 196, fx: 1470, fy: 225, z: 2.6 },
  { n: 6, name: 'C 주차장·언덕 캠핑 · 135동', info: 'Parking & Hill camping', bx: 1350, by: 525, fx: 1260, fy: 455, z: 2.6 },
  { n: 7, name: '템플스테이', info: 'Temple Stay', bx: 1484, by: 332, fx: 1440, fy: 390, z: 2.8 },
  { n: 8, name: '하동야생차박물관', info: 'Hadong Wild Tea Museum', bx: 517, by: 887, fx: 580, fy: 920, z: 3 },
  { n: 9, name: '하동야생차밭', info: 'Hadong Wild Tea Field', bx: 1052, by: 932, fx: 960, fy: 1000, z: 2.6 },
  { n: 10, name: '방사(숙소) ① · C 주차장 옆', info: 'Temple Lodging', bx: 1305, by: 118, fx: 1210, fy: 150, z: 3 },
  { n: 11, name: '방사(숙소) ② · 전통불교문화예술관', info: 'Temple Lodging · Buddhist Art Hall', bx: 1627, by: 774, fx: 1730, fy: 750, z: 2.6 },
]
const FACILITIES: [string, string][] = [['화장실', 'Toilet'], ['샤워실', 'Shower'], ['종합안내소', 'Information'], ['의무실', 'First Aid'], ['주차장 · 정류소', 'Parking · Bus'], ['도보 동선', 'Walking Route']]
const STATS: [string, string][] = [['A 쌍계사 경내', '30'], ['B 쌍계초', '85'], ['C 주차장', '135']]
const WALKS: [string, string][] = [['무대 → 일주문', '864m · 도보 12분'], ['쌍계초 → 일주문', '501m · 도보 7분']]

/** 전체 화면 약도: 두 손가락으로 확대, 두 번 탭하면 2.5배 ↔ 맞춤. initial 번호를 주면 그 장소를 확대해 보여 준다 */
function MapViewer({ onClose, initial }: { onClose: () => void; initial?: number }) {
  const box = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLImageElement>(null)
  const [zoom, setZoom] = useState(1)
  const [sel, setSel] = useState<Point | null>(null)
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
  // 약도의 (fx, fy) 지점을 화면 가운데로
  const centerOn = (fx: number, fy: number, smooth: boolean) => {
    const el = box.current, im = img.current
    if (!el || !im) return
    const br = el.getBoundingClientRect(), ir = im.getBoundingClientRect()
    el.scrollTo({
      left: ir.left - br.left + el.scrollLeft + (fx / MAP_W) * ir.width - br.width / 2,
      top: ir.top - br.top + el.scrollTop + (fy / MAP_H) * ir.height - br.height / 2,
      behavior: smooth ? 'smooth' : 'auto',
    })
  }
  const showPoint = (p: Point | null, smooth = true) => {
    setSel(p)
    setZoom(p ? p.z : 1)
    // 배율이 반영된 다음 프레임에 스크롤
    requestAnimationFrame(() => requestAnimationFrame(() => (p ? centerOn(p.fx, p.fy, smooth) : box.current?.scrollTo({ left: 0, top: 0, behavior: smooth ? 'smooth' : 'auto' }))))
  }
  useEffect(() => {
    if (initial) showPoint(POINTS.find((p) => p.n === initial) ?? null, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-[calc(env(safe-area-inset-top)+10px)] text-white">
        {sel ? (
          <p className="flex min-w-0 items-center gap-2">
            <span className="tnum flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#FF5A36] text-[11.5px] font-black">{sel.n}</span>
            <span className="min-w-0"><span className="block truncate text-[14px] font-bold">{sel.name}</span><span className="block truncate text-[11px] text-white/60">{sel.info}</span></span>
          </p>
        ) : <p className="text-[14px] font-bold">행사장 약도</p>}
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
          <div className="relative w-full">
            <img ref={img} src={MAP_HI} width={MAP_W} height={MAP_H} alt="2026 산사캠프 행사장 약도" draggable={false} className="block h-auto w-full select-none" onLoad={() => sel && centerOn(sel.fx, sel.fy, false)} />
            {sel && (
              <span className="pointer-events-none absolute aspect-square w-[6.5%] -translate-x-1/2 -translate-y-1/2" style={{ left: `${(sel.bx / MAP_W) * 100}%`, top: `${(sel.by / MAP_H) * 100}%` }} aria-hidden="true">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#FF5A36]/60" />
                <span className="absolute inset-0 rounded-full border-[3px] border-[#FF5A36] shadow-[0_0_0_3px_rgba(255,255,255,0.8)]" />
              </span>
            )}
          </div>
        </div>
      </div>
      {/* 장소 바로 가기 — 번호를 누르면 그 장소로 이동 */}
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pt-3" role="tablist" aria-label="장소 선택">
        <button type="button" role="tab" aria-selected={!sel} onClick={() => showPoint(null)} className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold ${!sel ? 'bg-white text-ink' : 'bg-white/15 text-white'}`}>전체</button>
        {POINTS.map((p) => (
          <button key={p.n} type="button" role="tab" aria-selected={sel?.n === p.n} aria-label={p.name} onClick={() => showPoint(p)} className={`tnum h-8 w-8 shrink-0 rounded-full text-[12.5px] font-black ${sel?.n === p.n ? 'bg-[#FF5A36] text-white' : 'bg-white/15 text-white'}`}>{p.n}</button>
        ))}
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
  // null: 닫힘 · 0: 전체 약도 · 1~11: 그 장소를 확대해서 열기
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div>
      <button type="button" onClick={() => setOpen(0)} className="group relative block w-full overflow-hidden rounded-tile border border-line bg-[#2E6B2A] active:scale-[0.99] transition">
        <img src={MAP} srcSet={`${MAP} 947w, ${MAP_HI} 1894w`} sizes="(max-width: 430px) 100vw, 430px" alt="2026 산사캠프 행사장 약도" width={947} height={734} loading="lazy" decoding="async" className="block h-auto w-full" />
      </button>
      <p className="mt-2 text-center text-[12px] font-bold text-deep">약도를 누르면 크게 볼 수 있어요 · 아래 장소를 누르면 그 위치로 확대</p>

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
          <li key={z.n}>
            <button type="button" onClick={() => setOpen(z.n)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition active:bg-mint/60">
              <span className="tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1F7A8C] text-[12px] font-black text-white">{z.n}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold leading-snug">{z.name}</span>
                <span className="mt-0.5 block text-[11.5px] text-sub">{z.info}</span>
              </span>
              <span className="shrink-0 text-[11.5px] font-bold text-deep">위치 ›</span>
            </button>
          </li>
        ))}
      </ul>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {FACILITIES.map(([k, v]) => (
          <li key={k} className="text-[12.5px]"><span className="font-bold">{k}</span> <span className="text-sub">{v}</span></li>
        ))}
      </ul>
      <p className="mt-3 text-[11.5px] text-gray-400">쌍계사 · 하동군 화개면 쌍계사길 59 · 캠핑 사이트 3곳 · 텐트 250동. 거리는 줄여서 그린 안내도이며 현장 사정에 따라 바뀔 수 있습니다.</p>

      {open !== null && <MapViewer initial={open || undefined} onClose={() => setOpen(null)} />}
    </div>
  )
}
