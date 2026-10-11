import { Link } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/ui/Icon'
import { Toggle } from '../components/ui'
import { MoktakGlyph } from '../components/illust'
import { useApp } from '../data/AppProvider'
import { timeAgo } from '../lib/format'
import { useRequireAuth } from '../hooks/useRequireAuth'

const label: Record<string, string> = { booth: '잔여석', luckydraw: '럭키드로우', reminder: '리마인드', market: '산사장터', notice: '안내' }
// 알림 종류별 바로 가기: 프로그램 관련(잔여석·리마인드)은 예약 탭으로, 럭키드로우는 더보기로
const shortcut: Record<string, { to: string; label: string } | undefined> = {
  booth: { to: '/reserve?tab=program', label: '예약하기' },
  reminder: { to: '/reserve?tab=program', label: '내 예약 보기' },
  luckydraw: { to: '/more', label: '응모하기' },
}

export default function Notifications() {
  const { notifications, consent, setConsent } = useApp()
  const requireAuth = useRequireAuth()
  return (
    <>
      <PageHeader eyebrow="실시간" title="알림" glyph={<MoktakGlyph className="w-12" />} />
      <div className="px-5 pb-6">
        <div className="flex items-center gap-4 rounded-tile bg-mint px-4 py-3.5">
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold">카카오 알림톡으로도 받기</p>
            <p className="mt-0.5 text-[12px] leading-snug text-sub">예약한 프로그램 시작 10분 전 안내와 운영 공지를 카카오톡으로 받습니다. 휴대폰 번호가 연결된 계정만 받을 수 있어요.</p>
          </div>
          <Toggle on={consent} label="카카오 알림톡 수신 동의" onChange={(v) => requireAuth(() => { void setConsent(v) })} />
        </div>
        <ol className="mt-4">
          {notifications.map((n, i) => (
            <li key={n.id} className="border-t hairline py-4 first:border-t-0">
              <div className="flex items-center gap-2">
                {i === 0 && <span className="h-1.5 w-1.5 rounded-full bg-brand-grad" aria-label="최신" />}
                <span className="text-[11px] font-bold text-deep">{label[n.type]}</span>
                <span className="tnum ml-auto text-[11px] text-gray-400">{timeAgo(n.created_at)}</span>
              </div>
              <p className="mt-1.5 text-[16px] font-extrabold">{n.title}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-ink/75">{n.body}</p>
              {shortcut[n.type] && (
                <Link to={shortcut[n.type]!.to} className="mt-3 inline-flex items-center gap-1 rounded-full bg-btn-grad px-4 py-2 text-[13px] font-extrabold text-onbrand active:scale-95">
                  {shortcut[n.type]!.label} <Icon name="chevron" size={14} />
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </>
  )
}
