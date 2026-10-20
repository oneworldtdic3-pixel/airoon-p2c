import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useApp } from '../../data/AppProvider'
import { toMessage } from '../../data/errors'
import { priceLabel, useCampEvent, useZoneSummary, type ZoneSummary } from '../../data/camp'
import { openExternal } from '../../lib/external'
import { BottomSheet } from '../ui'
import { TICKETS } from './TicketFab'
import PetNotice from '../camp/PetNotice'

// 홈 — 캠핑존 A/B/C 비교 카드. 숫자(남은 자리·최근 예약)는 관리자 > 캠핑 > 구역·설정에서 고친다.
export default function ZoneCards() {
  const ev = useCampEvent()
  const zs = useZoneSummary(ev.data?.id)
  const { user } = useApp()
  const [alertFor, setAlertFor] = useState<ZoneSummary | null>(null)
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const list = zs.data ?? []
  if (!ev.data || !list.length) return null

  const request = async () => {
    if (!alertFor) return
    setBusy(true)
    const { error } = await supabase.rpc('request_vacancy_alert', { p_zone: alertFor.id, p_phone: phone })
    setBusy(false)
    if (error) return setMsg(toMessage(error))
    setMsg('신청했습니다. 빈자리가 생기면 이 번호로 안내해 드려요'); setTimeout(() => { setAlertFor(null); setMsg(null) }, 1600)
  }
  const buy = (z: ZoneSummary) => openExternal(z.smartstore_url || TICKETS.camp.url)

  return (
    <section className="px-5 pt-12">
      <div className="mb-1 flex items-end justify-between">
        <h2 className="text-[21px] font-extrabold tracking-[-0.02em]">캠핑존 고르기</h2>
        <Link to="/reserve?tab=camp" className="text-[13px] font-bold text-deep">사이트 번호 선택 ›</Link>
      </div>
      <p className="mb-4 text-[13px] text-sub">{priceLabel(ev.data)} · 예매 후 앱에서 사이트 번호를 고릅니다</p>
      <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1">
        {list.map((z) => {
          const soldOut = z.sold_out || z.remaining <= 0
          return (
            <article key={z.id} className="w-[78%] shrink-0 snap-start overflow-hidden rounded-card border border-line bg-white">
              <div className="relative aspect-[16/10] bg-mint">
                {z.photo_url ? <img src={z.photo_url} alt={`${z.code} ${z.name}`} loading="lazy" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[42px] font-black text-deep/30">{z.code}</div>}
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11.5px] font-black text-ink">{z.code} 구역</span>
                {soldOut ? <span className="absolute right-3 top-3 rounded-full bg-ink px-2.5 py-1 text-[11.5px] font-black text-white">매진</span>
                  : <span className="tnum absolute right-3 top-3 rounded-full bg-[#FF5A36] px-2.5 py-1 text-[11.5px] font-black text-white">남은 자리 {z.remaining}동</span>}
              </div>
              <div className="p-4">
                <h3 className="text-[17px] font-extrabold leading-tight">{z.name}</h3>
                <p className="mt-0.5 text-[12.5px] text-sub">{z.subtitle}</p>
                <ul className="mt-3 space-y-1 text-[12.5px]">
                  <li className="flex justify-between"><span className="text-sub">가격</span><b>{priceLabel(ev.data)}</b></li>
                  <li className="flex justify-between"><span className="text-sub">바닥</span><b>{z.ground || '안내 예정'}</b></li>
                  <li className="flex justify-between"><span className="text-sub">화장실 · 샤워실</span><b>{z.toilet_distance || z.shower_distance ? `${z.toilet_distance || '-'} · ${z.shower_distance || '-'}` : '안내 예정'}</b></li>
                  <li className="flex justify-between"><span className="text-sub">반려견</span><b>{z.pet_allowed ? '동반 가능 🐾' : '불가'}</b></li>
                </ul>
                <p className="tnum mt-3 text-[12px] text-sub">전체 {z.capacity}동{z.recent_bookings ? ` · 최근 ${z.recent_bookings}팀 예약` : ''}</p>
                {soldOut
                  ? <button type="button" onClick={() => { setAlertFor(z); setPhone(user?.phone ?? '') }} className="btn-ghost mt-3 w-full">빈자리 알림 신청</button>
                  : <button type="button" onClick={() => buy(z)} className="btn mt-3 w-full">캠핑존 예매하기</button>}
              </div>
            </article>
          )
        })}
      </div>
      {list.some((z) => z.pet_allowed) && <PetNotice className="mt-3" />}

      <BottomSheet open={!!alertFor} onClose={() => setAlertFor(null)} title="빈자리 알림 신청">
        {alertFor && (
          <div>
            <p className="text-[13.5px] leading-relaxed text-sub"><b className="text-ink">{alertFor.code} {alertFor.name}</b>에 취소로 빈자리가 생기면 문자·알림톡으로 알려 드립니다. 번호는 이 안내에만 쓰고 행사 뒤 삭제합니다.</p>
            <input className="field tnum mt-4" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-0000-0000" autoComplete="tel" />
            {msg && <p className="mt-2 text-[13px] font-bold text-deep">{msg}</p>}
            <button type="button" disabled={busy} onClick={() => void request()} className="btn mt-4 w-full">{busy ? '신청 중…' : '알림 신청'}</button>
          </div>
        )}
      </BottomSheet>
    </section>
  )
}
