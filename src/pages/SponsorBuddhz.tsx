import { useNavigate } from 'react-router-dom'
import Icon from '../components/ui/Icon'

// 붓쯔(BUDDHZ) · 도반HC 홍보 상세 — 홈 덱의 도반HC 배너에서 진입. 긴 소개 이미지를 8조각으로 나눠 순서대로 띄운다.
const PARTS = Array.from({ length: 8 }, (_, i) => `/sponsors/buddhz/p${i + 1}.jpg`)

export default function SponsorBuddhz() {
  const nav = useNavigate()
  return (
    <div className="min-h-dvh bg-[#1E6B3C]">
      <header className="sticky top-0 z-20 flex items-center justify-between bg-white/95 px-3 pb-2.5 pt-[calc(env(safe-area-inset-top)+10px)] backdrop-blur">
        <button type="button" onClick={() => (window.history.length > 1 ? nav(-1) : nav('/'))} aria-label="뒤로" className="p-2"><Icon name="back" /></button>
        <p className="flex items-center gap-2 text-[15px] font-extrabold">
          <img src="/sponsors/buddhz.png" alt="" className="h-5 w-auto" />붓쯔 BUDDHZ
          <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider text-sub">AD</span>
        </p>
        <span className="w-10" />
      </header>
      <div className="mx-auto max-w-[430px] bg-white">
        {PARTS.map((src, i) => (
          <img key={src} src={src} alt={i === 0 ? '붓쯔 BUDDHZ — 불교, 굿즈를 만나다. 도반HC' : ''} width={778} height={1000} loading={i < 2 ? 'eager' : 'lazy'} decoding="async" draggable={false} className="block h-auto w-full" />
        ))}
        <p className="px-5 pb-[calc(env(safe-area-inset-bottom)+28px)] pt-5 text-center text-[11.5px] text-gray-400">후원사 제공 홍보 자료 · 붓쯔(BUDDHZ) · 도반HC</p>
      </div>
    </div>
  )
}
