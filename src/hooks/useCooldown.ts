import { useEffect, useRef, useState } from 'react'

/** 재발송 쿨다운(초). start() 호출 후 1초마다 줄어들고 0 이 되면 다시 보낼 수 있다. */
export function useCooldown(seconds = 60) {
  const [left, setLeft] = useState(0)
  const until = useRef(0)
  useEffect(() => {
    if (left <= 0) return
    const t = setInterval(() => setLeft(Math.max(0, Math.ceil((until.current - Date.now()) / 1000))), 500)
    return () => clearInterval(t)
  }, [left])
  const start = () => { until.current = Date.now() + seconds * 1000; setLeft(seconds) }
  const reset = () => { until.current = 0; setLeft(0) }
  return { left, ready: left <= 0, start, reset }
}
