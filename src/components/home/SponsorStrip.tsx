import { EVENT_POSTPONED, POSTPONED_LABEL, SPONSOR_TIERS } from '../../data/constants'

// 연기 중(장소 미정)에는 홈에서 '주최 하동 쌍계사'와 참여업체의 하동 쌍계사를 빼고, 주관을 글로 밝힌다
const SSANGGYESA = '하동 쌍계사'
const tiers = EVENT_POSTPONED
  ? SPONSOR_TIERS.filter((t) => t.tier !== '주최').map((t) => ({ ...t, items: t.items.filter((it) => it.name !== SSANGGYESA) })).filter((t) => t.items.length)
  : SPONSOR_TIERS
import SocialLinks from '../ui/SocialLinks'

export default function SponsorStrip() {
  return (
    <section className="mt-12 border-t hairline px-5 pt-7">
      <dl className="space-y-4">
        {tiers.map(({ tier, items }) => (
          <div key={tier} className="flex items-center gap-4">
            <dt className="eyebrow w-14 shrink-0 whitespace-pre-line leading-[1.35]">{tier}</dt>
            <dd className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {items.map((it) =>
                it.src ? <img key={it.name} src={it.src} alt={it.name} width={it.w} height={it.h ?? 22} style={{ height: it.h ?? 22 }} className="w-auto" loading="lazy" decoding="async" />
                       : <span key={it.name} className="text-[13px] font-bold text-ink">{it.name}</span>,
              )}
              {EVENT_POSTPONED && tier === '주관' && <span className="text-[13px] font-bold text-ink">산사캠프 사무국(주식회사 아이룬)</span>}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-7 flex items-center gap-4">
        <span className="eyebrow w-14 shrink-0">SNS</span>
        <SocialLinks compact />
      </div>
      <p className="mt-6 text-[12px] text-gray-500">{EVENT_POSTPONED ? POSTPONED_LABEL : '2026.11.6 (금) 14:00 – 11.8 (일) 11:00 · 하동 쌍계사 일원 · 캠핑존 / 한옥 방사 스테이'}</p>
    </section>
  )
}
