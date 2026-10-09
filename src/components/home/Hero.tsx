import { Link } from 'react-router-dom'
import { ddayLabel } from '../../lib/dday'
import { useApp } from '../../data/AppProvider'
import PhotoDeck from './PhotoDeck'

export default function Hero() {
  const { user } = useApp()
  return (
    <section className="relative overflow-hidden pt-[calc(env(safe-area-inset-top)+14px)]">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-mint blur-3xl" />

      {/* 최상단: CI 좌측, D-day 우측 */}
      <div className="relative flex items-center justify-between px-5">
        <Link to="/" aria-label="산사캠프 홈">
          <img src="/wordmark.png" alt="산사캠프" className="h-[52px] w-auto" draggable={false} />
        </Link>
        <Link to={user ? '/more' : '/login'} className="flex items-center gap-2">
          {user && <span className="text-[12px] font-bold text-sub">{user.nickname}님</span>}
          <span className="tnum rounded-full bg-sun px-3.5 py-1.5 text-[13px] font-extrabold">{ddayLabel()}</span>
        </Link>
      </div>

      <div className="relative mt-7 px-5">
        <p className="eyebrow">2026.11.6 – 11.8 · 하동 쌍계사</p>
        <h1 className="mt-1.5 text-[26px] font-extrabold leading-[1.25]">이번 가을 산사는<br /><span className="text-deep">쌍계사</span>에서 쉬어갈까요?</h1>
      </div>

      <div className="relative mt-6 flex items-center justify-between px-5">
        <p className="text-[13px] font-semibold text-ink">지금 산사캠프</p>
        <Link to="/photo" className="text-[12px] font-semibold text-sub">전체</Link>
      </div>
      <PhotoDeck />
    </section>
  )
}
