import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { AppProvider } from './data/AppProvider'
import './styles/index.css'
import { startAutoUpdate } from './lib/autoUpdate'

// 홈 화면 추가(설치) 요건용 최소 서비스워커. 캐시는 하지 않는다(배포 즉시 반영).
if (import.meta.env.PROD && 'serviceWorker' in navigator) window.addEventListener('load', () => { void navigator.serviceWorker.register('/sw.js') })
// 새 배포가 나오면 앱으로 돌아올 때 자동으로 최신 버전으로 바꾼다
if (import.meta.env.PROD) startAutoUpdate()

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
