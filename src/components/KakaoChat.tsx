import { extClick } from '../lib/external'

/** 산사캠프 카카오톡 채널 — 1:1 채팅으로 바로 연결 */
export const KAKAO_CHANNEL = { home: 'https://pf.kakao.com/_Rxcxfrn', chat: 'https://pf.kakao.com/_Rxcxfrn/chat' }

const KakaoGlyph = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path fill="#191919" d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7L5.8 21l4-2.6c.7.1 1.4.2 2.2.2 5.5 0 10-3.6 10-8S17.5 3 12 3z" /></svg>
)

/** 더보기 등에 넣는 문의 카드 */
export function KakaoChatCard() {
  return (
    <a href={KAKAO_CHANNEL.chat} target="_blank" rel="noopener noreferrer" onClick={extClick} className="flex items-center gap-3 rounded-tile bg-[#FEE500] px-4 py-3.5 transition active:scale-[0.98]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70"><KakaoGlyph size={20} /></span>
      <span className="min-w-0 flex-1 text-[#191919]">
        <span className="block text-[15px] font-extrabold">카카오톡으로 문의하기</span>
        <span className="block text-[12px] leading-snug opacity-75">예약·주차·환불 등 궁금한 점을 채팅으로 물어보세요</span>
      </span>
      <span className="shrink-0 rounded-full bg-[#191919] px-3 py-1.5 text-[12px] font-extrabold text-[#FEE500]">상담하기</span>
    </a>
  )
}

/** 화면 하단에 두는 한 줄짜리 문의 링크 */
export function KakaoChatLine({ text = '예약이 잘 안 되거나 궁금한 점이 있나요?' }: { text?: string }) {
  return (
    <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[12.5px] text-sub">
      <span>{text}</span>
      <a href={KAKAO_CHANNEL.chat} target="_blank" rel="noopener noreferrer" onClick={extClick} className="inline-flex items-center gap-1 rounded-full bg-[#FEE500] px-3 py-1.5 text-[12.5px] font-extrabold text-[#191919] active:scale-95">
        <KakaoGlyph size={14} />카카오톡 문의
      </a>
    </p>
  )
}
