import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import EventMap from '../components/more/EventMap'
import { Badge, SectionTitle, Toast } from '../components/ui'
import Icon from '../components/ui/Icon'
import { Moktak } from '../components/illust'
import { sponsors } from '../mock/data'
import { useApp } from '../mock/store'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { useToast } from '../hooks/useToast'

const guides = [
  { icon: 'fire', title: '화기 전면 금지 · 취사 없음', body: '라이터·버너·향초 등 불을 쓰는 물품은 반입할 수 없어요. 식사는 공양간과 푸드존에서 해결해요.' },
  { icon: 'ticket', title: 'QR 팔찌 상시 착용', body: '입장과 프로그램 체크인은 QR 팔찌로 진행돼요. 2박 3일 내내 착용해 주세요.' },
  { icon: 'sound', title: '고요의 시간 21시', body: '매일 21시부터는 고요의 시간이에요. 대화는 낮은 목소리로, 소리 나는 기기는 꺼 주세요.' },
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
      <PageHeader title="더보기" sub="행사 안내와 협찬사를 모았어요" />
      <div className="space-y-9 px-5 pb-4">
        <section className="card flex items-center gap-3 p-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-mint text-deep"><Icon name="user" /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-extrabold">{user ? user.nickname : '로그인하고 예약해 보세요'}</p>
            <p className="truncate text-[12px] text-sub">{user ? user.phone : '둘러보기는 로그인 없이 가능해요'}</p>
          </div>
          {user ? (
            <div className="flex gap-2">
              {user.is_admin && <Link to="/admin" className="rounded-full bg-mint px-3.5 py-2 text-[13px] font-bold text-deep">관리자</Link>}
              <button onClick={() => { logout(); show('로그아웃했어요') }} className="rounded-full border border-gray-200 px-3.5 py-2 text-[13px] font-bold text-sub">로그아웃</button>
            </div>
          ) : (
            <button onClick={() => nav('/login', { state: { from: '/more' } })} className="pill-btn !px-4 !py-2.5 !text-[13px]">로그인</button>
          )}
        </section>

        <section id="map" className="scroll-mt-4">
          <SectionTitle sub="약도이며 실제 배치와 다를 수 있어요">행사장 맵</SectionTitle>
          <EventMap />
        </section>

        <section>
          <SectionTitle>협찬사</SectionTitle>
          <div className="space-y-4">
            {(['HOST', 'PARTNER', 'BOOTH'] as const).map((tier) => (
              <div key={tier} className="card p-4">
                <Badge tone={tier === 'HOST' ? 'yellow' : 'green'}>{tier}</Badge>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sponsors[tier].map((n) => <span key={n} className={`rounded-full bg-mint px-3.5 py-2 font-bold text-deep ${tier === 'HOST' ? 'text-[15px]' : 'text-[13px]'}`}>{n}</span>)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden rounded-card bg-sun p-5 shadow-card">
          <Moktak className="absolute -right-2 -top-1 w-24 opacity-50" />
          <p className="relative text-[12px] font-extrabold tracking-widest text-ink/70">LUCKY DRAW</p>
          <h2 className="relative mt-1 text-[20px] font-extrabold text-ink">럭키드로우 응모</h2>
          <p className="relative mt-1 text-[13px] text-ink/75">참가자라면 누구나 1회 응모할 수 있어요.</p>
          <button
            disabled={luckyEntered}
            onClick={() => requireAuth(() => { const r = enterLuckyDraw(); show(r.ok ? '응모가 완료되었어요' : r.error) })}
            className="relative mt-4 rounded-full bg-ink px-6 py-3 text-[15px] font-extrabold text-white transition active:scale-95 disabled:bg-ink/40"
          >
            {luckyEntered ? '응모 완료 ✓' : '응모하기'}
          </button>
        </section>

        <section>
          <SectionTitle>행사 안내</SectionTitle>
          <ul className="space-y-3">
            {guides.map((g) => (
              <li key={g.title} className="card flex gap-3.5 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint text-deep"><Icon name={g.icon} /></span>
                <div>
                  <p className="text-[15px] font-extrabold">{g.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-sub">{g.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <Toast msg={msg} />
    </>
  )
}
