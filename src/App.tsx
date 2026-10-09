import { useState } from 'react'
import monk from './assets/monk.png'
import lotus from './assets/lotus.png'
import incense from './assets/incense.png'
import temple from './assets/temple.png'
import qr from './assets/qr.png'
import { BellIcon, CheckCircleIcon, LogoMark } from './components/icons'
import { TabBar, type TabKey } from './components/TabBar'

type QuickMenu = {
  title: string
  description: string
  image: string
  imageWidth: number
}

const QUICK_MENUS: QuickMenu[] = [
  { title: '시주 · 보시', description: '마음을 전합니다', image: lotus, imageWidth: 94 },
  { title: '의례 신청', description: '49재 · 전도재 · 위패', image: incense, imageWidth: 87 },
  { title: '템플스테이', description: '쉼이 필요한 날', image: temple, imageWidth: 94 },
  { title: 'QR 스캔', description: '사찰 QR로 바로 결제', image: qr, imageWidth: 77 },
]

const won = new Intl.NumberFormat('ko-KR')

function Header() {
  return (
    <header className="flex h-[40px] items-center justify-between pl-[16px] pr-[17px]">
      <h1 className="flex items-center gap-[8px] text-gold">
        <LogoMark />
        <span className="text-[17.5px] font-semibold leading-none tracking-[-0.01em]">TEMPLE PAY</span>
      </h1>
      <button type="button" aria-label="알림 (새 알림 있음)" className="-mr-1 p-1 text-ink transition-transform active:scale-90">
        <BellIcon />
      </button>
    </header>
  )
}

function GreetingCard({ name }: { name: string }) {
  return (
    <section
      className="relative h-[188px] overflow-hidden rounded-[24px] bg-[radial-gradient(120%_90%_at_72%_10%,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0)_55%),linear-gradient(180deg,#fefefe_0%,#f4ede3_24%,#e6dacb_48%,#d6c2a4_74%,#c2a377_100%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.7),inset_0_0_22px_rgba(255,255,255,0.6)]"
    >
      <div className="relative z-10 pl-[24px] pt-[66px] text-white [text-shadow:0_1px_8px_rgba(150,118,74,0.35)]">
        <p className="text-[14.5px] font-medium leading-[20px]">{name}님</p>
        <p className="mt-[4px] text-[21.5px] font-bold leading-[28px] tracking-[-0.02em]">오늘도 평안하세요</p>
      </div>
      <img
        src={monk}
        alt=""
        width={146}
        height={187}
        className="absolute bottom-0 right-[17px] w-[146px] [mask-image:linear-gradient(90deg,transparent_0%,#000_22%,#000_88%,transparent_100%)]"
      />
    </section>
  )
}

function MyTempleCard() {
  return (
    <section className="rounded-[24px] bg-white px-[20px] pb-[25px] pt-[22px]">
      <p className="text-[11px] font-medium leading-[14px] text-gold-label">나의사찰</p>
      <div className="mt-[12px] flex items-center gap-[11px]">
        <h2 className="text-[21.5px] font-bold leading-[28px] tracking-[-0.02em]">보문사</h2>
        <span className="inline-flex h-[22px] items-center gap-[4px] rounded-[7px] bg-gold-soft px-[8px] text-[11px] font-medium text-gold-text">
          <CheckCircleIcon />
          인증신도
        </span>
      </div>
      <p className="mt-[10px] text-[11px] leading-[14px] text-muted">대한불교조계종 · 인천 강화군</p>

      <div className="mt-[22px] flex h-[50px] items-center gap-[13px] rounded-[17px] bg-fill px-[15px]">
        <span className="grid size-[16px] place-items-center rounded-full bg-gold-ring" aria-hidden="true">
          <span className="size-[8px] rounded-full bg-gold-dot" />
        </span>
        <p className="truncate text-[14.5px] leading-[20px]">
          <span className="font-bold">오늘 저녁 7시</span>
          <span className="text-muted"> · 초하루 참선 법회</span>
        </p>
      </div>

      <button
        type="button"
        className="mt-[21px] h-[50px] w-full rounded-[16px] bg-[linear-gradient(180deg,#c8ab83_0%,#c3a174_100%)] text-[14px] font-semibold text-white shadow-[inset_0_0_14px_rgba(255,247,232,0.55),0_2px_6px_rgba(160,128,84,0.18)] transition-transform active:scale-[0.98]"
      >
        보문사에 시주하기
      </button>
    </section>
  )
}

function QuickMenuGrid() {
  return (
    <section className="grid grid-cols-2 gap-[16px]">
      {QUICK_MENUS.map(({ title, description, image, imageWidth }) => (
        <button
          key={title}
          type="button"
          className="relative flex h-[124px] flex-col items-start justify-start overflow-hidden rounded-[24px] bg-white pl-[20px] pt-[20px] text-left transition-transform active:scale-[0.98]"
        >
          <span className="relative z-10 block text-[14px] font-bold leading-[18px] tracking-[-0.02em]">{title}</span>
          <span className="relative z-10 mt-[4px] block text-[10px] leading-[13px] text-muted">{description}</span>
          <img src={image} alt="" style={{ width: imageWidth }} className="absolute bottom-0 right-0" />
        </button>
      ))}
    </section>
  )
}

function DonationSummary({ amount, count }: { amount: number; count: number }) {
  return (
    <section className="flex h-[87px] items-center justify-between rounded-[24px] bg-white px-[20px]">
      <div>
        <p className="text-[11px] leading-[14px] text-subtle">2026년 나의 신행</p>
        <p className="mt-[3px] flex items-baseline gap-[6px]">
          <strong className="text-[20px] font-bold leading-[26px] tracking-[-0.01em]">{won.format(amount)}</strong>
          <span className="text-[11px] text-muted">원 · {count}회 시주</span>
        </p>
      </div>
      <button
        type="button"
        className="h-[33px] rounded-[12px] bg-page w-[64px] text-[11px] font-medium text-[#333] transition-transform active:scale-95"
      >
        영수증
      </button>
    </section>
  )
}

export default function App() {
  const [tab, setTab] = useState<TabKey>('home')

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-page pt-[max(env(safe-area-inset-top),63px)] pb-[150px]">
      <Header />
      <main className="mt-[9px] flex flex-col gap-[16px] px-[16px]">
        <GreetingCard name="보리" />
        <MyTempleCard />
        <QuickMenuGrid />
        <DonationSummary amount={280000} count={6} />
      </main>
      <TabBar active={tab} onChange={setTab} />
    </div>
  )
}
