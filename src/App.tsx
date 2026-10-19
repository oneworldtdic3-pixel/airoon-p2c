import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { naverPageView } from './lib/naverWcs'
import SponsorBuddhz from './pages/SponsorBuddhz'
import About from './pages/About'
import GoExternal from './pages/GoExternal'
import AppShell from './components/layout/AppShell'
import Home from './pages/Home'
import Reserve from './pages/Reserve'
import Photo from './pages/Photo'
import Notifications from './pages/Notifications'
import More from './pages/More'
import Login from './pages/Login'
import Admin from './pages/admin/Admin'
import { Privacy, Terms } from './pages/legal/Legal'

export default function App() {
  // 네이버 전환추적 PV: 첫 페이지는 index.html 공통 스크립트가 보내고, 이후 라우트 이동마다 보낸다
  const { pathname } = useLocation()
  const firstPv = useRef(true)
  useEffect(() => {
    if (firstPv.current) { firstPv.current = false; return }
    naverPageView()
  }, [pathname])

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route path="reserve" element={<Reserve />} />
        <Route path="photo" element={<Photo />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="more" element={<More />} />
        <Route path="login" element={<Login />} />
        <Route path="admin" element={<Admin />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="sponsor/buddhz" element={<SponsorBuddhz />} />
        <Route path="about" element={<About />} />
        <Route path="go" element={<GoExternal />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
