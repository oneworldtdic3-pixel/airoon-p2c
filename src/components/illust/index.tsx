import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

/* ------------------------------------------------------------------ */
/*  홈 히어로 — 달빛 아래 능선과 산사, 기슭의 텐트와 연등 줄 (오리지널)      */
/* ------------------------------------------------------------------ */
export function HeroScene(p: P) {
  return (
    <svg viewBox="0 0 390 300" preserveAspectRatio="xMidYMax slice" {...p}>
      <defs>
        <radialGradient id="h-moon" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="h-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".34" />
          <stop offset="1" stopColor="#fff" stopOpacity=".06" />
        </linearGradient>
        <linearGradient id="h-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#13BCA8" />
          <stop offset="1" stopColor="#0BAC98" />
        </linearGradient>
        <linearGradient id="h-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#00A68A" />
          <stop offset="1" stopColor="#057D70" />
        </linearGradient>
        <radialGradient id="h-glow" cx=".5" cy=".6" r=".5">
          <stop offset="0" stopColor="#FFD64A" stopOpacity=".7" />
          <stop offset="1" stopColor="#FFD64A" stopOpacity="0" />
        </radialGradient>
        <filter id="h-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      {/* 달과 별 */}
      <circle cx="300" cy="62" r="78" fill="url(#h-moon)" />
      <circle cx="300" cy="62" r="22" fill="#FFD64A" />
      <path d="M292 52a9 9 0 0 1 14 11 7 7 0 0 0-14-11Z" fill="#F2C53D" opacity=".9" />
      <g fill="#fff">
        <circle cx="48" cy="38" r="1.4" /><circle cx="118" cy="22" r="1" /><circle cx="196" cy="48" r="1.2" />
        <circle cx="236" cy="18" r=".9" /><circle cx="356" cy="112" r="1.1" /><circle cx="82" cy="84" r=".9" />
      </g>

      {/* 먼 능선 + 안개 */}
      <path d="M0 158 60 112l48 30 54-46 62 52 46-34 52 40 34-22 34 26v94H0Z" fill="url(#h-far)" />
      <ellipse cx="120" cy="166" rx="120" ry="12" fill="#fff" opacity=".22" />
      <ellipse cx="300" cy="172" rx="110" ry="10" fill="#fff" opacity=".18" />

      {/* 중간 능선 */}
      <path d="M0 212V186l54-40 46 36 58-56 70 62 44-30 58 44 60-38v48Z" fill="url(#h-mid)" />

      {/* 산사 — 능선 위 이층 지붕 */}
      <g transform="translate(228 104)">
        <path d="M0 50h60v6H0Z" fill="#077D70" />
        <path d="M8 36h44v14H8Z" fill="#088F7F" />
        <path d="M-6 38q33-14 72 0l-6-10q-30-9-60 0Z" fill="#066D63" />
        <path d="M14 20h32v10H14Z" fill="#088F7F" />
        <path d="M2 24q28-14 56 0l-5-9q-23-7-46 0Z" fill="#066D63" />
        <path d="M30 4v10" stroke="#066D63" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="30" cy="3" r="2.2" fill="#FFD64A" />
      </g>
      <ellipse cx="200" cy="214" rx="140" ry="9" fill="#fff" opacity=".16" />

      {/* 가까운 능선 */}
      <path d="M0 300V244l72-52 70 48 76-62 64 50 58-34 50 36v70Z" fill="url(#h-near)" />

      {/* 연등 줄 */}
      <path d="M22 196q90 44 180 22t166-30" fill="none" stroke="#FFD64A" strokeWidth="1.2" opacity=".8" />
      {[[52, 211], [104, 222], [158, 224], [214, 219], [268, 208], [322, 198]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r="9" fill="url(#h-glow)" />
          <rect x="-3.5" y="0" width="7" height="9" rx="2.5" fill="#FFD64A" />
          <path d="M-2.5 9h5" stroke="#F2C53D" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      ))}

      {/* 텐트 */}
      <g transform="translate(70 232)">
        <circle cx="30" cy="40" r="34" fill="url(#h-glow)" />
        <path d="M30 0 0 48h60Z" fill="#fff" />
        <path d="M30 0 0 48h30Z" fill="#E6FBF6" />
        <path d="M30 18 20 48h20Z" fill="#FFD64A" />
        <path d="M30 18 25 48h5Z" fill="#F2C53D" />
      </g>
      {/* 작은 나무들 */}
      <g fill="#046E63">
        <path d="M150 262l8-18 8 18Zm3-10 5-12 5 12Z" /><path d="M338 254l7-16 7 16Zm3-9 4-10 4 10Z" /><path d="M20 268l6-14 6 14Z" />
      </g>

      {/* 흰 영역으로 전환 */}
      <path d="M0 300V282q96-30 196-10t194-6v34Z" fill="#fff" />
      <rect width="390" height="300" filter="url(#h-grain)" opacity=".06" style={{ mixBlendMode: 'multiply' }} />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  스팟 장면 — 포토 피드용 목 이미지. 스팟 4종 × 시간대 3종                 */
/* ------------------------------------------------------------------ */
type Palette = { sky: [string, string]; far: string; mid: string; near: string; deep: string; light: string; water: string }
const TIMES: Palette[] = [
  { sky: ['#D4F4EF', '#F6FCFB'], far: '#A5E4DC', mid: '#59D2C4', near: '#1ABCAA', deep: '#088D7F', light: '#FFD64A', water: '#CFEFF8' }, // 낮
  { sky: ['#FFE6B0', '#FFF6E3'], far: '#D9D9A8', mid: '#89CBA3', near: '#3CAB92', deep: '#1A7C6C', light: '#FFB84A', water: '#FFE7C4' }, // 노을
  { sky: ['#0C6C66', '#00D4AC'], far: '#2BA192', mid: '#188275', near: '#0D6057', deep: '#07403B', light: '#FFD64A', water: '#9DE1DA' }, // 밤
]

export type SpotName = '일주문' | '대웅전 계단' | '차밭 능선' | '불일폭포'

export function spotSceneDataUri(spot: SpotName, variant: number): string {
  // 서버 없이 렌더하기 위해 문자열 SVG를 직접 조립한다(목 데이터 전용).
  const c = TIMES[variant % TIMES.length]
  const shift = ((variant * 23) % 30) - 15
  const body = {
    '일주문': `<path d="M-20 232q110-40 200-6t140-2v100H-20Z" fill="${c.near}"/><rect x="84" y="150" width="14" height="110" fill="${c.deep}"/><rect x="202" y="150" width="14" height="110" fill="${c.deep}"/><path d="M50 150q100-28 200 0l-8-14q-92-20-184 0Z" fill="${c.deep}"/><rect x="66" y="150" width="168" height="10" fill="${c.deep}"/><path d="M72 124q78-18 156 0l-6-12q-72-14-144 0Z" fill="${c.deep}"/><rect x="86" y="124" width="128" height="8" fill="${c.deep}"/><rect x="124" y="108" width="52" height="16" rx="2" fill="${c.light}"/><g fill="${c.deep}"><path d="M22 232l16-40 16 40Zm8-24 8-20 8 20Z"/><path d="M250 236l14-34 14 34Z"/></g>`,
    '대웅전 계단': `<path d="M0 300V170l150-34 150 34v130Z" fill="${c.mid}"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${70 + i * 6}" y="${170 + i * 18}" width="${160 - i * 12}" height="10" rx="2" fill="${c.near}" opacity="${1 - i * 0.07}"/>`).join('')}<path d="M96 136h108v22H96Z" fill="${c.deep}"/><path d="M78 140q72-26 144 0l-6-12q-66-18-132 0Z" fill="${c.deep}"/><path d="M110 118h80v10h-80Z" fill="${c.deep}"/><path d="M100 120q50-18 100 0l-5-10q-45-12-90 0Z" fill="${c.deep}"/><rect x="136" y="144" width="28" height="14" rx="2" fill="${c.light}"/>${[0, 1, 2].map((i) => `<rect x="${60 + i * 14}" y="${200 + i * 24}" width="6" height="9" rx="2" fill="${c.light}"/><rect x="${236 - i * 14}" y="${200 + i * 24}" width="6" height="9" rx="2" fill="${c.light}"/>`).join('')}`,
    '차밭 능선': `<path d="M-20 170q90-50 170-20t170-14v40q-90-30-170 12t-170 4Z" fill="${c.far}" opacity=".8"/><path d="M-20 200q110-70 200-20t140 0v140H-20Z" fill="${c.mid}"/><path d="M-20 236q100-60 200-18t140 6v96H-20Z" fill="${c.near}"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M-20 ${242 + i * 11}q100-56 200-16t140 6" fill="none" stroke="${c.deep}" stroke-width="2.5" opacity=".35"/>`).join('')}<g fill="${c.deep}"><path d="M236 206l8-18 8 18Zm3-10 5-12 5 12Z"/><path d="M24 214l6-14 6 14Z"/></g>`,
    '불일폭포': `<path d="M-20 300V110l110-30 20 20-10 200Z" fill="${c.deep}"/><path d="M320 300V100l-110-20-20 24 10 196Z" fill="${c.deep}"/><path d="M-20 300V140l80 10v150Z" fill="${c.near}" opacity=".9"/><path d="M320 300V150l-70 6v144Z" fill="${c.near}" opacity=".9"/><path d="M126 96h50l6 170h-62Z" fill="#fff" opacity=".92"/><path d="M138 96v170M164 100v166" stroke="${c.water}" stroke-width="3" opacity=".8"/><ellipse cx="150" cy="266" rx="90" ry="22" fill="${c.water}"/><ellipse cx="150" cy="262" rx="46" ry="12" fill="#fff" opacity=".8"/><g fill="${c.deep}"><path d="M52 150l10-26 10 26Z"/><path d="M236 146l10-24 10 24Z"/></g>`,
  }[spot]
  const sun = variant % 3 === 2
    ? `<circle cx="${230 + shift}" cy="70" r="16" fill="${c.light}"/>`
    : `<circle cx="${210 + shift}" cy="64" r="22" fill="${c.light}" opacity=".9"/>`
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.sky[0]}"/><stop offset="1" stop-color="${c.sky[1]}"/></linearGradient><filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter></defs><rect width="300" height="300" fill="url(#s)"/>${sun}<g transform="translate(${shift} 0)">${body}</g><rect width="300" height="300" filter="url(#g)" opacity=".07" style="mix-blend-mode:multiply"/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/* ------------------------------------------------------------------ */
/*  소형 글리프 — 페이지 헤더와 빈 상태용                                    */
/* ------------------------------------------------------------------ */
export const LanternGlyph = (p: P) => (
  <svg viewBox="0 0 48 72" {...p}>
    <path d="M24 2v10" stroke="#00A68A" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="15" y="11" width="18" height="5" rx="2.5" fill="#00A68A" />
    <ellipse cx="24" cy="38" rx="17" ry="22" fill="#FFD64A" />
    <path d="M24 16v44M12 24q12 14 0 28M36 24q-12 14 0 28" stroke="#F2C53D" strokeWidth="1.5" fill="none" />
    <rect x="16" y="59" width="16" height="5" rx="2.5" fill="#00A68A" />
    <path d="M24 64v6" stroke="#00A68A" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)
export const MoonGlyph = (p: P) => (
  <svg viewBox="0 0 64 64" {...p}>
    <circle cx="32" cy="32" r="30" fill="#E6FBF6" />
    <circle cx="34" cy="30" r="18" fill="#FFD64A" />
    <path d="M28 22a7 7 0 0 1 10 9 6 6 0 0 0-10-9Z" fill="#F2C53D" />
    <path d="M6 48q26-14 52 0" stroke="#00D4AC" strokeWidth="3" strokeLinecap="round" fill="none" />
  </svg>
)
export const MoktakGlyph = (p: P) => (
  <svg viewBox="0 0 72 64" {...p}>
    <ellipse cx="34" cy="36" rx="28" ry="24" fill="#FFD64A" />
    <path d="M10 42q24 12 48-4" stroke="#F2C53D" strokeWidth="3" fill="none" strokeLinecap="round" />
    <ellipse cx="34" cy="40" rx="8" ry="4.5" fill="#F2C53D" />
    <path d="M56 14 70 4" stroke="#00A68A" strokeWidth="5" strokeLinecap="round" />
  </svg>
)
export const RidgeGlyph = (p: P) => (
  <svg viewBox="0 0 96 48" {...p}>
    <path d="M0 48 26 14l16 18 18-26 22 30 14-14v26Z" fill="#00D4AC" opacity=".45" />
    <path d="M0 48V30l20-18 18 20 22-22 20 24 16-10v24Z" fill="#00A68A" />
    <circle cx="80" cy="10" r="6" fill="#FFD64A" />
  </svg>
)
export const TentGlyph = (p: P) => (
  <svg viewBox="0 0 80 56" {...p}>
    <path d="M40 2 4 52h72Z" fill="#CEF3EE" />
    <path d="M40 2 4 52h36Z" fill="#E6FBF6" />
    <path d="M40 22 28 52h24Z" fill="#00A68A" />
    <path d="M40 2v-2M40 0l10 4-10 3" fill="#FFD64A" stroke="#00A68A" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)
