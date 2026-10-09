import { useMemo, useState } from 'react'
import { useApp } from '../../mock/store'
import { EVENT_DAYS, programs } from '../../mock/data'
import { dayKey, fmtDay, fmtTime } from '../../lib/format'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { Badge, BottomSheet, Chip } from '../ui'
import Icon from '../ui/Icon'
import QrTicket from './QrTicket'
import type { Booking, Program } from '../../mock/types'

export default function ProgramList({ toast }: { toast: (m: string) => void }) {
  const { sessions, bookings, bookSession, cancelBooking } = useApp()
  const requireAuth = useRequireAuth()
  const [day, setDay] = useState<string>(EVENT_DAYS[0])
  const [open, setOpen] = useState<Program | null>(null)
  const [ticket, setTicket] = useState<Booking | null>(null)

  const list = useMemo(
    () =>
      programs
        .map((p) => ({ p, ss: sessions.filter((s) => s.program_id === p.id && dayKey(s.starts_at) === day).sort((a, b) => a.starts_at.localeCompare(b.starts_at)) }))
        .filter((x) => x.ss.length),
    [sessions, day],
  )
  const mine = bookings.filter((b) => b.status === 'confirmed')
  const bookingOf = (sid: string) => mine.find((b) => b.session_id === sid)

  const book = (sid: string) =>
    requireAuth(() => {
      const r = bookSession(sid)
      if (!r.ok) return toast(r.error)
      toast('예약이 완료되었어요')
      setOpen(null)
      if (r.booking) setTicket(r.booking)
    })

  return (
    <div className="space-y-4">
      {mine.length > 0 && (
        <div className="rounded-card bg-mint p-4">
          <p className="mb-2 text-[13px] font-extrabold text-deep">내 예약 {mine.length}</p>
          <ul className="space-y-2">
            {mine.map((b) => {
              const s = sessions.find((x) => x.id === b.session_id)!
              const p = programs.find((x) => x.id === s.program_id)!
              return (
                <li key={b.id}>
                  <button onClick={() => setTicket(b)} className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-left shadow-card">
                    <span className="text-[14px] font-bold">{p.emoji} {p.title}</span>
                    <span className="text-[12px] text-sub">{fmtDay(s.starts_at)} {fmtTime(s.starts_at)}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {EVENT_DAYS.map((d, i) => <Chip key={d} active={day === d} onClick={() => setDay(d)}>DAY {i + 1} · {Number(d.slice(-2))}일</Chip>)}
      </div>

      {list.map(({ p, ss }) => {
        const left = ss.reduce((a, s) => a + (s.capacity - s.booked_count), 0)
        return (
          <article key={p.id} className="card p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-mint text-2xl">{p.emoji}</span>
              <div className="min-w-0 flex-1">
                <h3 className="text-[16px] font-extrabold">{p.title}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-[12px] text-sub"><Icon name="pin" size={13} />{p.location} · {p.duration}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                {p.pet_allowed && <Badge tone="yellow">🐾 펫 OK</Badge>}
                {p.capacity <= 100 && p.id === 'p3' && <Badge tone="gray">100명 한정</Badge>}
              </div>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-sub">{p.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className={`text-[13px] font-bold ${left ? 'text-deep' : 'text-gray-400'}`}>{left ? `잔여 ${left}석` : '전 회차 마감'}</span>
              <button onClick={() => setOpen(p)} className="pill-btn !py-2.5">회차 선택</button>
            </div>
          </article>
        )
      })}

      <BottomSheet open={!!open} onClose={() => setOpen(null)} title={open?.title}>
        {open && (
          <div>
            <p className="mb-4 text-[13px] text-sub">{fmtDay(`${day}T00:00:00+09:00`)} 회차</p>
            <ul className="space-y-2.5">
              {sessions.filter((s) => s.program_id === open.id && dayKey(s.starts_at) === day).sort((a, b) => a.starts_at.localeCompare(b.starts_at)).map((s) => {
                const left = s.capacity - s.booked_count
                const mineB = bookingOf(s.id)
                return (
                  <li key={s.id} className="flex items-center gap-3 rounded-2xl bg-mint px-4 py-3.5">
                    <span className="text-[17px] font-extrabold tabular-nums">{fmtTime(s.starts_at)}</span>
                    <span className={`flex-1 text-[13px] font-bold ${left ? 'text-deep' : 'text-gray-400'}`}>{left ? `잔여 ${left}/${s.capacity}` : '마감'}{left > 0 && left <= 5 && <span className="ml-1.5 text-[11px] text-red-500">마감임박</span>}</span>
                    {mineB ? (
                      <button onClick={() => { cancelBooking(mineB.id); toast('예약을 취소했어요') }} className="rounded-full border border-gray-300 bg-white px-4 py-2 text-[13px] font-bold text-sub">예약 취소</button>
                    ) : (
                      <button disabled={left === 0} onClick={() => book(s.id)} className="pill-btn !px-5 !py-2.5">예약</button>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </BottomSheet>
      <QrTicket booking={ticket} onClose={() => setTicket(null)} />
    </div>
  )
}
