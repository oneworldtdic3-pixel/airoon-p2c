import { Link, useNavigate } from 'react-router-dom'
import Icon from '../components/ui/Icon'
import SponsorStrip from '../components/home/SponsorStrip'
import { PROGRAM_BOOKING_LABEL, programBookingOpen } from '../data/constants'

// 기획의도 · WHY SANSA CAMP — 운영팀 기획 페이지(PDF)를 9조각 이미지로. 마지막 CTA·주최/후원은 앱에서 직접 그린다(링크·최신 목록 반영).
const PARTS = Array.from({ length: 9 }, (_, i) => `/about/p${i + 1}.jpg`)

export default function About() {
  const nav = useNavigate()
  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-20 flex items-center justify-between bg-white/95 px-3 pb-2.5 pt-[calc(env(safe-area-inset-top)+10px)] backdrop-blur">
        <button type="button" onClick={() => (window.history.length > 1 ? nav(-1) : nav('/'))} aria-label="뒤로" className="p-2"><Icon name="back" /></button>
        <p className="text-[15px] font-extrabold">기획의도 · WHY SANSA CAMP</p>
        <span className="w-10" />
      </header>
      <div className="mx-auto max-w-[430px]">
        {PARTS.map((src, i) => (
          <img key={src} src={src} alt={i === 0 ? '2026 산사캠프 with 쌍계사 — 쉬러 갔다가 더 지쳐서 돌아온 적, 있나요? 비우러 와서, 채워 가는 2박 3일' : ''} width={1109} height={1479} loading={i < 2 ? 'eager' : 'lazy'} decoding="async" draggable={false} className="block h-auto w-full" />
        ))}

        {/* 마무리 CTA — 이미지 대신 실제 버튼 */}
        <section className="bg-sky px-5 pb-10 pt-12 text-center text-ink">
          <h2 className="text-[30px] font-extrabold leading-[1.2]">비우러 와서,<br />채워 가세요</h2>
          <p className="tnum mt-5 text-[14px] font-bold">2026. 11. 6(금) 14:00 – 11. 8(일) 11:00</p>
          <p className="mt-1 text-[13.5px] font-semibold text-ink/80">하동 쌍계사 일원 · 700명 한정</p>
          <Link to="/reserve?tab=program" className="mt-7 inline-flex items-center justify-center rounded-full bg-ember px-8 py-3.5 text-[15px] font-extrabold text-white shadow-[0_8px_20px_rgba(240,85,42,0.35)] transition active:scale-[0.97]">{programBookingOpen() ? '프로그램 사전예약하기' : '프로그램 미리 보기'}</Link>
          {!programBookingOpen() && <p className="mt-3 text-[12.5px] font-bold text-ink/75">프로그램 예약은 {PROGRAM_BOOKING_LABEL}부터 가능합니다</p>}
        </section>
        <div className="pb-[calc(env(safe-area-inset-bottom)+24px)]"><SponsorStrip /></div>
      </div>
    </div>
  )
}
