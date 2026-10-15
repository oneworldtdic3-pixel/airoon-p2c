import { openExternal } from '../../lib/external'

// 홈 고정 예매 버튼 — 하단 탭 바로 위 오른쪽에 떠 있는 풍선형 버튼 2개. 네이버 예매 페이지로 바로 연결.
export const TICKETS = {
  hanok: { label: '한옥 예매하기', url: 'https://naver.me/Ghwqi86o' },
  camp: { label: '캠핑존 예매하기', url: 'https://naver.me/IMZ2Cni4' },
} as const

const Hanok = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 10c3-1 5-3 9-6 4 3 6 5 9 6" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /><path d="M2 10h20" />
  </svg>
)
const Tent = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 20 12 4l9 16" /><path d="M8.5 20 12 12l3.5 8" /><path d="M2 20h20" />
  </svg>
)

export default function TicketFab() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(88px+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-[430px] flex-col items-end gap-2.5 px-4" aria-label="예매 바로가기">
      <button type="button" onClick={() => openExternal(TICKETS.hanok.url)}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[#FBE9D2] py-3 pl-4 pr-5 text-[15px] font-extrabold text-[#7A4A12] shadow-[0_10px_24px_rgba(122,74,18,0.28)] ring-1 ring-[#F1D7B3] transition active:scale-95">
        <Hanok />{TICKETS.hanok.label}
      </button>
      <button type="button" onClick={() => openExternal(TICKETS.camp.url)}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[#1E8E5A] py-3 pl-4 pr-5 text-[15px] font-extrabold text-white shadow-[0_10px_24px_rgba(30,142,90,0.38)] transition active:scale-95">
        <Tent />{TICKETS.camp.label}
      </button>
    </div>
  )
}
