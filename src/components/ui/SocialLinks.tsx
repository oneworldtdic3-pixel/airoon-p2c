import type { ReactNode } from 'react'
import { SOCIAL } from '../../data/constants'

const icons: Record<string, ReactNode> = {
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8.5c0-1.4 1.1-2.5 2.5-2.5h13A2.5 2.5 0 0 1 21 8.5v7a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 15.5Z" /><path d="m10 9.5 5 2.5-5 2.5Z" fill="currentColor" />
    </svg>
  ),
}

/** 공식 SNS — 새 탭으로 연다 */
export default function SocialLinks({ compact = false }: { compact?: boolean }) {
  return (
    <ul className={`flex ${compact ? 'gap-2' : 'gap-2.5'}`}>
      {SOCIAL.map((s) => (
        <li key={s.id}>
          <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={`산사캠프 ${s.name} (새 창)`}
             className={`flex items-center gap-2 rounded-full border border-line bg-white font-bold text-ink transition active:scale-95 ${compact ? 'px-3 py-2 text-[12.5px]' : 'px-4 py-2.5 text-[13.5px]'}`}>
            <span className="text-deep">{icons[s.id]}</span>{s.name}
          </a>
        </li>
      ))}
    </ul>
  )
}
