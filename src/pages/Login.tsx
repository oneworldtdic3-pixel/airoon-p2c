import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp, MOCK_OTP } from '../mock/store'
import { Cloud, Wave, Tent } from '../components/illust'
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
    <div className="flex min-h-dvh flex-col">
      <div className="relative overflow-hidden bg-hero-grad px-6 pb-16 pt-[calc(env(safe-area-inset-top)+16px)] text-white">
        <button onClick={() => nav(-1)} aria-label="뒤로" className="-ml-2 p-2"><Icon name="back" /></button>
        <Cloud className="absolute right-6 top-10 w-20 opacity-30" />
        <Tent className="absolute bottom-6 right-8 w-24" />
        <h1 className="mt-4 text-[26px] font-extrabold leading-tight">전화번호로<br />간편하게 시작해요</h1>
        <p className="mt-2 text-[14px] opacity-90">예약과 사진 올리기에만 필요해요</p>
        <Wave className="absolute inset-x-0 -bottom-px h-10 w-full" />
      </div>
      <form className="flex-1 space-y-4 px-6 pb-10" onSubmit={(e) => { e.preventDefault(); submit() }}>
        <div>
          <label htmlFor="phone" className="mb-2 block text-[14px] font-extrabold">휴대폰 번호</label>
          <input id="phone" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={sent} placeholder="010-0000-0000" className="w-full rounded-2xl border-2 border-transparent bg-mint px-4 py-3.5 font-semibold outline-none focus:border-brand disabled:opacity-60" />
        </div>
        {sent && (
          <>
            <div>
              <label htmlFor="nick" className="mb-2 block text-[14px] font-extrabold">닉네임 <span className="font-medium text-sub">(처음이라면)</span></label>
              <input id="nick" value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={12} placeholder="예) 고요한토끼" className="w-full rounded-2xl border-2 border-transparent bg-mint px-4 py-3.5 font-semibold outline-none focus:border-brand" />
            </div>
            <div>
              <label htmlFor="otp" className="mb-2 block text-[14px] font-extrabold">인증번호</label>
              <input id="otp" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} placeholder="6자리" className="w-full rounded-2xl border-2 border-transparent bg-mint px-4 py-3.5 font-semibold tracking-[0.4em] outline-none focus:border-brand" />
              <p className="mt-2 text-[12px] text-sub">개발 단계: 테스트 인증번호 <b className="text-deep">{MOCK_OTP}</b></p>
            </div>
          </>
        )}
        {err && <p role="alert" className="text-[13px] font-semibold text-red-500">{err}</p>}
        <button type="submit" disabled={sent ? otp.length < 6 : !valid} className="pill-btn w-full">{sent ? '확인하고 시작하기' : '인증번호 받기'}</button>
        <button type="button" onClick={() => nav(from === '/login' ? '/' : -1 as never)} className="w-full py-2 text-[13px] font-semibold text-sub">나중에 할게요 (둘러보기)</button>
      </form>
    </div>
  )
}
