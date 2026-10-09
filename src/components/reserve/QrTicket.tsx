import { QRCodeSVG } from 'qrcode.react'
import { useApp } from '../../mock/store'
import { programs } from '../../mock/data'
import { fmtDay, fmtTime } from '../../lib/format'
import { BottomSheet } from '../ui'
import type { Booking } from '../../mock/types'

export default function QrTicket({ booking, onClose }: { booking: Booking | null; onClose: () => void }) {
  const { sessions } = useApp()
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
                <span className="tnum text-[32px] font-extrabold leading-none">{fmtTime(s.starts_at)}</span>
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
        </div>
      )}
    </BottomSheet>
  )
}
