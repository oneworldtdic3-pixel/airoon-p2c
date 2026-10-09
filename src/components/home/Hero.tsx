import { ddayLabel, daysUntilStart } from '../../lib/dday'
import { HeroScene } from '../illust'

export default function Hero() {
  const d = daysUntilStart()
  return (
    <section className="relative overflow-hidden bg-hero-grad text-white">
      <div className="relative z-10 px-6 pt-[calc(env(safe-area-inset-top)+22px)]">
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-bold tracking-[0.22em]">SANSA CAMP 2026</p>
          <p className="text-[12px] font-semibold tracking-wide opacity-90">하동 쌍계사</p>
        </div>
        <h1 className="mt-9 text-[34px] font-extrabold leading-[1.18]">
          이번 가을,<br />산사에서 쉬어갈까요?
        </h1>
        <div className="mt-5 flex items-baseline gap-3">
          <span className="tnum text-[40px] font-extrabold leading-none text-sun">{ddayLabel()}</span>
          <span className="text-[13px] font-semibold opacity-90">
            {d > 0 ? '11월 6일 금요일 2시 입재' : d >= -2 ? '가장 조용한 페스티벌, 진행 중' : '세 밤의 기록'}
          </span>
        </div>
      </div>
      <HeroScene className="-mt-6 block h-[260px] w-full" />
    </section>
  )
}
