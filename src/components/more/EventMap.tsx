// 행사장 약도 — 실측 아님. 배치 확정 시 좌표만 교체.
const legend = [
  ['#A7E3C7', '캠핑존 4인'], ['#1EC97E', '캠핑존 6인'], ['#FFD64A', '체험부스존'], ['#0B9659', '메인무대'],
  ['#BFE9F2', '샤워동'], ['#FFD0B5', '산사장터'], ['#D1D5DB', '주차장'], ['#fff', '일주문 · 쌍계사'],
]

const Block = ({ x, y, w, h, fill, label, sub, dark }: { x: number; y: number; w: number; h: number; fill: string; label: string; sub?: string; dark?: boolean }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx="10" fill={fill} stroke={fill === '#fff' ? '#0B9659' : 'none'} strokeWidth="1.5" />
    <text x={x + 10} y={y + 18} fontSize="11" fontWeight="700" fill={dark ? '#1F2937' : '#fff'}>{label}</text>
    {sub && <text x={x + 10} y={y + 32} fontSize="10" fill={dark ? '#6B7280' : '#ffffffcc'}>{sub}</text>}
  </g>
)

export default function EventMap() {
  return (
    <div>
      <svg viewBox="0 0 360 380" role="img" aria-label="행사장 약도" className="w-full rounded-tile border border-line bg-white">
        <path d="M0 300 Q90 270 180 290 T360 280 V380 H0Z" fill="#E9FAF2" />
        <path d="M184 380V290q0-30-30-50T124 190V88" fill="none" stroke="#E6EFE9" strokeWidth="12" strokeLinecap="round" />
        <path d="M184 300H296M124 190h130M124 130h170" fill="none" stroke="#E6EFE9" strokeWidth="8" strokeLinecap="round" />
        <Block x={80} y={16} w={88} h={44} fill="#fff" label="쌍계사" sub="대웅전 · 경내" dark />
        <Block x={96} y={74} w={56} h={26} fill="#fff" label="일주문" dark />
        <Block x={190} y={22} w={120} h={48} fill="#0B9659" label="메인무대" sub="싱잉볼 · 스님과의 대화" />
        <Block x={190} y={100} w={130} h={44} fill="#FFD64A" label="체험부스존" sub="단주 · 사경 · 싱잉볼" dark />
        <Block x={28} y={140} w={84} h={40} fill="#FFD0B5" label="산사장터" dark />
        <Block x={28} y={204} w={120} h={66} fill="#A7E3C7" label="캠핑존 4인" sub="A1–A40" dark />
        <Block x={164} y={176} w={140} h={84} fill="#1EC97E" label="캠핑존 6인" sub="B1–B60" />
        <Block x={312} y={176} w={38} h={84} fill="#BFE9F2" label="샤워" sub="A–D" dark />
        <Block x={40} y={318} w={104} h={42} fill="#D1D5DB" label="제1주차장" sub="도보 10분" dark />
        <Block x={224} y={322} w={104} h={42} fill="#D1D5DB" label="제2주차장" sub="셔틀" dark />
        <text x="330" y="370" fontSize="9" fill="#9CA3AF" textAnchor="end">N ↑ · 약도</text>
      </svg>
      <ul className="mt-3 grid grid-cols-4 gap-x-2 gap-y-1.5">
        {legend.map(([c, t]) => (
          <li key={t} className="flex items-center gap-1.5 text-[11px] font-medium text-sub">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm border border-black/5" style={{ background: c }} />{t}
          </li>
        ))}
      </ul>
    </div>
  )
}
