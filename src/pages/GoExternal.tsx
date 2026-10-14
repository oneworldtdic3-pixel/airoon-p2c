import { useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

// 외부 링크 중간 페이지 — 안드로이드는 '사용자가 누른 직후'의 이동에만 앱 선택창(열기: Chrome/삼성/NAVER)을 띄운다.
// 이 페이지가 먼저 뜬 뒤 스크립트가 알아서 넘어가면 선택창 없이 브라우저 안에서 바로 열린다.
const LABEL: Record<string, string> = { 'naver.me': '네이버', 'smartstore.naver.com': '네이버 스마트스토어', 'm.smartstore.naver.com': '네이버 스마트스토어', 'www.instagram.com': '인스타그램', 'instagram.com': '인스타그램', 'www.youtube.com': '유튜브' }

export default function GoExternal() {
  const [sp] = useSearchParams()
  const url = useMemo(() => {
    const u = sp.get('u') ?? ''
    try { const p = new URL(u); return /^https?:$/.test(p.protocol) ? p.toString() : null } catch { return null }
  }, [sp])
  const host = url ? new URL(url).hostname : ''
  useEffect(() => {
    if (!url) return
    const t = window.setTimeout(() => window.location.replace(url), 350)
    return () => window.clearTimeout(t)
  }, [url])
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-white px-8 text-center">
      {url ? (
        <>
          <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-deep" aria-hidden />
          <p className="text-[15px] font-extrabold">{LABEL[host] ?? host}(으)로 이동 중…</p>
          <p className="text-[12.5px] text-sub">자동으로 열리지 않으면 아래 버튼을 눌러 주세요.</p>
          <a href={url} className="btn mt-2 !px-6">바로 열기</a>
          <Link to="/" className="mt-1 text-[13px] font-bold text-sub">산사캠프로 돌아가기</Link>
        </>
      ) : (
        <>
          <p className="text-[15px] font-extrabold">열 수 없는 주소입니다</p>
          <Link to="/" className="btn mt-2">홈으로</Link>
        </>
      )}
    </div>
  )
}
