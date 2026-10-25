import { useState } from 'react'
import { openExternal } from '../../lib/external'
import { KAKAO_CHANNEL, NAVER_TALK, NaverTalkGlyph } from '../KakaoChat'
import { BottomSheet } from '../ui'
import { naverConversion } from '../../lib/naverWcs'
import { markBuyClick } from '../../lib/visit'

// 홈 고정 풍선형 버튼 — 하단 탭 바로 위 오른쪽. 문의(카카오톡·네이버 톡톡 선택) + 네이버 예매 2개.
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

/** hidden: 홈 맨 아래(후원사·SNS)까지 내려오면 내용을 가리지 않게 살짝 내려가며 사라진다 */
export default function TicketFab({ hidden = false }: { hidden?: boolean }) {
  const [ask, setAsk] = useState(false)
  const go = (url: string) => { setAsk(false); openExternal(url) }
  return (
    <>
    <div inert={hidden} className={`pointer-events-none fixed inset-x-0 bottom-[calc(88px+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-[430px] flex-col items-end gap-2.5 px-4 transition duration-300 ease-out ${hidden ? 'translate-y-6 opacity-0 [&>*]:!pointer-events-none' : ''}`} aria-label="문의·예매 바로가기">
      <button type="button" onClick={() => setAsk(true)} aria-label="문의하기 (카카오톡·네이버 톡톡)"
        className="pointer-events-auto flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-full bg-ink text-white shadow-[0_10px_24px_rgba(31,41,55,0.35)] ring-1 ring-white/20 transition active:scale-95">
        <KakaoBubble />
        <span className="text-[9.5px] font-extrabold leading-none">문의</span>
      </button>
      <button type="button" onClick={() => { naverConversion('custom001'); markBuyClick(); openExternal(TICKETS.hanok.url) }}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[#FBE9D2] py-3 pl-4 pr-5 text-[15px] font-extrabold text-[#7A4A12] shadow-[0_10px_24px_rgba(122,74,18,0.28)] ring-1 ring-[#F1D7B3] transition active:scale-95">
        <Hanok />{TICKETS.hanok.label}
      </button>
      <button type="button" onClick={() => { naverConversion('custom001'); markBuyClick(); openExternal(TICKETS.camp.url) }}
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[#1E8E5A] py-3 pl-4 pr-5 text-[15px] font-extrabold text-white shadow-[0_10px_24px_rgba(30,142,90,0.38)] transition active:scale-95">
        <Tent />{TICKETS.camp.label}
      </button>
    </div>
    <BottomSheet open={ask} onClose={() => setAsk(false)} title="무엇으로 문의할까요?">
      <p className="mb-4 text-[13px] leading-relaxed text-sub">스마트스토어에서 예매하셨다면 네이버 톡톡이, 그 밖의 문의는 카카오톡이 편해요. 둘 다 같은 운영팀이 답합니다.</p>
      <div className="space-y-2.5">
        <button type="button" onClick={() => go(NAVER_TALK.chat)} className="flex w-full items-center gap-3 rounded-tile bg-[#03C75A] px-4 py-3.5 text-left text-white transition active:scale-[0.98]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white"><NaverTalkGlyph size={22} /></span>
          <span className="min-w-0 flex-1"><span className="block text-[15px] font-extrabold">네이버 톡톡</span><span className="block text-[12px] opacity-85">예매·주문·환불 문의</span></span>
        </button>
        <button type="button" onClick={() => go(KAKAO_CHANNEL.chat)} className="flex w-full items-center gap-3 rounded-tile bg-[#FEE500] px-4 py-3.5 text-left text-[#191919] transition active:scale-[0.98]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70"><KakaoBubble /></span>
          <span className="min-w-0 flex-1"><span className="block text-[15px] font-extrabold">카카오톡</span><span className="block text-[12px] opacity-75">프로그램·주차·행사 전반 문의</span></span>
        </button>
      </div>
    </BottomSheet>
    </>
  )
}
