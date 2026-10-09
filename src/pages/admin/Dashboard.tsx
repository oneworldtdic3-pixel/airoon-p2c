import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { AdminStats } from '../../data/types'

const pct = (b: number, c: number) => (c ? Math.round((b / c) * 100) : 0)

function Rate({ label, booked, capacity, sub }: { label: string; booked: number; capacity: number; sub?: string }) {
  const p = pct(booked, capacity)
  return (
    <li className="py-3">
      <div className="flex items-baseline justify-between">
        <span className="text-[14px] font-bold">{label}</span>
        <span className="tnum text-[13px] text-sub">{booked}/{capacity} · <b className={p >= 90 ? 'text-ember' : 'text-deep'}>{p}%</b></span>
      </div>
      {sub && <p className="text-[11px] text-gray-400">{sub}</p>}
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${p >= 90 ? 'bg-ember' : 'bg-brand-grad'}`} style={{ width: `${p}%` }} /></div>
    </li>
  )
}

export default function Dashboard() {
  const q = useQuery({
    queryKey: ['admin-stats'],
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_stats')
      if (error) throw error
      return data as AdminStats
    },
  })
  if (q.isLoading) return <p className="py-10 text-center text-[13px] text-sub">불러오는 중</p>
  if (q.error || !q.data) return <p className="py-10 text-center text-[13px] text-red-500">집계를 불러오지 못했습니다</p>
  const s = q.data
  const progTotal = s.programs.reduce((a, p) => ({ b: a.b + p.booked, c: a.c + p.capacity }), { b: 0, c: 0 })
  const showerTotal = s.shower.reduce((a, p) => ({ b: a.b + p.booked, c: a.c + p.capacity }), { b: 0, c: 0 })
  return (
    <div className="space-y-9">
      <dl className="grid grid-cols-4 gap-2 text-center">
        {[['가입', s.users], ['프로그램', `${pct(progTotal.b, progTotal.c)}%`], ['샤워', `${pct(showerTotal.b, showerTotal.c)}%`], ['주차', s.parking.P1 + s.parking.P2]].map(([k, v]) => (
          <div key={String(k)} className="rounded-tile bg-mint py-3"><dt className="text-[11px] text-sub">{k}</dt><dd className="tnum text-[20px] font-extrabold">{v}</dd></div>
        ))}
      </dl>
      <section>
        <h2 className="eyebrow mb-1">프로그램 · 전 회차 합산</h2>
        <ul className="divide-y hairline">{s.programs.map((p) => <Rate key={p.id} label={p.title} booked={p.booked} capacity={p.capacity} />)}</ul>
      </section>
      <section>
        <h2 className="eyebrow mb-1">샤워실 · 동별</h2>
        <ul className="divide-y hairline">{s.shower.map((p) => <Rate key={p.building} label={p.building} booked={p.booked} capacity={p.capacity} />)}</ul>
      </section>
      <section>
        <h2 className="eyebrow mb-1">주차장</h2>
        <ul className="divide-y hairline text-[14px]">
          <li className="flex justify-between py-3"><span className="font-bold">제1주차장 · 도보</span><span className="tnum">{s.parking.P1}대</span></li>
          <li className="flex justify-between py-3"><span className="font-bold">제2주차장 · 셔틀</span><span className="tnum">{s.parking.P2}대</span></li>
          <li className="flex justify-between py-3"><span className="font-bold">럭키드로우 응모</span><span className="tnum">{s.lucky}명</span></li>
        </ul>
      </section>
      <p className="text-[11px] text-gray-400">30초마다 자동 갱신</p>
    </div>
  )
}
