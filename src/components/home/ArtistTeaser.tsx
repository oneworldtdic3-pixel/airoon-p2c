const MARQUEE = 'ARTIST LINE-UP · JAZZ VOCALIST WOONGSAN · SANSA CAMP 2026 · 11.06 – 11.08 · HADONG SSANGGYESA · MORE ARTISTS SOON · '

/** 아티스트 라인업 배너 — 확정 아티스트: 재즈 보컬리스트 웅산. 클릭 이동 없음 */
export default function ArtistTeaser() {
  return (
    <section className="px-5 pt-10">
      <h2 className="mb-4 flex items-end gap-1.5">
        <img src="/line-up.png" alt="LINE UP" width={103} height={98} className="h-[46px] w-auto" />
        <span className="pb-0.5 text-[15px] font-extrabold tracking-[-0.02em]">아티스트 라인업</span>
      </h2>
      <div role="img" aria-label="아티스트 라인업 확정: 재즈 보컬리스트 웅산" className="relative block aspect-[5/4] select-none overflow-hidden rounded-tile bg-[#0A0A0B] text-white">
        <img
          src="/artists/woongsan.jpg"
          width={1280}
          height={1024}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute inset-y-0 left-0 h-full w-[calc(100%-2.25rem)] object-cover object-[30%_30%]"
        />
        {/* 위·아래 글자 가독성용 어둠 */}
        <span aria-hidden className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent" />
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* 상단 라벨 */}
        <div className="absolute left-4 top-4 flex items-center gap-2 text-[12px] font-extrabold tracking-[0.28em]">
          <span className="rounded-sm bg-white px-1.5 py-0.5 text-[#0A0A0B]">2026</span>
          <span className="text-white/90">ARTIST LINE-UP</span>
        </div>

        {/* 하단 카피 */}
        <div className="absolute bottom-4 left-4 right-12">
          <span className="inline-block rounded-full bg-pink-deep px-2.5 py-0.5 text-[12px] font-black tracking-[0.06em] shadow-[0_6px_16px_rgba(255,45,138,0.45)]">라인업 확정</span>
          <p className="mt-1.5 text-[32px] font-black leading-none tracking-[-0.04em]">웅산 <span className="align-middle text-[14px] font-extrabold tracking-[0.12em] text-white/80">WOONGSAN</span></p>
          <p className="mt-1.5 text-[12px] font-bold text-white/85">아시아를 대표하는 재즈 보컬리스트 · 산사의 밤을 채웁니다</p>
        </div>

        {/* 오른쪽 세로 마퀴 */}
        <div aria-hidden className="absolute bottom-0 right-0 top-0 w-9 overflow-hidden border-l border-white/15 bg-[#0A0A0B]">
          <div className="absolute left-1/2 top-0 whitespace-nowrap" style={{ transform: 'rotate(90deg) translate(0, -100%)', transformOrigin: 'top left' }}>
            <span className="inline-block animate-[marquee_14s_linear_infinite] text-[12px] font-extrabold tracking-[0.3em] text-white/85">{MARQUEE}{MARQUEE}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
