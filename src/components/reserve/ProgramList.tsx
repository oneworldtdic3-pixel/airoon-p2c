import { useMemo, useState } from 'react'
import { useApp } from '../../mock/store'
import { EVENT_DAYS, programs } from '../../mock/data'
import { dayKey, fmtDay, fmtTime } from '../../lib/format'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { BottomSheet, Chip, Tag } from '../ui'
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
      toast('예약되었습니다')
      setOpen(null)
      if (r.booking) setTicket(r.booking)
    })

  return (
    <div>
      {mine.length > 0 && (
        <section className="mb-6 rounded-tile bg-mint p-4">
          <p className="eyebrow mb-2 text-deep">내 예약 {mine.length}</p>
          <ul className="divide-y divide-white">
            {mine.map((b) => {
              const s = sessions.find((x) => x.id === b.session_id)!
              const p = programs.find((x) => x.id === s.program_id)!
              return (
                <li key={b.id}>
                  <button onClick={() => setTicket(b)} className="flex w-full items-center gap-3 py-2.5 text-left">
                    <Icon name="qr" size={18} className="text-deep" />
                    <span className="flex-1 text-[14px] font-bold">{p.title}</span>
                    <span className="tnum text-[12px] text-sub">{fmtDay(s.starts_at)} {fmtTime(s.starts_at)}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {EVENT_DAYS.map((d, i) => <Chip key={d} active={day === d} onClick={() => setDay(d)}>{i + 1}일차 · 11.{Number(d.slice(-2))}</Chip>)}
      </div>

      <ol className="mt-2">
        {list.map(({ p, ss }, i) => {
          const left = ss.reduce((a, s) => a + (s.capacity - s.booked_count), 0)
          const ratio = 1 - left / ss.reduce((a, s) => a + s.capacity, 0)
          return (
            <li key={p.id} className="border-t hairline py-5 first:border-t-0">
              <button onClick={() => setOpen(p)} className="block w-full text-left">
                <div className="flex items-start gap-4">
                  <span className="tnum mt-1 w-7 text-[12px] font-bold text-gray-400">{String(i + 1).padStart(2, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[18px] font-extrabold">{p.title}</h3>
                      {p.pet_allowed && <Icon name="paw" size={16} className="text-deep" />}
                    </div>
                    <p className="mt-1 text-[12.5px] text-sub">{p.location} · {p.duration}{p.id === 'p3' && ' · 100명 한정'}</p>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink/80">{p.description}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex gap-1.5">
                        {ss.map((s) => (
                          <span key={s.id} className={`tnum rounded-md px-2 py-1 text-[12px] font-bold ${s.booked_count >= s.capacity ? 'bg-gray-100 text-gray-400 line-through' : 'bg-mint text-deep'}`}>{fmtTime(s.starts_at)}</span>
                        ))}
                      </div>
                      <span className="ml-auto flex items-center gap-2">
                        <span className="h-1 w-12 overflow-hidden rounded-full bg-gray-100"><span className="block h-full bg-deep" style={{ width: `${ratio * 100}%` }} /></span>
                        <Tag tone={left ? 'green' : 'ink'}>{left ? `${left}석` : '마감'}</Tag>
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ol>

      <BottomSheet open={!!open} onClose={() => setOpen(null)} title={open?.title}>
        {open && (
          <div>
            <p className="text-[13px] text-sub">{open.location} · {open.duration}{open.pet_allowed && ' · 반려견 동반 가능'}</p>
            <p className="mt-2 text-[14px] leading-relaxed">{open.description}</p>
            <p className="eyebrow mb-2 mt-6">{fmtDay(`${day}T00:00:00+09:00`)}</p>
            <ul className="divide-y hairline border-y">
              {sessions.filter((s) => s.program_id === open.id && dayKey(s.starts_at) === day).sort((a, b) => a.starts_at.localeCompare(b.starts_at)).map((s) => {
                const left = s.capacity - s.booked_count
                const mineB = bookingOf(s.id)
                return (
                  <li key={s.id} className="flex items-center gap-3 py-3.5">
                    <span className="tnum w-16 text-[20px] font-extrabold">{fmtTime(s.starts_at)}</span>
                    <span className="flex-1 text-[13px]">
                      <span className={`tnum font-bold ${left ? 'text-deep' : 'text-gray-400'}`}>{left ? `${left}석 남음` : '마감'}</span>
                      {left > 0 && left <= 5 && <span className="ml-1.5 text-[11px] font-bold text-ember">곧 마감</span>}
                      <span className="tnum block text-[11px] text-gray-400">정원 {s.capacity}</span>
                    </span>
                    {mineB ? (
                      <button onClick={() => { cancelBooking(mineB.id); toast('예약을 취소했습니다') }} className="btn-ghost">취소</button>
                    ) : (
                      <button disabled={left === 0} onClick={() => book(s.id)} className="btn !px-5 !py-2.5 !text-[14px]">예약</button>
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
