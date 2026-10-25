import { useEffect, useState } from 'react'
import { BottomSheet, Toast } from '../ui'
import Icon from '../ui/Icon'
import InstallSheet from '../InstallSheet'
import { useInstall } from '../../hooks/useInstall'
import { useToast } from '../../hooks/useToast'
import { enablePush, getPushState, type PushState } from '../../lib/push'
import { buyClickedThisSession, countVisit, popupShownThisSession } from '../../lib/visit'

// 휴대폰 알림을 아직 안 켠 기기에 권한다. '나중에' = 오늘(KST) 하루 다시 안 띄움
//  · 첫 방문에는 띄우지 않는다. 두 번째 방문부터, 또는 예매 버튼을 누르고 돌아왔을 때만
//  · 같은 방문에 공지 팝업이 한 번이라도 떴으면 띄우지 않는다 (시트가 연달아 뜨지 않게)
const KEY = 'sansa:push-prompt-later'
const todayKst = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10)
const later = () => { try { return localStorage.getItem(KEY) === todayKst() } catch { return false } }

const Row = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-2.5 py-1.5 text-[14px] leading-snug"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-deep" /><span>{children}</span></li>
)

export default function PushPrompt() {
  const { inApp } = useInstall()
  const { msg, show } = useToast()
  const [state, setState] = useState<PushState | null>(null)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [installOpen, setInstallOpen] = useState(false)

  useEffect(() => {
    const visits = countVisit()
    // 카카오톡 등 인앱 브라우저에서는 알림 권한을 받을 수 없어 띄우지 않는다
    if (inApp || later()) return
    let alive = true
    let timer = 0
    let pending: PushState | null = null
    const eligible = () => !popupShownThisSession() && !later() && (visits >= 2 || buyClickedThisSession())
    // 첫 화면이 뜬 뒤, 다른 시트(관리자 팝업·닉네임 설정)가 닫혀 있을 때만 올린다
    const tryOpen = (tries = 0) => {
      if (!alive || !pending || !eligible()) return
      if (document.querySelector('[role="dialog"]')) { if (tries < 60) timer = window.setTimeout(() => tryOpen(tries + 1), 1000); return }
      setOpen(true)
    }
    void getPushState().then((s) => {
      if (!alive || (s !== 'off' && s !== 'ios-install')) return
      pending = s
      setState(s)
      timer = window.setTimeout(() => tryOpen(), 2500)
    })
    // 예매하러 스마트스토어에 갔다가 돌아오면 다시 판단한다
    const onVisible = () => { if (document.visibilityState === 'visible') { window.clearTimeout(timer); timer = window.setTimeout(() => tryOpen(), 1200) } }
    document.addEventListener('visibilitychange', onVisible)
    return () => { alive = false; window.clearTimeout(timer); document.removeEventListener('visibilitychange', onVisible) }
  }, [inApp])

  const close = () => { try { localStorage.setItem(KEY, todayKst()) } catch { /* ignore */ } setOpen(false) }
  const turnOn = async () => {
    if (state === 'ios-install') { setOpen(false); setInstallOpen(true); return }
    setBusy(true)
    const r = await enablePush()
    setBusy(false)
    setOpen(false)
    show(r.ok ? '알림을 켰습니다. 잠시 뒤 테스트 알림이 옵니다' : r.error)
    if (!r.ok) close()
  }

  return (
    <>
      <BottomSheet open={open} onClose={close} title="휴대폰 알림 받기">
        <div className="flex items-center gap-3 rounded-tile bg-mint px-4 py-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-deep"><Icon name="bell" size={22} fill /></span>
          <p className="text-[14.5px] font-bold leading-snug">공지와 예약 안내를<br />휴대폰 상단으로 바로 알려 드려요</p>
        </div>
        <ul className="mt-3">
          <Row>우천·장소 변경 같은 <b>운영 공지</b>를 바로 받아요</Row>
          <Row>예약한 프로그램 <b>시작 10분 전</b>에 알려 드려요</Row>
          <Row>내 사진에 <b>댓글</b>이 달리면 바로 답할 수 있어요</Row>
          <Row>무료이고, 알림 탭에서 언제든 끌 수 있어요</Row>
        </ul>
        {state === 'ios-install' && <p className="mt-2 rounded-xl bg-sun/30 px-3 py-2 text-[12.5px] leading-snug">아이폰은 산사캠프를 <b>홈 화면에 추가</b>한 뒤 그 앱에서 알림을 켤 수 있어요.</p>}
        <button type="button" disabled={busy} onClick={() => void turnOn()} className="btn mt-5 w-full">{busy ? '켜는 중…' : state === 'ios-install' ? '홈 화면에 추가하는 방법' : '알림 켜기'}</button>
        <button type="button" onClick={close} className="mt-2 w-full py-2.5 text-[13.5px] font-semibold text-sub">나중에 할게요</button>
      </BottomSheet>
      <InstallSheet open={installOpen} onClose={() => setInstallOpen(false)} />
      <Toast msg={msg} />
    </>
  )
}
