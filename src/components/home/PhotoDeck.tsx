import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../mock/store'
import { banners } from '../../mock/data'
import Icon from '../ui/Icon'

type Card =
  | { kind: 'photo'; id: string; url: string; spot: string; nickname: string; likes: number }
  | { kind: 'ad'; id: string; url: string; sponsor: string; title: string; sub: string; link: string; bg: string }

const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
)

/** BEST PHOTO 1장 + 광고 배너 2장 이상을 겹친 카드 덱. 3.5초 자동 전환, 스와이프 가능 */
export default function PhotoDeck() {
  const { photos } = useApp()
  const nav = useNavigate()
  const cards = useMemo<Card[]>(() => {
    const best = [...photos].filter((p) => !p.is_hidden).sort((a, b) => b.likes_count - a.likes_count)[0]
    const ads: Card[] = banners.map((b) => ({ kind: 'ad', id: b.id, url: b.image, sponsor: b.sponsor, title: b.title, sub: b.sub, link: b.link, bg: b.bg }))
    return best ? [{ kind: 'photo', id: best.id, url: best.url, spot: best.spot_tag, nickname: best.nickname, likes: best.likes_count }, ...ads] : ads
  }, [photos])
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const startX = useRef<number | null>(null)
  const n = cards.length

  useEffect(() => {
    if (paused || n < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setInterval(() => setIdx((i) => (i + 1) % n), 3500)
    return () => window.clearInterval(t)
  }, [paused, n])

  if (!n) return null

  return (
    <div
      className="relative mt-3 h-[320px] select-none"
      onPointerDown={(e) => { startX.current = e.clientX; setPaused(true) }}
      onPointerUp={(e) => {
        const dx = startX.current === null ? 0 : e.clientX - startX.current
        if (Math.abs(dx) > 30) setIdx((i) => (i + (dx < 0 ? 1 : n - 1)) % n)
        startX.current = null
        setPaused(false)
      }}
      onPointerCancel={() => { startX.current = null; setPaused(false) }}
    >
      {cards.map((c, i) => {
        const pos = (i - idx + n) % n
        const style =
          pos === 0 ? { transform: 'translateX(-50%) scale(1)', opacity: 1, zIndex: 3 }
          : pos === 1 ? { transform: 'translateX(-41%) translateY(12px) scale(.9)', opacity: 0.4, zIndex: 1 }
          : pos === n - 1 ? { transform: 'translateX(-59%) translateY(12px) scale(.9)', opacity: 0.4, zIndex: 1 }
          : { transform: 'translateX(-50%) translateY(16px) scale(.85)', opacity: 0, zIndex: 0 }
        const bigWord = c.kind === 'photo' ? c.spot : c.sponsor
        const go = () => nav(c.kind === 'photo' ? '/photo' : c.link)
        return (
          <article
            key={c.id}
            aria-hidden={pos !== 0}
            className="absolute left-1/2 top-0 h-full w-[72%] overflow-hidden rounded-[26px] transition-[transform,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
            style={{ ...style, background: c.kind === 'ad' ? c.bg : '#0B9659' }}
          >
            <img src={c.url} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-125 object-cover blur-xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-ink/70" />
            <p className="absolute left-0 right-0 top-2 overflow-hidden whitespace-nowrap px-3 text-[64px] font-extrabold leading-none tracking-[-0.04em] text-white/80">{bigWord}</p>
            <img src={c.url} alt={c.kind === 'photo' ? `${c.spot} 사진` : c.title} draggable={false} className="absolute left-[8%] right-[8%] top-[28%] h-[52%] w-[84%] rounded-2xl object-cover ring-1 ring-white/30" />
            {c.kind === 'ad' && <span className="absolute left-4 top-4 rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider text-ink">AD</span>}
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
              {c.kind === 'photo' ? (
                <div>
                  <p className="text-[12px] font-semibold tracking-wide opacity-85">BEST PHOTO · {c.spot} · {c.nickname}</p>
                  <p className="tnum mt-0.5 flex items-center gap-1.5 text-[26px] font-extrabold leading-none"><Icon name="heart" size={20} fill />{c.likes}</p>
                </div>
              ) : (
                <div className="min-w-0 pr-3">
                  <p className="text-[12px] font-semibold tracking-wide opacity-85">{c.sponsor}</p>
                  <p className="mt-0.5 text-[20px] font-extrabold leading-tight">{c.title}</p>
                  <p className="mt-1 text-[12px] opacity-80">{c.sub}</p>
                </div>
              )}
              <button onClick={go} aria-label={c.kind === 'photo' ? '포토 전체 보기' : `${c.sponsor} 자세히`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-ink transition active:scale-90"><Arrow /></button>
            </div>
          </article>
        )
      })}
      <div className="absolute inset-x-0 -bottom-5 flex justify-center gap-1.5" aria-hidden="true">
        {cards.map((c, i) => <span key={c.id} className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-4 bg-ink' : 'w-1.5 bg-gray-300'}`} />)}
      </div>
    </div>
  )
}
