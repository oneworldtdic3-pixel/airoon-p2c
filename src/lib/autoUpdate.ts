// 새 배포 자동 반영 — 홈 화면 앱이나 오래 열어 둔 탭은 새로고침 전까지 예전 JS 를 계속 쓴다.
// 앱으로 돌아올 때(화면이 다시 보일 때)와 5분마다 index.html 을 새로 받아
// 메인 스크립트 파일명(배포마다 해시가 바뀜)이 다르면 조용히 새로고침한다.
const scriptOf = (html: string) => html.match(/<script[^>]+src="(\/assets\/[^"]+\.js)"/)?.[1] ?? null

export function startAutoUpdate() {
  const current = document.querySelector<HTMLScriptElement>('script[type="module"][src*="/assets/"]')?.getAttribute('src')
  if (!current) return
  let checking = false
  const typing = () => {
    const el = document.activeElement
    return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).isContentEditable)
  }
  const check = async () => {
    if (checking || document.visibilityState !== 'visible' || !navigator.onLine) return
    checking = true
    try {
      const res = await fetch(`/?v=${Date.now()}`, { cache: 'no-store' })
      const next = res.ok ? scriptOf(await res.text()) : null
      if (next && next !== current && !typing()) location.reload()
    } catch { /* 오프라인 등: 다음 기회에 */ } finally { checking = false }
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void check() })
  window.setInterval(check, 5 * 60_000)
}
