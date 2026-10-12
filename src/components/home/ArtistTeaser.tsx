const NOISE = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"
const MARQUEE = 'COMING SOON · ARTIST LINE-UP · SANSA CAMP 2026 · 11.06 – 11.08 · HADONG SSANGGYESA · '

/** 아티스트 라인업 티저 — K-pop 컴백 티저 포스터 톤. 라인업 확정 시 실제 아티스트 카드로 교체 */
export default function ArtistTeaser() {
  return (
    <section className="px-5 pt-10">
      <div role="img" aria-label="아티스트 라인업 공개 예정" className="relative block aspect-[4/3] overflow-hidden rounded-tile bg-[#0A0A0B] text-white select-none">
        {/* 사선 홀로그램 색면 */}
        <span aria-hidden className="absolute -inset-x-10 top-[38%] h-[120%] -skew-y-[14deg] bg-[linear-gradient(100deg,#72E1B8_0%,#35D6BD_28%,#FFD64A_58%,#F0552A_100%)]" />
        <span aria-hidden className="absolute -inset-x-10 top-[36%] h-[3px] -skew-y-[14deg] bg-white/90" />
        {/* 노이즈 질감 */}
        <span aria-hidden className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: NOISE }} />

        {/* 상단 라벨 */}
        <div className="absolute left-5 top-4 flex items-center gap-2 text-[10px] font-extrabold tracking-[0.28em]">
          <span className="rounded-sm bg-white px-1.5 py-0.5 text-[#0A0A0B]">2026</span>
          <span className="text-white/80">ARTIST LINE-UP</span>
        </div>
        <span className="absolute right-12 top-4 text-[10px] font-extrabold tracking-[0.28em] text-white/50">VOL.1</span>

        {/* 대형 타이포: LINE 은 채움, UP 은 외곽선 */}
        <div className="absolute left-4 top-9 leading-[0.82]">
          <p className="text-[78px] font-black tracking-[-0.05em]">LINE</p>
          <p className="text-[78px] font-black tracking-[-0.05em] text-transparent" style={{ WebkitTextStroke: '2px #fff' }}>UP</p>
        </div>

        {/* 가려진 아티스트 이름 바 */}
        <div className="absolute bottom-12 left-5 flex flex-col gap-1.5">
          {[
            [92, 'ARTIST 01'],
            [60, 'ARTIST 02'],
            [116, 'ARTIST 03'],
          ].map(([w, label]) => (
            <div key={label as string} className="flex items-center gap-2">
              <span className="h-3.5 rounded-[2px] bg-[#0A0A0B]/85 ring-1 ring-white/30 [background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.35)_0_2px,transparent_2px_5px)]" style={{ width: w as number }} />
              <span className="text-[9px] font-extrabold tracking-[0.22em] text-[#0A0A0B]/70">{label}</span>
            </div>
          ))}
        </div>

        {/* 하단 한국어 카피 */}
        <p className="absolute bottom-4 left-5 text-[12.5px] font-bold text-[#0A0A0B]">산사의 밤을 채울 아티스트, 곧 공개</p>
        <p className="absolute bottom-4 right-12 text-[10px] font-extrabold tracking-[0.2em] text-[#0A0A0B]/70">@SANSACAMP</p>

        {/* 오른쪽 세로 마퀴 */}
        <div aria-hidden className="absolute bottom-0 right-0 top-0 w-9 overflow-hidden border-l border-white/15 bg-[#0A0A0B]">
          <div className="absolute left-1/2 top-0 origin-top-left -rotate-90 translate-y-0 whitespace-nowrap" style={{ transform: 'rotate(90deg) translate(0, -100%)', transformOrigin: 'top left' }}>
            <span className="inline-block animate-[marquee_14s_linear_infinite] text-[11px] font-extrabold tracking-[0.3em] text-white/85">{MARQUEE}{MARQUEE}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
