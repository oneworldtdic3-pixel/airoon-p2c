import { QRCodeSVG } from 'qrcode.react'
import { useApp } from '../../data/AppProvider'
import { fmtDay, fmtTime } from '../../lib/format'
import { PROGRAM_TIME_TBD } from '../../data/constants'
import { BottomSheet } from '../ui'
import type { Booking } from '../../data/types'

export default function QrTicket({ booking, onClose, onCancel }: { booking: Booking | null; onClose: () => void; onCancel?: (b: Booking, title: string, when: string) => Promise<void> }) {
  const { programs, sessions } = useApp()
  const s = booking && sessions.find((x) => x.id === booking.session_id)
  const p = s && programs.find((x) => x.id === s.program_id)
  return (
    <BottomSheet open={!!booking} onClose={onClose} title="입장 QR">
      {booking && s && p && (
        <div className="pb-2">
          {/* 티켓: 상단 정보 / 절취선 / QR */}
          <div className="rounded-tile bg-mint">
            <div className="px-5 pb-4 pt-5">
              <p className="eyebrow text-deep">{fmtDay(s.starts_at)}</p>
              <p className="mt-1 flex items-baseline gap-2">
                <span className={`tnum font-extrabold leading-none ${PROGRAM_TIME_TBD ? 'text-[20px] text-sub' : 'text-[32px]'}`}>{PROGRAM_TIME_TBD ? '시간 협의중' : fmtTime(s.starts_at)}</span>
                <span className="text-[16px] font-extrabold">{p.title}</span>
              </p>
              <p className="mt-1.5 text-[13px] text-sub">{p.location}</p>
            </div>
            <div className="relative flex items-center">
              <span className="-ml-3 h-6 w-6 rounded-full bg-white" />
              <span className="flex-1 border-t border-dashed border-deep/30" />
              <span className="-mr-3 h-6 w-6 rounded-full bg-white" />
            </div>
            <div className="flex flex-col items-center px-5 pb-6 pt-4">
              <div className="rounded-2xl bg-white p-4"><QRCodeSVG value={booking.qr_code} size={168} fgColor="#1F2937" /></div>
              <p className="tnum mt-3 text-[12px] tracking-[0.2em] text-sub">{booking.qr_code}</p>
            </div>
          </div>
          <p className="mt-4 text-center text-[12.5px] text-sub">현장에서 이 화면 또는 QR 팔찌를 보여주세요.</p>
          <button
            type="button"
            onClick={async () => {
              if (!window.confirm(`${p.title} ${fmtDay(s.starts_at)} 예약을 취소할까요?`)) return
              await onCancel?.(booking, p.title, `${fmtDay(s.starts_at)}${PROGRAM_TIME_TBD ? '' : ' ' + fmtTime(s.starts_at)}`)
              onClose()
            }}
            className="mt-3 w-full py-3 text-center text-[13px] font-semibold text-sub underline underline-offset-2"
          >
            참여가 어려우면 예약 취소하기
          </button>
        </div>
      )}
    </BottomSheet>
  )
}
