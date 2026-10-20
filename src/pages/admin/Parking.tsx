import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { EVENT_DAYS } from '../../data/constants'
import { fmtPhone } from '../../lib/format'
import { Chip } from '../../components/ui'

type Row = { id: string; zone: 'P1' | 'P2'; car_number: string; dates: string[]; updated_at: string; profiles: { nickname: string; phone: string | null } | null }
const ZONE = { P1: '제1주차장 · 도보', P2: '제2주차장 · 도보' } as const

/** 관리자 · 주차 등록 목록. 차량번호 검색, 구역·일차 필터, 현장 대조용 */
export default function Parking({ toast }: { toast: (m: string) => void }) {
  const q = useQuery({
    queryKey: ['admin-parking'],
    queryFn: async () => {
      const { data, error } = await supabase.from('parking_bookings').select('id, zone, car_number, dates, updated_at, profiles(nickname, phone)').order('updated_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as Row[]
    },
    refetchInterval: 30_000,
  })
  const [zone, setZone] = useState<'all' | 'P1' | 'P2'>('all')
  const [day, setDay] = useState<'all' | string>('all')
  const [search, setSearch] = useState('')
  const rows = useMemo(() => {
    const s = search.replace(/\s/g, '')
    return (q.data ?? []).filter((r) =>
      (zone === 'all' || r.zone === zone) &&
      (day === 'all' || r.dates.includes(day)) &&
      (!s || r.car_number.replace(/\s/g, '').includes(s) || (r.profiles?.phone ?? '').includes(s)),
    )
  }, [q.data, zone, day, search])

  const copyCsv = async () => {
    const lines = [['차량번호', '구역', '이용일', '닉네임', '휴대폰'].join(','), ...rows.map((r) => [r.car_number, ZONE[r.zone], r.dates.map(dayLabel).join(' '), r.profiles?.nickname ?? '', fmtPhone(r.profiles?.phone)].join(','))]
    try { await navigator.clipboard.writeText(lines.join('\n')); toast(`${rows.length}건을 복사했습니다 (엑셀에 붙여넣기)`) } catch { toast('복사하지 못했습니다') }
  }

  return (
    <div>
      <p className="mb-3 text-[12px] text-sub">등록 {q.data?.length ?? 0}대 · 차량 1대 = 계정 1개. 현장에서는 차량번호 뒷자리로 검색하세요.</p>
      <input value={search} onChange={(e) => setSearch(e.target.value)} inputMode="search" placeholder="차량번호 또는 휴대폰 뒷자리" className="field tnum text-[16px] font-bold" />
      <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
        <Chip active={zone === 'all'} onClick={() => setZone('all')}>전체</Chip>
        <Chip active={zone === 'P1'} onClick={() => setZone('P1')}>제1주차장</Chip>
        <Chip active={zone === 'P2'} onClick={() => setZone('P2')}>제2주차장</Chip>
        <span className="w-px shrink-0 bg-line" />
        <Chip active={day === 'all'} onClick={() => setDay('all')}>모든 날</Chip>
        {EVENT_DAYS.map((d, i) => <Chip key={d} active={day === d} onClick={() => setDay(d)}>{i + 1}일차</Chip>)}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="tnum text-[13px] font-bold">{rows.length}대</p>
        <button type="button" onClick={() => void copyCsv()} disabled={!rows.length} className="btn-ghost !py-2 !text-[12.5px] disabled:opacity-40">목록 복사</button>
      </div>
      {q.isLoading && <p className="py-10 text-center text-[13px] text-sub">불러오는 중</p>}
      {q.error && <p className="py-10 text-center text-[13px] text-red-500">목록을 불러오지 못했습니다</p>}
      <ul className="mt-2 divide-y hairline border-y">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <p className="tnum text-[17px] font-extrabold tracking-wide">{r.car_number}</p>
              <p className="truncate text-[12px] text-sub">{r.profiles?.nickname ?? '-'} · <span className="tnum">{fmtPhone(r.profiles?.phone) || '번호 없음'}</span></p>
            </div>
            <div className="shrink-0 text-right">
              <p className={`text-[12px] font-bold ${r.zone === 'P1' ? 'text-deep' : 'text-ink'}`}>{ZONE[r.zone]}</p>
              <p className="tnum text-[11.5px] text-sub">{r.dates.length ? r.dates.map(dayLabel).join(' · ') : '날짜 없음'}</p>
            </div>
          </li>
        ))}
        {!q.isLoading && !rows.length && <li className="py-10 text-center text-[13px] text-sub">조건에 맞는 차량이 없습니다</li>}
      </ul>
    </div>
  )
}

const dayLabel = (d: string) => { const i = EVENT_DAYS.indexOf(d as (typeof EVENT_DAYS)[number]); return i >= 0 ? `${i + 1}일차` : d.slice(5) }
