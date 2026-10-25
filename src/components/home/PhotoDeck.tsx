import { useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../data/AppProvider'
import Icon from '../ui/Icon'
import { openExternal } from '../../lib/external'
import { TICKETS } from './TicketFab'

type Card =
  | { kind: 'event'; id: string; url: string; full?: boolean; link?: string }
  | { kind: 'photo'; id: string; url: string; spot: string; nickname: string; likes: number }
  | { kind: 'ad'; id: string; url: string; sponsor: string; title: string; sub: string; link: string; bg: string; full: boolean }

const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
)

/** BEST PHOTO 1장 + 광고 배너 2장 이상을 겹친 카드 덱. 손가락을 따라오는 가로 스와이프, 3.5초 자동 전환(조작 후 8초간 멈춤) */
export default function PhotoDeck() {
  const { photos, banners } = useApp()
  const nav = useNavigate()
  const cards = useMemo<Card[]>(() => {
    const best = [...photos].filter((p) => !p.is_hidden).sort((a, b) => b.likes_count - a.likes_count)[0]
    // 실제 배너 이미지(seed 가 아닌 것)는 카드 전면에 채우고, 개발용 일러스트는 안쪽 액자형으로
    const ads: Card[] = banners.map((b) => ({ kind: 'ad', id: b.id, url: b.image, sponsor: b.sponsor, title: b.title, sub: b.sub, link: b.link, bg: b.bg, full: !b.image_path.startsWith('seed:') }))
    const events: Card[] = [
      // 정사각 포스터 카드 → 네이버 티켓 구매 페이지(새 창). 세로 포스터 카드 → 기획의도
      { kind: 'event', id: 'poster', url: '/poster-square.jpg', link: TICKETS.hanok.url },
      { kind: 'event', id: 'poster-full', url: '/poster-card.jpg', full: true },
    ]
    return best ? [events[0], { kind: 'photo', id: best.id, url: best.url, spot: best.spot_tag, nickname: best.nickname, likes: best.likes_count }, events[1], ...ads] : [...events, ...ads]
  }, [photos, banners])
  const [idx, setIdx] = useState(0)
  const [drag, setDrag] = useState(0)          // 손가락을 따라가는 가로 이동(px)
  const [dragging, setDragging] = useState(false)
  const start = useRef<{ x: number; y: number; t: number } | null>(null)
  const axis = useRef<'x' | 'y' | null>(null)   // 첫 움직임으로 가로/세로 판정
  const swiped = useRef(false)                 // 스와이프 뒤에 따라오는 click 을 탭으로 오인하지 않게
  const lastTouch = useRef(0)                  // 마지막 조작 시각: 이후 8초 동안 자동 전환 멈춤
  const n = cards.length
  const root = useRef<HTMLDivElement>(null)
  const [onScreen, setOnScreen] = useState(true) // 덱이 화면 밖이면 자동 전환·재렌더를 멈춘다

  useEffect(() => {
    const el = root.current
    if (!el || !('IntersectionObserver' in window)) return
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { threshold: 0.1 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (n < 2 || !onScreen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setInterval(() => {
      if (Date.now() - lastTouch.current < 8000) return
      setIdx((i) => (i + 1) % n)
    }, 3500)
    return () => window.clearInterval(t)
  }, [n, onScreen])

  const step = (d: 1 | -1) => { lastTouch.current = Date.now(); setIdx((i) => (i + d + n) % n) }

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    start.current = { x: e.clientX, y: e.clientY, t: Date.now() }
    axis.current = null
    swiped.current = false
    lastTouch.current = Date.now()
  }
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!start.current) return
    const dx = e.clientX - start.current.x
    const dy = e.clientY - start.current.y
    if (!axis.current) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
      axis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      if (axis.current === 'x') { setDragging(true); e.currentTarget.setPointerCapture(e.pointerId) }
    }
    if (axis.current !== 'x') return
    // 끝까지 끌어도 카드가 날아가지 않게 살짝 저항
    const w = e.currentTarget.clientWidth
    setDrag(Math.max(-w, Math.min(w, dx)) * 0.9)
    lastTouch.current = Date.now()
  }
  const onUp = (e: RPointerEvent<HTMLDivElement>) => {
    if (!start.current) return
    const dx = e.clientX - start.current.x
    const dt = Math.max(1, Date.now() - start.current.t)
    const fast = Math.abs(dx) / dt > 0.4 // px/ms: 짧고 빠른 플릭
    if (axis.current === 'x' && (Math.abs(dx) > 50 || (fast && Math.abs(dx) > 15))) { swiped.current = true; step(dx < 0 ? 1 : -1) }
    else if (axis.current === 'x') swiped.current = true
    start.current = null
    axis.current = null
    setDrag(0)
    setDragging(false)
  }

  if (!n) return null

  const w = 0.72 // 카드 너비 비율(컨테이너 대비)
  return (
    <div
      ref={root}
      className="relative mt-3 h-[320px] select-none"
      style={{ touchAction: 'pan-y' }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
    >
      {cards.map((c, i) => {
        const pos = (i - idx + n) % n
        const near = pos === 0 || pos === 1 || pos === n - 1 // 앞·양옆 카드만 실제로 그린다
        // 드래그 진행도(-1~1): 앞 카드는 손가락을 따라가고, 옆 카드는 중앙으로 끌려 들어온다
        const p = Math.max(-1, Math.min(1, drag / 260))
        const style =
          pos === 0 ? { transform: `translateX(calc(-50% + ${drag}px)) scale(${1 - Math.abs(p) * 0.06})`, opacity: 1 - Math.abs(p) * 0.25, zIndex: 3 }
          : pos === 1 ? { transform: `translateX(calc(-41% + ${drag * 0.35}px)) translateY(${12 - Math.max(0, -p) * 12}px) scale(${0.9 + Math.max(0, -p) * 0.1})`, opacity: 0.4 + Math.max(0, -p) * 0.6, zIndex: p < 0 ? 2 : 1 }
          : pos === n - 1 ? { transform: `translateX(calc(-59% + ${drag * 0.35}px)) translateY(${12 - Math.max(0, p) * 12}px) scale(${0.9 + Math.max(0, p) * 0.1})`, opacity: 0.4 + Math.max(0, p) * 0.6, zIndex: p > 0 ? 2 : 1 }
          : { transform: 'translateX(-50%) translateY(16px) scale(.85)', opacity: 0, zIndex: 0 }
        const bigWord = c.kind === 'photo' ? c.spot : c.kind === 'ad' ? c.sponsor : '산사캠프'
        const full = c.kind !== 'photo' && c.full
        // 광고 링크가 외부 주소(https://…)면 새 창(쇼핑몰 등), 앱 내부 경로면 화면 이동
        const go = () => {
          const ext = c.kind === 'ad' ? c.link : c.kind === 'event' ? c.link : undefined
          if (ext && /^https?:\/\//i.test(ext)) { openExternal(ext); return }
          nav(c.kind === 'photo' ? '/photo' : c.kind === 'ad' ? c.link : '/about')
        }
        return (
          <article
            key={c.id}
            aria-hidden={pos !== 0}
            role={pos === 0 ? 'link' : undefined}
            tabIndex={pos === 0 ? 0 : -1}
            onClick={() => { if (pos === 0 && !swiped.current) go() }}
            onKeyDown={(e) => { if (pos === 0 && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); go() } }}
            className={`absolute left-1/2 top-0 h-full overflow-hidden rounded-[26px] ${dragging ? '' : 'transition-[transform,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)]'} ${pos === 0 ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
            style={{ ...style, willChange: 'transform, opacity', visibility: near ? 'visible' : 'hidden', width: `${w * 100}%`, background: c.kind === 'ad' ? c.bg : c.kind === 'event' ? '#2EA7E0' : '#35D6BD' }}
          >
            {near && <img src={c.url} alt="" aria-hidden decoding="async" className="absolute inset-0 h-full w-full scale-125 object-cover blur-xl" />}
            <div className={`absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 ${c.kind === 'event' && c.full ? 'to-ink/25' : 'to-ink/70'}`} />
            {!full && <p className="absolute left-0 right-0 top-2 overflow-hidden whitespace-nowrap px-3 text-[64px] font-extrabold leading-none tracking-[-0.04em] text-white/80">{bigWord}</p>}
            {full ? (
              <img src={c.url} alt={c.kind === 'ad' ? `${c.sponsor} · ${c.title}` : '2026 산사캠프 with 쌍계사 포스터'} draggable={false} className="absolute inset-0 h-full w-full object-cover object-top" />
            ) : (
              <img src={c.url} alt={c.kind === 'photo' ? `${c.spot} 사진` : c.kind === 'ad' ? c.title : '2026 산사캠프 포스터'} draggable={false} className={`absolute left-[8%] right-[8%] top-[28%] w-[84%] rounded-2xl object-cover ring-1 ring-white/30 ${c.kind === 'event' ? 'h-[34%]' : 'h-[52%]'}`} />
            )}
            {c.kind === 'ad' && c.full && <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-ink/85 via-ink/40 to-transparent" />}
            {c.kind === 'event' && c.full && <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black/75 via-black/40 to-transparent" />}
            {c.kind === 'ad' && <span className="absolute left-4 top-4 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-extrabold text-ink">부스참여업체</span>}
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
              {c.kind === 'event' && c.full ? (
                <span className="inline-flex shrink-0 flex-col rounded-full border-2 border-ink bg-white px-3.5 py-1.5 text-ink shadow-[0_6px_16px_rgba(0,0,0,0.25)]">
                  <span className="whitespace-nowrap text-[9.5px] font-extrabold uppercase leading-none tracking-[0.18em] text-sub">Why Sansa Camp</span>
                  <span className="mt-1 whitespace-nowrap text-[13.5px] font-extrabold leading-none">산사캠프 기획의도</span>
                </span>
              ) : c.kind === 'event' ? (
                <div>
                  <p className="text-[12px] font-semibold tracking-wide opacity-85">2026 산사에서 즐기는 마인드 디톡스</p>
                  <p className="mt-0.5 whitespace-nowrap text-[16px] font-extrabold leading-tight">11.06 FRI – 11.08 SUN</p>
                  <p className="mt-1 text-[12px] opacity-80">하동 쌍계사 일원 · 700명 한정</p>
                  {c.link && <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11.5px] font-extrabold">한옥 예매하기 →</p>}
                </div>
              ) : c.kind === 'photo' ? (
                <div>
                  <p className="text-[12px] font-semibold tracking-wide opacity-85">BEST PHOTO · {c.spot} · {c.nickname}</p>
                  <p className="tnum mt-0.5 flex items-center gap-1.5 text-[26px] font-extrabold leading-none"><Icon name="heart" size={20} fill className="text-pink" />{c.likes}</p>
                </div>
              ) : (
                <div className="min-w-0 pr-3">
                  <p className="text-[12px] font-semibold tracking-wide opacity-85">{c.sponsor}</p>
                  <p className="mt-0.5 text-[20px] font-extrabold leading-tight">{c.title}</p>
                  <p className="mt-1 text-[12px] opacity-80">{c.sub}</p>
                </div>
              )}
              <button onClick={(e) => { e.stopPropagation(); go() }} aria-label={c.kind === 'photo' ? '포토 전체 보기' : c.kind === 'ad' ? `${c.sponsor} 자세히` : c.kind === 'event' && c.link ? '한옥 예매하기 (새 창)' : '기획의도 보기'} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-ink transition active:scale-90"><Arrow /></button>
            </div>
          </article>
        )
      })}
      <div className="absolute inset-x-0 -bottom-5 flex justify-center gap-1.5" aria-hidden="true">
        {cards.map((c, i) => <span key={c.id} className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-4 bg-ink' : 'w-1.5 bg-gray-300'}`} />)}
      </div>
      <p className="sr-only">카드를 좌우로 밀어 넘길 수 있습니다</p>
    </div>
  )
}
