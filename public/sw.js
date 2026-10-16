// 산사캠프 서비스워커 — 설치(홈 화면 추가) 요건 + 앱 푸시 알림. 캐시 없음: 항상 네트워크로 최신 버전을 받는다.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {})

// 푸시 수신 → 알림 표시. badge 는 안드로이드 상단 상태바(시계 옆)에 뜨는 흰색 아이콘
self.addEventListener('push', (e) => {
  let d = {}
  try { d = e.data ? e.data.json() : {} } catch { d = { body: e.data ? e.data.text() : '' } }
  const show = self.registration.showNotification(d.title || '산사캠프', {
    body: d.body || '',
    // icon 은 넣지 않는다 — 홈 화면 앱은 왼쪽에 앱 아이콘이 이미 붙어서, 넣으면 오른쪽에 같은 아이콘이 한 번 더 보인다
    badge: '/badge-96.png',
    tag: d.tag || undefined,
    renotify: !!d.tag,
    lang: 'ko',
    data: { url: d.url || '/notifications' },
  })
  const badge = self.navigator && self.navigator.setAppBadge ? self.navigator.setAppBadge().catch(() => {}) : Promise.resolve()
  e.waitUntil(Promise.all([show, badge]))
})

// 알림을 누르면 열려 있는 앱으로 가서 해당 화면을 띄우고, 없으면 새로 연다
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = new URL((e.notification.data && e.notification.data.url) || '/', self.location.origin).href
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const win = list.find((c) => c.url.startsWith(self.location.origin))
    if (win) {
      await win.focus()
      try { await win.navigate(url) } catch { /* 제어 밖 창이면 이동 생략 */ }
      return
    }
    await self.clients.openWindow(url)
  })())
})
