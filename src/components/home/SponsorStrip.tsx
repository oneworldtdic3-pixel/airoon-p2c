import { sponsors } from '../../mock/data'

export default function SponsorStrip() {
  return (
    <section className="mt-12 border-t hairline px-5 pt-8 text-[12px] leading-relaxed text-sub">
      <p><span className="mr-2 font-bold text-ink">주최</span>{sponsors.HOST.join(' · ')}</p>
      <p className="mt-1"><span className="mr-2 font-bold text-ink">협력</span>{sponsors.PARTNER.join(' · ')}</p>
      <p className="mt-6 text-[11px] text-gray-400">2026.11.6 (금) 14:00 – 11.8 (일) 11:00 · 경남 하동군 화개면 쌍계사</p>
    </section>
  )
}
