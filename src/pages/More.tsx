import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import EventMap from '../components/more/EventMap'
import { SectionTitle, Toast } from '../components/ui'
import { RidgeGlyph, MoktakGlyph } from '../components/illust'
import { sponsors } from '../mock/data'
import { useApp } from '../mock/store'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { useToast } from '../hooks/useToast'

const guides = [
  ['화기 전면 금지, 취사 없음', '라이터·버너·향초처럼 불을 쓰는 물품은 가져올 수 없습니다. 식사는 공양간과 산사장터에서.'],
  ['QR 팔찌는 2박 3일 내내', '입장과 프로그램 체크인 모두 팔찌로 합니다. 끊어지면 안내 부스에서 재발급.'],
  ['21시부터 고요의 시간', '대화는 낮은 목소리로, 소리 나는 기기는 꺼 둡니다. 가장 조용한 페스티벌의 약속.'],
]

export default function More() {
  const { hash } = useLocation()
  const nav = useNavigate()
  const { user, logout, luckyEntered, enterLuckyDraw } = useApp()
  const requireAuth = useRequireAuth()
  const { msg, show } = useToast()

  useEffect(() => {
    if (hash === '#map') document.getElementById('map')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  return (
    <>
      <PageHeader eyebrow="안내" title="더보기" glyph={<RidgeGlyph className="w-16" />} />
      <div className="px-5 pb-6">
        <section className="flex items-center justify-between border-y hairline py-4">
          <div className="min-w-0">
            <p className="text-[16px] font-extrabold">{user ? user.nickname : '로그인 전'}</p>
            <p className="tnum truncate text-[12.5px] text-sub">{user ? user.phone : '둘러보기는 로그인 없이, 예약할 때만 번호 인증'}</p>
          </div>
          {user ? (
            <div className="flex gap-2">
              {user.is_admin && <Link to="/admin" className="btn-ghost">관리자</Link>}
              <button onClick={() => { logout(); show('로그아웃했습니다') }} className="btn-ghost text-sub">로그아웃</button>
            </div>
          ) : (
            <button onClick={() => nav('/login', { state: { from: '/more' } })} className="btn !py-2.5 !text-[14px]">로그인</button>
          )}
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
            onClick={() => requireAuth(() => { const r = enterLuckyDraw(); show(r.ok ? '응모했습니다' : r.error) })}
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
          <dl className="space-y-4 text-[14px]">
            {(['HOST', 'PARTNER', 'BOOTH'] as const).map((tier) => (
              <div key={tier} className="grid grid-cols-[72px_1fr] gap-3 border-t hairline pt-4">
                <dt className="eyebrow pt-1">{tier}</dt>
                <dd className={`leading-relaxed ${tier === 'HOST' ? 'text-[17px] font-extrabold' : tier === 'PARTNER' ? 'font-bold' : 'text-sub'}`}>{sponsors[tier].join(' · ')}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <Toast msg={msg} />
    </>
  )
}
