import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../data/AppProvider'
import { TEST_PHONES } from '../data/constants'
import Icon from '../components/ui/Icon'

export default function Login() {
  const { sendOtp, verifyOtp } = useApp()
  const nav = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'
  const [phone, setPhone] = useState('')
  const [nickname, setNickname] = useState('')
  const [otp, setOtp] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const valid = /^01\d{8,9}$/.test(phone.replace(/\D/g, ''))
  const submit = async () => {
    setErr('')
    setBusy(true)
    const r = sent ? await verifyOtp(phone, otp, nickname) : await sendOtp(phone)
    setBusy(false)
    if (!r.ok) return setErr(r.error)
    if (sent) nav(from, { replace: true })
    else setSent(true)
  }

  return (
    <div className="flex min-h-dvh flex-col px-6 pt-[calc(env(safe-area-inset-top)+12px)]">
      <button onClick={() => nav(-1)} aria-label="뒤로" className="-ml-2 self-start p-2"><Icon name="back" /></button>
      <img src="/wordmark.png" alt="산사캠프" className="mt-10 h-16 w-auto self-start" draggable={false} />
      <h1 className="mt-6 text-[30px] font-extrabold leading-[1.2]">휴대폰 번호로<br />시작합니다</h1>
      <p className="mt-2 text-[14px] text-sub">예약과 사진 올리기에만 필요합니다. 둘러보기는 그냥 하셔도 됩니다.</p>

      <form className="mt-10 flex-1 space-y-5" onSubmit={(e) => { e.preventDefault(); void submit() }}>
        <div>
          <label htmlFor="phone" className="eyebrow mb-2 block">휴대폰 번호</label>
          <input id="phone" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={sent} placeholder="010 0000 0000" className="field tnum text-[20px] font-bold disabled:text-sub" />
        </div>
        {sent && (
          <>
            <div style={{ animation: 'rise .25s' }}>
              <label htmlFor="otp" className="eyebrow mb-2 block">인증번호</label>
              <input id="otp" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} placeholder="6자리" autoFocus className="field tnum text-[24px] font-bold tracking-[0.3em]" />
              {import.meta.env.DEV && <p className="mt-2 text-[12px] text-sub">개발용 테스트 번호 {TEST_PHONES.user.replace('+82', '0')} · 인증번호 <b className="tnum text-deep">{TEST_PHONES.otp}</b></p>}
            </div>
            <div style={{ animation: 'rise .3s' }}>
              <label htmlFor="nick" className="eyebrow mb-2 block">닉네임 <span className="normal-case tracking-normal text-gray-400">처음이면</span></label>
              <input id="nick" value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={12} placeholder="사진에 표시될 이름" className="field" />
            </div>
          </>
        )}
        {err && <p role="alert" className="text-[13px] font-semibold text-red-500">{err}</p>}
        <div className="pt-2">
          <button type="submit" disabled={busy || (sent ? otp.length < 6 : !valid)} className="btn w-full">{busy ? '잠시만요' : sent ? '확인' : '인증번호 받기'}</button>
          {sent && <button type="button" onClick={() => { setSent(false); setOtp('') }} className="mt-2 w-full py-3 text-[13px] font-semibold text-sub">번호 다시 입력</button>}
          {!sent && <button type="button" onClick={() => nav('/')} className="mt-2 w-full py-3 text-[13px] font-semibold text-sub">나중에 하기</button>}
        </div>
      </form>
    </div>
  )
}
