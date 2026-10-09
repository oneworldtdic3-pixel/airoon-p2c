import PageHeader from '../components/layout/PageHeader'
import { Toggle } from '../components/ui'
import Icon from '../components/ui/Icon'
import { useApp } from '../mock/store'
import { timeAgo } from '../lib/format'
import { useRequireAuth } from '../hooks/useRequireAuth'

const meta: Record<string, { icon: string; label: string }> = {
  booth: { icon: 'ticket', label: '부스' },
  luckydraw: { icon: 'fire', label: '럭키드로우' },
  reminder: { icon: 'clock', label: '리마인드' },
  market: { icon: 'pin', label: '장터' },
  notice: { icon: 'sound', label: '공지' },
}

export default function Notifications() {
  const { notifications, consent, setConsent } = useApp()
  const requireAuth = useRequireAuth()
  return (
    <>
      <PageHeader title="알림" sub="행사 소식을 실시간으로 알려드려요" />
      <div className="space-y-5 px-5 pb-4">
        <div className="card flex items-center gap-4 p-4">
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-extrabold">카카오 알림톡 수신 동의</p>
            <p className="mt-0.5 text-[12px] leading-snug text-sub">예약 리마인드·마감 임박 소식을 받아보세요. (발송 연동은 추후 제공)</p>
          </div>
          <Toggle on={consent} label="카카오 알림톡 수신 동의" onChange={(v) => requireAuth(() => setConsent(v))} />
        </div>
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li key={n.id} className="card flex gap-3.5 p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mint text-deep"><Icon name={meta[n.type].icon} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold text-deep">{meta[n.type].label}</span>
                  <span className="text-[11px] text-gray-400">{timeAgo(n.created_at)}</span>
                </div>
                <p className="mt-0.5 text-[15px] font-bold">{n.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-sub">{n.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
