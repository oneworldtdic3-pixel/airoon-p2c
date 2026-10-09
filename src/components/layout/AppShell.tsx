import { NavLink, Outlet, useLocation } from 'react-router-dom'
import Icon from '../ui/Icon'

const tabs = [
  { to: '/', label: '홈', icon: 'home' },
  { to: '/reserve', label: '예약', icon: 'calendar' },
  { to: '/photo', label: '포토', icon: 'camera' },
  { to: '/notifications', label: '알림', icon: 'bell' },
  { to: '/more', label: '더보기', icon: 'menu' },
]

export default function AppShell() {
  const { pathname } = useLocation()
  const hideTabs = pathname === '/login' || pathname.startsWith('/admin')
  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-white shadow-[0_0_60px_rgba(11,150,89,0.15)]">
      <main className={hideTabs ? '' : 'pb-[calc(84px+env(safe-area-inset-bottom))]'}>
        <Outlet />
      </main>
      {!hideTabs && (
        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[430px] rounded-t-[26px] bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_28px_-10px_rgba(11,150,89,0.25)] backdrop-blur" aria-label="하단 탭">
          <ul className="flex">
            {tabs.map((t) => (
              <li key={t.to} className="flex-1">
                <NavLink to={t.to} end={t.to === '/'} className={({ isActive }) => `flex flex-col items-center gap-1 pb-2 pt-3 text-[11px] font-bold transition ${isActive ? 'text-deep' : 'text-gray-400'}`}>
                  {({ isActive }) => (
                    <>
                      <span className={`flex h-8 w-12 items-center justify-center rounded-full transition ${isActive ? 'bg-mint' : ''}`}><Icon name={t.icon} /></span>
                      {t.label}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
