import type { ReactNode } from 'react'
import { Cloud, Wave } from '../illust'

export default function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <header className="relative overflow-hidden bg-hero-grad px-6 pb-10 pt-[calc(env(safe-area-inset-top)+24px)] text-white">
      <Cloud className="absolute -right-4 top-4 w-24 opacity-25" />
      <h1 className="relative text-[26px] font-extrabold tracking-tight">{title}</h1>
      {sub && <p className="relative mt-1 text-[14px] font-medium opacity-90">{sub}</p>}
      {children && <div className="relative mt-4">{children}</div>}
      <Wave className="absolute inset-x-0 -bottom-px h-8 w-full" />
    </header>
  )
}
