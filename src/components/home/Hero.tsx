import { Link } from 'react-router-dom'
import { ddayLabel } from '../../lib/dday'
import { useApp } from '../../data/AppProvider'
import PhotoDeck from './PhotoDeck'
import QuoteSheet, { useQuotes } from './QuoteWall'
import { useToast } from '../../hooks/useToast'
import { Toast } from '../ui'
import Icon from '../ui/Icon'
import { useState } from 'react'
import { InquiryButton } from '../InquirySheet'

export default function Hero() {
  const { user } = useApp()
  const { top, visible } = useQuotes()
  const [sheet, setSheet] = useState(false)
  const { msg, show } = useToast()
  return (
    <section className="relative overflow-hidden pt-[calc(env(safe-area-inset-top)+14px)]">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,#E8FAF4_55%,transparent)]" />

      {/* 최상단: CI 좌측, D-day 우측 */}
      <div className="relative flex items-center justify-between px-5">
        <Link to="/" aria-label="산사캠프 홈">
          <img src="/wordmark.webp" alt="산사캠프" width={96} height={52} className="h-[52px] w-auto" draggable={false} fetchPriority="high" />
        </Link>
        <div className="flex items-center gap-1">
          <Link to={user ? '/more' : '/login'} className="flex min-h-[44px] items-center gap-2">
            {user && <span className="text-[12px] font-bold text-sub">{user.nickname}님</span>}
            <span className="tnum rounded-full bg-sun px-3.5 py-1.5 text-[13px] font-extrabold">{ddayLabel()}</span>
          </Link>
          <InquiryButton />
        </div>
      </div>

      <div className="relative mt-7 px-5">
        <p className="eyebrow">2026.11.6 – 11.8 · 하동 쌍계사</p>
        {top ? (
          <button type="button" onClick={() => setSheet(true)} className="block w-full text-left">
            <h1 className="mt-1.5 text-[26px] font-extrabold leading-[1.25] [text-wrap:balance]">
              <span className="text-deep">“</span>{top.body}<span className="text-deep">”</span>
            </h1>
            <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-sub">
              <span className="font-bold text-ink">{top.profiles?.nickname ?? '산사러'}</span>님의 한 줄
              <span className="tnum inline-flex items-center gap-0.5 rounded-full bg-pink/10 px-2 py-0.5 font-bold text-pink-deep"><Icon name="heart" size={11} fill />{top.likes_count}</span>
              <span className="ml-auto font-semibold text-deep">나도 한 줄 <Icon name="chevron" size={12} className="-ml-0.5 inline" /></span>
            </p>
          </button>
        ) : (
          <button type="button" onClick={() => setSheet(true)} className="block w-full text-left">
            <h1 className="mt-1.5 text-[26px] font-extrabold leading-[1.25]">이번 가을 산사는<br /><span className="text-deep">쌍계사</span>에서 쉬어갈까요?</h1>
            <p className="mt-2 text-[12.5px] text-sub">캠퍼의 한 줄이 이 자리에 걸립니다 · <span className="font-semibold text-deep">나도 한 줄 남기기{visible.length ? '' : ' (첫 번째!)'}</span></p>
          </button>
        )}
      </div>
      <QuoteSheet open={sheet} onClose={() => setSheet(false)} toast={show} />
      <Toast msg={msg} />

      <div className="relative mt-6 flex items-center justify-between px-5">
        <p className="text-[13px] font-semibold text-ink">지금 산사캠프</p>
        <Link to="/photo" className="-my-3 -mr-2 inline-flex min-h-[44px] items-center px-2 text-[12px] font-semibold text-sub">전체</Link>
      </div>
      <PhotoDeck />
    </section>
  )
}
