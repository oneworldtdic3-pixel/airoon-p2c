import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageHeader from '../components/layout/PageHeader'
import Icon from '../components/ui/Icon'
import { Toggle } from '../components/ui'
import { MoktakGlyph } from '../components/illust'
import { useApp } from '../data/AppProvider'
import { timeAgo } from '../lib/format'
import { useRequireAuth } from '../hooks/useRequireAuth'
import { useToast } from '../hooks/useToast'
import { Toast } from '../components/ui'
import InstallSheet from '../components/InstallSheet'
import { useMyNotifications } from '../data/myNotifications'
import { clearAppBadge, disablePush, enablePush, getPushState, testPush, type PushState } from '../lib/push'

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
  const { msg, show } = useToast()
  const navigate = useNavigate()
  const mine = useMyNotifications()
  const [push, setPush] = useState<PushState | null>(null)
  const [busy, setBusy] = useState(false)
  const [installOpen, setInstallOpen] = useState(false)
  useEffect(() => { clearAppBadge(); void getPushState().then(setPush) }, [])
  const togglePush = async (on: boolean) => {
    setBusy(true)
    if (on) {
      const r = await enablePush()
      if (r.ok) show('알림을 켰습니다. 잠시 뒤 테스트 알림이 옵니다')
      else show(r.error)
    } else {
      await disablePush()
      show('이 기기의 알림을 껐습니다')
    }
    setPush(await getPushState())
    setBusy(false)
  }
  const pushSub: Record<PushState, string> = {
    on: '이 기기로 운영 공지, 예약 10분 전 안내, 내 사진 댓글을 보내 드려요.',
    off: '휴대폰 상단에 바로 알림이 떠요. 무료이고, 언제든 끌 수 있어요.',
    denied: '알림이 차단되어 있어요. 휴대폰·브라우저 설정에서 sansacamp.com 알림을 허용해 주세요.',
    'ios-install': '아이폰은 홈 화면에 추가한 산사캠프 앱에서 알림을 켤 수 있어요.',
    unsupported: '이 브라우저는 알림을 지원하지 않아요. Chrome이나 Safari에서 열어 주세요.',
  }
  return (
    <>
      <PageHeader eyebrow="실시간" title="알림" glyph={<MoktakGlyph className="w-12" />} />
      <div className="px-5 pb-6">
        {push && (
          <div className="mb-3 rounded-tile border-2 border-deep/20 bg-white px-4 py-3.5">
            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold">휴대폰 알림 받기</p>
                <p className="mt-0.5 text-[12px] leading-snug text-sub">{pushSub[push]}</p>
              </div>
              {(push === 'on' || push === 'off') && <Toggle on={push === 'on'} label="휴대폰 알림 받기" onChange={(v) => { if (!busy) void togglePush(v) }} />}
              {push === 'ios-install' && <button type="button" onClick={() => setInstallOpen(true)} className="btn-ghost shrink-0 !px-3 !py-2 !text-[12.5px]">추가 방법</button>}
            </div>
            {push === 'on' && (
              <button type="button" disabled={busy} onClick={async () => { setBusy(true); show((await testPush()) ? '테스트 알림을 보냈습니다' : '보내지 못했습니다. 알림을 껐다 다시 켜 주세요'); setBusy(false) }} className="mt-2 text-[12px] font-bold text-deep underline underline-offset-2">테스트 알림 보내기</button>
            )}
          </div>
        )}
        <div className="flex items-center gap-4 rounded-tile bg-mint px-4 py-3.5">
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold">카카오 알림톡으로도 받기</p>
            <p className="mt-0.5 text-[12px] leading-snug text-sub">예약한 프로그램 시작 10분 전 안내와 운영 공지를 카카오톡으로 받습니다. 휴대폰 번호가 연결된 계정만 받을 수 있어요.</p>
          </div>
          <Toggle on={consent} label="카카오 알림톡 수신 동의" onChange={(v) => requireAuth(() => { void setConsent(v) })} />
        </div>
        {mine.items.length > 0 && (
          <section className="mt-5">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="eyebrow text-deep">내 소식 {mine.unread > 0 && <span className="tnum ml-1 rounded-full bg-[#FF3B30] px-1.5 py-0.5 text-[12px] text-white">{mine.unread}</span>}</h2>
              {mine.unread > 0 && <button type="button" onClick={() => void mine.markRead()} className="text-[12px] font-bold text-sub">모두 읽음</button>}
            </div>
            <ul className="divide-y hairline">
              {mine.items.slice(0, 20).map((n) => (
                <li key={n.id}>
                  <button type="button" onClick={() => { void mine.markRead({ ids: [n.id] }); if (n.photo_id) navigate(`/photo?p=${n.photo_id}`) }} className="flex w-full items-start gap-3 py-3 text-left">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-mint text-[12px] font-extrabold text-deep">{(n.actor_nickname || '산')[0]}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] leading-snug"><b>{n.actor_nickname}</b>님이 {n.on_my_photo ? '내 사진에 댓글을 남겼어요' : '함께 댓글 단 사진에 답했어요'}</span>
                      <span className="mt-0.5 block truncate text-[13px] text-sub">“{n.body}”</span>
                      <span className="tnum mt-0.5 block text-[12px] text-gray-500">{timeAgo(n.created_at)} · 눌러서 답글 달기</span>
                    </span>
                    {!n.read_at && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#FF3B30]" aria-label="안 읽음" />}
                  </button>
                </li>
              ))}
            </ul>
            <h2 className="eyebrow mb-1 mt-6">운영 소식</h2>
          </section>
        )}
        <ol className="mt-4">
          {notifications.map((n, i) => (
            <li key={n.id} className="border-t hairline py-4 first:border-t-0">
              <div className="flex items-center gap-2">
                {i === 0 && <span className="h-1.5 w-1.5 rounded-full bg-brand-grad" aria-label="최신" />}
                <span className="text-[12px] font-bold text-deep">{label[n.type]}</span>
                <span className="tnum ml-auto text-[12px] text-gray-500">{timeAgo(n.created_at)}</span>
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
      <InstallSheet open={installOpen} onClose={() => setInstallOpen(false)} />
      <Toast msg={msg} />
    </>
  )
}
