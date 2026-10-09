import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import { supabase, photoUrl } from '../lib/supabase'
import { resolveSeedArt } from './art'
import { toMessage } from './errors'
import type { AppNotification, Banner, Booking, ParkingBooking, Photo, Profile, Program, ProgramSession, ShowerBooking, ShowerSlot, SpotTag } from './types'

export type Result = { ok: true } | { ok: false; error: string }
const fail = (e: unknown): Result => ({ ok: false, error: toMessage(e) })

interface Ctx {
  ready: boolean
  user: Profile | null
  sendOtp: (phone: string) => Promise<Result>
  verifyOtp: (phone: string, otp: string, profile?: { nickname?: string; consent?: boolean }) => Promise<Result>
  logout: () => Promise<void>

  programs: Program[]
  sessions: ProgramSession[]
  bookings: Booking[]
  bookSession: (sessionId: string) => Promise<Result & { booking?: Booking }>
  cancelBooking: (bookingId: string) => Promise<Result>

  slots: ShowerSlot[]
  showerBookings: ShowerBooking[]
  bookShower: (slotId: string) => Promise<Result>
  cancelShower: (id: string) => Promise<Result>

  parking: ParkingBooking | null
  saveParking: (zone: 'P1' | 'P2', car: string, dates: string[]) => Promise<Result>

  photos: Photo[]
  likedIds: Set<string>
  toggleLike: (photoId: string) => Promise<Result>
  uploadPhoto: (file: File, spot: SpotTag) => Promise<Result>

  notifications: AppNotification[]
  banners: Banner[]
  consent: boolean
  setConsent: (v: boolean) => Promise<Result>
  luckyEntered: boolean
  enterLuckyDraw: () => Promise<Result>
}

const AppCtx = createContext<Ctx | null>(null)
export const useApp = () => {
  const c = useContext(AppCtx)
  if (!c) throw new Error('AppProvider missing')
  return c
}

/** 010-1234-5678 → +821012345678 */
export const toE164 = (phone: string) => '+82' + phone.replace(/\D/g, '').replace(/^0/, '')

export function AppProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient()
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)
  const uid = session?.user.id ?? null

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true) })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  // ---- 조회 -------------------------------------------------------------
  const profileQ = useQuery({
    queryKey: ['profile', uid],
    enabled: !!uid,
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', uid!).single()
      if (error) throw error
      return data as Profile
    },
  })
  const programsQ = useQuery({ queryKey: ['programs'], queryFn: async () => (await supabase.from('programs').select('*').order('sort')).data as Program[] })
  const sessionsQ = useQuery({ queryKey: ['sessions'], queryFn: async () => (await supabase.from('program_sessions').select('*').order('starts_at')).data as ProgramSession[] })
  const slotsQ = useQuery({ queryKey: ['slots'], queryFn: async () => (await supabase.from('shower_slots').select('*').order('starts_at')).data as ShowerSlot[] })
  const notiQ = useQuery({ queryKey: ['notifications'], queryFn: async () => (await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50)).data as AppNotification[] })
  const bannersQ = useQuery({
    queryKey: ['banners'],
    queryFn: async () => ((await supabase.from('banners').select('*').eq('is_active', true).order('sort')).data as Omit<Banner, 'image'>[]).map((b) => ({ ...b, image: resolveSeedArt(b.image_path) })),
  })
  const photosQ = useQuery({
    queryKey: ['photos'],
    queryFn: async () => {
      const { data } = await supabase.from('photos').select('*, profiles(nickname)').order('created_at', { ascending: false }).limit(200)
      return ((data ?? []) as (Omit<Photo, 'url' | 'nickname'> & { profiles: { nickname: string } | null })[]).map(({ profiles, ...p }) => ({
        ...p, nickname: profiles?.nickname ?? '산사러', url: p.storage_path.startsWith('seed:') ? resolveSeedArt(p.storage_path) : photoUrl(p.storage_path),
      })) as Photo[]
    },
  })
  const mineQ = useQuery({
    queryKey: ['mine', uid],
    enabled: !!uid,
    queryFn: async () => {
      const [b, s, p, l, ld] = await Promise.all([
        supabase.from('bookings').select('*').eq('status', 'confirmed'),
        supabase.from('shower_bookings').select('*').eq('status', 'confirmed'),
        supabase.from('parking_bookings').select('*').maybeSingle(),
        supabase.from('photo_likes').select('photo_id'),
        supabase.from('lucky_draw_entries').select('id').maybeSingle(),
      ])
      return {
        bookings: (b.data ?? []) as Booking[],
        showerBookings: (s.data ?? []) as ShowerBooking[],
        parking: (p.data ?? null) as ParkingBooking | null,
        likedIds: new Set(((l.data ?? []) as { photo_id: string }[]).map((x) => x.photo_id)),
        luckyEntered: !!ld.data,
      }
    },
  })

  // ---- Realtime: 변경 시 해당 쿼리만 무효화 ------------------------------
  useEffect(() => {
    const ch = supabase.channel('app')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, () => qc.invalidateQueries({ queryKey: ['photos'] }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => qc.invalidateQueries({ queryKey: ['notifications'] }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'program_sessions' }, () => qc.invalidateQueries({ queryKey: ['sessions'] }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shower_slots' }, () => qc.invalidateQueries({ queryKey: ['slots'] }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banners' }, () => qc.invalidateQueries({ queryKey: ['banners'] }))
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [qc])

  const refreshMine = useCallback(() => qc.invalidateQueries({ queryKey: ['mine', uid] }), [qc, uid])
  const rpc = useCallback(async (fn: string, args?: Record<string, unknown>) => {
    const { data, error } = await supabase.rpc(fn, args)
    if (error) throw error
    return data
  }, [])

  // ---- 인증 -------------------------------------------------------------
  const sendOtp: Ctx['sendOtp'] = async (phone) => {
    const { error } = await supabase.auth.signInWithOtp({ phone: toE164(phone) })
    return error ? fail(error) : { ok: true }
  }
  const verifyOtp: Ctx['verifyOtp'] = async (phone, otp, profile) => {
    const { data, error } = await supabase.auth.verifyOtp({ phone: toE164(phone), token: otp, type: 'sms' })
    if (error) return fail(error)
    const patch: Record<string, unknown> = {}
    if (profile?.nickname?.trim()) patch.nickname = profile.nickname.trim()
    if (profile?.consent !== undefined) patch.kakao_alimtalk_consent = profile.consent
    if (Object.keys(patch).length && data.user) await supabase.from('profiles').update(patch).eq('id', data.user.id)
    await qc.invalidateQueries({ queryKey: ['profile'] })
    return { ok: true }
  }
  const logout = async () => { await supabase.auth.signOut(); qc.removeQueries({ queryKey: ['mine'] }); qc.removeQueries({ queryKey: ['profile'] }) }

  // ---- 예약 -------------------------------------------------------------
  const bookSession: Ctx['bookSession'] = async (sessionId) => {
    try {
      const booking = (await rpc('book_session', { p_session: sessionId })) as Booking
      await Promise.all([refreshMine(), qc.invalidateQueries({ queryKey: ['sessions'] })])
      return { ok: true, booking }
    } catch (e) { return fail(e) }
  }
  const cancelBooking: Ctx['cancelBooking'] = async (id) => {
    try { await rpc('cancel_booking', { p_booking: id }); await Promise.all([refreshMine(), qc.invalidateQueries({ queryKey: ['sessions'] })]); return { ok: true } } catch (e) { return fail(e) }
  }
  const bookShower: Ctx['bookShower'] = async (slotId) => {
    try { await rpc('book_shower', { p_slot: slotId }); await Promise.all([refreshMine(), qc.invalidateQueries({ queryKey: ['slots'] })]); return { ok: true } } catch (e) { return fail(e) }
  }
  const cancelShower: Ctx['cancelShower'] = async (id) => {
    try { await rpc('cancel_shower', { p_booking: id }); await Promise.all([refreshMine(), qc.invalidateQueries({ queryKey: ['slots'] })]); return { ok: true } } catch (e) { return fail(e) }
  }
  const saveParking: Ctx['saveParking'] = async (zone, car, dates) => {
    try { await rpc('upsert_parking', { p_zone: zone, p_car: car.trim(), p_dates: dates }); await refreshMine(); return { ok: true } } catch (e) { return fail(e) }
  }

  // ---- 사진 -------------------------------------------------------------
  const toggleLike: Ctx['toggleLike'] = async (photoId) => {
    // 낙관적 갱신
    const liked = mineQ.data?.likedIds.has(photoId) ?? false
    qc.setQueryData(['photos'], (old: Photo[] | undefined) => old?.map((p) => (p.id === photoId ? { ...p, likes_count: p.likes_count + (liked ? -1 : 1) } : p)))
    qc.setQueryData(['mine', uid], (old: typeof mineQ.data) => old && { ...old, likedIds: new Set(liked ? [...old.likedIds].filter((x) => x !== photoId) : [...old.likedIds, photoId]) })
    try { await rpc('toggle_like', { p_photo: photoId }); return { ok: true } }
    catch (e) { await Promise.all([qc.invalidateQueries({ queryKey: ['photos'] }), refreshMine()]); return fail(e) }
  }
  const uploadPhoto: Ctx['uploadPhoto'] = async (file, spot) => {
    if (!uid) return fail('AUTH_REQUIRED')
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `${uid}/${Date.now()}.${ext}`
    const up = await supabase.storage.from('photos').upload(path, file, { contentType: file.type || 'image/jpeg', upsert: false })
    if (up.error) return fail(up.error)
    const { error } = await supabase.from('photos').insert({ user_id: uid, spot_tag: spot, storage_path: path })
    if (error) return fail(error)
    await qc.invalidateQueries({ queryKey: ['photos'] })
    return { ok: true }
  }

  // ---- 기타 -------------------------------------------------------------
  const setConsent: Ctx['setConsent'] = async (v) => {
    if (!uid) return fail('AUTH_REQUIRED')
    const { error } = await supabase.from('profiles').update({ kakao_alimtalk_consent: v }).eq('id', uid)
    if (error) return fail(error)
    await qc.invalidateQueries({ queryKey: ['profile', uid] })
    return { ok: true }
  }
  const enterLuckyDraw: Ctx['enterLuckyDraw'] = async () => {
    try { await rpc('enter_lucky_draw'); await refreshMine(); return { ok: true } } catch (e) { return fail(e) }
  }

  const value = useMemo<Ctx>(() => ({
    ready, user: uid ? profileQ.data ?? null : null, sendOtp, verifyOtp, logout,
    programs: programsQ.data ?? [], sessions: sessionsQ.data ?? [], bookings: mineQ.data?.bookings ?? [], bookSession, cancelBooking,
    slots: slotsQ.data ?? [], showerBookings: mineQ.data?.showerBookings ?? [], bookShower, cancelShower,
    parking: mineQ.data?.parking ?? null, saveParking,
    photos: photosQ.data ?? [], likedIds: mineQ.data?.likedIds ?? new Set(), toggleLike, uploadPhoto,
    notifications: notiQ.data ?? [], banners: bannersQ.data ?? [],
    consent: profileQ.data?.kakao_alimtalk_consent ?? false, setConsent,
    luckyEntered: mineQ.data?.luckyEntered ?? false, enterLuckyDraw,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [ready, uid, profileQ.data, programsQ.data, sessionsQ.data, slotsQ.data, notiQ.data, bannersQ.data, photosQ.data, mineQ.data])

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}
