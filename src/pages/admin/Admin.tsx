import { Link } from 'react-router-dom'
import { useApp } from '../../data/AppProvider'

// 4단계에서 구현: 예약 현황 / 알림 발행 / 부적절 사진 숨김
export default function Admin() {
  const { user } = useApp()
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-8 text-center">
      <h1 className="text-[20px] font-extrabold">관리자</h1>
      <p className="text-[14px] text-sub">{user?.is_admin ? '관리자 페이지는 4단계에서 구현됩니다.' : '접근 권한이 없어요.'}</p>
      <Link to="/" className="btn">홈으로</Link>
    </div>
  )
}
