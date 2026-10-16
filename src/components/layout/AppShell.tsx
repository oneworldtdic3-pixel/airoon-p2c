import { useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../../data/AppProvider'
import { syncPush } from '../../lib/push'
import Icon from '../ui/Icon'
import { NicknamePrompt } from '../NicknameSheet'

const tabs = [
  { to: '/', label: '홈', icon: 'home' },
  { to: '/reserve', label: '예약', icon: 'calendar' },
  { to: '/photo', label: '포토', icon: 'camera' },
  { to: '/notifications', label: '알림', icon: 'bell' },
  { to: '/more', label: '더보기', icon: 'menu' },
]

export default function AppShell() {
  const { pathname } = useLocation()
  const { user } = useApp()
  // 알림을 켠 기기는 로그인 계정이 바뀌면 그 계정에 다시 묶는다 (예약 리마인드 대상)
  useEffect(() => { void syncPush() }, [user?.id])
  const hideTabs = pathname === '/login' || pathname.startsWith('/admin') || pathname === '/privacy' || pathname === '/terms' || pathname.startsWith('/sponsor/') || pathname === '/about' || pathname === '/go'
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] overflow-x-clip bg-white">
      <main className={hideTabs ? '' : 'pb-[calc(76px+env(safe-area-inset-bottom))]'}>
        <Outlet />
      </main>
      <NicknamePrompt />
      {!hideTabs && (
        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[430px] border-t hairline bg-white/92 pb-[env(safe-area-inset-bottom)] backdrop-blur" aria-label="하단 탭">
          <ul className="flex">
            {tabs.map((t) => (
              <li key={t.to} className="flex-1">
                <NavLink to={t.to} end={t.to === '/'} className={({ isActive }) => `flex flex-col items-center gap-1 pb-2 pt-2.5 text-[10.5px] font-bold transition ${isActive ? 'text-deep' : 'text-gray-400'}`}>
                  {({ isActive }) => (<><Icon name={t.icon} size={24} fill={isActive} />{t.label}</>)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
