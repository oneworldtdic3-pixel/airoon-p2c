import { ddayLabel, daysUntilStart } from '../../lib/dday'
import { Cloud, HeroScene, Wave } from '../illust'

export default function Hero() {
  const d = daysUntilStart()
  return (
    <section className="relative overflow-hidden bg-hero-grad pt-[calc(env(safe-area-inset-top)+20px)] text-white">
      <Cloud className="absolute -left-6 top-24 w-28 opacity-30" style={{ animation: 'drift 9s ease-in-out infinite' }} />
      <Cloud className="absolute right-4 top-6 w-20 opacity-25" style={{ animation: 'drift 11s ease-in-out -3s infinite' }} />
      <div className="relative px-6">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-extrabold tracking-[0.2em] opacity-90">SANSA CAMP</span>
          <span className="rounded-full bg-sun px-3 py-1.5 text-[13px] font-extrabold text-ink shadow-card">입재 {ddayLabel()}</span>
        </div>
        <h1 className="mt-6 text-[28px] font-extrabold leading-[1.3] tracking-tight">
          이번 가을,<br />산사에서 쉬어갈까요?
        </h1>
        <p className="mt-2 text-[14px] font-medium opacity-90">
          {d > 0 ? '11.6(금) 14:00 입재 · 하동 쌍계사' : d >= -2 ? '지금, 가장 조용한 페스티벌이 열리고 있어요' : '함께해 주셔서 고마워요'}
        </p>
      </div>
      <HeroScene className="relative mx-auto mt-2 block w-full" />
      <Wave className="absolute inset-x-0 -bottom-px h-8 w-full" />
    </section>
  )
}
