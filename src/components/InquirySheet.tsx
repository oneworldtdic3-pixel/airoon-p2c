import { useState } from 'react'
import { openExternal } from '../lib/external'
import { KAKAO_CHANNEL, NAVER_TALK, NaverTalkGlyph } from './KakaoChat'
import { BottomSheet } from './ui'

const KakaoBubble = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7L5.8 21l4-2.6c.7.1 1.4.2 2.2.2 5.5 0 10-3.6 10-8S17.5 3 12 3z" /></svg>
)

/** 문의 채널 고르기 — 네이버 톡톡(예매·주문) / 카카오톡(그 밖) */
export function InquirySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const go = (url: string) => { onClose(); openExternal(url) }
  return (
    <BottomSheet open={open} onClose={onClose} title="무엇으로 문의할까요?">
      <p className="mb-4 text-[13px] leading-relaxed text-sub">스마트스토어에서 예매하셨다면 네이버 톡톡이, 그 밖의 문의는 카카오톡이 편해요. 둘 다 같은 운영팀이 답합니다.</p>
      <div className="space-y-2.5">
        <button type="button" onClick={() => go(NAVER_TALK.chat)} aria-label="네이버 톡톡으로 문의 (새 창)" className="flex w-full items-center gap-3 rounded-tile bg-[#03C75A] px-4 py-3.5 text-left text-white transition active:scale-[0.98]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white"><NaverTalkGlyph size={22} /></span>
          <span className="min-w-0 flex-1"><span className="block text-[15px] font-extrabold">네이버 톡톡</span><span className="block text-[12px] opacity-90">예매·주문·환불 문의</span></span>
        </button>
        <button type="button" onClick={() => go(KAKAO_CHANNEL.chat)} aria-label="카카오톡으로 문의 (새 창)" className="flex w-full items-center gap-3 rounded-tile bg-[#FEE500] px-4 py-3.5 text-left text-[#191919] transition active:scale-[0.98]">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/70"><KakaoBubble /></span>
          <span className="min-w-0 flex-1"><span className="block text-[15px] font-extrabold">카카오톡</span><span className="block text-[12px] opacity-80">프로그램·주차·행사 전반 문의</span></span>
        </button>
      </div>
    </BottomSheet>
  )
}

/** 홈 맨 위 오른쪽 '문의' 버튼 (누르면 채널 선택 시트) */
export function InquiryButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="문의하기 (카카오톡·네이버 톡톡)"
        className="inline-flex min-h-[44px] items-center gap-1 rounded-full px-2 text-[13px] font-bold text-ink active:scale-95">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white"><KakaoBubble size={16} /></span>문의
      </button>
      <InquirySheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}
