import { KAKAO_CHANNEL } from '../KakaoChat'
import { extClick } from '../../lib/external'

/** 반려견 동반 안내 — 세 구역 모두 가능하지만, 잘 짖거나 낯선 사람을 어려워하는 아이는 쌍계초 쪽으로 안내한다 */
export default function PetNotice({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-tile bg-[#FFF4E8] px-4 py-3.5 ${className}`}>
      <p className="flex items-center gap-1.5 text-[13.5px] font-extrabold text-ink"><span aria-hidden="true">🐾</span>반려견과 함께 오시나요?</p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-sub">
        세 구역 모두 반려견 동반이 가능해요. 다만 잘 짖거나 낯선 사람과의 접촉이 어려운 반려견은 <b className="text-ink">쌍계초 쪽</b>으로 안내하고 있으니, 사이트를 고르기 전에 미리 알려 주세요.
      </p>
      <a href={KAKAO_CHANNEL.chat} target="_blank" rel="noopener noreferrer" onClick={extClick} className="mt-2.5 inline-flex items-center rounded-full bg-[#FEE500] px-3 py-1.5 text-[12.5px] font-extrabold text-[#191919] active:scale-95">카카오톡으로 미리 알리기</a>
    </div>
  )
}
