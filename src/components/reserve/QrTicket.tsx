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
    <BottomSheet open={!!booking} onClose={onClose} title="예약 QR">
      {booking && s && p && (
        <div className="flex flex-col items-center pb-2 text-center">
          <div className="rounded-card bg-mint p-5">
            <div className="rounded-2xl bg-white p-4"><QRCodeSVG value={booking.qr_code} size={180} fgColor="#0B6B40" /></div>
          </div>
          <p className="mt-4 text-[18px] font-extrabold">{p.emoji} {p.title}</p>
          <p className="mt-1 text-[14px] text-sub">{fmtDay(s.starts_at)} {fmtTime(s.starts_at)} · {p.location}</p>
          <p className="mt-3 text-[12px] tracking-widest text-gray-400">{booking.qr_code}</p>
          <p className="mt-4 rounded-2xl bg-mint px-4 py-3 text-[12px] text-deep">현장 부스에서 이 QR을 보여주세요. 입장은 QR 팔찌로도 가능해요.</p>
        </div>
      )}
    </BottomSheet>
  )
}
