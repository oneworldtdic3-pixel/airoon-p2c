import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { openExternal } from '../../lib/external'
import type { Popup } from '../../data/types'
import { markPopupShown } from '../../lib/visit'

/** 오늘 날짜(KST) — '오늘 하루 보지 않기' 기준 */
const todayKst = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10)
const hideKey = (id: string) => `sansa:popup-hide:${id}`
const closedKey = (id: string) => `sansa:popup-closed:${id}`

/** 지금 노출 기간 안인지 (관리자는 꺼진 팝업도 받아오므로 화면에서 한 번 더 거른다) */
export const popupLive = (p: Popup, now = Date.now()) =>
  p.is_active && (!p.starts_at || Date.parse(p.starts_at) <= now) && (!p.ends_at || Date.parse(p.ends_at) > now)

function dismissed(id: string) {
  try {
    if (localStorage.getItem(hideKey(id)) === todayKst()) return true
    if (sessionStorage.getItem(closedKey(id))) return true
  } catch { /* 저장소를 못 쓰면 매번 보여준다 */ }
  return false
}

/** 아래에서 올라오는 팝업 시트. 홈과 관리자 미리보기에서 같이 쓴다 */
export function PopupSheet({ popup, onClose, onHideToday }: { popup: Popup; onClose: () => void; onHideToday?: () => void }) {
  const navigate = useNavigate()
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', esc) }
  }, [onClose])
  const go = () => {
    const to = popup.link.trim()
    if (!to) return
    onClose()
    if (to.startsWith('/')) navigate(to)
    else openExternal(to)
  }
  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-[430px] items-end" role="dialog" aria-modal="true" aria-label={popup.title}>
      <div className="absolute inset-0 bg-ink/45" style={{ animation: 'fade-in .2s' }} onClick={onClose} />
      <div className="relative max-h-[90dvh] w-full overflow-y-auto rounded-t-[28px] bg-white pb-[env(safe-area-inset-bottom)]" style={{ animation: 'sheet-in .35s cubic-bezier(.22,1,.36,1)' }}>
        {popup.image_url ? (
          <div className="relative">
            <button type="button" onClick={go} disabled={!popup.link} className="block w-full" aria-label={popup.link ? `${popup.title} 자세히 보기` : undefined}>
              <img src={popup.image_url} alt="" className="block max-h-[58dvh] w-full object-cover" />
            </button>
            <span className="pointer-events-none absolute left-1/2 top-2.5 h-1 w-9 -translate-x-1/2 rounded-full bg-white/80" />
          </div>
        ) : (
          <div className="mx-auto mt-3 h-1 w-9 rounded-full bg-gray-200" />
        )}
        <div className="px-5 pb-5 pt-5">
          <h2 className="text-[20px] font-extrabold leading-snug [text-wrap:balance]">{popup.title}</h2>
          {popup.body && <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-sub">{popup.body}</p>}
          {popup.link && <button type="button" onClick={go} className="btn mt-5 w-full">{popup.button_label || '자세히 보기'}</button>}
        </div>
        <div className="flex border-t hairline text-[13.5px] font-semibold text-sub">
          {onHideToday && <button type="button" onClick={onHideToday} className="flex-1 py-4 active:bg-gray-50">오늘 하루 보지 않기</button>}
          {onHideToday && <span className="my-3 w-px bg-line" />}
          <button type="button" onClick={onClose} className="flex-1 py-4 font-extrabold text-ink active:bg-gray-50">닫기</button>
        </div>
      </div>
    </div>
  )
}

/** 홈 진입 시 노출 중인 팝업 하나를 띄운다. 닫기 = 이번 방문 동안 숨김, 오늘 하루 보지 않기 = 오늘(KST) 숨김 */
export default function HomePopup() {
  const q = useQuery({
    queryKey: ['popups'],
    queryFn: async () => {
      const { data, error } = await supabase.from('popups').select('*').order('sort').order('created_at', { ascending: false })
      if (error) throw error
      return data as Popup[]
    },
  })
  const [shown, setShown] = useState<Popup | null>(null)
  const [ready, setReady] = useState(false)
  // 첫 화면이 그려진 뒤 잠깐 있다가 올린다 (닉네임 설정 등 다른 시트가 떠 있으면 건너뜀)
  useEffect(() => { const t = window.setTimeout(() => setReady(true), 700); return () => window.clearTimeout(t) }, [])
  useEffect(() => {
    if (!ready || shown) return
    if (document.querySelector('[role="dialog"]')) return
    const next = (q.data ?? []).find((p) => popupLive(p) && !dismissed(p.id))
    if (next) { markPopupShown(); setShown(next) }
  }, [ready, q.data, shown])
  // 보고 있는 팝업이 관리자에서 꺼지면 바로 내린다
  useEffect(() => {
    if (shown && q.data && !q.data.some((p) => p.id === shown.id && popupLive(p))) setShown(null)
  }, [q.data, shown])

  if (!shown) return null
  const close = () => { try { sessionStorage.setItem(closedKey(shown.id), '1') } catch { /* ignore */ } setShown(null) }
  const hideToday = () => { try { localStorage.setItem(hideKey(shown.id), todayKst()) } catch { /* ignore */ } close() }
  return <PopupSheet popup={shown} onClose={close} onHideToday={hideToday} />
}
