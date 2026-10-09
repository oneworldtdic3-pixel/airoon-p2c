import { useEffect, type ReactNode } from 'react'
import Icon from './Icon'

export function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold transition active:scale-95 ${active ? 'bg-deep text-white shadow-card' : 'bg-mint text-deep'}`}
    >
      {children}
    </button>
  )
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div role="tablist" className="flex rounded-full bg-mint p-1">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-full py-2.5 text-[14px] font-bold transition ${value === o.value ? 'bg-white text-deep shadow-card' : 'text-sub'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Badge({ tone = 'green', children }: { tone?: 'green' | 'yellow' | 'gray' | 'red'; children: ReactNode }) {
  const t = { green: 'bg-mint text-deep', yellow: 'bg-sun text-ink', gray: 'bg-gray-100 text-sub', red: 'bg-red-50 text-red-600' }[tone]
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold tracking-wide ${t}`}>{children}</span>
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`relative h-8 w-14 shrink-0 rounded-full transition ${on ? 'bg-brand' : 'bg-gray-300'}`}>
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? 'left-7' : 'left-1'}`} />
    </button>
  )
}

export function BottomSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', esc) }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 mx-auto flex max-w-[430px] items-end" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/40" style={{ animation: 'fade-in .2s' }} onClick={onClose} />
      <div className="relative max-h-[88dvh] w-full overflow-y-auto rounded-t-[28px] bg-white px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3" style={{ animation: 'sheet-in .28s cubic-bezier(.22,1,.36,1)' }}>
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-gray-200" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[18px] font-extrabold">{title}</h2>
          <button onClick={onClose} aria-label="닫기" className="-mr-2 p-2 text-sub"><Icon name="close" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function SectionTitle({ children, sub, right }: { children: ReactNode; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between">
      <div>
        <h2 className="text-[19px] font-extrabold tracking-tight">{children}</h2>
        {sub && <p className="mt-0.5 text-[13px] text-sub">{sub}</p>}
      </div>
      {right}
    </div>
  )
}

export function Toast({ msg }: { msg: string | null }) {
  if (!msg) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[96px] z-[60] mx-auto flex max-w-[430px] justify-center px-6" style={{ animation: 'fade-in .2s' }}>
      <div className="rounded-full bg-ink/90 px-5 py-3 text-[14px] font-semibold text-white shadow-float">{msg}</div>
    </div>
  )
}
