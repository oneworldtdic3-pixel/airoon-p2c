import type { ReactNode } from 'react'

/** 홈 외 탭의 흰 헤더: 큰 제목 + 탭별 글리프. 초록 블록은 홈 히어로에만 쓴다. */
export default function PageHeader({ eyebrow, title, glyph, children }: { eyebrow?: string; title: string; glyph?: ReactNode; children?: ReactNode }) {
  return (
    <header className="px-5 pb-5 pt-[calc(env(safe-area-inset-top)+28px)]">
      <div className="flex items-end justify-between">
        <div>
          {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
          <h1 className="text-[30px] font-extrabold leading-none">{title}</h1>
        </div>
        {glyph && <div className="w-14 shrink-0">{glyph}</div>}
      </div>
      {children && <div className="mt-5">{children}</div>}
    </header>
  )
}
