import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

export function LogoMark(props: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <circle cx="10" cy="10" r="10" fill="currentColor" />
      <circle cx="10" cy="6.4" r="2.6" fill="#fff" />
      <circle cx="6.6" cy="12.3" r="2.6" fill="#fff" />
      <circle cx="13.4" cy="12.3" r="2.6" fill="#fff" />
    </svg>
  )
}

export function BellIcon(props: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6 9.5a6 6 0 0 1 12 0c0 4.6 1.4 6.4 2.4 7.3.3.3.1.7-.3.7H3.9c-.4 0-.6-.4-.3-.7C4.6 15.9 6 14.1 6 9.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M9.8 20.6a2.4 2.4 0 0 0 4.4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="18.6" cy="4.6" r="3.2" fill="#ff2d2d" stroke="#f3f4f8" strokeWidth="1.6" />
    </svg>
  )
}

export function CheckCircleIcon(props: IconProps) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <circle cx="8" cy="8" r="6.8" stroke="currentColor" strokeWidth="1.2" />
      <path d="m5.3 8.1 1.8 1.8 3.6-3.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function HomeIcon(props: IconProps) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true" {...props}>
      <path
        d="M3.5 12.4c0-1.2.5-2.3 1.5-3l7-5.6a3.2 3.2 0 0 1 4 0l7 5.6c1 .7 1.5 1.8 1.5 3v9.4a3.7 3.7 0 0 1-3.7 3.7H7.2a3.7 3.7 0 0 1-3.7-3.7v-9.4Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function PrayIcon(props: IconProps) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13.2 24.5V9.6c0-1.6-.4-3.5-1.2-5-.5-.9-1.6-.9-2.1 0-.9 1.7-1.6 4-2 6.2l-1.5 7-2.6 6.7" />
        <path d="M14.8 24.5V9.6c0-1.6.4-3.5 1.2-5 .5-.9 1.6-.9 2.1 0 .9 1.7 1.6 4 2 6.2l1.5 7 2.6 6.7" />
        <path d="M10.5 9.5 9.6 19M17.5 9.5l.9 9.5" />
      </g>
    </svg>
  )
}

export function TempleStayIcon(props: IconProps) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M3.5 23.5 10 11.2a1.2 1.2 0 0 1 2.1 0l6.5 12.3H3.5Z" />
        <path d="M13.6 17.3 16.9 12a1 1 0 0 1 1.7 0l6 11.5H18" />
        <circle cx="21" cy="5.8" r="2.3" />
      </g>
    </svg>
  )
}

export function UserIcon(props: IconProps) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="14" cy="9" r="4.6" />
        <path d="M5.8 24.5c.4-4.6 3.8-7.6 8.2-7.6s7.8 3 8.2 7.6" />
      </g>
    </svg>
  )
}

export function QrScanIcon(props: IconProps) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true" {...props}>
      <g stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 8.5V5a3 3 0 0 1 3-3h3.5M19.5 2H23a3 3 0 0 1 3 3v3.5M26 19.5V23a3 3 0 0 1-3 3h-3.5M8.5 26H5a3 3 0 0 1-3-3v-3.5" />
      </g>
      <g stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
        <path d="M14 9.2c1.6 1.3 2.4 2.9 2.4 4.6 0 1.8-1 3.3-2.4 4.4-1.4-1.1-2.4-2.6-2.4-4.4 0-1.7.8-3.3 2.4-4.6Z" />
        <path d="M11.8 12.3c-1.6-.7-3.2-.6-4.3-.2.1 2.8 2.2 5.6 6.5 6.1" />
        <path d="M16.2 12.3c1.6-.7 3.2-.6 4.3-.2-.1 2.8-2.2 5.6-6.5 6.1" />
      </g>
    </svg>
  )
}
