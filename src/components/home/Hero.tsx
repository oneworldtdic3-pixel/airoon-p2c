import { Link } from 'react-router-dom'
import { ddayLabel } from '../../lib/dday'
import { useApp } from '../../data/AppProvider'
import PhotoDeck from './PhotoDeck'

export default function Hero() {
  const { user } = useApp()
  return (
    <section className="relative overflow-hidden pt-[calc(env(safe-area-inset-top)+16px)]">
      {/* 아주 옅은 민트 번짐 */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-mint blur-3xl" />

      <div className="relative flex items-center justify-between px-5">
        <Link to={user ? '/more' : '/login'} className="flex items-center gap-3">
          {user ? (
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-grad text-[16px] font-extrabold text-white">{user.nickname.slice(0, 1)}</span>
          ) : (
            <img src="/icon-192.png" alt="" className="h-11 w-11 rounded-full" />
          )}
          <span>
            <span className="block text-[15px] font-extrabold leading-tight">{user ? `${user.nickname}님` : '산사캠프'}</span>
            <span className="block text-[12px] text-sub">{user ? '@sansacamp' : 'with 쌍계사 · 11.6–11.8'}</span>
          </span>
        </Link>
        <span className="tnum rounded-full bg-sun px-3.5 py-1.5 text-[13px] font-extrabold">{ddayLabel()}</span>
      </div>

      <div className="relative mt-8 px-5">
        <p className="text-[15px] text-sub">이번 가을, 산사에서 쉬어갈까요?</p>
        <h1 className="mt-2"><img src="/wordmark.png" alt="산사캠프" className="h-[84px] w-auto" draggable={false} /></h1>
      </div>

      <div className="relative mt-6 flex items-center justify-between px-5">
        <p className="text-[13px] font-semibold text-ink">지금 산사캠프</p>
        <Link to="/photo" className="text-[12px] font-semibold text-sub">전체</Link>
      </div>
      <PhotoDeck />
    </section>
  )
}
