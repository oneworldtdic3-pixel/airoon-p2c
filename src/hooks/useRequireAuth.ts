import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../data/AppProvider'

/** 로그인 상태면 실행, 아니면 /login 으로 보내고 돌아올 위치를 기억한다 */
export function useRequireAuth() {
  const { ready, user } = useApp()
  const nav = useNavigate()
  const loc = useLocation()
  return (action: () => void) => {
    if (!ready) return // 세션·프로필 확인 중에는 아무것도 하지 않는다
    if (user) action()
    else nav('/login', { state: { from: loc.pathname + loc.search } })
  }
}
