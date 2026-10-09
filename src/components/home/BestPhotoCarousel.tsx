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
    if (paused || top.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = window.setInterval(() => setI((x) => (x + 1) % top.length), 3500)
    return () => window.clearInterval(t)
  }, [paused, top.length])

  if (!top.length) return null
  const idx = i % top.length
  const cur = top[idx]
  return (
    <section className="pt-10">
      <div className="px-5">
        <SectionTitle eyebrow="Best photo" right={<Link to="/photo" className="text-[13px] font-bold text-deep">포토 전체</Link>}>오늘 가장 많이 머문 장면</SectionTitle>
      </div>
      <div className="relative ml-5 overflow-hidden rounded-l-card" onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} onPointerLeave={() => setPaused(false)}>
        <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${idx * 100}%)` }}>
          {top.map((p, n) => (
            <img key={p.id} src={p.url} alt={`${p.spot_tag} 사진`} draggable={false} aria-hidden={n !== idx} className="aspect-[4/3] w-full shrink-0 object-cover" />
          ))}
        </div>
      </div>
      {/* 캡션 패널을 사진 아래로 겹쳐 올려 비대칭으로 */}
      <div className="relative z-10 mx-5 -mt-9 mr-14 flex items-end justify-between rounded-tile bg-white px-4 pb-1 pt-3 shadow-soft">
        <div>
          <span className="tnum text-[26px] font-extrabold leading-none text-deep">0{idx + 1}</span>
          <p className="mt-1 text-[14px] font-bold">{cur.spot_tag}</p>
          <p className="text-[12px] text-sub">{cur.nickname}</p>
        </div>
        <span className="mb-1 flex items-center gap-1 text-[13px] font-bold text-sub"><Icon name="heart" size={15} fill className="text-deep" />{cur.likes_count}</span>
      </div>
    </section>
  )
}
