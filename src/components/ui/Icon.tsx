import type { ReactNode } from 'react'

const paths: Record<string, ReactNode> = {
  home: <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" />,
  calendar: <><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></>,
  camera: <><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13" r="3.6" /></>,
  bell: <><path d="M6 17V11a6 6 0 1 1 12 0v6l1.5 2h-15Z" /><path d="M10 21h4" /></>,
  menu: <><circle cx="5.5" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="18.5" cy="12" r="1.4" /></>,
  heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10C19.5 15.4 12 20 12 20Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  back: <path d="m15 5-7 7 7 7" />,
  paw: <><circle cx="7" cy="10" r="1.8" /><circle cx="11" cy="6.5" r="1.8" /><circle cx="15.5" cy="7" r="1.8" /><circle cx="18" cy="11.5" r="1.8" /><path d="M12 12c3 0 5 3 5 5s-2 2-5 1.4C9 19 7 19 7 17s2-5 5-5Z" /></>,
  pin: <><path d="M12 21s7-6 7-11.5A7 7 0 0 0 5 9.5C5 15 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.4" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  shower: <><path d="M4 8a5 5 0 0 1 10 0" /><path d="M2 8h14M6 12v1M9 12v2M12 12v1M6 17v1M9 18v2M12 17v1" /></>,
  car: <><path d="M5 16V12l1.8-4.5A1.5 1.5 0 0 1 8.2 6.5h7.6a1.5 1.5 0 0 1 1.4 1L19 12v4Z" /><path d="M5 12h14M7 19v-3M17 19v-3" /></>,
  map: <><path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2Z" /><path d="M9 4v14M15 6v14" /></>,
  fire: <path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9Z" />,
  ticket: <><path d="M3 9a2 2 0 0 0 0 6v3h18v-3a2 2 0 0 1 0-6V6H3Z" /><path d="M14 6v12" strokeDasharray="2 2" /></>,
  user: <><circle cx="12" cy="8.5" r="3.6" /><path d="M5 20c0-4 3-6 7-6s7 2 7 6" /></>,
  sound: <><path d="M4 10v4h3l5 4V6L7 10Z" /><path d="M16 9a4 4 0 0 1 0 6" /></>,
}

export default function Icon({ name, size = 22, className = '', fill = false }: { name: keyof typeof paths | string; size?: number; className?: string; fill?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[name]}
    </svg>
  )
}
