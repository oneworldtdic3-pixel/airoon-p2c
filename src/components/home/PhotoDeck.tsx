import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../mock/store'
import Icon from '../ui/Icon'

/** 좋아요 상위 3장을 겹친 카드 덱. 3.5초 자동 전환, 스와이프 가능 */
export default function PhotoDeck() {
  const { photos } = useApp()
  const nav = useNavigate()
  const top = useMemo(() => [...photos].filter((p) => !p.is_hidden).sort((a, b) => b.likes_count - a.likes_count).slice(0, 3), [photos])
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const startX = useRef<number | null>(null)
  const n = top.length

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
      {top.map((p, i) => {
        const pos = (i - idx + n) % n // 0 앞, 1 오른쪽 뒤, 2 왼쪽 뒤
        const style =
          pos === 0
            ? { transform: 'translateX(-50%) scale(1)', opacity: 1, zIndex: 3 }
            : pos === 1
              ? { transform: 'translateX(-41%) translateY(12px) scale(.9)', opacity: 0.4, zIndex: 1 }
              : { transform: 'translateX(-59%) translateY(12px) scale(.9)', opacity: 0.4, zIndex: 1 }
        return (
          <article
            key={p.id}
            aria-hidden={pos !== 0}
            className="absolute left-1/2 top-0 h-full w-[72%] overflow-hidden rounded-[26px] bg-deep transition-[transform,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
            style={style}
          >
            {/* 흐린 배경 + 큰 글자 + 안쪽 사진 프레임 */}
            <img src={p.url} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-125 object-cover blur-xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-deep/30 via-deep/20 to-ink/70" />
            <p className="absolute left-0 right-0 top-2 overflow-hidden whitespace-nowrap px-3 text-[64px] font-extrabold leading-none tracking-[-0.04em] text-white/80">{p.spot_tag}</p>
            <img src={p.url} alt={`${p.spot_tag} 사진`} draggable={false} className="absolute left-[8%] right-[8%] top-[28%] h-[52%] w-[84%] rounded-2xl object-cover ring-1 ring-white/30" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
              <div>
                <p className="text-[12px] font-semibold tracking-wide opacity-85">{p.spot_tag} · {p.nickname}</p>
                <p className="tnum mt-0.5 flex items-center gap-1.5 text-[26px] font-extrabold leading-none"><Icon name="heart" size={20} fill />{p.likes_count}</p>
              </div>
              <button onClick={() => nav('/photo')} aria-label="포토 전체 보기" className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink transition active:scale-90">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7M9 7h8v8" /></svg>
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
