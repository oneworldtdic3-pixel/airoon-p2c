import type { ComponentType, SVGProps } from 'react'
import { HomeIcon, PrayIcon, QrScanIcon, TempleStayIcon, UserIcon } from './icons'

export type TabKey = 'home' | 'donate' | 'scan' | 'templestay' | 'me'

type Tab = { key: Exclude<TabKey, 'scan'>; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }

const LEFT_TABS: Tab[] = [
  { key: 'home', label: '홈', Icon: HomeIcon },
  { key: 'donate', label: '시주', Icon: PrayIcon },
]

const RIGHT_TABS: Tab[] = [
  { key: 'templestay', label: '템플스테이', Icon: TempleStayIcon },
  { key: 'me', label: '내정보', Icon: UserIcon },
]

type TabBarProps = {
  active: TabKey
  onChange: (key: TabKey) => void
}

export function TabBar({ active, onChange }: TabBarProps) {
  const renderTab = ({ key, label, Icon }: Tab) => {
    const selected = active === key
    return (
      <button
        key={key}
        type="button"
        onClick={() => onChange(key)}
        aria-current={selected ? 'page' : undefined}
        className={`flex flex-col items-center pt-[17px] transition-transform active:scale-95 ${
          selected ? 'text-ink' : 'text-tab-inactive'
        }`}
      >
        <Icon />
        <span className={`mt-[5px] text-[9px] leading-[12px] ${selected ? 'font-semibold' : 'font-medium'}`}>
          {label}
        </span>
      </button>
    )
  }

  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[430px] rounded-t-[30px] bg-[linear-gradient(180deg,#ddcaad_0%,#d0b691_55%,#c09e72_100%)] shadow-[0_-6px_20px_rgba(120,96,60,0.10)]"
    >
      <button
        type="button"
        onClick={() => onChange('scan')}
        className="block h-[37px] w-full pt-[8px] text-center text-[12.5px] font-semibold leading-[20px] text-white/85"
      >
        Temple pay QR Scan
      </button>

      <div className="relative flex h-[calc(83px+max(0px,env(safe-area-inset-bottom)-28px))]">
        <div className="-mr-px flex-1 rounded-tl-[28px] bg-white" />
        <div className="flex w-[140px] shrink-0 flex-col">
          <svg width="140" height="83" viewBox="0 0 140 83" className="block shrink-0" aria-hidden="true">
            <path d="M0 0H6C22 0 28 8 31 22C35 46 50 65 70 65C90 65 105 46 109 22C112 8 118 0 134 0H140V83H0Z" fill="#fff" />
          </svg>
          <div className="flex-1 bg-white" />
        </div>
        <div className="-ml-px flex-1 rounded-tr-[28px] bg-white" />

        <div className="absolute inset-0 grid grid-cols-5 px-2">
          {LEFT_TABS.map(renderTab)}
          <button
            type="button"
            onClick={() => onChange('scan')}
            aria-label="QR 스캔"
            className="flex justify-center pt-[22px] text-white transition-transform active:scale-95"
          >
            <QrScanIcon />
          </button>
          {RIGHT_TABS.map(renderTab)}
        </div>
      </div>
    </nav>
  )
}
