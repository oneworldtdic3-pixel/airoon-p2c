import { sponsors } from '../../mock/data'

export default function SponsorStrip() {
  const names = [...sponsors.HOST, ...sponsors.PARTNER]
  return (
    <section className="pt-8">
      <p className="px-5 text-[12px] font-bold tracking-widest text-sub">SPONSORS</p>
      <div className="no-scrollbar mt-3 flex gap-2.5 overflow-x-auto px-5 pb-2">
        {names.map((n) => (
          <span key={n} className="shrink-0 rounded-full bg-mint px-4 py-2.5 text-[13px] font-bold text-deep">{n}</span>
        ))}
      </div>
    </section>
  )
}
