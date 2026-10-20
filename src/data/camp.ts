import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

// 캠핑 사이트 배정 — 데이터 타입과 조회 훅. 결제는 스마트스토어, 앱은 '사이트 배정'만 한다.
export interface CampEvent {
  id: string; slug: string; temple_name: string; edition: number; title: string
  starts_at: string; ends_at: string; checkin_time: string; checkout_time: string
  refund_rules: { label: string; rate: number; note?: string }[]
  refund_note: string
  pricing: { site?: number | null; adult?: number | null; kid?: number | null; infant?: number | null }
  consents: { key: string; title: string; body: string }[]
  is_active: boolean; is_test: boolean
}
export interface EventMap { id: string; event_id: string; title: string; image_url: string; width: number; height: number; sort: number }
export interface Zone {
  id: string; event_id: string; code: string; name: string; subtitle: string; capacity: number
  ground: string; toilet_distance: string; shower_distance: string; pet_allowed: boolean; photo_url: string
  price_won: number | null
  remaining_override: number | null; recent_bookings: number; sold_out: boolean; smartstore_url: string; sort: number
}
export interface Site {
  id: string; event_id: string; zone_id: string; map_id: string | null; number: string; x: number; y: number
  width_m: number | null; depth_m: number | null; ground: string; pet_allowed: boolean; status: 'open' | 'blocked'; sort: number; is_test: boolean
}
export interface Occupancy { site_id: string; taken: boolean; group_key: string | null }
export interface ZoneSummary extends Omit<Zone, 'event_id' | 'remaining_override' | 'sort' | 'price_won'> { remaining: number; site_count: number; taken: number }
export interface Member { id: string; name: string; phone: string; is_lead: boolean; qr_code: string }
export interface MyAssignment {
  id: string; site_number: string; zone_code: string; zone_name: string; adults: number; kids: number; infants: number
  car_number: string; group_key: string | null; qr_code: string; status: string; created_at: string; members: Member[]
}

/** 가격 표기 — 관리자가 events.pricing 에 스마트스토어 기준 값을 넣기 전에는 숫자를 보여 주지 않는다 */
export const won = (n: number) => n.toLocaleString('ko-KR') + '원'
export const priceLabel = (e?: CampEvent | null) => (e?.pricing?.site ? `1사이트 ${won(e.pricing.site)} (1~2인)` : '가격은 스마트스토어 상품 페이지 참고')
export const extraFeeLines = (e?: CampEvent | null) => {
  const p = e?.pricing ?? {}
  const lines: string[] = []
  if (p.adult) lines.push(`추가 성인 ${won(p.adult)}`)
  if (p.kid) lines.push(`36개월~미취학 ${won(p.kid)}`)
  if (p.adult || p.kid) lines.push('36개월 미만 무료')
  return lines
}

/** 현재 진행 중인 행사(제1회 쌍계사). 여러 행사가 있으면 가장 가까운 것 */
export function useCampEvent() {
  return useQuery({
    queryKey: ['camp-event'],
    queryFn: async () => {
      const { data, error } = await supabase.from('events').select('*').eq('is_active', true).order('starts_at').limit(1).maybeSingle()
      if (error) throw error
      return (data ?? null) as CampEvent | null
    },
    staleTime: 60_000,
  })
}

/** 행사의 배치도·구역·사이트·점유 상태. 실시간으로 다른 사람의 선택이 반영된다 */
export function useCampBoard(eventId: string | undefined, { live = false } = {}) {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['camp-board', eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const [m, z, s, o] = await Promise.all([
        supabase.from('event_maps').select('*').eq('event_id', eventId!).order('sort'),
        supabase.from('zones').select('*').eq('event_id', eventId!).order('sort'),
        supabase.from('sites').select('*').eq('event_id', eventId!).order('sort').order('number'),
        supabase.rpc('site_occupancy', { p_event: eventId }),
      ])
      for (const r of [m, z, s, o]) if (r.error) throw r.error
      const occ = new Map<string, Occupancy>()
      for (const r of (o.data ?? []) as Occupancy[]) occ.set(r.site_id, r)
      return { maps: (m.data ?? []) as EventMap[], zones: (z.data ?? []) as Zone[], sites: ((s.data ?? []) as Site[]).map((x) => ({ ...x, x: Number(x.x), y: Number(x.y) })), occ }
    },
    staleTime: 10_000,
  })
  useEffect(() => {
    if (!live || !eventId) return
    const inv = () => qc.invalidateQueries({ queryKey: ['camp-board', eventId] })
    const ch = supabase.channel(`camp:${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_assignments', filter: `event_id=eq.${eventId}` }, inv)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sites', filter: `event_id=eq.${eventId}` }, inv)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'zones', filter: `event_id=eq.${eventId}` }, inv)
      .subscribe()
    const onVisible = () => { if (document.visibilityState === 'visible') void inv() }
    document.addEventListener('visibilitychange', onVisible)
    return () => { document.removeEventListener('visibilitychange', onVisible); supabase.removeChannel(ch) }
  }, [live, eventId, qc])
  return q
}

/** 홈 카드용 구역 요약 */
export function useZoneSummary(eventId: string | undefined) {
  return useQuery({
    queryKey: ['zone-summary', eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('zone_summary', { p_event: eventId })
      if (error) throw error
      return (data ?? []) as ZoneSummary[]
    },
    staleTime: 30_000,
  })
}

/** 내 배정 (로그인 시) */
export function useMyAssignments(eventId: string | undefined, uid: string | null) {
  return useQuery({
    queryKey: ['my-assignments', eventId, uid],
    enabled: !!eventId && !!uid,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('my_assignments', { p_event: eventId })
      if (error) throw error
      return (data ?? []) as MyAssignment[]
    },
  })
}

/** 사이트 번호 정렬용: 'A-10' 이 'A-9' 뒤에 오게 */
export const siteNumberKey = (n: string) => n.replace(/\d+/g, (d) => d.padStart(4, '0'))
