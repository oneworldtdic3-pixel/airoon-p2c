import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Home from './pages/Home'
import Reserve from './pages/Reserve'
import Photo from './pages/Photo'
import Notifications from './pages/Notifications'
import More from './pages/More'
import Login from './pages/Login'
import Admin from './pages/admin/Admin'

export default function App() {
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
