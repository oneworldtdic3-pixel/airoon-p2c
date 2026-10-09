import type { SpotTag } from './types'

// 목 사진용 오리지널 플랫 풍경 SVG (data URI)
const SCENES: Record<SpotTag, { sky: [string, string]; hill: string; hill2: string; accent: string }> = {
  '일주문': { sky: ['#9BEFC6', '#E9FAF2'], hill: '#1EC97E', hill2: '#0B9659', accent: '#FFD64A' },
  '대웅전 계단': { sky: ['#FFE9A8', '#FFF8DC'], hill: '#43E09A', hill2: '#0FB267', accent: '#FF9F6B' },
  '차밭 능선': { sky: ['#B9F3D6', '#F1FFF8'], hill: '#0FB267', hill2: '#0B9659', accent: '#FFFFFF' },
  '불일폭포': { sky: ['#8FD9F0', '#E6FAFF'], hill: '#0B9659', hill2: '#066B40', accent: '#FFFFFF' },
}

export function sceneArt(spot: SpotTag, seed = 0): string {
  const s = SCENES[spot]
  const off = (seed * 37) % 60
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'>
<defs><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='${s.sky[0]}'/><stop offset='1' stop-color='${s.sky[1]}'/></linearGradient></defs>
<rect width='300' height='300' fill='url(#g)'/>
<circle cx='${70 + off * 2}' cy='${70 + (seed % 3) * 14}' r='26' fill='${s.accent}'/>
<path d='M-10 230 L${80 + off} 120 L${150 + off} 200 L${210} 140 L330 240 L330 310 L-10 310Z' fill='${s.hill}'/>
<path d='M-10 260 Q80 200 160 245 T330 235 L330 310 L-10 310Z' fill='${s.hill2}'/>
<g fill='#fff' opacity='.9'><ellipse cx='${200 - off}' cy='55' rx='34' ry='10'/><ellipse cx='${224 - off}' cy='47' rx='20' ry='10'/></g>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
