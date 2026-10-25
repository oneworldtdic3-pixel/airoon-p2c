import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useApp } from '../../data/AppProvider'
import { toMessage } from '../../data/errors'
import { PROGRAM_BOOKING_LABEL, programBookingOpen } from '../../data/constants'
import { extraFeeLines, priceLabel, siteNumberKey, useCampBoard, useCampEvent, useMyAssignments, type MyAssignment, type Site } from '../../data/camp'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { naverConversion } from '../../lib/naverWcs'
import SiteMap, { SiteLegend, siteState } from '../camp/SiteMap'
import PetNotice from '../camp/PetNotice'
import Icon from '../ui/Icon'

type Order = { order_id: string; zone_id: string | null; qty: number; used: number; buyer_name: string }
type Step = 'order' | 'site' | 'people' | 'car' | 'members' | 'confirm' | 'done'
const STEPS: { key: Step; label: string }[] = [{ key: 'order', label: '예매 확인' }, { key: 'site', label: '사이트' }, { key: 'people', label: '인원' }, { key: 'car', label: '차량' }, { key: 'members', label: '동반자' }, { key: 'confirm', label: '동의' }]

function Check({ on, onChange, children }: { on: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 py-2">
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${on ? 'border-transparent bg-brand-grad text-onbrand' : 'border-gray-300 bg-white'}`}>{on && <Icon name="check" size={13} />}</span>
      <span className="text-[13.5px] leading-snug">{children}</span>
    </label>
  )
}
function Counter({ label, hint, value, min, onChange }: { label: string; hint?: string; value: number; min: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div><p className="text-[14.5px] font-bold">{label}</p>{hint && <p className="text-[12px] text-sub">{hint}</p>}</div>
      <div className="flex items-center gap-3">
        <button type="button" aria-label={`${label} 줄이기`} disabled={value <= min} onClick={() => onChange(value - 1)} className="h-9 w-9 rounded-full border border-line text-[18px] font-bold disabled:opacity-30">−</button>
        <span className="tnum w-6 text-center text-[17px] font-extrabold">{value}</span>
        <button type="button" aria-label={`${label} 늘리기`} disabled={value >= 10} onClick={() => onChange(value + 1)} className="h-9 w-9 rounded-full border border-line text-[18px] font-bold disabled:opacity-30">+</button>
      </div>
    </div>
  )
}

export default function CampSites({ toast }: { toast: (m: string) => void }) {
  const { user, parking } = useApp()
  const requireAuth = useRequireAuth()
  const qc = useQueryClient()
  const ev = useCampEvent()
  const event = ev.data
  const board = useCampBoard(event?.id, { live: true })
  const mine = useMyAssignments(event?.id, user?.id ?? null)
  const bookingOpen = programBookingOpen() || !!user?.is_admin

  const [step, setStep] = useState<Step>('order')
  const [orderNo, setOrderNo] = useState('')
  const [last4, setLast4] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [sel, setSel] = useState<string[]>([])
  const [together, setTogether] = useState(true)
  const [adults, setAdults] = useState(2)
  const [kids, setKids] = useState(0)
  const [infants, setInfants] = useState(0)
  const [car, setCar] = useState(parking?.car_number ?? '')
  const [noCar, setNoCar] = useState(false)
  const [pzone, setPzone] = useState<'P1' | 'P2'>(parking?.zone ?? 'P1')
  const [members, setMembers] = useState<{ name: string; phone: string }[]>([])
  const [agree, setAgree] = useState({ terms: false, privacy: false, promises: false })
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState<{ qr_codes: string[]; group_key: string | null } | null>(null)
  const mapAnchor = useRef<HTMLDivElement>(null)
  const [mapOff, setMapOff] = useState(false)
  useEffect(() => { if (parking) { setCar(parking.car_number); setPzone(parking.zone) } }, [parking])
  // 배치도가 화면 위로 지나가면 작은 창으로 띄운다
  useEffect(() => {
    const el = mapAnchor.current
    if (!el || step !== 'site') return
    const io = new IntersectionObserver(([e]) => setMapOff(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [step, board.data])

  const zones = board.data?.zones ?? []
  const sites = board.data?.sites ?? []
  const occ = board.data?.occ ?? new Map()
  const zone = zones.find((z) => z.id === order?.zone_id) ?? null
  const zoneSites = useMemo(() => sites.filter((s) => !zone || s.zone_id === zone.id).sort((a, b) => siteNumberKey(a.number).localeCompare(siteNumberKey(b.number))), [sites, zone])
  const map = board.data?.maps.find((m) => zoneSites.some((s) => s.map_id === m.id)) ?? board.data?.maps[0]
  const need = order ? Math.max(order.qty - order.used, 1) : 1
  const canTogether = need > 1

  const verify = async () => {
    if (!event) return
    if (!orderNo.trim() || last4.replace(/\D/g, '').length < 4) return toast('주문번호와 휴대폰 뒷 4자리를 입력해 주세요')
    setBusy(true)
    const { data, error } = await supabase.rpc('verify_order', { p_event: event.id, p_order_no: orderNo.trim(), p_last4: last4 })
    setBusy(false)
    if (error) return toast(toMessage(error))
    const o = data as Order
    if (o.used >= o.qty) return toast('이 주문번호로는 이미 사이트가 모두 배정되었습니다')
    setOrder(o); setSel([]); setStep('site')
  }
  const pick = (s: Site) => {
    if (sel.includes(s.id)) return setSel(sel.filter((x) => x !== s.id))
    if (together && canTogether) {
      // 옆자리로 묶기: 고른 번호부터 연속된 빈 사이트를 need 개 채운다
      const i = zoneSites.findIndex((x) => x.id === s.id)
      const run: string[] = []
      for (let k = i; k < zoneSites.length && run.length < need; k++) {
        if (siteState(zoneSites[k], occ, zone?.id) === 'free') run.push(zoneSites[k].id); else break
      }
      if (run.length < need) toast(`이어진 빈 자리가 ${run.length}곳뿐이에요. 다른 곳을 고르거나 '옆자리 묶기'를 끄고 따로 고르세요`)
      setSel(run)
      return
    }
    setSel(sel.length >= need ? [...sel.slice(1), s.id] : [...sel, s.id])
  }
  const submit = () => requireAuth(async () => {
    if (!event || !order) return
    if (!agree.terms || !agree.privacy || !agree.promises) return toast('필수 동의 항목에 모두 체크해 주세요')
    if (!noCar && car.trim() && !/^\d{2,3}[가-힣]\s?\d{4}$/.test(car.trim())) return toast('차량번호 형식을 확인해 주세요 (예: 123가 4567)')
    setBusy(true)
    const { data, error } = await supabase.rpc('assign_site', {
      p_event: event.id, p_order_no: orderNo.trim(), p_last4: last4, p_site_ids: sel,
      p_adults: adults, p_kids: kids, p_infants: infants,
      p_car: noCar ? '' : car.trim(), p_parking_zone: pzone,
      p_members: members.filter((m) => m.name.trim()), p_consents: { terms: 'true', privacy: 'true', promises: 'true' },
    })
    setBusy(false)
    if (error) { const msg = toMessage(error); toast(msg); if (/다른 분이 선택|선택할 수 없는/.test(msg)) { setSel([]); setStep('site') } return }
    setDone(data as { qr_codes: string[]; group_key: string | null }); setStep('done')
    naverConversion('lead')
    void qc.invalidateQueries({ queryKey: ['my-assignments'] }); void qc.invalidateQueries({ queryKey: ['mine', user?.id] }); void qc.invalidateQueries({ queryKey: ['camp-board', event.id] })
  })

  if (ev.isLoading || !event) return <p className="py-6 text-[13px] text-sub">{ev.isLoading ? '불러오는 중' : '진행 중인 행사가 없습니다'}</p>

  // 11/1 전: 안내만
  if (!bookingOpen) return (
    <div className="space-y-4">
      <div className="rounded-tile bg-sun/30 px-4 py-4">
        <p className="text-[15px] font-extrabold">캠핑 사이트 선택은 {PROGRAM_BOOKING_LABEL} 0시에 열립니다</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-sub">스마트스토어에서 캠핑존을 예매한 분은 주문번호로 원하는 사이트 번호를 고를 수 있어요. 오픈되면 휴대폰 알림으로 바로 알려 드립니다.</p>
        <Link to="/notifications" className="btn mt-4 w-full">11/1 오픈 · 알림 신청</Link>
      </div>
      <ZoneInfo />
    </div>
  )

  // 완료
  if (step === 'done' && done) {
    const my = mine.data ?? []
    return (
      <div className="space-y-4">
        <div className="rounded-tile bg-mint p-5 text-center">
          <p className="eyebrow text-deep">배정 완료</p>
          <p className="mt-1 text-[22px] font-extrabold">{sel.map((id) => sites.find((s) => s.id === id)?.number).filter(Boolean).join(' · ')}</p>
          <p className="mt-1 text-[13px] text-sub">{zone?.code} {zone?.name}{done.group_key ? ` · 일행 ${done.group_key}` : ''}</p>
        </div>
        <MyAssignmentsList list={my.length ? my : []} fallbackQr={done.qr_codes} />
        <button type="button" onClick={() => { setStep('order'); setOrder(null); setSel([]); setDone(null) }} className="btn-ghost w-full">다른 예매번호로 배정하기</button>
      </div>
    )
  }

  const stepIdx = STEPS.findIndex((s) => s.key === step)
  return (
    <div className="pb-24">
      {/* 내 배정 */}
      {step === 'order' && (mine.data?.length ?? 0) > 0 && (
        <section className="mb-6"><p className="eyebrow mb-2 text-deep">내 사이트</p><MyAssignmentsList list={mine.data ?? []} /></section>
      )}

      {/* 진행 단계 */}
      <ol className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto">
        {STEPS.map((s, i) => <li key={s.key} className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold ${i === stepIdx ? 'bg-ink text-white' : i < stepIdx ? 'bg-mint text-deep' : 'bg-gray-100 text-gray-500'}`}>{i + 1} {s.label}</li>)}
      </ol>

      {step === 'order' && (
        <div className="space-y-4">
          <div className="rounded-tile bg-mint/60 px-4 py-3.5 text-[13px] leading-relaxed">
            <p className="font-bold">네이버 스마트스토어에서 예매한 캠핑존의 사이트 번호를 고릅니다.</p>
            <p className="mt-1 text-sub">주문번호는 네이버 주문내역에서 확인할 수 있어요. {priceLabel(event)}</p>
          </div>
          <label className="block"><span className="eyebrow mb-2 block">주문번호</span><input className="field tnum" inputMode="numeric" value={orderNo} onChange={(e) => setOrderNo(e.target.value)} placeholder="2026…" autoComplete="off" /></label>
          <label className="block"><span className="eyebrow mb-2 block">휴대폰 뒷 4자리 <span className="font-normal normal-case tracking-normal text-sub">(주문할 때 쓴 번호)</span></span><input className="field tnum" inputMode="numeric" maxLength={4} value={last4} onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="1234" /></label>
          <button type="button" disabled={busy} onClick={() => void verify()} className="btn w-full">{busy ? '확인 중…' : '예매 확인'}</button>
          <ZoneInfo />
        </div>
      )}

      {step === 'site' && order && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-bold">{zone ? `${zone.code} ${zone.name}` : '구역'} · {need}사이트 선택{order.buyer_name ? ` · ${order.buyer_name}님` : ''}</p>
            <button type="button" onClick={() => setStep('order')} className="text-[12px] text-sub underline">다른 주문</button>
          </div>
          {canTogether && (
            <label className="flex items-center justify-between rounded-tile border border-line px-4 py-3 text-[13.5px] font-bold">일행 옆자리로 묶기<span className="text-[12px] font-normal text-sub">한 곳을 고르면 이어진 {need}자리를 함께 골라요</span><input type="checkbox" className="h-5 w-5 accent-deep" checked={together} onChange={(e) => { setTogether(e.target.checked); setSel([]) }} /></label>
          )}
          <div ref={mapAnchor}>
            {map ? <SiteMap map={map} sites={zoneSites} occ={occ} zoneId={zone?.id} selected={sel} onSelect={pick} /> : <p className="rounded-tile bg-gray-50 px-4 py-8 text-center text-[13px] text-sub">배치도가 아직 준비 중입니다. 아래 번호 목록에서 고를 수 있어요.</p>}
          </div>
          <SiteLegend />
          {/* 떠 있는 미니맵 */}
          {map && mapOff && (
            <div className="fixed right-3 top-[calc(env(safe-area-inset-top)+8px)] z-30 w-[44%] rounded-tile bg-white p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.25)] ring-1 ring-line">
              <SiteMap map={map} sites={zoneSites} occ={occ} zoneId={zone?.id} selected={sel} onSelect={pick} compact />
              <p className="tnum mt-1 text-center text-[12px] font-bold text-deep">{sel.length ? sel.map((id) => sites.find((s) => s.id === id)?.number).join(', ') : '사이트를 골라 주세요'}</p>
            </div>
          )}
          <p className="eyebrow">사이트 번호</p>
          <ul className="grid grid-cols-3 gap-2">
            {zoneSites.map((s) => {
              const st = siteState(s, occ, zone?.id); const on = sel.includes(s.id); const dis = st !== 'free'
              return (
                <li key={s.id}>
                  <button type="button" disabled={dis} aria-pressed={on} onClick={() => pick(s)} className={`w-full rounded-xl border px-2 py-2 text-left transition ${on ? 'border-[#FF5A36] bg-[#FF5A36]/10' : dis ? 'border-gray-100 bg-gray-50 text-gray-500' : 'border-line bg-white active:scale-95'}`}>
                    <span className="tnum block text-[14px] font-extrabold">{s.number}</span>
                    <span className="block text-[12px] text-sub">{s.width_m && s.depth_m ? `${s.width_m}×${s.depth_m}m` : '크기 미정'}{s.ground ? ` · ${s.ground}` : ''}{s.pet_allowed && <> · <Icon name="paw" size={12} className="inline align-[-2px]" /><span className="sr-only">반려견 가능</span></>}</span>
                    <span className="block text-[12px] font-bold">{st === 'free' ? '빈 자리' : st === 'blocked' ? '선택 불가' : '예약됨'}</span>
                  </button>
                </li>
              )
            })}
            {!zoneSites.length && <li className="col-span-3 py-6 text-center text-[13px] text-sub">이 구역의 사이트가 아직 등록되지 않았습니다</li>}
          </ul>
        </div>
      )}

      {step === 'people' && (
        <div>
          <p className="mb-1 text-[14px] font-bold">{priceLabel(event)}</p>
          {extraFeeLines(event).length ? <p className="text-[12.5px] text-sub">추가 인원 요금: {extraFeeLines(event).join(' · ')}. 추가 인원은 스마트스토어에서 함께 구매한 수량 기준입니다.</p> : <p className="text-[12.5px] text-sub">추가 인원 요금은 스마트스토어 상품 페이지의 옵션 가격을 따릅니다.</p>}
          <div className="mt-3 divide-y hairline rounded-tile border border-line px-4">
            <Counter label="성인" hint="1사이트 1~2인 포함" value={adults} min={1} onChange={setAdults} />
            <Counter label="소인" hint="36개월~미취학" value={kids} min={0} onChange={setKids} />
            <Counter label="유아" hint="36개월 미만 · 무료" value={infants} min={0} onChange={setInfants} />
          </div>
        </div>
      )}

      {step === 'car' && (
        <div className="space-y-4">
          <div className="rounded-tile bg-sun/30 px-4 py-3 text-[13px] leading-relaxed"><b>주차 무료 · 사전등록제(1팀 1대)</b> · 미등록 차량은 주차장에 들어올 수 없습니다. 여기서 등록하면 예약 탭 '주차장'에도 같은 내용으로 등록됩니다.</div>
          <label className="flex items-center gap-3 text-[13.5px] font-bold"><input type="checkbox" className="h-5 w-5 accent-deep" checked={noCar} onChange={(e) => setNoCar(e.target.checked)} />차량 없이 옵니다</label>
          {!noCar && (
            <>
              <label className="block"><span className="eyebrow mb-2 block">차량번호</span><input className="field tnum text-[18px] font-bold tracking-wider" value={car} onChange={(e) => setCar(e.target.value)} placeholder="123가 4567" autoComplete="off" /></label>
              <div className="grid grid-cols-2 gap-2">
                {([['P1', '제1주차장', '일주문 입구까지 걸어서'], ['P2', '제2주차장', '도보 동선은 행사장 약도 참고']] as const).map(([id, name, desc]) => (
                  <button key={id} type="button" aria-pressed={pzone === id} onClick={() => setPzone(id)} className={`rounded-tile border p-3.5 text-left ${pzone === id ? 'border-deep bg-brand-grad text-onbrand' : 'border-line bg-white'}`}><span className="block text-[15px] font-extrabold">{name}</span><span className={`block text-[12px] ${pzone === id ? 'text-onbrand/80' : 'text-sub'}`}>도보 이동 · {desc}</span></button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {step === 'members' && (
        <div className="space-y-3">
          <p className="text-[13px] leading-relaxed text-sub">함께 오는 분의 이름을 적어 주세요. 각자 QR 팔찌가 발급됩니다. 연락처는 선택이며, 현장에서 일행을 찾을 때만 씁니다.</p>
          <p className="text-[12px] text-sub">대표: {order?.buyer_name || user?.nickname || '본인'} (자동)</p>
          {members.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className="field flex-1 !py-2.5" value={m.name} onChange={(e) => setMembers(members.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} placeholder="이름" maxLength={30} />
              <input className="field tnum flex-1 !py-2.5" inputMode="tel" value={m.phone} onChange={(e) => setMembers(members.map((x, j) => (j === i ? { ...x, phone: e.target.value } : x)))} placeholder="연락처 (선택)" />
              <button type="button" aria-label="삭제" onClick={() => setMembers(members.filter((_, j) => j !== i))} className="p-1 text-gray-500"><Icon name="close" size={16} /></button>
            </div>
          ))}
          <button type="button" onClick={() => setMembers([...members, { name: '', phone: '' }])} disabled={members.length >= 9} className="btn-ghost w-full">+ 동반자 추가</button>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-5">
          <section className="rounded-tile border border-line p-4 text-[13.5px]">
            <p className="font-extrabold">{sel.map((id) => sites.find((s) => s.id === id)?.number).filter(Boolean).join(' · ')} <span className="font-normal text-sub">· {zone?.code} {zone?.name}</span></p>
            <p className="mt-1 text-sub">성인 {adults}{kids ? ` · 소인 ${kids}` : ''}{infants ? ` · 유아 ${infants}` : ''}{noCar ? ' · 차량 없음' : car ? ` · ${car}` : ''}{members.filter((m) => m.name.trim()).length ? ` · 동반 ${members.filter((m) => m.name.trim()).length}명` : ''}</p>
          </section>
          <section>
            <p className="eyebrow mb-2">환불 규정</p>
            {event.refund_note && <p className="mb-2 text-[13px] font-bold leading-snug">{event.refund_note}</p>}
            {event.refund_rules.length > 0 && (
              <table className="w-full text-[13px]"><tbody>
                {event.refund_rules.map((r, i) => <tr key={i} className="border-t hairline"><td className="py-2">{r.label}</td><td className="tnum py-2 text-right font-bold">{r.rate}% 환불{r.note ? <span className="ml-1 font-normal text-sub">· {r.note}</span> : ''}</td></tr>)}
              </tbody></table>
            )}
          </section>
          <section>
            <p className="eyebrow mb-1">필수 동의</p>
            <Check on={agree.terms} onChange={(v) => setAgree({ ...agree, terms: v })}><b>[필수]</b> 유의사항과 위 환불 규정을 확인했습니다 (<Link to="/terms" className="underline">이용약관</Link>)</Check>
            <Check on={agree.privacy} onChange={(v) => setAgree({ ...agree, privacy: v })}><b>[필수]</b> 개인정보 수집·이용에 동의합니다 — 주문번호, 연락처 뒷자리, 차량번호, <b>동반자 이름·연락처</b>를 사이트 배정·입장 확인·주차 등록에 쓰며 행사 종료 후 30일 안에 삭제합니다. 동반자 정보는 본인 동의를 받고 입력해 주세요 (<Link to="/privacy" className="underline">개인정보처리방침</Link>)</Check>
            <Check on={agree.promises} onChange={(v) => setAgree({ ...agree, promises: v })}><b>[필수]</b> 산사캠프 세 가지 약속을 지키겠습니다</Check>
            <ul className="ml-8 space-y-1.5 text-[12.5px] text-sub">
              {event.consents.map((c) => <li key={c.key}><b className="text-ink">{c.title}</b> — {c.body}</li>)}
            </ul>
          </section>
        </div>
      )}

      {/* 하단 고정 버튼 */}
      <div className="fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-[430px] gap-2 border-t hairline bg-white/95 px-5 py-3 backdrop-blur">
        {stepIdx > 0 && <button type="button" onClick={() => setStep(STEPS[stepIdx - 1].key)} className="btn-ghost !px-4">이전</button>}
        {step === 'order' ? null : step === 'confirm' ? (
          <button type="button" disabled={busy || !agree.terms || !agree.privacy || !agree.promises} onClick={submit} className="btn flex-1">{busy ? '배정 중…' : '선택 완료'}</button>
        ) : (
          <button type="button" disabled={step === 'site' && sel.length < need} onClick={() => setStep(STEPS[stepIdx + 1].key)} className="btn flex-1">{step === 'site' ? (sel.length < need ? `${need}곳을 골라 주세요 (${sel.length}/${need})` : '다음') : '다음'}</button>
        )}
      </div>
    </div>
  )

  function ZoneInfo() {
    if (!zones.length) return null
    return (
      <div className="space-y-3">
        <ul className="space-y-2">
          {zones.map((z) => (
            <li key={z.id} className="flex items-center gap-3 rounded-tile border border-line px-4 py-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1F7A8C] text-[14px] font-black text-white">{z.code}</span>
              <span className="min-w-0 flex-1"><span className="block text-[14px] font-bold">{z.name} <span className="tnum font-normal text-sub">· {z.capacity}동</span></span><span className="block text-[12px] text-sub">{z.subtitle}{z.pet_allowed ? ' · 반려견 가능' : ''}{z.ground ? ` · ${z.ground}` : ''}</span></span>
            </li>
          ))}
        </ul>
        {zones.some((z) => z.pet_allowed) && <PetNotice />}
      </div>
    )
  }
}

/** 내 배정 목록 — 사이트 번호 + 동반자별 QR */
function MyAssignmentsList({ list, fallbackQr = [] }: { list: MyAssignment[]; fallbackQr?: string[] }) {
  const [open, setOpen] = useState<string | null>(null)
  if (!list.length) return fallbackQr.length ? <div className="flex flex-col items-center rounded-tile border border-line p-4"><QRCodeSVG value={fallbackQr[0]} size={160} fgColor="#1F2937" /><p className="tnum mt-2 text-[12px] tracking-[0.2em] text-sub">{fallbackQr[0]}</p></div> : null
  return (
    <ul className="space-y-2">
      {list.map((a) => (
        <li key={a.id} className="rounded-tile border border-line p-4">
          <div className="flex items-center justify-between">
            <p className="text-[16px] font-extrabold">{a.site_number} <span className="text-[12.5px] font-normal text-sub">· {a.zone_code} {a.zone_name}</span></p>
            <span className="tnum text-[12px] text-sub">성인 {a.adults}{a.kids ? ` 소인 ${a.kids}` : ''}{a.infants ? ` 유아 ${a.infants}` : ''}</span>
          </div>
          {a.car_number && <p className="tnum mt-1 text-[12.5px] text-sub">차량 {a.car_number}</p>}
          <ul className="mt-3 divide-y hairline">
            {a.members.map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => setOpen(open === m.id ? null : m.id)} className="flex w-full items-center justify-between py-2.5 text-left">
                  <span className="text-[13.5px] font-bold">{m.name}{m.is_lead && <span className="ml-1 rounded bg-mint px-1.5 py-0.5 text-[12px] text-deep">대표</span>}</span>
                  <span className="flex items-center gap-1 text-[12px] font-bold text-deep"><Icon name="qr" size={14} />QR 팔찌</span>
                </button>
                {open === m.id && <div className="flex flex-col items-center pb-3"><QRCodeSVG value={m.qr_code} size={168} fgColor="#1F2937" /><p className="tnum mt-2 text-[12px] tracking-[0.2em] text-sub">{m.qr_code}</p></div>}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
