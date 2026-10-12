import { SPONSOR_TIERS } from '../../data/constants'
import SocialLinks from '../ui/SocialLinks'

export default function SponsorStrip() {
  return (
    <section className="mt-12 border-t hairline px-5 pt-7">
      <dl className="space-y-4">
        {SPONSOR_TIERS.map(({ tier, items }) => (
          <div key={tier} className="flex items-center gap-4">
            <dt className="eyebrow w-10 shrink-0">{tier}</dt>
            <dd className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {items.map((it) =>
                it.src ? <img key={it.name} src={it.src} alt={it.name} style={{ height: it.h ?? 22 }} className="w-auto" loading="lazy" />
                       : <span key={it.name} className="text-[13px] font-bold text-ink">{it.name}</span>,
              )}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-7 flex items-center gap-4">
        <span className="eyebrow w-10 shrink-0">SNS</span>
        <SocialLinks compact />
      </div>
      <p className="mt-6 text-[11px] text-gray-400">2026.11.6 (금) 14:00 – 11.8 (일) 11:00 · 하동 쌍계사 일원 · 캠핑존 / 한옥 방사 스테이</p>
    </section>
  )
}
