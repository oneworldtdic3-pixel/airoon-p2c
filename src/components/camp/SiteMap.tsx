import { useRef, useState, type MouseEvent, type TouchEvent as RTouchEvent } from 'react'
import type { Site, Occupancy, EventMap } from '../../data/camp'

// 배치도 위에 사이트 점을 그린다. 손님 선택 화면과 관리자 편집기가 같이 쓴다.
//  · 빈 자리 초록 / 찬 자리 회색 / 막힌 자리 빗금 / 내가 고른 자리 주황
//  · 두 손가락 확대, 더블탭 확대, 관리자는 빈 곳을 눌러 새 사이트를 찍는다
export type SiteState = 'free' | 'taken' | 'blocked' | 'mine' | 'other-zone'

export function siteState(s: Site, occ: Map<string, Occupancy>, zoneId?: string | null): SiteState {
  if (zoneId && s.zone_id !== zoneId) return 'other-zone'
  if (s.status === 'blocked') return 'blocked'
  const o = occ.get(s.id)
  if (o?.taken) return o.group_key ? 'mine' : 'taken'
  return 'free'
}

const DOT: Record<SiteState | 'selected', string> = {
  free: 'bg-[#22C55E] text-white ring-white',
  taken: 'bg-gray-400 text-white ring-white',
  blocked: 'bg-[repeating-linear-gradient(45deg,#9CA3AF_0_3px,#E5E7EB_3px_6px)] text-gray-600 ring-white',
  mine: 'bg-[#1F7A8C] text-white ring-white',
  'other-zone': 'bg-gray-200 text-gray-400 ring-white opacity-60',
  selected: 'bg-[#FF5A36] text-white ring-[#FF5A36]/40 scale-110',
}

export default function SiteMap({
  map, sites, occ, zoneId, selected = [], onSelect, onPlace, compact = false, editable = false, dotSize,
}: {
  map: EventMap
  sites: Site[]
  occ: Map<string, Occupancy>
  zoneId?: string | null
  selected?: string[]
  onSelect?: (s: Site, state: SiteState) => void
  onPlace?: (x: number, y: number) => void
  compact?: boolean
  editable?: boolean
  dotSize?: number
}) {
  const box = useRef<HTMLDivElement>(null)
  const img = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)
  const pinch = useRef<{ d: number; z: number } | null>(null)
  const lastTap = useRef(0)
  const size = dotSize ?? (compact ? 3.2 : 5.5) // 배치도 폭 대비 %

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
    requestAnimationFrame(() => { el.scrollLeft = fx * el.scrollWidth - px; el.scrollTop = fy * el.scrollHeight - py })
  }
  const dist = (e: RTouchEvent) => Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY)
  const onTouchStart = (e: RTouchEvent) => {
    if (e.touches.length === 2) pinch.current = { d: dist(e), z: zoom }
    else if (e.touches.length === 1 && !compact) {
      const now = Date.now()
      if (now - lastTap.current < 280) { zoomTo(zoom > 1.2 ? 1 : 2.5, e.touches[0].clientX, e.touches[0].clientY); lastTap.current = 0 }
      else lastTap.current = now
    }
  }
  const onTouchMove = (e: RTouchEvent) => {
    if (e.touches.length !== 2 || !pinch.current) return
    zoomTo(pinch.current.z * (dist(e) / pinch.current.d), (e.touches[0].clientX + e.touches[1].clientX) / 2, (e.touches[0].clientY + e.touches[1].clientY) / 2)
  }
  // 관리자: 빈 곳을 누르면 그 위치(비율)를 돌려준다
  const onMapClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!editable || !onPlace || !img.current) return
    const r = img.current.getBoundingClientRect()
    onPlace(Math.round(((e.clientX - r.left) / r.width) * 10000) / 10000, Math.round(((e.clientY - r.top) / r.height) * 10000) / 10000)
  }

  return (
    <div className={`relative overflow-hidden rounded-tile border border-line bg-[#EAF4F1] ${compact ? '' : ''}`}>
      <div
        ref={box}
        className="no-scrollbar relative overflow-auto overscroll-contain"
        style={{ touchAction: zoom > 1 ? 'pan-x pan-y' : 'pan-y', maxHeight: compact ? 160 : '62dvh' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={() => { pinch.current = null }}
      >
        <div style={{ width: `${zoom * 100}%` }}>
          <div ref={img} className={`relative ${editable ? 'cursor-crosshair' : ''}`} onClick={onMapClick}>
            <img src={map.image_url} alt={map.title} draggable={false} className="block h-auto w-full select-none" />
            {sites.filter((s) => s.map_id === map.id || (!s.map_id && true)).map((s) => {
              const st = siteState(s, occ, zoneId)
              const sel = selected.includes(s.id)
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`사이트 ${s.number} · ${sel ? '선택됨' : st === 'free' ? '비어 있음' : st === 'taken' ? '예약됨' : st === 'mine' ? '내 자리' : st === 'blocked' ? '선택 불가' : '다른 구역'}`}
                  aria-pressed={sel}
                  disabled={!editable && (st === 'taken' || st === 'blocked' || st === 'other-zone')}
                  onClick={(e) => { e.stopPropagation(); onSelect?.(s, st) }}
                  style={{ left: `${s.x * 100}%`, top: `${s.y * 100}%`, width: `${size}%`, fontSize: `${Math.max(size * 0.32, 1.3)}cqw` }}
                  className={`tnum absolute flex aspect-square -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-black leading-none shadow-[0_2px_6px_rgba(0,0,0,0.25)] ring-2 transition ${sel ? DOT.selected : DOT[st]} ${!editable && (st === 'taken' || st === 'blocked' || st === 'other-zone') ? '' : 'active:scale-95'}`}
                >
                  {!compact && s.number.replace(/^[A-Za-z]+-?/, '')}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      {!compact && (
        <div className="absolute bottom-2 right-2 flex gap-1.5">
          <button type="button" aria-label="축소" onClick={() => zoomTo(zoom - 0.75)} disabled={zoom <= 1} className="h-8 w-8 rounded-full bg-white/90 text-[16px] font-bold text-ink shadow disabled:opacity-40">−</button>
          <button type="button" aria-label="확대" onClick={() => zoomTo(zoom + 0.75)} disabled={zoom >= 4} className="h-8 w-8 rounded-full bg-white/90 text-[16px] font-bold text-ink shadow disabled:opacity-40">+</button>
        </div>
      )}
    </div>
  )
}

export function SiteLegend({ editable = false }: { editable?: boolean }) {
  const items: [string, string][] = [['bg-[#22C55E]', '빈 자리'], ['bg-gray-400', '예약됨'], ['bg-[repeating-linear-gradient(45deg,#9CA3AF_0_3px,#E5E7EB_3px_6px)]', editable ? '막힘' : '선택 불가'], ['bg-[#FF5A36]', '내 선택']]
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-sub">
      {items.map(([c, l]) => <li key={l} className="flex items-center gap-1"><span className={`inline-block h-3 w-3 rounded-full ${c}`} />{l}</li>)}
    </ul>
  )
}
