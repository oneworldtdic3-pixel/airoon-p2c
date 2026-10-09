import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useApp } from '../../data/AppProvider'
import { Segmented, Toast } from '../../components/ui'
import Icon from '../../components/ui/Icon'
import { useToast } from '../../hooks/useToast'
import Dashboard from './Dashboard'
import Publish from './Publish'
import Photos from './Photos'
import Banners from './Banners'

type Tab = 'stats' | 'publish' | 'photos' | 'banners'

export default function Admin() {
  const { ready, user } = useApp()
  const loc = useLocation()
  const [tab, setTab] = useState<Tab>('stats')
  const { msg, show } = useToast()

  if (!ready) return null
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  if (!user.is_admin) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="text-[16px] font-extrabold">관리자만 들어올 수 있습니다</p>
        <p className="text-[13px] text-sub">{user.nickname} 계정에는 권한이 없습니다.</p>
        <Link to="/" className="btn mt-2">홈으로</Link>
      </div>
    )
  }
  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-20 border-b hairline bg-white/95 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+14px)] backdrop-blur">
        <div className="flex items-center justify-between">
          <Link to="/more" aria-label="앱으로" className="-ml-2 p-2"><Icon name="back" /></Link>
          <p className="text-[15px] font-extrabold">관리자</p>
          <span className="w-8" />
        </div>
        <div className="mt-2">
          <Segmented<Tab> value={tab} onChange={setTab} options={[{ value: 'stats', label: '예약 현황' }, { value: 'publish', label: '알림' }, { value: 'photos', label: '사진' }, { value: 'banners', label: '배너' }]} />
        </div>
      </header>
      <div className="px-5 pb-12 pt-5">
        {tab === 'stats' && <Dashboard />}
        {tab === 'publish' && <Publish toast={show} />}
        {tab === 'photos' && <Photos toast={show} />}
        {tab === 'banners' && <Banners toast={show} />}
      </div>
      <Toast msg={msg} />
    </div>
  )
}
