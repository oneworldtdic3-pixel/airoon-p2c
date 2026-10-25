import { useState } from 'react'
import Icon from '../ui/Icon'
import InstallSheet from '../InstallSheet'
import { useInstall } from '../../hooks/useInstall'

const KEY = 'sansa:install-dismissed'
const dismissed = () => { try { return localStorage.getItem(KEY) === '1' } catch { return false } }

/** 홈 상단의 "홈 화면에 추가" 띠. 설치돼 있거나 닫은 적 있으면 숨긴다. */
export default function InstallStrip() {
  const { installed } = useInstall()
  const [hidden, setHidden] = useState(dismissed)
  const [open, setOpen] = useState(false)
  if (installed || hidden) return null
  const close = () => { setHidden(true); try { localStorage.setItem(KEY, '1') } catch { /* ignore */ } }
  return (
    <>
      <div className="mx-5 flex items-center gap-3 rounded-tile bg-mint py-3 pl-4 pr-2">
        <button type="button" onClick={() => setOpen(true)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <img src="/icon-192.png" alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-[10px]" />
          <span className="min-w-0">
            <span className="block text-[14.5px] font-extrabold">홈 화면에 추가하기</span>
            <span className="block truncate text-[12.5px] text-sub">앱처럼 한 번에 열고, 현장에서 QR 팔찌를 바로 꺼내요</span>
          </span>
          <Icon name="chevron" size={18} className="shrink-0 text-deep" />
        </button>
        <button type="button" onClick={close} aria-label="닫기" className="-m-1.5 flex h-11 w-11 items-center justify-center text-sub"><Icon name="close" size={18} /></button>
      </div>
      <InstallSheet open={open} onClose={() => setOpen(false)} />
    </>
  )
}
