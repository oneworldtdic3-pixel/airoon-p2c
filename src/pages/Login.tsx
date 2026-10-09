import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../data/AppProvider'
import { TEST_PHONES } from '../data/constants'
import Icon from '../components/ui/Icon'

type Mode = 'login' | 'signup'

function Check({ on, onChange, children, required }: { on: boolean; onChange: (v: boolean) => void; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-1.5">
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${on ? 'border-transparent bg-brand-grad text-white' : 'border-gray-300 bg-white'}`}>
        {on && <Icon name="check" size={13} />}
      </span>
      <span className="text-[13.5px] leading-snug">
        {children}
        {required ? <span className="ml-1 text-red-500">필수</span> : <span className="ml-1 text-gray-400">선택</span>}
      </span>
    </label>
  )
}

export default function Login() {
  const { sendOtp, verifyOtp, signInWithProvider } = useApp()
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'
  const [mode, setMode] = useState<Mode>(sp.get('mode') === 'signup' ? 'signup' : 'login')
  const [phone, setPhone] = useState('')
  const [nickname, setNickname] = useState('')
  const [agree, setAgree] = useState(false)
  const [consent, setConsent] = useState(false)
  const [otp, setOtp] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const validPhone = /^01\d{8,9}$/.test(phone.replace(/\D/g, ''))
  const validNick = nickname.trim().length >= 2 && nickname.trim().length <= 12
  const canSend = mode === 'login' ? validPhone : validPhone && validNick && agree

  const submit = async () => {
    setErr('')
    setBusy(true)
    const r = sent
      ? await verifyOtp(phone, otp, mode === 'signup' ? { nickname, consent } : undefined)
      : await sendOtp(phone)
    setBusy(false)
    if (!r.ok) return setErr(r.error)
    if (sent) nav(from, { replace: true })
    else setSent(true)
  }
  const switchMode = (m: Mode) => { setMode(m); setSent(false); setOtp(''); setErr('') }
  const social = async (provider: 'kakao' | 'google' | 'naver') => {
    setErr('')
    if (provider === 'naver') return setErr('네이버 로그인은 준비 중입니다. 카카오·구글 또는 휴대폰 번호로 가입해 주세요.')
    if (mode === 'signup' && !agree) return setErr('개인정보 수집·이용에 동의해 주세요.')
    const r = await signInWithProvider(provider, { consent: mode === 'signup' ? consent : undefined, returnTo: from })
    if (!r.ok) setErr(r.error)
  }

  return (
    <div className="flex min-h-dvh flex-col px-6 pt-[calc(env(safe-area-inset-top)+12px)]">
      <button onClick={() => nav(-1)} aria-label="뒤로" className="-ml-2 self-start p-2"><Icon name="back" /></button>
      <img src="/wordmark.png" alt="산사캠프" className="mt-8 h-14 w-auto self-start" draggable={false} />

      <div role="tablist" className="mt-8 flex gap-6 border-b hairline">
        {([['login', '로그인'], ['signup', '회원가입']] as const).map(([m, l]) => (
          <button key={m} role="tab" aria-selected={mode === m} onClick={() => switchMode(m)} className={`-mb-px border-b-2 py-3 text-[16px] font-bold transition ${mode === m ? 'border-ink text-ink' : 'border-transparent text-gray-400'}`}>{l}</button>
        ))}
      </div>

      <h1 className="mt-7 whitespace-pre-line text-[26px] font-extrabold leading-[1.25]">
        {sent ? '인증번호를 입력해 주세요' : mode === 'login' ? '휴대폰 번호로\n로그인합니다' : '산사캠프에\n처음 오셨군요'}
      </h1>
      <p className="mt-2 whitespace-pre-line text-[14px] text-sub">
        {sent ? `${phone} 로 보낸 6자리 숫자` : mode === 'login' ? '예약과 사진 올리기에만 필요합니다. 둘러보기는 그냥 하셔도 됩니다.' : '닉네임은 사진과 예약에 표시됩니다. 비밀번호는 없고, 휴대폰 인증으로 들어옵니다.'}
      </p>

      <form className="mt-8 flex-1 space-y-5" onSubmit={(e) => { e.preventDefault(); void submit() }}>
        {!sent && mode === 'signup' && (
          <div>
            <label htmlFor="nick" className="eyebrow mb-2 block">닉네임</label>
            <input id="nick" value={nickname} onChange={(e) => setNickname(e.target.value)} maxLength={12} placeholder="2–12자" autoComplete="nickname" className="field" />
          </div>
        )}
        {!sent && (
          <div>
            <label htmlFor="phone" className="eyebrow mb-2 block">휴대폰 번호</label>
            <input id="phone" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010 0000 0000" className="field tnum text-[20px] font-bold" />
          </div>
        )}
        {!sent && mode === 'signup' && (
          <div className="rounded-tile bg-mint px-4 py-2">
            <Check on={agree} onChange={setAgree} required>개인정보 수집·이용에 동의합니다 (예약·입장 확인 목적, 행사 종료 후 30일 내 파기)</Check>
            <Check on={consent} onChange={setConsent}>카카오 알림톡으로 예약 리마인드를 받겠습니다</Check>
          </div>
        )}
        {sent && (
          <div style={{ animation: 'rise .25s' }}>
            <label htmlFor="otp" className="eyebrow mb-2 block">인증번호</label>
            <input id="otp" inputMode="numeric" autoComplete="one-time-code" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} placeholder="6자리" autoFocus className="field tnum text-[24px] font-bold tracking-[0.3em]" />
            {import.meta.env.DEV && <p className="mt-2 text-[12px] text-sub">개발용 테스트 번호 {TEST_PHONES.user.replace('+82', '0')} · 인증번호 <b className="tnum text-deep">{TEST_PHONES.otp}</b></p>}
          </div>
        )}
        {err && <p role="alert" className="text-[13px] font-semibold text-red-500">{err}</p>}
        <div className="pt-2">
          <button type="submit" disabled={busy || (sent ? otp.length < 6 : !canSend)} className="btn w-full">
            {busy ? '잠시만요' : sent ? (mode === 'signup' ? '가입 완료' : '로그인') : '인증번호 받기'}
          </button>
          {sent ? (
            <button type="button" onClick={() => { setSent(false); setOtp('') }} className="mt-2 w-full py-3 text-[13px] font-semibold text-sub">번호 다시 입력</button>
          ) : (
            <button type="button" onClick={() => nav('/')} className="mt-2 w-full py-3 text-[13px] font-semibold text-sub">나중에 하기</button>
          )}
        </div>
      </form>
      {!sent && (
        <div className="pb-6">
          <div className="flex items-center gap-3 py-2">
            <span className="h-px flex-1 bg-line" /><span className="eyebrow">간편 {mode === 'signup' ? '회원가입' : '로그인'}</span><span className="h-px flex-1 bg-line" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2.5">
            <button type="button" onClick={() => void social('naver')} className="flex items-center justify-center gap-2 rounded-2xl bg-[#03C75A] py-3.5 text-[14px] font-extrabold text-white transition active:scale-[0.97]">
              <span className="text-[15px] font-black leading-none">N</span>네이버
            </button>
            <button type="button" onClick={() => void social('kakao')} className="flex items-center justify-center gap-2 rounded-2xl bg-[#FEE500] py-3.5 text-[14px] font-extrabold text-[#191919] transition active:scale-[0.97]">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="#191919" d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7L5.8 21l4-2.6c.7.1 1.4.2 2.2.2 5.5 0 10-3.6 10-8S17.5 3 12 3Z"/></svg>카카오
            </button>
            <button type="button" onClick={() => void social('google')} className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-white py-3.5 text-[14px] font-extrabold text-ink transition active:scale-[0.97]">
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.8 3-4.4 3-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9l3.3-2.6Z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5L6.4 10C7.2 7.8 9.4 6 12 6Z"/></svg>구글
            </button>
          </div>
        </div>
      )}
      {!sent && (
        <p className="pb-8 text-center text-[13px] text-sub">
          {mode === 'login' ? '처음이신가요? ' : '이미 가입하셨나요? '}
          <button onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')} className="font-bold text-deep underline-offset-2 hover:underline">{mode === 'login' ? '회원가입' : '로그인'}</button>
        </p>
      )}
    </div>
  )
}
