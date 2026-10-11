// 산사캠프 서비스워커 — 설치(홈 화면 추가) 요건만 충족. 캐시 없음: 항상 네트워크로 최신 버전을 받는다.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {})
