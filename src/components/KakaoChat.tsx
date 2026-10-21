import { extClick } from '../lib/external'

/** 산사캠프 카카오톡 채널 — 1:1 채팅으로 바로 연결 */
export const KAKAO_CHANNEL = { home: 'https://pf.kakao.com/_Rxcxfrn', chat: 'https://pf.kakao.com/_Rxcxfrn/chat' }
/** 네이버 톡톡 — 스마트스토어 주문 문의는 이쪽이 편하다 */
export const NAVER_TALK = { chat: 'https://talk.naver.com/ct/wk4m4sr' }

/** 네이버 톡톡 말풍선 (초록 바탕 위 흰 N 자) */
export const NaverTalkGlyph = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#03C75A" d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7L5.8 21l4-2.6c.7.1 1.4.2 2.2.2 5.5 0 10-3.6 10-8S17.5 3 12 3z" />
    <path fill="#fff" d="M8.6 7.5h2.3l2.6 4.3V7.5h2v7h-2.3l-2.6-4.3v4.3h-2z" />
  </svg>
)

const KakaoGlyph = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path fill="#191919" d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7L5.8 21l4-2.6c.7.1 1.4.2 2.2.2 5.5 0 10-3.6 10-8S17.5 3 12 3z" /></svg>
)

/** 더보기 등에 넣는 문의 카드 — 카카오톡과 네이버 톡톡 둘 다 */
export function KakaoChatCard() {
  return (
    <div className="space-y-2.5">
      <a href={KAKAO_CHANNEL.chat} target="_blank" rel="noopener noreferrer" onClick={extClick} className="flex items-center gap-3 rounded-tile bg-[#FEE500] px-4 py-3.5 transition active:scale-[0.98]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70"><KakaoGlyph size={20} /></span>
      <span className="min-w-0 flex-1 text-[#191919]">
        <span className="block text-[15px] font-extrabold">카카오톡으로 문의하기</span>
        <span className="block text-[12px] leading-snug opacity-75">예약·주차·환불 등 궁금한 점을 채팅으로 물어보세요</span>
      </span>
      <span className="shrink-0 rounded-full bg-[#191919] px-3 py-1.5 text-[12px] font-extrabold text-[#FEE500]">상담하기</span>
    </a>
      <a href={NAVER_TALK.chat} target="_blank" rel="noopener noreferrer" onClick={extClick} className="flex items-center gap-3 rounded-tile bg-[#03C75A] px-4 py-3.5 transition active:scale-[0.98]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white"><NaverTalkGlyph size={22} /></span>
        <span className="min-w-0 flex-1 text-white">
          <span className="block text-[15px] font-extrabold">네이버 톡톡으로 문의하기</span>
          <span className="block text-[12px] leading-snug opacity-85">스마트스토어 주문·환불 문의는 톡톡이 빨라요</span>
        </span>
        <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[12px] font-extrabold text-[#03C75A]">상담하기</span>
      </a>
    </div>
  )
}

/** 화면 하단에 두는 한 줄짜리 문의 링크 */
export function KakaoChatLine({ text = '예약이 잘 안 되거나 궁금한 점이 있나요?' }: { text?: string }) {
  return (
    <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[12.5px] text-sub">
      <span>{text}</span>
      <span className="inline-flex gap-1.5">
        <a href={KAKAO_CHANNEL.chat} target="_blank" rel="noopener noreferrer" onClick={extClick} className="inline-flex items-center gap-1 rounded-full bg-[#FEE500] px-3 py-1.5 text-[12.5px] font-extrabold text-[#191919] active:scale-95">
          <KakaoGlyph size={14} />카카오톡
        </a>
        <a href={NAVER_TALK.chat} target="_blank" rel="noopener noreferrer" onClick={extClick} className="inline-flex items-center gap-1 rounded-full bg-[#03C75A] px-3 py-1.5 text-[12.5px] font-extrabold text-white active:scale-95">
          <NaverTalkGlyph size={14} />네이버 톡톡
        </a>
      </span>
    </p>
  )
}
