import { useEffect, useState } from 'react'
import Icon from '../ui/Icon'
import { Toast } from '../ui'
import InstallSheet from '../InstallSheet'
import { useInstall } from '../../hooks/useInstall'
import { useToast } from '../../hooks/useToast'
import { enablePush, getPushState, type PushState } from '../../lib/push'

// 행사 연기 중 홈 하단 고정 버튼 — 예매 버튼 대신 '새 일정 알림 받기'.
//  · 알림이 꺼져 있으면 휴대폰 알림(푸시 구독)을 켠다
//  · 이미 켜져 있으면 안내만
//  · 아이폰에서 홈 화면 앱이 아니면 '홈 화면에 추가' 안내
// 알림 상태는 미리 읽어 둔다. 아이폰은 버튼을 누른 그 순간에 권한을 물어야 하기 때문
const ON_MSG = '알림이 켜져 있어요. 새 일정이 정해지면 가장 먼저 알려드릴게요'

export default function NotifyFab({ hidden = false }: { hidden?: boolean }) {
  const { inApp } = useInstall()
  const { msg, show } = useToast()
  const [state, setState] = useState<PushState | null>(null)
  const [busy, setBusy] = useState(false)
  const [installOpen, setInstallOpen] = useState(false)

  useEffect(() => {
    let alive = true
    const read = () => { getPushState().then((s) => { if (alive) setState(s) }).catch(() => {}) }
    read()
    // 서비스워커가 늦게 준비되면 구독 여부를 그때 다시 읽는다
    if ('serviceWorker' in navigator) void navigator.serviceWorker.ready.then(read).catch(() => {})
    const onVisible = () => { if (document.visibilityState === 'visible') read() }
    document.addEventListener('visibilitychange', onVisible)
    return () => { alive = false; document.removeEventListener('visibilitychange', onVisible) }
  }, [])

  const click = async () => {
    if (busy) return
    if (inApp) return show('카카오톡·인스타그램 안 브라우저에서는 알림을 켤 수 없어요. 크롬이나 사파리에서 열어 주세요')
    if (state === 'on') return show(ON_MSG)
    if (state === 'ios-install') return setInstallOpen(true)
    if (state === 'denied') return show('알림이 차단되어 있어요. 브라우저 설정에서 sansacamp.com 알림을 허용해 주세요')
    if (state === 'unsupported') return show('이 브라우저는 휴대폰 알림을 지원하지 않아요')
    setBusy(true)
    const r = await enablePush()
    setBusy(false)
    if (r.ok) { setState('on'); show('알림을 켰어요. 새 일정이 정해지면 가장 먼저 알려드릴게요') }
    else show(r.error)
  }

  return (
    <>
      <div inert={hidden} className={`pointer-events-none fixed inset-x-0 bottom-[calc(80px+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-[430px] justify-end px-4 transition duration-300 ease-out ${hidden ? 'translate-y-6 opacity-0 [&>*]:!pointer-events-none' : ''}`}>
        <button type="button" onClick={() => void click()} disabled={busy}
          className="btn-buy pointer-events-auto min-h-[48px] gap-2 shadow-[0_10px_24px_rgba(24,122,76,0.38)]">
          <Icon name="bell" size={20} />{busy ? '알림 켜는 중…' : '새 일정 알림 받기'}
        </button>
      </div>
      <InstallSheet open={installOpen} onClose={() => setInstallOpen(false)} />
      <Toast msg={msg} />
    </>
  )
}
