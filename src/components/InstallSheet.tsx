import { BottomSheet } from './ui'
import { useInstall } from '../hooks/useInstall'

const ShareGlyph = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 3v12M8 7l4-4 4 4" /><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
  </svg>
)
const Step = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <li className="flex gap-3 py-3">
    <span className="tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mint text-[13px] font-extrabold text-deep">{n}</span>
    <p className="pt-0.5 text-[15px] leading-snug">{children}</p>
  </li>
)

/** 홈 화면 추가 안내 시트. 안드로이드 크롬은 바로 설치창, iOS·그 외는 수동 절차 안내. */
export default function InstallSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { platform, inApp, canPrompt, prompt } = useInstall()
  const install = async () => { const ok = await prompt(); if (ok) onClose() }
  return (
    <BottomSheet open={open} onClose={onClose} title="홈 화면에 추가">
      <p className="text-[13.5px] leading-relaxed text-sub">앱처럼 아이콘으로 바로 열립니다. 행사장에서 QR 팔찌와 예약 확인을 빠르게 꺼낼 수 있어요.</p>
      {inApp ? (
        <div className="mt-5 rounded-tile bg-mint p-4">
          <p className="text-[15px] font-bold">지금은 {platform === 'ios' ? 'Safari' : 'Chrome'}에서 열어 주세요</p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-sub">카카오톡·인스타그램 안의 브라우저에서는 홈 화면 추가가 되지 않습니다. 오른쪽 위 메뉴에서 <b className="text-ink">다른 브라우저로 열기</b>를 누른 뒤 다시 시도해 주세요.</p>
        </div>
      ) : canPrompt ? (
        <button type="button" onClick={() => void install()} className="btn mt-5 w-full">지금 추가하기</button>
      ) : platform === 'ios' ? (
        <ol className="mt-3 divide-y hairline">
          <Step n={1}>Safari 아래쪽 가운데의 <span className="inline-flex translate-y-[3px] text-deep"><ShareGlyph /></span> <b>공유</b> 버튼을 누릅니다</Step>
          <Step n={2}>목록을 아래로 내려 <b>홈 화면에 추가</b>를 누릅니다</Step>
          <Step n={3}>오른쪽 위 <b>추가</b>를 누르면 끝</Step>
        </ol>
      ) : (
        <ol className="mt-3 divide-y hairline">
          <Step n={1}>브라우저 오른쪽 위 <b>⋮ 메뉴</b>를 엽니다</Step>
          <Step n={2}><b>홈 화면에 추가</b> 또는 <b>앱 설치</b>를 누릅니다</Step>
          <Step n={3}><b>설치</b>를 누르면 끝</Step>
        </ol>
      )}
    </BottomSheet>
  )
}
