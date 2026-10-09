import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useApp } from '../../data/AppProvider'
import { toMessage } from '../../data/errors'
import { timeAgo } from '../../lib/format'
import { Chip } from '../../components/ui'

const TYPES = [['booth', '잔여석'], ['luckydraw', '럭키드로우'], ['reminder', '리마인드'], ['market', '산사장터'], ['notice', '안내']] as const

export default function Publish({ toast }: { toast: (m: string) => void }) {
  const { notifications } = useApp()
  const qc = useQueryClient()
  const [type, setType] = useState<(typeof TYPES)[number][0]>('notice')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setBusy(true)
    const { error } = await supabase.rpc('admin_publish_notification', { p_type: type, p_title: title.trim(), p_body: body.trim() })
    setBusy(false)
    if (error) return toast(toMessage(error))
    setTitle(''); setBody('')
    await qc.invalidateQueries({ queryKey: ['notifications'] })
    toast('알림을 발행했습니다')
  }

  return (
    <div className="space-y-8">
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void submit() }}>
        <div>
          <p className="eyebrow mb-2">종류</p>
          <div className="flex flex-wrap gap-2">{TYPES.map(([v, l]) => <Chip key={v} active={type === v} onClick={() => setType(v)}>{l}</Chip>)}</div>
        </div>
        <div>
          <label htmlFor="t" className="eyebrow mb-2 block">제목</label>
          <input id="t" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={40} placeholder="예) 싱잉볼 체험, 다섯 자리 남음" className="field" />
        </div>
        <div>
          <label htmlFor="b" className="eyebrow mb-2 block">내용</label>
          <textarea id="b" value={body} onChange={(e) => setBody(e.target.value)} rows={3} maxLength={200} placeholder="한두 문장이면 충분합니다" className="field resize-none" />
        </div>
        <button type="submit" disabled={busy || !title.trim()} className="btn w-full">{busy ? '발행 중' : '지금 발행'}</button>
        <p className="text-[11px] text-gray-400">발행 즉시 모든 참가자의 알림 탭과 홈 상단에 실시간으로 뜹니다. 카카오 알림톡 발송은 추후 연동.</p>
      </form>
      <section>
        <h2 className="eyebrow mb-1">최근 발행</h2>
        <ul className="divide-y hairline">
          {notifications.slice(0, 10).map((n) => (
            <li key={n.id} className="py-3">
              <div className="flex justify-between text-[11px]"><span className="font-bold text-deep">{TYPES.find((t) => t[0] === n.type)?.[1]}</span><span className="tnum text-gray-400">{timeAgo(n.created_at)}</span></div>
              <p className="mt-0.5 text-[14px] font-bold">{n.title}</p>
              <p className="text-[12.5px] text-sub">{n.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
