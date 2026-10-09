import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../mock/store'

/** 로그인 상태면 실행, 아니면 /login 으로 보내고 돌아올 위치를 기억한다 */
export function useRequireAuth() {
  const { user } = useApp()
  const nav = useNavigate()
  const loc = useLocation()
  return (action: () => void) => {
    if (user) action()
    else nav('/login', { state: { from: loc.pathname + loc.search } })
  }
}
