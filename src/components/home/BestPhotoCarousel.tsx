import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../mock/store'
import { SectionTitle } from '../ui'
import Icon from '../ui/Icon'

export default function BestPhotoCarousel() {
  const { photos } = useApp()
  const top = useMemo(() => [...photos].filter((p) => !p.is_hidden).sort((a, b) => b.likes_count - a.likes_count).slice(0, 3), [photos])
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || top.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setInterval(() => setI((x) => (x + 1) % top.length), 3500)
    return () => window.clearInterval(t)
  }, [paused, top.length])

  if (!top.length) return null
  const idx = i % top.length
  return (
    <section className="px-5 pt-8">
      <SectionTitle sub="좋아요를 가장 많이 받은 사진" right={<Link to="/photo" className="text-[13px] font-bold text-deep">전체보기</Link>}>BEST PHOTO</SectionTitle>
      <div className="relative overflow-hidden rounded-card shadow-card" onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} onPointerLeave={() => setPaused(false)}>
        <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${idx * 100}%)` }}>
          {top.map((p, n) => (
            <div key={p.id} className="relative aspect-[4/3] w-full shrink-0" aria-hidden={n !== idx}>
              <img src={p.url} alt={`${p.spot_tag} 사진`} className="h-full w-full object-cover" draggable={false} />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink/55 to-transparent p-4 text-white">
                <div>
                  <span className="rounded-full bg-sun px-2.5 py-1 text-[11px] font-extrabold text-ink">TOP {n + 1}</span>
                  <p className="mt-1.5 text-[13px] font-semibold">{p.spot_tag} · {p.nickname}</p>
                </div>
                <span className="flex items-center gap-1 text-[14px] font-bold"><Icon name="heart" size={18} fill />{p.likes_count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex justify-center gap-1.5" aria-hidden="true">
        {top.map((_, n) => <span key={n} className={`h-1.5 rounded-full transition-all ${n === idx ? 'w-5 bg-deep' : 'w-1.5 bg-gray-300'}`} />)}
      </div>
    </section>
  )
}
