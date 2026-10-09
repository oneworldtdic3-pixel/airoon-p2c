import { useEffect, type ReactNode } from 'react'
import Icon from './Icon'

export function Chip({ active, onClick, children }: { active?: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold transition duration-200 active:scale-95 ${active ? 'bg-ink text-white' : 'border border-line bg-white text-ink'}`}
    >
      {children}
    </button>
  )
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div role="tablist" className="flex gap-6 border-b hairline">
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={`-mb-px border-b-2 py-3 text-[16px] font-bold transition ${value === o.value ? 'border-ink text-ink' : 'border-transparent text-gray-400'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Tag({ children, tone = 'ink' }: { children: ReactNode; tone?: 'ink' | 'green' | 'sun' | 'red' }) {
  const t = { ink: 'text-sub', green: 'text-deep', sun: 'bg-sun text-ink px-1.5 rounded-md', red: 'text-red-500' }[tone]
  return <span className={`text-[11px] font-bold tracking-wide ${t}`}>{children}</span>
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`relative h-7 w-12 shrink-0 rounded-full transition duration-200 ${on ? 'bg-brand-grad' : 'bg-gray-300'}`}>
      <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all duration-200 ${on ? 'left-[22px]' : 'left-0.5'}`} />
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
      <div className="absolute inset-0 bg-ink/35" style={{ animation: 'fade-in .2s' }} onClick={onClose} />
      <div className="relative max-h-[88dvh] w-full overflow-y-auto rounded-t-[28px] bg-white px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3" style={{ animation: 'sheet-in .3s cubic-bezier(.22,1,.36,1)' }}>
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-gray-200" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[20px] font-extrabold">{title}</h2>
          <button onClick={onClose} aria-label="닫기" className="-mr-2 p-2 text-sub"><Icon name="close" /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function SectionTitle({ children, eyebrow, right }: { children: ReactNode; eyebrow?: string; right?: ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h2 className="text-[21px] font-extrabold">{children}</h2>
      </div>
      {right}
    </div>
  )
}

export function Toast({ msg }: { msg: string | null }) {
  if (!msg) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[96px] z-[60] mx-auto flex max-w-[430px] justify-center px-6" style={{ animation: 'rise .25s' }}>
      <div className="rounded-full bg-ink px-5 py-3 text-[14px] font-semibold text-white shadow-card">{msg}</div>
    </div>
  )
}
