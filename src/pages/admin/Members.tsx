import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { fmtPhone, timeAgo } from '../../lib/format'
import { Chip } from '../../components/ui'

type Member = {
  id: string; nickname: string; phone: string | null; is_admin: boolean; kakao_alimtalk_consent: boolean
  providers: string[]; signed_up: string; last_sign_in: string | null
  programs: number; showers: number; parking: boolean; photos: number
}
const PROVIDER: Record<string, string> = { phone: '휴대폰', kakao: '카카오', google: '구글', naver: '네이버', email: '이메일' }
const fmtDate = (iso: string) => new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso))
type Filter = 'all' | 'today' | 'booked' | 'phone' | 'social' | 'nonick'

/** 관리자 · 회원 목록. 가입 경로·마지막 로그인·예약 현황을 한눈에 */
export default function Members({ toast }: { toast: (m: string) => void }) {
  const q = useQuery({
    queryKey: ['admin-members'],
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_members')
      if (error) throw error
      return (data ?? []) as Member[]
    },
  })
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const todayKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date())
  const rows = useMemo(() => {
    const s = search.replace(/\s|-/g, '').toLowerCase()
    return (q.data ?? []).filter((m) => {
      if (filter === 'today' && new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date(m.signed_up)) !== todayKey) return false
      if (filter === 'booked' && !(m.programs || m.showers || m.parking)) return false
      if (filter === 'phone' && !m.providers.includes('phone')) return false
      if (filter === 'social' && !m.providers.some((p) => p !== 'phone')) return false
      if (filter === 'nonick' && m.nickname !== '산사러') return false
      if (!s) return true
      return m.nickname.toLowerCase().includes(s) || (m.phone ?? '').replace(/^82/, '0').includes(s)
    })
  }, [q.data, filter, search, todayKey])
  const total = q.data?.length ?? 0
  const todayCount = (q.data ?? []).filter((m) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date(m.signed_up)) === todayKey).length

  const copyCsv = async () => {
    const lines = [['닉네임', '휴대폰', '가입경로', '가입일', '마지막 로그인', '프로그램', '샤워', '주차', '사진', '알림톡 동의'].join(','), ...rows.map((m) => [
      m.nickname, fmtPhone(m.phone), m.providers.map((p) => PROVIDER[p] ?? p).join(' '), fmtDate(m.signed_up), m.last_sign_in ? fmtDate(m.last_sign_in) : '', m.programs, m.showers, m.parking ? 'O' : '', m.photos, m.kakao_alimtalk_consent ? 'O' : '',
    ].join(','))]
    try { await navigator.clipboard.writeText(lines.join('\n')); toast(`${rows.length}명을 복사했습니다 (엑셀에 붙여넣기)`) } catch { toast('복사하지 못했습니다') }
  }

  return (
    <div>
      <dl className="grid grid-cols-3 gap-2 text-center">
        {[['전체 회원', total], ['오늘 가입', todayCount], ['예약 있음', (q.data ?? []).filter((m) => m.programs || m.showers || m.parking).length]].map(([k, v]) => (
          <div key={String(k)} className="rounded-tile bg-mint py-3"><dt className="text-[11px] text-sub">{k}</dt><dd className="tnum text-[20px] font-extrabold">{v}</dd></div>
        ))}
      </dl>
      <input value={search} onChange={(e) => setSearch(e.target.value)} inputMode="search" placeholder="닉네임 또는 휴대폰 뒷자리" className="field mt-4 text-[16px] font-bold" />
      <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
        {([['all', '전체'], ['today', '오늘 가입'], ['booked', '예약 있음'], ['phone', '휴대폰'], ['social', '소셜'], ['nonick', '닉네임 미설정']] as [Filter, string][]).map(([v, l]) => (
          <Chip key={v} active={filter === v} onClick={() => setFilter(v)}>{l}</Chip>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="tnum text-[13px] font-bold">{rows.length}명</p>
        <button type="button" onClick={() => void copyCsv()} disabled={!rows.length} className="btn-ghost !py-2 !text-[12.5px] disabled:opacity-40">목록 복사</button>
      </div>
      {q.isLoading && <p className="py-10 text-center text-[13px] text-sub">불러오는 중</p>}
      {q.error && <p className="py-10 text-center text-[13px] text-red-500">목록을 불러오지 못했습니다</p>}
      <ul className="mt-2 divide-y hairline border-y">
        {rows.map((m) => (
          <li key={m.id} className="py-3">
            <div className="flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate text-[15px] font-extrabold">
                {m.nickname}
                {m.is_admin && <span className="ml-1.5 rounded bg-sun px-1.5 py-0.5 align-middle text-[10px] font-extrabold">관리자</span>}
                {m.nickname === '산사러' && <span className="ml-1.5 rounded bg-gray-100 px-1.5 py-0.5 align-middle text-[10px] font-bold text-sub">닉네임 미설정</span>}
              </p>
              <p className="tnum shrink-0 text-[12px] text-sub">{fmtDate(m.signed_up)} 가입</p>
            </div>
            <p className="tnum mt-0.5 text-[13px] text-sub">
              {m.phone ? fmtPhone(m.phone) : '휴대폰 없음'} · {m.providers.map((p) => PROVIDER[p] ?? p).join('·') || '—'}
              {m.kakao_alimtalk_consent && ' · 알림톡 동의'}
            </p>
            <p className="tnum mt-0.5 text-[12px] text-gray-400">
              마지막 로그인 {m.last_sign_in ? timeAgo(m.last_sign_in) : '없음(인증 미완료)'}
              {(m.programs || m.showers || m.parking || m.photos) ? ` · 프로그램 ${m.programs} · 샤워 ${m.showers}${m.parking ? ' · 주차 등록' : ''}${m.photos ? ` · 사진 ${m.photos}` : ''}` : ' · 예약 없음'}
            </p>
          </li>
        ))}
        {!q.isLoading && !rows.length && <li className="py-8 text-center text-[13px] text-sub">해당하는 회원이 없습니다</li>}
      </ul>
      <p className="mt-3 text-[11px] text-gray-400">30초마다 자동 갱신 · 관리자 지정은 Supabase에서만 가능합니다</p>
    </div>
  )
}
