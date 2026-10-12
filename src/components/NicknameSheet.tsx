import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../data/AppProvider'
import { BottomSheet } from './ui'

export const DEFAULT_NICK = '산사러'

/** 닉네임 정하기/바꾸기 시트 */
export function NicknameSheet({ open, onClose, onDone, first }: { open: boolean; onClose: () => void; onDone?: () => void; first?: boolean }) {
  const { user, updateNickname } = useApp()
  const [v, setV] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (open) { setV(user && user.nickname !== DEFAULT_NICK ? user.nickname : ''); setErr('') } }, [open, user])
  const n = v.trim()
  const valid = n.length >= 2 && n.length <= 12 && n !== DEFAULT_NICK
  const save = async () => {
    if (!valid || busy) return
    setBusy(true)
    const r = await updateNickname(n)
    setBusy(false)
    if (!r.ok) return setErr(r.error)
    onDone?.()
    onClose()
  }
  return (
    <BottomSheet open={open} onClose={onClose} title={first ? '닉네임을 정해 주세요' : '닉네임 바꾸기'}>
      <p className="-mt-2 mb-4 text-[13.5px] leading-relaxed text-sub">
        {first ? '사진·댓글·한 줄 글에 표시되는 이름입니다. 다른 캠퍼와 겹치지 않는 이름으로 정해 주세요.' : '다른 캠퍼와 겹치지 않는 2–12자 이름으로 바꿀 수 있습니다.'}
      </p>
      <form onSubmit={(e) => { e.preventDefault(); void save() }}>
        <label htmlFor="nick-edit" className="eyebrow mb-2 block">닉네임</label>
        <input id="nick-edit" value={v} onChange={(e) => { setV(e.target.value); setErr('') }} maxLength={12} placeholder="2–12자" autoComplete="nickname" autoFocus className="field" />
        <p className={`mt-2 min-h-[1.25em] text-[12.5px] ${err ? 'font-bold text-ember' : 'text-sub'}`}>
          {err || (n === DEFAULT_NICK ? `'${DEFAULT_NICK}'는 기본 이름이라 쓸 수 없습니다` : `${n.length}/12`)}
        </p>
        <button type="submit" disabled={!valid || busy} className="btn mt-3 w-full">{busy ? '저장 중…' : '저장'}</button>
        {first && <button type="button" onClick={onClose} className="mt-2 w-full py-2 text-[13px] font-bold text-sub">나중에 하기</button>}
      </form>
    </BottomSheet>
  )
}

/** 로그인했는데 닉네임이 기본값('산사러')이면 한 번 정하게 한다. '나중에'를 누르면 이 기기에서 하루 동안 다시 묻지 않음 */
export function NicknamePrompt() {
  const { ready, user } = useApp()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const key = user ? `sansa:nick-later:${user.id}` : ''
  useEffect(() => {
    if (!ready || !user || user.nickname !== DEFAULT_NICK) return setOpen(false)
    if (pathname === '/login' || pathname.startsWith('/admin')) return
    let later = 0
    try { later = Number(localStorage.getItem(key) ?? 0) } catch { /* ignore */ }
    if (Date.now() - later > 24 * 3600_000) setOpen(true)
  }, [ready, user, pathname, key])
  const close = () => { try { localStorage.setItem(key, String(Date.now())) } catch { /* ignore */ } setOpen(false) }
  return <NicknameSheet open={open} onClose={close} first />
}
