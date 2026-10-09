import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

export const Cloud = (p: P) => (
  <svg viewBox="0 0 120 50" {...p}>
    <path d="M18 46a16 16 0 0 1-1-32 20 20 0 0 1 38-6 18 18 0 0 1 30 8 15 15 0 0 1 18 14 12 12 0 0 1-12 16Z" fill="#fff" />
  </svg>
)

export const Moon = (p: P) => (
  <svg viewBox="0 0 60 60" {...p}>
    <circle cx="30" cy="30" r="24" fill="#FFD64A" />
    <circle cx="40" cy="24" r="20" fill="#43E09A" opacity=".0" />
    <circle cx="22" cy="24" r="3" fill="#F5C21F" /><circle cx="36" cy="38" r="4" fill="#F5C21F" /><circle cx="38" cy="22" r="2" fill="#F5C21F" />
  </svg>
)

export const Lantern = (p: P) => (
  <svg viewBox="0 0 40 80" {...p}>
    <path d="M20 0v14" stroke="#0B9659" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="12" y="12" width="16" height="5" rx="2" fill="#0B9659" />
    <ellipse cx="20" cy="38" rx="15" ry="21" fill="#FFD64A" />
    <path d="M20 17v42M10 24q10 14 0 28M30 24q-10 14 0 28" stroke="#F5A623" strokeWidth="1.6" fill="none" opacity=".7" />
    <rect x="13" y="57" width="14" height="5" rx="2" fill="#0B9659" />
    <path d="M20 62v14M16 76h8" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)

export const Tent = (p: P) => (
  <svg viewBox="0 0 120 90" {...p}>
    <path d="M60 6 6 82h108Z" fill="#fff" />
    <path d="M60 6 6 82h54Z" fill="#E9FAF2" />
    <path d="M60 36 38 82h44Z" fill="#0B9659" />
    <path d="M60 36 49 82h11Z" fill="#0A7E4B" />
    <path d="M60 6v-4M60 2l12 5-12 4" stroke="#0B9659" strokeWidth="2.5" fill="#FFD64A" strokeLinejoin="round" />
  </svg>
)

export const Mountains = (p: P) => (
  <svg viewBox="0 0 300 120" preserveAspectRatio="none" {...p}>
    <path d="M0 120 0 70 60 20 105 62 150 30 215 90 250 60 300 100v20Z" fill="#43E09A" opacity=".55" />
    <path d="M0 120V92L50 54l40 36 55-48 70 56 40-24 45 38v20Z" fill="#0B9659" opacity=".5" />
  </svg>
)

export const Moktak = (p: P) => (
  <svg viewBox="0 0 80 70" {...p}>
    <ellipse cx="38" cy="38" rx="30" ry="26" fill="#FFD64A" />
    <path d="M12 44q26 12 52-4" stroke="#F5A623" strokeWidth="3" fill="none" strokeLinecap="round" />
    <ellipse cx="38" cy="42" rx="8" ry="5" fill="#F5A623" opacity=".55" />
    <path d="M62 14 76 4" stroke="#0B9659" strokeWidth="5" strokeLinecap="round" />
    <circle cx="62" cy="15" r="5" fill="#0B9659" />
  </svg>
)

/** 홈 히어로: 달·산·텐트·연등이 있는 산사 야영 장면 (오리지널) */
export function HeroScene(p: P) {
  return (
    <svg viewBox="0 0 360 220" {...p}>
      <g style={{ animation: 'glow 4s ease-in-out infinite' }}>
        <circle cx="286" cy="52" r="34" fill="#fff" opacity=".22" />
      </g>
      <circle cx="286" cy="52" r="22" fill="#FFD64A" />
      <circle cx="279" cy="46" r="3" fill="#F5C21F" /><circle cx="292" cy="58" r="4" fill="#F5C21F" />
      <path d="M0 220V120l60-52 52 44 58-62 70 80 44-38 76 66v62Z" fill="#43E09A" opacity=".65" />
      <path d="M0 220v-70l46-34 44 40 60-52 86 78 50-36 74 58v36Z" fill="#0FB267" />
      <path d="M-10 220v-30q80-34 150-6t160-8 70 8v36Z" fill="#fff" />
      {/* tent */}
      <g transform="translate(70 120)">
        <path d="M44 0 0 76h88Z" fill="#fff" />
        <path d="M44 0 0 76h44Z" fill="#E9FAF2" />
        <path d="M44 26 28 76h32Z" fill="#0B9659" />
        <path d="M44 0V-8l14 4-14 4" fill="#FFD64A" stroke="#0B9659" strokeWidth="2" strokeLinejoin="round" />
      </g>
      {/* lanterns */}
      <g style={{ animation: 'float-y 5s ease-in-out infinite' }}>
        <g transform="translate(206 70) scale(.62)"><Lantern x={0} y={0} width="40" height="80" /></g>
      </g>
      <g style={{ animation: 'float-y 6s ease-in-out -2s infinite' }}>
        <g transform="translate(248 108) scale(.46)"><Lantern x={0} y={0} width="40" height="80" /></g>
      </g>
      <g fill="#fff" opacity=".9">
        <circle cx="40" cy="40" r="2" /><circle cx="150" cy="30" r="1.6" /><circle cx="330" cy="120" r="1.8" />
      </g>
    </svg>
  )
}

export const Wave = (p: P & { fill?: string }) => (
  <svg viewBox="0 0 430 60" preserveAspectRatio="none" {...p}>
    <path d="M0 60V34c24-16 44-14 66 0s44 16 66 2 46-22 70-8 44 14 66 4 46-20 70-6 44 18 66 6 26-8 26-8v36Z" fill={p.fill ?? '#fff'} />
  </svg>
)
