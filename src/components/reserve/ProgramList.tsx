import { useMemo, useState } from 'react'
import { useApp } from '../../data/AppProvider'
import { EVENT_DAYS, MEALS, PROGRAM_BOOKING_LABEL, PROGRAM_TIME_TBD, mealTag, programBookingOpen, sessionLabel, timeTbd } from '../../data/constants'
import { dayKey, fmtDay } from '../../lib/format'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { BottomSheet, Chip, Tag } from '../ui'
import Icon from '../ui/Icon'
import QrTicket from './QrTicket'
import { naverConversion } from '../../lib/naverWcs'
import type { Booking, Program } from '../../data/types'

export default function ProgramList({ toast }: { toast: (m: string) => void }) {
  const { user, programs, sessions, bookings, bookSession, cancelBooking } = useApp()
  const requireAuth = useRequireAuth()
  const [day, setDay] = useState<string>(EVENT_DAYS[0])
  const [open, setOpen] = useState<Program | null>(null)
  const [ticket, setTicket] = useState<Booking | null>(null)
  const [cancelled, setCancelled] = useState<{ id: string; title: string; when: string }[]>([]) // 방금 취소한 예약 — 화면에 '취소되었습니다' 로 남긴다

  const list = useMemo(
    () =>
      programs
        .map((p) => ({ p, ss: sessions.filter((s) => s.program_id === p.id && dayKey(s.starts_at) === day).sort((a, b) => a.starts_at.localeCompare(b.starts_at)) }))
        .filter((x) => x.ss.length),
    [programs, sessions, day],
  )
  const mine = bookings.filter((b) => b.status === 'confirmed')
  const DAILY_MAX = 3 // 1인당 하루 프로그램 예약 상한 (DB book_session 과 동일)
  const myToday = mine.filter((b) => { const s = sessions.find((x) => x.id === b.session_id); return s && dayKey(s.starts_at) === day })
  const atLimit = myToday.length >= DAILY_MAX
  const bookingOpen = programBookingOpen() || !!user?.is_admin
  const bookedProgramIds = new Set(mine.map((b) => sessions.find((x) => x.id === b.session_id)?.program_id))
  const bookingOf = (sid: string) => mine.find((b) => b.session_id === sid)

  const cancel = async (b: Booking, title: string, when: string) => {
    const r = await cancelBooking(b.id)
    if (!r.ok) return toast(r.error)
    setCancelled((cur) => [{ id: b.id, title, when }, ...cur])
    toast('예약을 취소했습니다')
  }
  const book = (sid: string) =>
    requireAuth(async () => {
      const r = await bookSession(sid)
      if (!r.ok) return toast(r.error)
      toast('예약되었습니다')
      naverConversion('schedule')
      setOpen(null)
      if (r.booking) setTicket(r.booking)
    })

  return (
    <div>
      {cancelled.length > 0 && (
        <section className="mb-4 rounded-tile border hairline bg-white p-4" role="status" aria-live="polite">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[14px] font-extrabold text-ember">예약이 취소되었습니다</p>
              <ul className="mt-1 space-y-0.5">
                {cancelled.map((c) => <li key={c.id} className="text-[13px] text-sub"><span className="font-bold text-ink line-through decoration-ember/60">{c.title}</span> · <span className="tnum">{c.when}</span></li>)}
              </ul>
              <p className="mt-2 text-[12px] text-sub">자리는 다른 분이 예약할 수 있게 열렸습니다. 다시 참여하려면 아래에서 예약해 주세요.</p>
            </div>
            <button type="button" onClick={() => setCancelled([])} aria-label="닫기" className="-mr-1 -mt-1 p-1 text-sub"><Icon name="close" size={18} /></button>
          </div>
        </section>
      )}
      {mine.length > 0 && (
        <section className="mb-6 rounded-tile bg-mint p-4">
          <p className="eyebrow mb-2 text-deep">내 예약 {mine.length}</p>
          <p className="-mt-1 mb-2 text-[12px] text-sub">참여가 어려우면 미리 취소해 주세요. 노쇼 2회면 당일 예약이 제한됩니다.</p>
          <ul className="divide-y divide-white">
            {mine.map((b) => {
              const s = sessions.find((x) => x.id === b.session_id)!
              const p = programs.find((x) => x.id === s.program_id)!
              return (
                <li key={b.id} className="flex items-center gap-2">
                  <button type="button" onClick={() => setTicket(b)} className="flex min-w-0 flex-1 items-center gap-3 py-2.5 text-left">
                    <Icon name="qr" size={18} className="shrink-0 text-deep" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold">{p.title}</span>
                      <span className="tnum block text-[12px] text-sub">{fmtDay(s.starts_at)} {sessionLabel(s.starts_at, undefined, undefined, p)} · QR 보기</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!window.confirm(`${p.title} ${fmtDay(s.starts_at)} 예약을 취소할까요?\n취소한 자리는 다른 분이 예약할 수 있습니다.`)) return
                      await cancel(b, p.title, `${fmtDay(s.starts_at)} ${sessionLabel(s.starts_at, undefined, undefined, p)}`)
                    }}
                    className="shrink-0 rounded-full border border-deep/30 px-3 py-1.5 text-[12px] font-bold text-deep active:bg-white"
                  >
                    취소
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {!bookingOpen ? (
        <div className="mb-3 rounded-tile bg-sun/40 px-4 py-3">
          <p className="text-[14px] font-extrabold">프로그램 예약은 {PROGRAM_BOOKING_LABEL}부터 가능합니다</p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink/80">티켓 판매가 마감된 뒤 예약을 엽니다. 지금은 프로그램 내용을 미리 보실 수 있고, 오픈되면 알림으로 안내해 드립니다.{PROGRAM_TIME_TBD && ' 일부 프로그램 시간대는 협의 중입니다.'}</p>
        </div>
      ) : PROGRAM_TIME_TBD && <p className="mb-3 rounded-tile bg-sun/30 px-4 py-2.5 text-[12.5px] font-semibold text-ink">일부 프로그램 시간대는 협의 중입니다. 날짜별로 먼저 예약해 두시면, 시간이 확정되는 대로 알림으로 안내해 드립니다.</p>}
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {EVENT_DAYS.map((d, i) => <Chip key={d} active={day === d} onClick={() => setDay(d)}>{i + 1}일차 · 11.{Number(d.slice(-2))}</Chip>)}
      </div>
      <p className={`tnum mt-3 text-[12.5px] font-bold ${atLimit ? 'text-ember' : 'text-sub'}`}>
        이 날 내 예약 {myToday.length}/{DAILY_MAX}{atLimit ? ' · 더 예약하려면 하나를 취소하세요' : ' · 같은 프로그램은 1회, 시간이 겹치면 예약할 수 없습니다'}
      </p>

      {MEALS.some((m) => m.day === day) && (
        <ul className="mt-4 divide-y divide-white/70 rounded-tile bg-sun/30 px-4 py-1">
          {MEALS.filter((m) => m.day === day).sort((a, b) => a.time.localeCompare(b.time)).map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-2.5">
              <span className="tnum min-w-[3.2em] shrink-0 text-[14px] font-extrabold">{m.time}</span>
              <span className="min-w-0 flex-1 truncate text-[13.5px] font-bold">{m.title}</span>
              <span className="shrink-0 text-[11.5px] text-sub">{m.location} · {m.note}</span>
              <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10.5px] font-extrabold ${m.kind === 'meal' ? 'bg-sun text-ink' : m.kind === 'info' ? 'bg-sky/40 text-ink' : 'bg-mint text-deep'}`}>{mealTag(m)}</span>
            </li>
          ))}
        </ul>
      )}
      <ol className="mt-2">
        {list.map(({ p, ss }, i) => {
          const left = ss.reduce((a, s) => a + (s.capacity - s.booked_count), 0)
          const ratio = 1 - left / ss.reduce((a, s) => a + s.capacity, 0)
          return (
            <li key={p.id} className="border-t hairline py-5 first:border-t-0">
              <button onClick={() => setOpen(p)} className="block w-full text-left">
                <div className="flex items-start gap-4">
                  <span className="tnum mt-1 min-w-[1.8em] shrink-0 text-[12px] font-bold text-gray-400">{String(i + 1).padStart(2, '0')}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[18px] font-extrabold">{p.title}</h3>
                      {p.pet_allowed && <Icon name="paw" size={16} className="text-deep" />}
                    </div>
                    <p className="mt-1 text-[12.5px] text-sub">{p.location} · {p.duration}</p>
                    <p className="mt-2 text-[14px] leading-relaxed text-ink/80">{p.description}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex min-w-0 flex-wrap gap-1.5">
                        {ss.map((s, k) => (
                          <span key={s.id} className={`tnum rounded-md px-2 py-1 text-[12px] font-bold ${s.booked_count >= s.capacity ? 'bg-gray-100 text-gray-400 line-through' : 'bg-mint text-deep'}`}>{sessionLabel(s.starts_at, k, ss.length, p)}</span>
                        ))}
                      </div>
                      <span className="ml-auto flex shrink-0 items-center gap-2">
                        <span className="h-1 w-12 overflow-hidden rounded-full bg-gray-100"><span className="block h-full bg-brand-grad" style={{ width: `${ratio * 100}%` }} /></span>
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
              {sessions.filter((s) => s.program_id === open.id && dayKey(s.starts_at) === day).sort((a, b) => a.starts_at.localeCompare(b.starts_at)).map((s, k, arr) => {
                const left = s.capacity - s.booked_count
                const when = sessionLabel(s.starts_at, k, arr.length, open)
                const mineB = bookingOf(s.id)
                return (
                  <li key={s.id} className="flex items-center gap-3 py-3.5">
                    <span className={`tnum min-w-[3.4em] shrink-0 font-extrabold ${timeTbd(open) ? 'text-[13px] text-sub' : 'text-[20px]'}`}>{when}</span>
                    <span className="flex-1 text-[13px]">
                      <span className={`tnum font-bold ${left ? 'text-deep' : 'text-gray-400'}`}>{left ? `${left}석 남음` : '마감'}</span>
                      {left > 0 && left <= 5 && <span className="ml-1.5 text-[11px] font-bold text-ember">곧 마감</span>}
                      <span className="tnum block text-[11px] text-gray-400">정원 {s.capacity}</span>
                    </span>
                    {mineB ? (
                      <span className="flex flex-col items-end gap-1">
                        <span className="rounded-full bg-mint px-3 py-1 text-[12px] font-extrabold text-deep">예약 완료</span>
                        <button type="button" onClick={() => void cancel(mineB, open.title, `${fmtDay(s.starts_at)} ${when}`)} className="px-2 py-1 text-[12px] font-semibold text-sub underline underline-offset-2">취소하기</button>
                      </span>
                    ) : (
                      <button type="button" disabled={!bookingOpen || left === 0 || atLimit || bookedProgramIds.has(open.id)} onClick={() => book(s.id)} className="btn !px-5 !py-2.5 !text-[14px]">
                        {!bookingOpen ? `${PROGRAM_BOOKING_LABEL} 오픈` : left === 0 ? '마감' : bookedProgramIds.has(open.id) ? '다른 회차 예약됨' : atLimit ? '하루 3개 초과' : '예약하기'}
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </BottomSheet>
      <QrTicket booking={ticket} onClose={() => setTicket(null)} onCancel={cancel} />
    </div>
  )
}
