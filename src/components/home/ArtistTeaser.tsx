import { SOCIAL } from '../../data/constants'

/** 아티스트 라인업 공개 예정 배너. 라인업이 확정되면 이 컴포넌트를 실제 아티스트 카드로 교체한다. */
export default function ArtistTeaser() {
  return (
    <section className="px-5 pt-10">
      <a
        href={SOCIAL.find((s) => s.id === 'instagram')!.url}
        target="_blank"
        rel="noreferrer"
        className="relative block overflow-hidden rounded-tile bg-ink px-5 py-6 text-white transition active:scale-[0.985]"
        aria-label="아티스트 라인업 공개 예정, 인스타그램에서 먼저 확인"
      >
        {/* 무대 조명: 브랜드 그라데이션 빛줄기 두 개 */}
        <span aria-hidden className="pointer-events-none absolute -left-10 -top-24 h-72 w-40 rotate-[28deg] bg-brand-grad opacity-30 blur-2xl" />
        <span aria-hidden className="pointer-events-none absolute -right-6 -top-28 h-80 w-32 -rotate-[22deg] bg-sun opacity-20 blur-2xl" />
        {/* 실루엣 세 명 */}
        <span aria-hidden className="pointer-events-none absolute bottom-0 right-4 flex items-end gap-1 opacity-40">
          {[26, 36, 30].map((h, i) => (
            <span key={i} className="flex flex-col items-center">
              <span className="h-4 w-4 rounded-full bg-white/80" />
              <span className="mt-0.5 w-7 rounded-t-full bg-white/80" style={{ height: h }} />
            </span>
          ))}
        </span>
        <p className="eyebrow text-brand">Line-up</p>
        <p className="mt-1 text-[22px] font-extrabold leading-tight">아티스트<br />공개 예정</p>
        <p className="mt-2 max-w-[62%] text-[12.5px] leading-snug text-white/70">산사의 밤을 채울 아티스트를 준비하고 있어요. 라인업은 인스타그램에 먼저 올라옵니다.</p>
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-extrabold tracking-wider text-white ring-1 ring-white/20">
          <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" /></span>
          COMING SOON
        </span>
      </a>
    </section>
  )
}
