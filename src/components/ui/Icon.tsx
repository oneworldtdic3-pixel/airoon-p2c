import type { ReactNode } from 'react'

// 1.75 스트로크, 둥근 끝. 탭 아이콘은 활성 시 채움(fill) 버전을 함께 둔다.
const paths: Record<string, { line: ReactNode; fill?: ReactNode }> = {
  home: { line: <path d="M4 11.5 12 4.5l8 7V20h-5.5v-5h-5v5H4Z" />, fill: <path d="M4 11.5 12 4.5l8 7V20h-5.5v-5h-5v5H4Z" fill="currentColor" stroke="none" /> },
  calendar: { line: <><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></>, fill: <><rect x="3.5" y="5" width="17" height="15" rx="3" fill="currentColor" stroke="none" /><path d="M8 3v4M16 3v4" /><path d="M3.5 10h17" stroke="#fff" /></> },
  camera: { line: <><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13" r="3.4" /></>, fill: <><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" fill="currentColor" stroke="none" /><circle cx="12" cy="13" r="3.2" stroke="#fff" /></> },
  bell: { line: <><path d="M6 17v-6a6 6 0 1 1 12 0v6l1.5 2h-15Z" /><path d="M10 21h4" /></>, fill: <><path d="M6 17v-6a6 6 0 1 1 12 0v6l1.5 2h-15Z" fill="currentColor" stroke="none" /><path d="M10 21h4" /></> },
  menu: { line: <><circle cx="5.5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="18.5" cy="12" r="1.3" /></>, fill: <><circle cx="5.5" cy="12" r="1.8" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none" /><circle cx="18.5" cy="12" r="1.8" fill="currentColor" stroke="none" /></> },
  heart: { line: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10C19.5 15.4 12 20 12 20Z" />, fill: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10C19.5 15.4 12 20 12 20Z" fill="currentColor" stroke="none" /> },
  plus: { line: <path d="M12 5v14M5 12h14" /> },
  close: { line: <path d="M6 6l12 12M18 6 6 18" /> },
  check: { line: <path d="m5 12.5 4.5 4.5L19 7.5" /> },
  back: { line: <path d="m15 5-7 7 7 7" /> },
  chevron: { line: <path d="m9 5 7 7-7 7" /> },
  paw: { line: <><circle cx="7" cy="10" r="1.6" /><circle cx="11" cy="6.5" r="1.6" /><circle cx="15.5" cy="7" r="1.6" /><circle cx="18" cy="11.5" r="1.6" /><path d="M12 12c3 0 5 3 5 5s-2 2-5 1.4C9 19 7 19 7 17s2-5 5-5Z" /></> },
  pin: { line: <><path d="M12 21s7-6 7-11.5A7 7 0 0 0 5 9.5C5 15 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.4" /></> },
  clock: { line: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></> },
  user: { line: <><circle cx="12" cy="8.5" r="3.6" /><path d="M5 20c0-4 3-6 7-6s7 2 7 6" /></> },
  // 바로가기 글리프
  lantern: { line: <><path d="M12 3v2M9 5h6" /><path d="M8 9c0-2 2-3 4-3s4 1 4 3v5c0 2-2 3-4 3s-4-1-4-3Z" /><path d="M12 6v11M10 18h4M12 18v3" /></> },
  shower: { line: <><path d="M5 10a7 7 0 0 1 14 0" /><path d="M3 10h18" /><path d="M7 14v1M10 14v2M13 14v1M16 14v2M8 19v1M12 19v2M16 19v1" /></> },
  car: { line: <><path d="M4 16v-4l1.8-4.5A1.5 1.5 0 0 1 7.2 6.5h9.6a1.5 1.5 0 0 1 1.4 1L20 12v4Z" /><path d="M4 12h16M6 19v-3M18 19v-3M8 15h.01M16 15h.01" /></> },
  map: { line: <><path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2Z" /><path d="M9 4v14M15 6v14" /></> },
  fire: { line: <path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9Z" /> },
  ticket: { line: <><path d="M3 9a2 2 0 0 0 0 6v3h18v-3a2 2 0 0 1 0-6V6H3Z" /><path d="M14 6v12" strokeDasharray="2 2.5" /></> },
  sound: { line: <><path d="M4 10v4h3l5 4V6L7 10Z" /><path d="M16 9a4 4 0 0 1 0 6" /></> },
  qr: { line: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M14 14h2v2h-2zM18 14h2M14 18v2M18 18h2v2" /></> },
}

export default function Icon({ name, size = 22, className = '', fill = false }: { name: keyof typeof paths | string; size?: number; className?: string; fill?: boolean }) {
  const d = paths[name]
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {fill && d?.fill ? d.fill : d?.line}
    </svg>
  )
}
