import { useCallback, useRef, useState } from 'react'

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  const t = useRef<number | undefined>(undefined)
  const show = useCallback((m: string, ms?: number) => {
    setMsg(m)
    window.clearTimeout(t.current)
    // 오류·안내처럼 긴 문구는 더 오래 보여준다
    t.current = window.setTimeout(() => setMsg(null), ms ?? (m.length > 18 ? 4500 : 2200))
  }, [])
  return { msg, show }
}
