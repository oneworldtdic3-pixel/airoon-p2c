import { useNavigate } from 'react-router-dom'
import Icon from '../components/ui/Icon'
import { extClick } from '../lib/external'

// 붓쯔(BUDDHZ) · 도반HC 홍보 상세 — 홈 덱의 도반HC 배너에서 진입. 긴 소개 이미지를 8조각으로 나눠 순서대로 띄운다.
const PARTS = Array.from({ length: 8 }, (_, i) => `/sponsors/buddhz/p${i + 1}.jpg`)
const INSTAGRAM = 'https://www.instagram.com/buddhz.official'

export default function SponsorBuddhz() {
  const nav = useNavigate()
  return (
    <div className="min-h-dvh bg-[#1E6B3C]">
      <header className="sticky top-0 z-20 flex items-center justify-between bg-white/95 px-3 pb-2.5 pt-[calc(env(safe-area-inset-top)+10px)] backdrop-blur">
        <button type="button" onClick={() => (window.history.length > 1 ? nav(-1) : nav('/'))} aria-label="뒤로" className="p-2"><Icon name="back" /></button>
        <p className="flex items-center gap-2 text-[15px] font-extrabold">
          <img src="/sponsors/buddhz.png" alt="" className="h-5 w-auto" />붓쯔 BUDDHZ
          <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-extrabold text-sub">부스참여업체</span>
        </p>
        <span className="w-10" />
      </header>
      <div className="mx-auto max-w-[430px] bg-white">
        {PARTS.map((src, i) => (
          <img key={src} src={src} alt={i === 0 ? '붓쯔 BUDDHZ — 불교, 굿즈를 만나다. 도반HC' : ''} width={778} height={1000} loading={i < 2 ? 'eager' : 'lazy'} decoding="async" draggable={false} className="block h-auto w-full" />
        ))}
        <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+28px)] pt-6">
          <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" onClick={extClick} className="flex items-center gap-3 rounded-tile border border-line bg-white px-4 py-3.5 shadow-soft transition active:scale-[0.98]">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#F9CE34,#EE2A7B_55%,#6228D7)] text-white"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" /></svg></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-extrabold">붓쯔 인스타그램</span>
              <span className="block truncate text-[12.5px] text-sub">@buddhz.official · 새 굿즈와 팝업 소식</span>
            </span>
            <Icon name="chevron" size={18} className="shrink-0 text-gray-400" />
          </a>
          <p className="mt-5 text-center text-[11.5px] text-gray-400">후원사 제공 홍보 자료 · 붓쯔(BUDDHZ) · 도반HC</p>
        </div>
      </div>
    </div>
  )
}
