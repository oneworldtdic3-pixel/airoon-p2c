// 행사장 맵 — 개략도(실측 아님). 실제 배치 확정 시 좌표만 교체.
const legend = [
  { c: '#43E09A', t: '캠핑존 4인' },
  { c: '#0FB267', t: '캠핑존 6인' },
  { c: '#FFD64A', t: '체험부스존' },
  { c: '#0B9659', t: '메인무대' },
  { c: '#8FD9F0', t: '샤워동' },
  { c: '#FFB38A', t: '산사장터' },
  { c: '#9CA3AF', t: '주차장' },
  { c: '#fff', t: '일주문·쌍계사', stroke: '#0B9659' },
]

export default function EventMap() {
  return (
    <div>
      <div className="overflow-hidden rounded-card bg-mint p-2 shadow-card">
        <svg viewBox="0 0 360 400" role="img" aria-label="행사장 맵" className="w-full">
          <rect width="360" height="400" rx="16" fill="#E9FAF2" />
          <path d="M0 330 Q90 290 180 320 T360 300 V400H0Z" fill="#fff" opacity=".7" />
          {/* 길 */}
          <path d="M180 392 V300 Q180 270 160 250 T120 200 V70" fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="round" />
          <path d="M180 300 H300 M120 200 H250 M120 130 H280" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
          {/* 쌍계사 / 일주문 */}
          <g>
            <rect x="80" y="14" width="80" height="44" rx="10" fill="#fff" stroke="#0B9659" strokeWidth="2" />
            <text x="120" y="42" textAnchor="middle" fontSize="12" fontWeight="800" fill="#0B9659">쌍계사</text>
            <rect x="96" y="78" width="48" height="22" rx="8" fill="#fff" stroke="#0B9659" strokeWidth="2" />
            <text x="120" y="93" textAnchor="middle" fontSize="10" fontWeight="800" fill="#0B9659">일주문</text>
          </g>
          {/* 메인무대 */}
          <rect x="180" y="26" width="110" height="52" rx="14" fill="#0B9659" />
          <text x="235" y="57" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">메인무대</text>
          {/* 체험부스존 */}
          <rect x="176" y="100" width="130" height="48" rx="14" fill="#FFD64A" />
          <text x="241" y="129" textAnchor="middle" fontSize="12" fontWeight="800" fill="#1F2937">체험부스존</text>
          {/* 산사장터 */}
          <rect x="30" y="140" width="76" height="46" rx="14" fill="#FFB38A" />
          <text x="68" y="168" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">산사장터</text>
          {/* 캠핑존 */}
          <rect x="30" y="206" width="112" height="70" rx="16" fill="#43E09A" />
          <text x="86" y="236" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">캠핑존</text>
          <text x="86" y="254" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">4인</text>
          <rect x="158" y="176" width="140" height="84" rx="16" fill="#0FB267" />
          <text x="228" y="214" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">캠핑존</text>
          <text x="228" y="232" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">6인</text>
          {/* 샤워동 */}
          <rect x="304" y="176" width="42" height="84" rx="12" fill="#8FD9F0" />
          <text x="325" y="222" textAnchor="middle" fontSize="11" fontWeight="800" fill="#0B5A73">샤워동</text>
          {/* 주차장 */}
          <rect x="40" y="320" width="100" height="50" rx="12" fill="#9CA3AF" />
          <text x="90" y="350" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">제1주차장</text>
          <rect x="226" y="330" width="100" height="44" rx="12" fill="#9CA3AF" />
          <text x="276" y="357" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">제2주차장</text>
          <circle cx="330" cy="30" r="8" fill="#FFD64A" /><path d="M326 36 L330 24 L334 36Z" fill="#0B9659" opacity=".0" />
        </svg>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
        {legend.map((l) => (
          <li key={l.t} className="flex items-center gap-2 text-[12px] font-semibold text-sub">
            <span className="h-3.5 w-3.5 rounded" style={{ background: l.c, border: l.stroke ? `2px solid ${l.stroke}` : undefined }} />{l.t}
          </li>
        ))}
      </ul>
    </div>
  )
}
