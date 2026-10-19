import { openExternal } from '../../lib/external'
import { KAKAO_CHANNEL } from '../KakaoChat'
import { naverConversion } from '../../lib/naverWcs'

// 홈 고정 풍선형 버튼 — 하단 탭 바로 위 오른쪽. 카카오톡 문의 + 네이버 예매 2개.
export const TICKETS = {
  hanok: { label: '한옥 예매하기', url: 'https://naver.me/Ghwqi86o' },
  camp: { label: '캠핑존 예매하기', url: 'https://naver.me/IMZ2Cni4' },
} as const

const Hanok = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 10c3-1 5-3 9-6 4 3 6 5 9 6" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /><path d="M2 10h20" />
  </svg>
)
const KakaoBubble = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7L5.8 21l4-2.6c.7.1 1.4.2 2.2.2 5.5 0 10-3.6 10-8S17.5 3 12 3z" /></svg>
)
const Tent = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 20 12 4l9 16" /><path d="M8.5 20 12 12l3.5 8" /><path d="M2 20h20" />
  </svg>
)

export default function TicketFab() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(88px+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-[430px] flex-col items-end gap-2.5 px-4" aria-label="문의·예매 바로가기">
      <button type="button" onClick={() => openExternal(KAKAO_CHANNEL.chat)} aria-label="카카오톡으로 문의하기"
        className="pointer-events-auto flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-full bg-[#FEE500] text-[#191919] shadow-[0_10px_24px_rgba(120,100,0,0.28)] ring-1 ring-[#EBD300] transition active:scale-95">
        <KakaoBubble />
        <span className="text-[9.5px] font-extrabold leading-none">문의</span>
      </button>
      <button type="button" onClick={() => { naverConversion('custom001'); openExternal(TICKETS.hanok.url) }}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[#FBE9D2] py-3 pl-4 pr-5 text-[15px] font-extrabold text-[#7A4A12] shadow-[0_10px_24px_rgba(122,74,18,0.28)] ring-1 ring-[#F1D7B3] transition active:scale-95">
        <Hanok />{TICKETS.hanok.label}
      </button>
      <button type="button" onClick={() => { naverConversion('custom001'); openExternal(TICKETS.camp.url) }}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[#1E8E5A] py-3 pl-4 pr-5 text-[15px] font-extrabold text-white shadow-[0_10px_24px_rgba(30,142,90,0.38)] transition active:scale-95">
        <Tent />{TICKETS.camp.label}
      </button>
    </div>
  )
}
