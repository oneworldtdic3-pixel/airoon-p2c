import { useCallback, useRef, useState } from 'react'

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  const t = useRef<number | undefined>(undefined)
  const show = useCallback((m: string) => {
    setMsg(m)
    window.clearTimeout(t.current)
    t.current = window.setTimeout(() => setMsg(null), 2200)
  }, [])
  return { msg, show }
}
