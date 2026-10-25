import { openExternal } from '../../lib/external'
import { naverConversion } from '../../lib/naverWcs'
import { markBuyClick } from '../../lib/visit'

// 홈 고정 예매 버튼 — 하단 탭 바로 위 오른쪽, 한 줄.
//  · 주요 버튼은 '캠핑존 예매하기' 하나(진초록 .btn-buy), '한옥 예매하기'는 흰 바탕 보조 버튼
//  · 문의 버튼은 홈 맨 위(D-day 옆)로 옮겼다
export const TICKETS = {
  hanok: { label: '한옥 예매하기', url: 'https://naver.me/Ghwqi86o' },
  camp: { label: '캠핑존 예매하기', url: 'https://naver.me/IMZ2Cni4' },
} as const

const Hanok = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 10c3-1 5-3 9-6 4 3 6 5 9 6" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /><path d="M2 10h20" />
  </svg>
)
const Tent = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 20 12 4l9 16" /><path d="M8.5 20 12 12l3.5 8" /><path d="M2 20h20" />
  </svg>
)

const go = (url: string) => { naverConversion('custom001'); markBuyClick(); openExternal(url) }

/** hidden: 캠핑존 카드 구간이나 맨 아래(후원사·SNS)가 보이면 내용을 가리지 않게 살짝 내려가며 사라진다 */
export default function TicketFab({ hidden = false }: { hidden?: boolean }) {
  return (
    <div inert={hidden} className={`pointer-events-none fixed inset-x-0 bottom-[calc(80px+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-[430px] items-center justify-end gap-2 px-4 transition duration-300 ease-out ${hidden ? 'translate-y-6 opacity-0 [&>*]:!pointer-events-none' : ''}`} aria-label="예매 바로가기">
      <button type="button" onClick={() => go(TICKETS.hanok.url)} aria-label={`${TICKETS.hanok.label} (새 창)`}
        className="pointer-events-auto inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-line bg-white px-3.5 text-[13px] font-bold text-ink shadow-[0_6px_16px_rgba(31,41,55,0.14)] transition active:scale-95">
        <Hanok />한옥
      </button>
      <button type="button" onClick={() => go(TICKETS.camp.url)} aria-label={`${TICKETS.camp.label} (새 창)`}
        className="btn-buy pointer-events-auto min-h-[48px] gap-2 shadow-[0_10px_24px_rgba(24,122,76,0.38)]">
        <Tent />{TICKETS.camp.label}
      </button>
    </div>
  )
}
