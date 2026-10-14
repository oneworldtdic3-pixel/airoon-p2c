import { useEffect, useState } from 'react'
import { useCooldown } from '../hooks/useCooldown'
import { useInstall } from '../hooks/useInstall'
import InstallSheet from '../components/InstallSheet'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import EventMap from '../components/more/EventMap'
import { BottomSheet, SectionTitle, Toast } from '../components/ui'
import SocialLinks from '../components/ui/SocialLinks'
import PressNews from '../components/more/PressNews'
import { RidgeGlyph, MoktakGlyph } from '../components/illust'
import { SPONSOR_TIERS } from '../data/constants'
import { useApp } from '../data/AppProvider'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { useToast } from '../hooks/useToast'
import { fmtPhone } from '../lib/format'
import { toMessage } from '../data/errors'
import { DEFAULT_NICK, NicknameSheet } from '../components/NicknameSheet'

const guides = [
  ['화기 전면 금지, 취사 없음', '라이터·버너·향초처럼 불을 쓰는 물품은 가져올 수 없습니다. 식사는 공양간과 산사장터에서.'],
  ['QR 팔찌는 2박 3일 내내', '입장과 프로그램 체크인 모두 팔찌로 합니다. 끊어지면 안내 부스에서 재발급.'],
  ['21시부터 고요의 시간', '대화는 낮은 목소리로, 소리 나는 기기는 꺼 둡니다. 가장 조용한 페스티벌의 약속.'],
  ['주차 무료 · 사전등록제(1팀 1대)', '미등록 차량은 주차장에 진입할 수 없습니다. 예약 탭 주차장에서 차량번호와 이용 일자를 미리 등록해 주세요.'],
]

export default function More() {
  const { hash } = useLocation()
  const nav = useNavigate()
  const { user, logout, luckyEntered, enterLuckyDraw, identities, linkProvider, signInWithNaver, startPhoneLink, verifyPhoneLink } = useApp()
  const [sp, setSp] = useSearchParams()
  const [phoneSheet, setPhoneSheet] = useState(false)
  const [lp, setLp] = useState({ phone: '', otp: '', sent: false, busy: false })
  const lpCooldown = useCooldown(60)
  const [installSheet, setInstallSheet] = useState(false)
  const [nickOpen, setNickOpen] = useState(false)
  const { installed } = useInstall()
  const requireAuth = useRequireAuth()
  const { msg, show } = useToast()

  useEffect(() => {
    if (hash === '#map') document.getElementById('map')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])
  // 연결 복귀 알림 (?linked=kakao / ?naver=linked|already_linked)
  useEffect(() => {
    const linked = sp.get('linked'); const naver = sp.get('naver')
    const errCode = sp.get('error_code') || sp.get('error')
    if (!linked && !naver && !errCode) return
    if (errCode) show(toMessage(sp.get('error_description') || errCode))
    else if (linked) show(`${linked === 'kakao' ? '카카오' : '구글'} 계정을 연결했습니다`)
    if (naver === 'linked') show('네이버 계정을 연결했습니다')
    if (naver === 'already_linked') show('그 네이버 계정은 이미 다른 계정에 연결되어 있습니다')
    setSp({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const linkRows = user ? [
    { key: 'phone', name: '휴대폰', on: !!identities.phone, sub: identities.phone ? fmtPhone(identities.phone) : '예약 알림과 본인 확인에 사용', act: () => setPhoneSheet(true) },
    { key: 'kakao', name: '카카오', on: identities.providers.includes('kakao'), act: async () => { const r = await linkProvider('kakao', '/more'); if (!r.ok) show(r.error) } },
    { key: 'google', name: '구글', on: identities.providers.includes('google'), act: async () => { const r = await linkProvider('google', '/more'); if (!r.ok) show(r.error) } },
    { key: 'naver', name: '네이버', on: identities.naver, act: async () => { const r = await signInWithNaver({ link: true, returnTo: '/more' }); if (!r.ok) show(r.error) } },
  ] : []
  const phoneLink = async () => {
    setLp((x) => ({ ...x, busy: true }))
    const r = lp.sent ? await verifyPhoneLink(lp.phone, lp.otp) : await startPhoneLink(lp.phone)
    setLp((x) => ({ ...x, busy: false, sent: x.sent || r.ok }))
    if (!r.ok) return show(r.error)
    if (lp.sent) { setPhoneSheet(false); setLp({ phone: '', otp: '', sent: false, busy: false }); lpCooldown.reset(); show('휴대폰 번호를 연결했습니다') }
    else lpCooldown.start()
  }
  const phoneResend = async () => {
    if (!lpCooldown.ready || lp.busy) return
    setLp((x) => ({ ...x, busy: true }))
    const r = await startPhoneLink(lp.phone)
    setLp((x) => ({ ...x, busy: false, otp: r.ok ? '' : x.otp }))
    if (!r.ok) return show(r.error)
    lpCooldown.start()
  }

  return (
    <>
      <PageHeader eyebrow="안내" title="더보기" glyph={<RidgeGlyph className="w-16" />} />
      <div className="px-5 pb-6">
        <section className="flex items-center justify-between border-y hairline py-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[16px] font-extrabold">
              <span className="truncate">{user ? user.nickname : '로그인 전'}</span>
              {user && <button type="button" onClick={() => setNickOpen(true)} className="shrink-0 rounded-full border border-line px-2 py-0.5 text-[11.5px] font-bold text-deep active:scale-95">{user.nickname === DEFAULT_NICK ? '닉네임 정하기' : '바꾸기'}</button>}
            </p>
            <p className="tnum truncate text-[12.5px] text-sub">{user ? (user.phone ? fmtPhone(user.phone) : '소셜 계정') : '예약할 때만 인증하면 됩니다'}</p>
          </div>
          {user ? (
            <div className="flex gap-2">
              {user.is_admin && <Link to="/admin" className="btn-ghost">관리자</Link>}
              <button onClick={async () => { await logout(); show('로그아웃했습니다') }} className="btn-ghost text-sub">로그아웃</button>
            </div>
          ) : (
            <div className="flex shrink-0 gap-2 whitespace-nowrap">
              <button onClick={() => nav('/login?mode=signup', { state: { from: '/more' } })} className="btn-ghost !px-3.5 !text-[13px]">회원가입</button>
              <button onClick={() => nav('/login', { state: { from: '/more' } })} className="btn !px-4 !py-2.5 !text-[13px]">로그인</button>
            </div>
          )}
        </section>

        {user && (
          <section className="pt-8">
            <SectionTitle eyebrow="Account">계정 연결</SectionTitle>
            <p className="-mt-2 mb-3 text-[13px] text-sub">어떤 방법으로 들어와도 같은 예약·사진을 보려면 여기서 연결하세요. 연결은 본인 확인 후에만 됩니다.</p>
            <ul className="divide-y hairline border-y">
              {linkRows.map((r) => (
                <li key={r.key} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold">{r.name}</p>
                    {r.sub && <p className="tnum truncate text-[12px] text-sub">{r.sub}</p>}
                  </div>
                  {r.on ? <span className="text-[12px] font-bold text-deep">연결됨</span> : <button type="button" onClick={() => void r.act()} className="btn-ghost !py-2 !text-[13px]">연결</button>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="pt-8">
          <SectionTitle eyebrow="App">홈 화면에 추가</SectionTitle>
          <div className="flex items-center gap-3 border-y hairline py-3">
            <img src="/icon-192.png" alt="" width={40} height={40} className="h-10 w-10 rounded-[11px]" />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-bold">산사캠프 앱으로 열기</p>
              <p className="text-[12px] text-sub">{installed ? '홈 화면에서 실행 중입니다' : '아이콘 하나로 예약·QR 팔찌를 바로 꺼내요'}</p>
            </div>
            {installed ? <span className="text-[12px] font-bold text-deep">추가됨</span> : <button type="button" onClick={() => setInstallSheet(true)} className="btn-ghost !py-2 !text-[13px]">추가</button>}
          </div>
        </section>

        <section className="pt-8">
          <SectionTitle eyebrow="Follow">산사캠프 소식</SectionTitle>
          <p className="-mt-2 mb-4 text-[13px] text-sub">라인업과 현장 소식은 SNS에 먼저 올라오고, 언론 보도는 아래에 모아 둡니다.</p>
          <SocialLinks />
          <PressNews />
        </section>

        <section id="map" className="scroll-mt-4 pt-10">
          <SectionTitle eyebrow="Map">행사장 약도</SectionTitle>
          <EventMap />
        </section>

        <section className="relative mt-10 overflow-hidden rounded-tile bg-sun p-5">
          <MoktakGlyph className="absolute -right-3 -bottom-3 w-28 opacity-60" />
          <p className="eyebrow text-ink/60">Lucky draw</p>
          <h2 className="mt-1 text-[22px] font-extrabold">럭키드로우</h2>
          <p className="mt-1 max-w-[70%] text-[13.5px] leading-relaxed text-ink/75">참가자 1인 1회. 마지막 날 아침 메인무대에서 추첨합니다.</p>
          <button
            disabled={luckyEntered}
            onClick={() => requireAuth(async () => { const r = await enterLuckyDraw(); show(r.ok ? '응모했습니다' : r.error) })}
            className="relative mt-5 rounded-full bg-ink px-6 py-3 text-[15px] font-bold text-white transition active:scale-95 disabled:bg-ink/35"
          >
            {luckyEntered ? '응모 완료' : '응모하기'}
          </button>
        </section>

        <section className="pt-12">
          <SectionTitle eyebrow="Rules">세 가지 약속</SectionTitle>
          <ol>
            {guides.map(([t, b], i) => (
              <li key={t} className="flex gap-4 border-t hairline py-5 first:border-t-0">
                <span className="tnum text-[22px] font-extrabold leading-none text-deep">0{i + 1}</span>
                <div>
                  <p className="text-[16px] font-extrabold">{t}</p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink/75">{b}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="pt-10">
          <SectionTitle eyebrow="Sponsors">함께하는 곳</SectionTitle>
          <dl className="space-y-4 border-t hairline pt-5">
            {SPONSOR_TIERS.map(({ tier, items }) => (
              <div key={tier} className="flex items-center gap-4">
                <dt className="eyebrow w-14 shrink-0 whitespace-pre-line leading-[1.35]">{tier}</dt>
                <dd className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  {items.map((it) =>
                    it.src ? <img key={it.name} src={it.src} alt={it.name} style={{ height: it.h ?? 22 }} className="w-auto" loading="lazy" />
                           : <span key={it.name} className="text-[13px] font-bold text-ink">{it.name}</span>,
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>
        <p className="mt-10 flex gap-4 text-[12px] text-gray-400">
          <Link to="/privacy" className="underline underline-offset-2">개인정보처리방침</Link>
          <Link to="/terms" className="underline underline-offset-2">이용약관</Link>
        </p>
      </div>
      <BottomSheet open={phoneSheet} onClose={() => setPhoneSheet(false)} title="휴대폰 번호 연결">
        <p className="text-[13px] text-sub">번호로 받은 인증번호를 확인해야 연결됩니다. 다른 계정에서 이미 쓰는 번호는 연결할 수 없습니다.</p>
        <form className="mt-5 space-y-4" onSubmit={(e) => { e.preventDefault(); void phoneLink() }}>
          <div>
            <label htmlFor="lp-phone" className="eyebrow mb-2 block">휴대폰 번호</label>
            <input id="lp-phone" inputMode="tel" value={lp.phone} onChange={(e) => setLp((x) => ({ ...x, phone: e.target.value }))} disabled={lp.sent} placeholder="010 0000 0000" className="field tnum text-[18px] font-bold disabled:text-sub" />
          </div>
          {lp.sent && (
            <div>
              <label htmlFor="lp-otp" className="eyebrow mb-2 block">인증번호</label>
              <input id="lp-otp" inputMode="numeric" value={lp.otp} onChange={(e) => setLp((x) => ({ ...x, otp: e.target.value }))} maxLength={6} placeholder="6자리" autoFocus className="field tnum text-[22px] font-bold tracking-[0.3em]" />
            </div>
          )}
          <button type="submit" disabled={lp.busy || (lp.sent ? lp.otp.length < 6 : !/^01\d{8,9}$/.test(lp.phone.replace(/\D/g, '')))} className="btn w-full">{lp.busy ? '잠시만요' : lp.sent ? '연결하기' : '인증번호 받기'}</button>
          {lp.sent && (
            <div className="flex">
              <button type="button" onClick={() => { setLp((x) => ({ ...x, sent: false, otp: '' })); lpCooldown.reset() }} className="flex-1 py-2 text-[13px] font-semibold text-sub">번호 다시 입력</button>
              <button type="button" onClick={() => void phoneResend()} disabled={!lpCooldown.ready || lp.busy} className="flex-1 py-2 text-[13px] font-semibold text-deep disabled:text-sub">
                {lpCooldown.ready ? '인증번호 다시 받기' : <>다시 받기 <span className="tnum">{lpCooldown.left}</span>초 후</>}
              </button>
            </div>
          )}
        </form>
      </BottomSheet>
      <InstallSheet open={installSheet} onClose={() => setInstallSheet(false)} />
      <NicknameSheet open={nickOpen} onClose={() => setNickOpen(false)} onDone={() => show('닉네임을 바꿨습니다')} />
      <Toast msg={msg} />
    </>
  )
}
