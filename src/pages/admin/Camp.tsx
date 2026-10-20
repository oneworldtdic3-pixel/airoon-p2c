import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useApp } from '../../data/AppProvider'
import { toMessage } from '../../data/errors'
import { BottomSheet, Chip, Segmented, Toggle } from '../../components/ui'
import SiteMap, { SiteLegend } from '../../components/camp/SiteMap'
import { siteNumberKey, useCampBoard, useCampEvent, type CampEvent, type EventMap, type Site, type Zone } from '../../data/camp'

type Sub = 'map' | 'orders' | 'assign' | 'settings' | 'alerts'
const field = 'field'

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[13px] font-bold">{label}{hint && <span className="ml-1 font-normal text-sub">{hint}</span>}</span>
      {children}
    </label>
  )
}

export default function Camp({ toast }: { toast: (m: string) => void }) {
  const ev = useCampEvent()
  const [sub, setSub] = useState<Sub>('map')
  if (ev.isLoading) return <p className="py-6 text-[13px] text-sub">불러오는 중</p>
  if (!ev.data) return <CreateEvent toast={toast} />
  const e = ev.data
  return (
    <div>
      <p className="mb-2 text-[12px] text-sub">{e.title} · {e.starts_at.slice(0, 10)} {e.checkin_time} ~ {e.ends_at.slice(0, 10)} {e.checkout_time}</p>
      <Segmented<Sub> value={sub} onChange={setSub} options={[{ value: 'map', label: '배치도' }, { value: 'assign', label: '배정 현황' }, { value: 'orders', label: '예매번호' }, { value: 'settings', label: '구역·설정' }, { value: 'alerts', label: '빈자리 알림' }]} />
      <div className="pt-4">
        {sub === 'map' && <MapEditor event={e} toast={toast} />}
        {sub === 'assign' && <Assignments event={e} toast={toast} />}
        {sub === 'orders' && <Orders event={e} toast={toast} />}
        {sub === 'settings' && <Settings event={e} toast={toast} />}
        {sub === 'alerts' && <Alerts event={e} toast={toast} />}
      </div>
    </div>
  )
}

// ---- 행사 만들기 (아직 없을 때) ----------------------------------------------------------------------
function CreateEvent({ toast }: { toast: (m: string) => void }) {
  const qc = useQueryClient()
  const [f, setF] = useState({ temple_name: '', edition: 1, starts: '', ends: '', checkin: '14:00', checkout: '11:00' })
  const save = async () => {
    if (!f.temple_name || !f.starts || !f.ends) return toast('사찰명과 기간을 입력해 주세요')
    const slug = `${f.temple_name.replace(/\s/g, '').toLowerCase()}-${f.edition}`
    const { error } = await supabase.from('events').insert({ slug, temple_name: f.temple_name, edition: f.edition, title: `제${f.edition}회 산사캠프 ${f.temple_name}`, starts_at: `${f.starts}T${f.checkin}:00+09:00`, ends_at: `${f.ends}T${f.checkout}:00+09:00`, checkin_time: f.checkin, checkout_time: f.checkout })
    if (error) return toast(toMessage(error))
    await qc.invalidateQueries({ queryKey: ['camp-event'] })
    toast('행사를 만들었습니다')
  }
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-sub">진행할 행사가 없습니다. 사찰명과 기간을 넣어 행사를 만들어 주세요.</p>
      <Field label="사찰명"><input className={field} value={f.temple_name} onChange={(e) => setF({ ...f, temple_name: e.target.value })} placeholder="쌍계사" /></Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="회차"><input type="number" className={`${field} tnum`} value={f.edition} onChange={(e) => setF({ ...f, edition: Number(e.target.value) || 1 })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="시작일"><input type="date" className={`${field} tnum`} value={f.starts} onChange={(e) => setF({ ...f, starts: e.target.value })} /></Field>
        <Field label="종료일"><input type="date" className={`${field} tnum`} value={f.ends} onChange={(e) => setF({ ...f, ends: e.target.value })} /></Field>
        <Field label="입실"><input type="time" className={`${field} tnum`} value={f.checkin} onChange={(e) => setF({ ...f, checkin: e.target.value })} /></Field>
        <Field label="퇴실"><input type="time" className={`${field} tnum`} value={f.checkout} onChange={(e) => setF({ ...f, checkout: e.target.value })} /></Field>
      </div>
      <button type="button" onClick={() => void save()} className="btn w-full">행사 만들기</button>
    </div>
  )
}

// ---- 배치도 편집기 ------------------------------------------------------------------------------------
function MapEditor({ event, toast }: { event: CampEvent; toast: (m: string) => void }) {
  const qc = useQueryClient()
  const { user } = useApp()
  const board = useCampBoard(event.id, { live: true })
  const [mapId, setMapId] = useState<string | null>(null)
  const [zoneId, setZoneId] = useState<string | null>(null)
  const [mode, setMode] = useState<'select' | 'place' | 'move'>('select')
  const [edit, setEdit] = useState<Site | null>(null)
  const [draft, setDraft] = useState<Partial<Site> & { x: number; y: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const refresh = () => qc.invalidateQueries({ queryKey: ['camp-board', event.id] })

  const maps = board.data?.maps ?? []
  const zones = board.data?.zones ?? []
  const sites = board.data?.sites ?? []
  const map = maps.find((m) => m.id === mapId) ?? maps[0]
  const zone = zones.find((z) => z.id === zoneId) ?? zones[0]
  const mapSites = sites.filter((s) => map && (s.map_id === map.id || !s.map_id))

  const upload = async (file: File) => {
    if (!user) return
    setBusy(true)
    const path = `${user.id}/maps/${Date.now()}.${(file.name.split('.').pop() || 'jpg').toLowerCase()}`
    const up = await supabase.storage.from('photos').upload(path, file, { contentType: file.type || 'image/jpeg' })
    if (up.error) { setBusy(false); return toast(toMessage(up.error)) }
    const url = supabase.storage.from('photos').getPublicUrl(path).data.publicUrl
    const dim = await new Promise<{ w: number; h: number }>((res) => { const i = new Image(); i.onload = () => res({ w: i.naturalWidth, h: i.naturalHeight }); i.onerror = () => res({ w: 0, h: 0 }); i.src = URL.createObjectURL(file) })
    const { data, error } = await supabase.from('event_maps').insert({ event_id: event.id, title: `배치도 ${maps.length + 1}`, image_url: url, width: dim.w, height: dim.h, sort: maps.length }).select('*').single()
    setBusy(false)
    if (error) return toast(toMessage(error))
    await refresh(); setMapId((data as EventMap).id)
    toast('배치도를 올렸습니다')
  }
  const replaceImage = async (file: File) => {
    if (!user || !map) return
    setBusy(true)
    const path = `${user.id}/maps/${Date.now()}.${(file.name.split('.').pop() || 'jpg').toLowerCase()}`
    const up = await supabase.storage.from('photos').upload(path, file, { contentType: file.type || 'image/jpeg' })
    if (up.error) { setBusy(false); return toast(toMessage(up.error)) }
    const url = supabase.storage.from('photos').getPublicUrl(path).data.publicUrl
    const { error } = await supabase.from('event_maps').update({ image_url: url }).eq('id', map.id)
    setBusy(false)
    if (error) return toast(toMessage(error))
    await refresh(); toast('이미지를 바꿨습니다. 사이트는 그대로이니 위치만 맞춰 주세요')
  }

  const nextNumber = () => {
    if (!zone) return ''
    const nums = sites.filter((s) => s.zone_id === zone.id).map((s) => Number(s.number.replace(/\D/g, ''))).filter((n) => !Number.isNaN(n))
    return `${zone.code}-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(2, '0')}`
  }
  const onPlace = async (x: number, y: number) => {
    if (mode === 'place') { if (!zone) return toast('구역을 먼저 선택해 주세요'); setDraft({ x, y, number: nextNumber(), zone_id: zone.id, ground: zone.ground, pet_allowed: zone.pet_allowed }) }
    else if (mode === 'move' && edit) {
      const { error } = await supabase.from('sites').update({ x, y, map_id: map?.id ?? null }).eq('id', edit.id)
      if (error) return toast(toMessage(error))
      setMode('select'); await refresh(); toast(`${edit.number} 위치를 옮겼습니다`)
    }
  }
  const saveDraft = async () => {
    if (!draft || !map) return
    if (!draft.number?.trim()) return toast('번호를 입력해 주세요')
    setBusy(true)
    const { error } = await supabase.from('sites').insert({ event_id: event.id, zone_id: draft.zone_id, map_id: map.id, number: draft.number.trim(), x: draft.x, y: draft.y, width_m: draft.width_m ?? null, depth_m: draft.depth_m ?? null, ground: draft.ground ?? '', pet_allowed: !!draft.pet_allowed, sort: sites.length })
    setBusy(false)
    if (error) return toast(toMessage(error))
    setDraft(null); await refresh()
  }
  const saveEdit = async () => {
    if (!edit) return
    setBusy(true)
    const { error } = await supabase.from('sites').update({ number: edit.number.trim(), zone_id: edit.zone_id, width_m: edit.width_m, depth_m: edit.depth_m, ground: edit.ground, pet_allowed: edit.pet_allowed, status: edit.status }).eq('id', edit.id)
    setBusy(false)
    if (error) return toast(toMessage(error))
    setEdit(null); await refresh(); toast('저장했습니다')
  }
  const removeSite = async () => {
    if (!edit || !window.confirm(`${edit.number} 사이트를 지울까요? 배정이 있으면 지울 수 없습니다.`)) return
    const { error } = await supabase.from('sites').delete().eq('id', edit.id)
    if (error) return toast(toMessage(error))
    setEdit(null); await refresh()
  }
  const bulkAdd = async () => {
    if (!zone || !map) return toast('구역과 배치도를 먼저 고르세요')
    const n = Number(window.prompt(`${zone.code} 구역에 몇 개를 한 번에 만들까요? (번호만 만들고 위치는 뒤에 찍습니다)`, '10'))
    if (!n || n < 1 || n > 200) return
    const start = Number(nextNumber().replace(/\D/g, ''))
    const rows = Array.from({ length: n }, (_, i) => ({ event_id: event.id, zone_id: zone.id, map_id: map.id, number: `${zone.code}-${String(start + i).padStart(2, '0')}`, x: 0.05 + (i % 10) * 0.09, y: 0.05 + Math.floor(i / 10) * 0.06, ground: zone.ground, pet_allowed: zone.pet_allowed, sort: sites.length + i }))
    const { error } = await supabase.from('sites').insert(rows)
    if (error) return toast(toMessage(error))
    await refresh(); toast(`${n}개를 만들었습니다. 각 점을 눌러 '위치 옮기기'로 자리를 잡아 주세요`)
  }

  return (
    <div className="space-y-4">
      <p className="text-[12px] leading-relaxed text-sub">① 배치도를 올리고 → ② 구역을 고른 뒤 → ③ '사이트 찍기'를 켜고 지도를 누르면 그 자리에 사이트가 생깁니다. 점을 누르면 번호·크기·바닥·막기를 고칠 수 있어요.</p>

      {/* 배치도 선택·업로드 */}
      <div className="flex flex-wrap items-center gap-2">
        {maps.map((m) => <Chip key={m.id} active={map?.id === m.id} onClick={() => setMapId(m.id)}>{m.title}</Chip>)}
        <label className="btn-ghost cursor-pointer !px-3 !py-2 !text-[12.5px]">{busy ? '올리는 중…' : '+ 배치도 올리기'}<input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void upload(f) }} /></label>
        {map && <label className="cursor-pointer text-[12px] font-bold text-sub underline">이미지 교체<input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void replaceImage(f) }} /></label>}
      </div>

      {map ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-bold text-sub">구역</span>
            {zones.map((z) => <Chip key={z.id} active={zone?.id === z.id} onClick={() => setZoneId(z.id)}>{z.code} {z.name}</Chip>)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip active={mode === 'select'} onClick={() => setMode('select')}>점 선택</Chip>
            <Chip active={mode === 'place'} onClick={() => setMode('place')}>사이트 찍기</Chip>
            <button type="button" onClick={() => void bulkAdd()} className="btn-ghost !px-3 !py-2 !text-[12.5px]">번호 여러 개 만들기</button>
          </div>
          {mode === 'place' && <p className="rounded-xl bg-sun/30 px-3 py-2 text-[12.5px] font-bold">지도를 누르면 {zone?.code} 구역 사이트 {nextNumber()}이(가) 그 자리에 생깁니다</p>}
          {mode === 'move' && edit && <p className="rounded-xl bg-sun/30 px-3 py-2 text-[12.5px] font-bold">{edit.number}을(를) 둘 자리를 지도에서 눌러 주세요 <button type="button" onClick={() => setMode('select')} className="ml-2 underline">취소</button></p>}
          <SiteMap map={map} sites={mapSites} occ={board.data?.occ ?? new Map()} zoneId={null} editable selected={edit ? [edit.id] : []} onPlace={onPlace} onSelect={(s) => { if (mode === 'select') setEdit({ ...s }) }} />
          <div className="flex items-center justify-between"><SiteLegend editable /><span className="tnum text-[12px] text-sub">{mapSites.length}개</span></div>
          {/* 구역별 요약 */}
          <ul className="grid grid-cols-3 gap-2 text-[12px]">
            {zones.map((z) => { const zs = sites.filter((s) => s.zone_id === z.id); const t = zs.filter((s) => board.data?.occ.get(s.id)?.taken).length
              return <li key={z.id} className="rounded-xl bg-mint px-3 py-2"><b>{z.code}</b> {z.name}<span className="tnum mt-0.5 block text-sub">사이트 {zs.length}/{z.capacity} · 배정 {t}</span></li> })}
          </ul>
        </>
      ) : <p className="rounded-tile border border-dashed border-line px-4 py-8 text-center text-[13px] text-sub">배치도(JPG/PNG)를 먼저 올려 주세요</p>}

      {/* 새 사이트 */}
      <BottomSheet open={!!draft} onClose={() => setDraft(null)} title="새 사이트">
        {draft && <SiteForm value={draft as Site} zones={zones} onChange={(v) => setDraft({ ...draft, ...v })} />}
        <button type="button" disabled={busy} onClick={() => void saveDraft()} className="btn mt-4 w-full">추가</button>
      </BottomSheet>
      {/* 사이트 수정 */}
      <BottomSheet open={!!edit && mode !== 'move'} onClose={() => setEdit(null)} title={edit ? `사이트 ${edit.number}` : ''}>
        {edit && (
          <div>
            {board.data?.occ.get(edit.id)?.taken && <p className="mb-3 rounded-xl bg-sun/30 px-3 py-2 text-[12.5px] font-bold">이 사이트는 배정되어 있습니다 — 배정 현황 탭에서 확인·취소할 수 있어요</p>}
            <SiteForm value={edit} zones={zones} onChange={(v) => setEdit({ ...edit, ...v })} />
            <div className="mt-3 flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5 text-[13px] font-bold">사이트 열림 <Toggle on={edit.status === 'open'} label="열림" onChange={(v) => setEdit({ ...edit, status: v ? 'open' : 'blocked' })} /></div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setMode('move')} className="btn-ghost flex-1">위치 옮기기</button>
              <button type="button" disabled={busy} onClick={() => void saveEdit()} className="btn flex-[1.6]">저장</button>
            </div>
            <button type="button" onClick={() => void removeSite()} className="mt-2 w-full py-2 text-[13px] font-semibold text-ember underline">이 사이트 지우기</button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}

function SiteForm({ value, zones, onChange }: { value: Site; zones: Zone[]; onChange: (v: Partial<Site>) => void }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label="번호"><input className={`${field} tnum`} value={value.number ?? ''} onChange={(e) => onChange({ number: e.target.value })} /></Field>
        <Field label="구역"><select className={field} value={value.zone_id} onChange={(e) => onChange({ zone_id: e.target.value })}>{zones.map((z) => <option key={z.id} value={z.id}>{z.code} {z.name}</option>)}</select></Field>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Field label="가로(m)"><input type="number" step="0.5" className={`${field} tnum`} value={value.width_m ?? ''} onChange={(e) => onChange({ width_m: e.target.value === '' ? null : Number(e.target.value) })} placeholder="미정" /></Field>
        <Field label="세로(m)"><input type="number" step="0.5" className={`${field} tnum`} value={value.depth_m ?? ''} onChange={(e) => onChange({ depth_m: e.target.value === '' ? null : Number(e.target.value) })} placeholder="미정" /></Field>
        <Field label="바닥"><input className={field} value={value.ground ?? ''} onChange={(e) => onChange({ ground: e.target.value })} placeholder="잔디/데크" /></Field>
      </div>
      <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5 text-[13px] font-bold">반려견 가능 <Toggle on={!!value.pet_allowed} label="반려견" onChange={(v) => onChange({ pet_allowed: v })} /></div>
    </div>
  )
}

// ---- 배정 현황 ----------------------------------------------------------------------------------------
type Row = { id: string; site_id: string; adults: number; kids: number; infants: number; car_number: string; status: string; group_key: string | null; note: string; created_at: string; is_test: boolean; sites: { number: string; zone_id: string }; ticket_orders: { order_no: string; buyer_name: string }; assignment_members: { name: string; phone: string; is_lead: boolean }[] }
function Assignments({ event, toast }: { event: CampEvent; toast: (m: string) => void }) {
  const qc = useQueryClient()
  const board = useCampBoard(event.id, { live: true })
  const q = useQuery({
    queryKey: ['admin-assignments', event.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_assignments').select('*, sites(number, zone_id), ticket_orders(order_no, buyer_name), assignment_members(name, phone, is_lead)').eq('event_id', event.id).eq('status', 'active').order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as Row[]
    },
  })
  const [manual, setManual] = useState<{ site_id: string; order_no: string; adults: number; kids: number; car: string; note: string } | null>(null)
  const [filter, setFilter] = useState('')
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ['admin-assignments', event.id] }), qc.invalidateQueries({ queryKey: ['camp-board', event.id] })])
  const cancel = async (r: Row) => {
    if (!window.confirm(`${r.sites.number} 배정을 취소할까요? 사이트가 다시 열립니다.`)) return
    const { error } = await supabase.rpc('admin_cancel_assignment', { p_assignment: r.id })
    if (error) return toast(toMessage(error))
    await refresh(); toast('취소했습니다')
  }
  const saveManual = async () => {
    if (!manual || !manual.site_id) return toast('사이트를 고르세요')
    const { error } = await supabase.rpc('admin_assign_site', { p_site: manual.site_id, p_order_no: manual.order_no.trim() || `MANUAL-${Date.now()}`, p_adults: manual.adults, p_kids: manual.kids, p_car: manual.car, p_note: manual.note })
    if (error) return toast(toMessage(error))
    setManual(null); await refresh(); toast('배정했습니다')
  }
  const zones = board.data?.zones ?? []
  const sites = board.data?.sites ?? []
  const free = sites.filter((s) => s.status === 'open' && !board.data?.occ.get(s.id)?.taken).sort((a, b) => siteNumberKey(a.number).localeCompare(siteNumberKey(b.number)))
  const rows = (q.data ?? []).filter((r) => !filter || r.sites.number.includes(filter) || r.ticket_orders.order_no.includes(filter) || r.car_number.includes(filter) || r.assignment_members.some((m) => m.name.includes(filter)))
  const copy = () => {
    const text = ['사이트\t예매번호\t대표\t성인\t소인\t유아\t차량\t동반자\t일행\t메모', ...rows.map((r) => [r.sites.number, r.ticket_orders.order_no, r.assignment_members.find((m) => m.is_lead)?.name ?? r.ticket_orders.buyer_name, r.adults, r.kids, r.infants, r.car_number, r.assignment_members.filter((m) => !m.is_lead).map((m) => `${m.name}${m.phone ? `(${m.phone})` : ''}`).join(', '), r.group_key ?? '', r.note].join('\t'))].join('\n')
    void navigator.clipboard?.writeText(text).then(() => toast('표를 복사했습니다 (엑셀에 붙여넣기)'))
  }
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <input className={`${field} !py-2 text-[13px]`} placeholder="사이트·예매번호·차량·이름 검색" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <button type="button" onClick={copy} className="btn-ghost shrink-0 !px-3 !py-2 !text-[12.5px]">복사</button>
        <button type="button" onClick={() => setManual({ site_id: free[0]?.id ?? '', order_no: '', adults: 2, kids: 0, car: '', note: '' })} className="btn shrink-0 !px-3 !py-2 !text-[12.5px]">수동 배정</button>
      </div>
      <p className="eyebrow mb-1">배정 {rows.length}건 · 빈 사이트 {free.length}</p>
      <ul className="divide-y hairline">
        {rows.map((r) => {
          const z = zones.find((x) => x.id === r.sites.zone_id)
          const lead = r.assignment_members.find((m) => m.is_lead)
          return (
            <li key={r.id} className="py-3">
              <div className="flex items-start gap-3">
                <span className="tnum rounded-lg bg-[#1F7A8C] px-2 py-1 text-[12px] font-black text-white">{r.sites.number}</span>
                <div className="min-w-0 flex-1 text-[12.5px]">
                  <p className="font-bold">{lead?.name ?? r.ticket_orders.buyer_name ?? '-'} <span className="font-normal text-sub">· {z?.name}</span>{r.is_test && <span className="ml-1 rounded bg-gray-100 px-1 text-[10px]">테스트</span>}</p>
                  <p className="tnum text-sub">예매 {r.ticket_orders.order_no} · 성인 {r.adults}{r.kids ? ` 소인 ${r.kids}` : ''}{r.infants ? ` 유아 ${r.infants}` : ''}{r.car_number ? ` · ${r.car_number}` : ''}{r.group_key ? ` · 일행 ${r.group_key}` : ''}</p>
                  {r.assignment_members.filter((m) => !m.is_lead).length > 0 && <p className="text-sub">동반 {r.assignment_members.filter((m) => !m.is_lead).map((m) => m.name).join(', ')}</p>}
                  {r.note && <p className="text-gray-400">{r.note}</p>}
                </div>
                <button type="button" onClick={() => void cancel(r)} className="shrink-0 text-[12px] font-bold text-ember underline">취소</button>
              </div>
            </li>
          )
        })}
        {!rows.length && !q.isLoading && <li className="py-8 text-center text-[13px] text-sub">배정이 아직 없습니다</li>}
      </ul>
      <BottomSheet open={!!manual} onClose={() => setManual(null)} title="수동 배정">
        {manual && (
          <div className="space-y-3">
            <Field label="사이트"><select className={field} value={manual.site_id} onChange={(e) => setManual({ ...manual, site_id: e.target.value })}>{free.map((s) => <option key={s.id} value={s.id}>{s.number} · {zones.find((z) => z.id === s.zone_id)?.name}</option>)}</select></Field>
            <Field label="예매번호" hint="(없으면 비워 두세요)"><input className={`${field} tnum`} value={manual.order_no} onChange={(e) => setManual({ ...manual, order_no: e.target.value })} /></Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="성인"><input type="number" min={1} className={`${field} tnum`} value={manual.adults} onChange={(e) => setManual({ ...manual, adults: Number(e.target.value) || 1 })} /></Field>
              <Field label="소인"><input type="number" min={0} className={`${field} tnum`} value={manual.kids} onChange={(e) => setManual({ ...manual, kids: Number(e.target.value) || 0 })} /></Field>
              <Field label="차량"><input className={`${field} tnum`} value={manual.car} onChange={(e) => setManual({ ...manual, car: e.target.value })} placeholder="12가 3456" /></Field>
            </div>
            <Field label="메모"><input className={field} value={manual.note} onChange={(e) => setManual({ ...manual, note: e.target.value })} /></Field>
            <button type="button" onClick={() => void saveManual()} className="btn w-full">배정</button>
          </div>
        )}
      </BottomSheet>
    </div>
  )
}

// ---- 예매번호 목록 ------------------------------------------------------------------------------------
type ParsedOrder = { order_no: string; zone: string; qty: number; buyer_name: string; phone: string }
/** 구역 코드 추출: 옵션/상품명에 'A 쌍계사 경내', 'B구역', 'Pet & Kids', '주차장' 등이 들어 있으면 A/B/C 로 */
function zoneOf(s: string) {
  const t = s.toUpperCase()
  if (/\b[ABC]\b|[ABC]\s*구역|구역\s*[ABC]/.test(t)) return (t.match(/\b([ABC])\b|([ABC])\s*구역|구역\s*([ABC])/) ?? []).slice(1).find(Boolean) ?? ''
  if (/경내|쌍계사/.test(s)) return 'A'
  if (/쌍계초|PET|KIDS|반려/i.test(s)) return 'B'
  if (/주차장|언덕/.test(s)) return 'C'
  return ''
}
/** 붙여넣은 텍스트 → 주문 목록. 머리글이 있으면 열 이름으로 찾고, 같은 주문번호는 수량을 합친다 */
function parseOrders(text: string): ParsedOrder[] {
  const lines = text.split(/\r?\n/).map((l) => l.split(/\t|,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((c) => c.replace(/^"|"$/g, '').trim())).filter((c) => c.some(Boolean))
  if (!lines.length) return []
  const head = lines[0].map((h) => h.replace(/\s/g, ''))
  const col = (...names: string[]) => head.findIndex((h) => names.some((n) => h.includes(n)))
  const iOrder = col('주문번호')
  const byOrder = new Map<string, ParsedOrder>()
  const add = (o: ParsedOrder) => {
    if (!/\d{6,}/.test(o.order_no)) return
    const prev = byOrder.get(o.order_no)
    if (prev) { prev.qty += o.qty; if (!prev.zone) prev.zone = o.zone; if (!prev.buyer_name) prev.buyer_name = o.buyer_name; if (!prev.phone) prev.phone = o.phone }
    else byOrder.set(o.order_no, { ...o })
  }
  if (iOrder >= 0 && head.some((h) => h.includes('상품주문번호') || h.includes('수량') || h.includes('구매자'))) {
    // 판매자센터 엑셀: 상품주문번호 열과 주문번호 열이 따로 있다 — '상품주문번호' 가 아닌 '주문번호' 열을 쓴다
    const iO = head.findIndex((h) => h === '주문번호') >= 0 ? head.findIndex((h) => h === '주문번호') : head.findIndex((h) => h.includes('주문번호') && !h.includes('상품'))
    const iQty = col('수량'), iName = col('구매자명', '구매자', '수취인명'), iPhone = col('구매자연락처', '연락처', '휴대폰', '전화'), iOpt = col('옵션정보', '옵션', '상품명')
    for (const c of lines.slice(1)) add({ order_no: c[iO] ?? '', zone: iOpt >= 0 ? zoneOf(c[iOpt] ?? '') : '', qty: iQty >= 0 ? Number(c[iQty]) || 1 : 1, buyer_name: iName >= 0 ? c[iName] ?? '' : '', phone: iPhone >= 0 ? c[iPhone] ?? '' : '' })
  } else {
    for (const c of lines) add({ order_no: c[0] ?? '', zone: zoneOf(c[1] ?? ''), qty: Number(c[2]) || 1, buyer_name: c[3] ?? '', phone: c[4] ?? '' })
  }
  return [...byOrder.values()]
}
function Orders({ event, toast }: { event: CampEvent; toast: (m: string) => void }) {
  const qc = useQueryClient()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const q = useQuery({
    queryKey: ['admin-orders', event.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('ticket_orders').select('*, zones(code), site_assignments(status)').eq('event_id', event.id).order('imported_at', { ascending: false }).limit(500)
      if (error) throw error
      return data as unknown as { id: string; order_no: string; buyer_name: string; phone_last4: string; qty: number; is_test: boolean; zones: { code: string } | null; site_assignments: { status: string }[] }[]
    },
  })
  const parsed = useMemo(() => parseOrders(text), [text])
  const imp = async () => {
    if (!parsed.length) return toast('붙여넣은 줄에서 예매번호를 찾지 못했습니다')
    setBusy(true)
    const { data, error } = await supabase.rpc('admin_import_orders', { p_event: event.id, p_rows: parsed })
    setBusy(false)
    if (error) return toast(toMessage(error))
    setText(''); await qc.invalidateQueries({ queryKey: ['admin-orders', event.id] }); toast(`${data}건을 등록했습니다`)
  }
  return (
    <div className="space-y-3">
      <p className="text-[12px] leading-relaxed text-sub">스마트스토어 판매자센터 주문 엑셀을 머리글 줄까지 그대로 복사해 붙여넣으세요(주문번호·상품주문번호·수량·구매자명·구매자연락처·옵션정보 열을 알아서 찾습니다). 한 주문에 상품주문번호가 여러 줄이면 같은 주문번호의 수량을 합칩니다. 머리글 없이 <b>주문번호, 구역(A/B/C), 수량, 구매자, 연락처</b> 순서로 적어도 됩니다. 손님은 주문번호와 휴대폰 뒷 4자리로 확인합니다.</p>
      <textarea className={`${field} tnum min-h-[120px] text-[12.5px]`} value={text} onChange={(e) => setText(e.target.value)} placeholder={'2026102012345678, A, 1, 홍길동, 010-1234-5678\n2026102087654321, C, 2, 김철수, 010-9876-5432'} />
      <div className="flex items-center justify-between"><span className="tnum text-[12px] text-sub">{parsed.length}건 인식</span><button type="button" disabled={busy || !parsed.length} onClick={() => void imp()} className="btn !px-4 !py-2 !text-[13px]">등록</button></div>
      <p className="eyebrow mt-4">등록된 예매번호 {q.data?.length ?? 0}</p>
      <ul className="divide-y hairline text-[12.5px]">
        {(q.data ?? []).map((o) => { const used = o.site_assignments.filter((a) => a.status === 'active').length
          return <li key={o.id} className="flex items-center gap-2 py-2"><span className="tnum font-bold">{o.order_no}</span><span className="text-sub">{o.zones?.code ?? '-'} · {o.buyer_name || '-'} · ***{o.phone_last4 || '----'}</span><span className={`tnum ml-auto ${used >= o.qty ? 'text-sub' : 'font-bold text-deep'}`}>{used}/{o.qty}</span>{o.is_test && <span className="rounded bg-gray-100 px-1 text-[10px]">테스트</span>}</li> })}
      </ul>
    </div>
  )
}

// ---- 구역·환불 규정·동의 항목 ---------------------------------------------------------------------------
function Settings({ event, toast }: { event: CampEvent; toast: (m: string) => void }) {
  const qc = useQueryClient()
  const { user } = useApp()
  const board = useCampBoard(event.id)
  const [zones, setZones] = useState<Zone[] | null>(null)
  const [refund, setRefund] = useState(event.refund_rules)
  const [refundNote, setRefundNote] = useState(event.refund_note ?? '')
  const [pricing, setPricing] = useState<{ site: string; adult: string; kid: string }>({ site: event.pricing?.site ? String(event.pricing.site) : '', adult: event.pricing?.adult ? String(event.pricing.adult) : '', kid: event.pricing?.kid ? String(event.pricing.kid) : '' })
  const [consents, setConsents] = useState(event.consents)
  const zs = zones ?? board.data?.zones ?? []
  const setZ = (id: string, v: Partial<Zone>) => setZones(zs.map((z) => (z.id === id ? { ...z, ...v } : z)))
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ['camp-board', event.id] }), qc.invalidateQueries({ queryKey: ['zone-summary', event.id] }), qc.invalidateQueries({ queryKey: ['camp-event'] })])
  const saveZones = async () => {
    for (const z of zs) {
      const { error } = await supabase.from('zones').update({ name: z.name, subtitle: z.subtitle, capacity: z.capacity, ground: z.ground, toilet_distance: z.toilet_distance, shower_distance: z.shower_distance, pet_allowed: z.pet_allowed, remaining_override: z.remaining_override, recent_bookings: z.recent_bookings, sold_out: z.sold_out, smartstore_url: z.smartstore_url, photo_url: z.photo_url }).eq('id', z.id)
      if (error) return toast(toMessage(error))
    }
    setZones(null); await refresh(); toast('구역 정보를 저장했습니다')
  }
  const zonePhoto = async (id: string, file: File) => {
    if (!user) return
    const path = `${user.id}/zones/${Date.now()}.${(file.name.split('.').pop() || 'jpg').toLowerCase()}`
    const up = await supabase.storage.from('photos').upload(path, file, { contentType: file.type || 'image/jpeg' })
    if (up.error) return toast(toMessage(up.error))
    setZ(id, { photo_url: supabase.storage.from('photos').getPublicUrl(path).data.publicUrl })
  }
  const cleanupTest = async () => {
    if (!window.confirm('테스트 표시가 붙은 배정·예매번호·사이트를 모두 지울까요?')) return
    // 배정 → 예매번호 → 사이트 순서 (참조 제약)
    const a = await supabase.from('site_assignments').delete().eq('event_id', event.id).eq('is_test', true)
    const o = await supabase.from('ticket_orders').delete().eq('event_id', event.id).eq('is_test', true)
    const s = await supabase.from('sites').delete().eq('event_id', event.id).eq('is_test', true)
    const err = a.error ?? o.error ?? s.error
    if (err) return toast(toMessage(err))
    await refresh(); await qc.invalidateQueries({ queryKey: ['admin-assignments', event.id] }); await qc.invalidateQueries({ queryKey: ['admin-orders', event.id] })
    toast('테스트 데이터를 지웠습니다')
  }
  const saveEvent = async () => {
    const num = (v: string) => (v.trim() === '' ? null : Number(v.replace(/\D/g, '')) || null)
    const { error } = await supabase.from('events').update({ refund_rules: refund.filter((r) => r.label.trim()), refund_note: refundNote.trim(), pricing: { site: num(pricing.site), adult: num(pricing.adult), kid: num(pricing.kid), infant: 0 }, consents: consents.filter((c) => c.title.trim()), updated_at: new Date().toISOString() }).eq('id', event.id)
    if (error) return toast(toMessage(error))
    await refresh(); toast('저장했습니다')
  }
  return (
    <div className="space-y-8">
      <section>
        <p className="eyebrow mb-2">구역 (홈 카드·손님 화면에 보입니다)</p>
        <div className="space-y-4">
          {zs.map((z) => (
            <div key={z.id} className="rounded-tile border border-line p-3">
              <p className="mb-2 text-[14px] font-extrabold">{z.code} 구역</p>
              <div className="grid grid-cols-2 gap-2">
                <Field label="이름"><input className={field} value={z.name} onChange={(e) => setZ(z.id, { name: e.target.value })} /></Field>
                <Field label="한 줄 소개"><input className={field} value={z.subtitle} onChange={(e) => setZ(z.id, { subtitle: e.target.value })} /></Field>
                <Field label="동 수"><input type="number" className={`${field} tnum`} value={z.capacity} onChange={(e) => setZ(z.id, { capacity: Number(e.target.value) || 0 })} /></Field>
                <Field label="바닥 종류" hint="(미정이면 비움)"><input className={field} value={z.ground} onChange={(e) => setZ(z.id, { ground: e.target.value })} placeholder="잔디 / 데크 / 파쇄석" /></Field>
                <Field label="화장실 거리"><input className={field} value={z.toilet_distance} onChange={(e) => setZ(z.id, { toilet_distance: e.target.value })} placeholder="도보 1분" /></Field>
                <Field label="샤워실 거리"><input className={field} value={z.shower_distance} onChange={(e) => setZ(z.id, { shower_distance: e.target.value })} placeholder="도보 3분" /></Field>
                <Field label="남은 자리" hint="(스마트스토어 재고. 비우면 자동)"><input type="number" className={`${field} tnum`} value={z.remaining_override ?? ''} onChange={(e) => setZ(z.id, { remaining_override: e.target.value === '' ? null : Number(e.target.value) })} placeholder="자동" /></Field>
                <Field label="최근 예약 팀"><input type="number" className={`${field} tnum`} value={z.recent_bookings} onChange={(e) => setZ(z.id, { recent_bookings: Number(e.target.value) || 0 })} /></Field>
              </div>
              <Field label="스마트스토어 링크"><input className={`${field} mt-2`} value={z.smartstore_url} onChange={(e) => setZ(z.id, { smartstore_url: e.target.value })} placeholder="https://smartstore.naver.com/…" inputMode="url" /></Field>
              <div className="mt-2 flex items-center gap-3">
                {z.photo_url ? <img src={z.photo_url} alt="" className="h-14 w-20 rounded-lg object-cover" /> : <span className="flex h-14 w-20 items-center justify-center rounded-lg bg-gray-100 text-[11px] text-sub">사진 없음</span>}
                <label className="btn-ghost cursor-pointer !px-3 !py-1.5 !text-[12px]">사진 올리기<input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void zonePhoto(z.id, f) }} /></label>
                <span className="ml-auto flex items-center gap-2 text-[12.5px] font-bold">반려견 <Toggle on={z.pet_allowed} label="반려견" onChange={(v) => setZ(z.id, { pet_allowed: v })} /></span>
                <span className="flex items-center gap-2 text-[12.5px] font-bold">매진 <Toggle on={z.sold_out} label="매진" onChange={(v) => setZ(z.id, { sold_out: v })} /></span>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => void saveZones()} className="btn mt-3 w-full">구역 저장</button>
      </section>

      <section>
        <p className="eyebrow mb-1">가격 (스마트스토어 옵션 가격과 같게 입력)</p>
        <p className="mb-2 text-[12px] text-sub">비워 두면 손님 화면에는 "가격은 스마트스토어 상품 페이지 참고"로만 보입니다. 1사이트는 1~2인 기준, 36개월 미만은 무료로 표기됩니다.</p>
        <div className="grid grid-cols-3 gap-2">
          <Field label="1사이트(1~2인)"><input inputMode="numeric" className={`${field} tnum`} value={pricing.site} onChange={(e) => setPricing({ ...pricing, site: e.target.value })} placeholder="원" /></Field>
          <Field label="추가 성인"><input inputMode="numeric" className={`${field} tnum`} value={pricing.adult} onChange={(e) => setPricing({ ...pricing, adult: e.target.value })} placeholder="원" /></Field>
          <Field label="36개월~미취학"><input inputMode="numeric" className={`${field} tnum`} value={pricing.kid} onChange={(e) => setPricing({ ...pricing, kid: e.target.value })} placeholder="원" /></Field>
        </div>
      </section>

      <section>
        <p className="eyebrow mb-1">환불 규정</p>
        <p className="mb-2 text-[12px] text-sub">손님 화면에 아래 문구와 표가 그대로 보입니다. 스마트스토어 상품 페이지와 같게 유지해 주세요.</p>
        <textarea className={`${field} mb-2 !py-2 text-[13px]`} rows={2} value={refundNote} onChange={(e) => setRefundNote(e.target.value)} placeholder="11/1(일) 24시까지만 취소·환불 가능, 이후 불가. 양도는 직계가족만 가능." />
        <ul className="space-y-2">
          {refund.map((r, i) => (
            <li key={i} className="flex items-center gap-2">
              <input className={`${field} !py-2 text-[13px]`} value={r.label} onChange={(e) => setRefund(refund.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="11/5까지 취소" />
              <input type="number" className={`${field} tnum w-20 !py-2 text-[13px]`} value={r.rate} onChange={(e) => setRefund(refund.map((x, j) => (j === i ? { ...x, rate: Number(e.target.value) || 0 } : x)))} />
              <span className="text-[12px] text-sub">%</span>
              <button type="button" onClick={() => setRefund(refund.filter((_, j) => j !== i))} className="text-[12px] text-ember">삭제</button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setRefund([...refund, { label: '', rate: 100 }])} className="btn-ghost mt-2 !px-3 !py-1.5 !text-[12px]">+ 줄 추가</button>
      </section>

      <section>
        <p className="eyebrow mb-2">행사별 동의 항목 ('세 가지 약속')</p>
        <ul className="space-y-3">
          {consents.map((c, i) => (
            <li key={i} className="rounded-xl border border-line p-3">
              <input className={`${field} !py-2 text-[13px] font-bold`} value={c.title} onChange={(e) => setConsents(consents.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} placeholder="제목" />
              <textarea className={`${field} mt-2 !py-2 text-[12.5px]`} rows={2} value={c.body} onChange={(e) => setConsents(consents.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))} placeholder="설명" />
              <button type="button" onClick={() => setConsents(consents.filter((_, j) => j !== i))} className="mt-1 text-[12px] text-ember">삭제</button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setConsents([...consents, { key: `c${Date.now()}`, title: '', body: '' }])} className="btn-ghost mt-2 !px-3 !py-1.5 !text-[12px]">+ 항목 추가</button>
      </section>
      <button type="button" onClick={() => void saveEvent()} className="btn w-full">가격·환불 규정·동의 항목 저장</button>

      <section className="rounded-tile border border-dashed border-line p-4">
        <p className="text-[13px] font-bold">테스트 데이터 정리</p>
        <p className="mt-1 text-[12px] text-sub">'테스트' 표시(is_test)가 붙은 예매번호·사이트·배정만 지웁니다. 실제 손님 데이터는 건드리지 않습니다.</p>
        <button type="button" onClick={() => void cleanupTest()} className="btn-ghost mt-2 !px-3 !py-1.5 !text-[12px] text-ember">테스트 데이터 지우기</button>
      </section>
    </div>
  )
}

// ---- 빈자리 알림 신청자 ----------------------------------------------------------------------------------
function Alerts({ event, toast }: { event: CampEvent; toast: (m: string) => void }) {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['vacancy-alerts', event.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('vacancy_alerts').select('*, zones(code, name)').eq('event_id', event.id).order('created_at', { ascending: false })
      if (error) throw error
      return data as unknown as { id: string; phone: string; notified_at: string | null; created_at: string; zones: { code: string; name: string } }[]
    },
  })
  const rows = q.data ?? []
  const copy = (list: typeof rows) => void navigator.clipboard?.writeText(list.map((r) => r.phone).join('\n')).then(() => toast(`${list.length}개 번호를 복사했습니다`))
  const mark = async (id: string) => {
    const { error } = await supabase.from('vacancy_alerts').update({ notified_at: new Date().toISOString() }).eq('id', id)
    if (error) return toast(toMessage(error))
    await qc.invalidateQueries({ queryKey: ['vacancy-alerts', event.id] })
  }
  const groups = Object.entries(rows.reduce<Record<string, typeof rows>>((acc, r) => { (acc[r.zones.code] ??= []).push(r); return acc }, {})).sort()
  return (
    <div className="space-y-5">
      <p className="text-[12px] leading-relaxed text-sub">매진 구역에 '빈자리 알림 신청'을 한 분들입니다. 취소가 생기면 번호를 복사해 알림톡·문자로 안내해 주세요. 카카오 알림톡 템플릿이 승인되면 여기에 '알림톡 보내기'를 연결합니다.</p>
      {groups.map(([code, list]) => (
        <section key={code}>
          <div className="mb-1 flex items-center justify-between"><p className="eyebrow">{code} {list[0].zones.name} · {list.length}명</p><button type="button" onClick={() => copy(list.filter((r) => !r.notified_at))} className="text-[12px] font-bold text-deep underline">미발송 번호 복사</button></div>
          <ul className="divide-y hairline text-[13px]">
            {list.map((r) => <li key={r.id} className="flex items-center gap-2 py-2"><span className="tnum font-bold">{r.phone.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3')}</span><span className="tnum text-[11.5px] text-sub">{r.created_at.slice(5, 10)}</span>{r.notified_at ? <span className="ml-auto text-[11.5px] text-sub">안내함</span> : <button type="button" onClick={() => void mark(r.id)} className="ml-auto text-[12px] font-bold text-deep">안내 완료</button>}</li>)}
          </ul>
        </section>
      ))}
      {!rows.length && !q.isLoading && <p className="py-8 text-center text-[13px] text-sub">신청자가 아직 없습니다</p>}
    </div>
  )
}
