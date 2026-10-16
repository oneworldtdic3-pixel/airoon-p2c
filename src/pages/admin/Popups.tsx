import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useApp } from '../../data/AppProvider'
import { toMessage } from '../../data/errors'
import { BottomSheet, Toggle } from '../../components/ui'
import { PopupSheet, popupLive } from '../../components/home/HomePopup'
import type { Popup } from '../../data/types'

type Draft = Omit<Popup, 'id' | 'created_at' | 'updated_at'> & { id?: string }
const EMPTY: Draft = { title: '', body: '', image_url: '', link: '', button_label: '자세히 보기', starts_at: null, ends_at: null, is_active: true, sort: 0 }

/** ISO ↔ <input type="datetime-local"> 값 (항상 한국시간 기준) */
const toLocal = (iso: string | null) => (iso ? new Date(Date.parse(iso) + 9 * 3600_000).toISOString().slice(0, 16) : '')
const fromLocal = (v: string) => (v ? new Date(`${v}:00+09:00`).toISOString() : null)
const fmt = (iso: string | null) => (iso ? toLocal(iso).replace('T', ' ').slice(5) : '')

function status(p: Popup) {
  const now = Date.now()
  if (!p.is_active) return { label: '꺼짐', cls: 'bg-gray-100 text-gray-500' }
  if (p.starts_at && Date.parse(p.starts_at) > now) return { label: '예약', cls: 'bg-sky/30 text-ink' }
  if (p.ends_at && Date.parse(p.ends_at) <= now) return { label: '종료', cls: 'bg-gray-100 text-gray-500' }
  return { label: '노출중', cls: 'bg-mint text-deep' }
}

export default function Popups({ toast }: { toast: (m: string) => void }) {
  const qc = useQueryClient()
  const { user } = useApp()
  const q = useQuery({
    queryKey: ['admin-popups'],
    queryFn: async () => {
      const { data, error } = await supabase.from('popups').select('*').order('sort').order('created_at', { ascending: false })
      if (error) throw error
      return data as Popup[]
    },
  })
  const [draft, setDraft] = useState<Draft | null>(null)
  const [preview, setPreview] = useState<Popup | null>(null)
  const [busy, setBusy] = useState(false)
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ['admin-popups'] }), qc.invalidateQueries({ queryKey: ['popups'] })])

  const setActive = async (id: string, v: boolean) => {
    const { error } = await supabase.from('popups').update({ is_active: v, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) return toast(toMessage(error))
    await refresh()
  }

  const upload = async (file: File) => {
    if (!user) return
    if (file.size > 8 * 1024 * 1024) return toast('이미지는 8MB 이하로 올려 주세요')
    setBusy(true)
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${user.id}/popups/${Date.now()}.${ext}`
    const up = await supabase.storage.from('photos').upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false })
    setBusy(false)
    if (up.error) return toast(toMessage(up.error))
    const url = supabase.storage.from('photos').getPublicUrl(path).data.publicUrl
    setDraft((d) => (d ? { ...d, image_url: url } : d))
  }

  const save = async () => {
    if (!draft) return
    if (!draft.title.trim()) return toast('제목을 입력해 주세요')
    if (draft.link && !draft.link.startsWith('/') && !/^https?:\/\//.test(draft.link)) return toast('링크는 /로 시작하는 앱 경로나 https:// 주소로 넣어 주세요')
    if (draft.starts_at && draft.ends_at && Date.parse(draft.ends_at) <= Date.parse(draft.starts_at)) return toast('종료 시각이 시작보다 뒤여야 합니다')
    setBusy(true)
    const { id, ...row } = draft
    const payload = { ...row, title: row.title.trim(), body: row.body.trim(), link: row.link.trim(), button_label: row.button_label.trim() || '자세히 보기', updated_at: new Date().toISOString() }
    const { error } = id ? await supabase.from('popups').update(payload).eq('id', id) : await supabase.from('popups').insert(payload)
    setBusy(false)
    if (error) return toast(toMessage(error))
    toast(id ? '팝업을 수정했습니다' : '팝업을 등록했습니다')
    setDraft(null)
    await refresh()
  }

  const remove = async () => {
    if (!draft?.id || !window.confirm(`'${draft.title}' 팝업을 삭제할까요?`)) return
    setBusy(true)
    const { error } = await supabase.from('popups').delete().eq('id', draft.id)
    setBusy(false)
    if (error) return toast(toMessage(error))
    toast('삭제했습니다')
    setDraft(null)
    await refresh()
  }

  const list = q.data ?? []
  const live = list.filter((p) => popupLive(p))
  return (
    <div>
      <p className="mb-3 text-[12px] leading-relaxed text-sub">홈에 들어오면 아래에서 올라오는 팝업입니다. 저장하면 바로 반영되고, 노출 중인 팝업이 여러 개면 순서대로 하나씩 뜹니다. 방문자는 ‘오늘 하루 보지 않기’로 숨길 수 있습니다.</p>
      <button type="button" onClick={() => setDraft({ ...EMPTY, sort: list.length })} className="btn mb-4 w-full">+ 새 팝업 만들기</button>
      <p className="eyebrow mb-1">지금 노출 {live.length}개 · 전체 {list.length}개</p>
      <ul className="divide-y hairline">
        {list.map((p) => {
          const st = status(p)
          return (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <button type="button" onClick={() => setDraft({ ...p })} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                {p.image_url ? <img src={p.image_url} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" /> : <span className="h-12 w-12 shrink-0 rounded-lg bg-mint" />}
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10.5px] font-extrabold ${st.cls}`}>{st.label}</span>
                    <span className="truncate text-[14px] font-bold">{p.title}</span>
                  </span>
                  <span className="tnum block truncate text-[12px] text-sub">{p.starts_at || p.ends_at ? `${fmt(p.starts_at) || '지금'} ~ ${fmt(p.ends_at) || '계속'}` : '기간 제한 없음'}{p.link ? ` · ${p.link}` : ''}</span>
                </span>
              </button>
              <button type="button" onClick={() => setPreview(p)} className="btn-ghost !px-3 !py-1.5 !text-[12px]">미리보기</button>
              <Toggle on={p.is_active} label={`${p.title} 노출`} onChange={(v) => void setActive(p.id, v)} />
            </li>
          )
        })}
        {!list.length && !q.isLoading && <li className="py-8 text-center text-[13px] text-sub">등록된 팝업이 없습니다</li>}
      </ul>

      <BottomSheet open={!!draft} onClose={() => !busy && setDraft(null)} title={draft?.id ? '팝업 수정' : '새 팝업'}>
        {draft && (
          <div className="space-y-4">
            <div>
              <p className="mb-1.5 text-[13px] font-bold">이미지 <span className="font-normal text-sub">(선택 · 세로형 또는 정사각 권장)</span></p>
              {draft.image_url ? (
                <div className="relative overflow-hidden rounded-tile border hairline">
                  <img src={draft.image_url} alt="" className="max-h-64 w-full object-cover" />
                  <button type="button" onClick={() => setDraft({ ...draft, image_url: '' })} className="absolute right-2 top-2 rounded-full bg-ink/70 px-3 py-1 text-[12px] font-bold text-white">빼기</button>
                </div>
              ) : (
                <label className="flex h-28 cursor-pointer items-center justify-center rounded-tile border border-dashed border-line text-[13px] font-bold text-sub">
                  {busy ? '올리는 중…' : '눌러서 이미지 올리기'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void upload(f) }} />
                </label>
              )}
            </div>
            <Field label="제목 *"><input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} maxLength={60} className="field" placeholder="예) 프로그램 예약이 11월 1일에 열립니다" /></Field>
            <Field label="내용"><textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={4} maxLength={500} className="field resize-none" placeholder="줄바꿈 그대로 보입니다" /></Field>
            <div className="grid grid-cols-[1fr_1.4fr] gap-2">
              <Field label="버튼 문구"><input value={draft.button_label} onChange={(e) => setDraft({ ...draft, button_label: e.target.value })} maxLength={20} className="field" /></Field>
              <Field label="연결 링크"><input value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} className="field" placeholder="/reserve 또는 https://…" inputMode="url" /></Field>
            </div>
            <p className="-mt-2 text-[11.5px] text-sub">링크를 비우면 버튼 없이 안내만 보여 줍니다.</p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="시작 (비우면 즉시)"><input type="datetime-local" value={toLocal(draft.starts_at)} onChange={(e) => setDraft({ ...draft, starts_at: fromLocal(e.target.value) })} className="field tnum" /></Field>
              <Field label="종료 (비우면 계속)"><input type="datetime-local" value={toLocal(draft.ends_at)} onChange={(e) => setDraft({ ...draft, ends_at: fromLocal(e.target.value) })} className="field tnum" /></Field>
            </div>
            <div className="flex items-center gap-3">
              <Field label="순서 (작을수록 먼저)"><input type="number" value={draft.sort} onChange={(e) => setDraft({ ...draft, sort: Number(e.target.value) || 0 })} className="field tnum w-24" /></Field>
              <span className="ml-auto flex items-center gap-2 pt-5 text-[13px] font-bold">노출 <Toggle on={draft.is_active} label="노출" onChange={(v) => setDraft({ ...draft, is_active: v })} /></span>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setPreview({ ...EMPTY, ...draft, id: draft.id ?? 'preview', created_at: '', updated_at: '' })} className="btn-ghost flex-1">미리보기</button>
              <button type="button" disabled={busy} onClick={() => void save()} className="btn flex-[1.6]">{busy ? '저장 중…' : '저장'}</button>
            </div>
            {draft.id && <button type="button" disabled={busy} onClick={() => void remove()} className="w-full py-2 text-[13px] font-semibold text-ember underline underline-offset-2">이 팝업 삭제</button>}
          </div>
        )}
      </BottomSheet>

      {preview && <PopupSheet popup={preview} onClose={() => setPreview(null)} onHideToday={() => setPreview(null)} />}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[13px] font-bold">{label}</span>
      {children}
    </label>
  )
}
