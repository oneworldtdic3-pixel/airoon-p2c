import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp, MOCK_OTP } from '../mock/store'
import { TentGlyph } from '../components/illust'
import Icon from '../components/ui/Icon'

export default function Login() {
  const { login } = useApp()
  const nav = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'
  const [phone, setPhone] = useState('')
  const [nickname, setNickname] = useState('')
  const [otp, setOtp] = useState('')
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')

  const valid = /^01\d{8,9}$/.test(phone.replace(/\D/g, ''))
  const submit = () => {
    if (!sent) { if (valid) { setSent(true); setErr('') } return }
    const r = login(phone, otp, nickname)
    if (r.ok) nav(from, { replace: true })
    else setErr(r.error)
  }

  return (
    <div className="flex min-h-dvh flex-col px-6 pt-[calc(env(safe-area-inset-top)+12px)]">
      <button onClick={() => nav(-1)} aria-label="뒤로" className="-ml-2 self-start p-2"><Icon name="back" /></button>
      <TentGlyph className="mt-8 w-20" />
      <h1 className="mt-6 text-[30px] font-extrabold leading-[1.2]">휴대폰 번호로<br />시작합니다</h1>
      <p className="mt-2 text-[14px] text-sub">예약과 사진 올리기에만 필요합니다. 둘러보기는 그냥 하셔도 됩니다.</p>

      <form className="mt-10 flex-1 space-y-5" onSubmit={(e) => { e.preventDefault(); submit() }}>
        <div>
          <label htmlFor="phone" className="eyebrow mb-2 block">휴대폰 번호</label>
          <input id="phone" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={sent} placeholder="010 0000 0000" className="field tnum text-[20px] font-bold disabled:text-sub" />
        </div>
        {sent && (
          <>
            <div style={{ animation: 'rise .25s' }}>
              <label htmlFor="otp" className="eyebrow mb-2 block">인증번호</label>
              <input id="otp" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} placeholder="6자리" autoFocus className="field tnum text-[24px] font-bold tracking-[0.3em]" />
              <p className="mt-2 text-[12px] text-sub">개발용 고정 인증번호 <b className="tnum text-deep">{MOCK_OTP}</b></p>
            </div>
            <div style={{ animation: 'rise .3s' }}>
              <label htmlFor="nick" className="eyebrow mb-2 block">닉네임 <span className="normal-case tracking-normal text-gray-400">처음이면</span></label>
              <input id="nick" value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={12} placeholder="사진에 표시될 이름" className="field" />
            </div>
          </>
        )}
        {err && <p role="alert" className="text-[13px] font-semibold text-red-500">{err}</p>}
        <div className="pt-2">
          <button type="submit" disabled={sent ? otp.length < 6 : !valid} className="btn w-full">{sent ? '확인' : '인증번호 받기'}</button>
          <button type="button" onClick={() => nav('/')} className="mt-2 w-full py-3 text-[13px] font-semibold text-sub">나중에 하기</button>
        </div>
      </form>
    </div>
  )
}
