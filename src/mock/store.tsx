import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { photos as seedPhotos, notifications as seedNoti, sessions as seedSessions, showerSlots as seedSlots } from './data'
import { sceneArt } from './art'
import { dayKey } from '../lib/format'
import type { AppNotification, Booking, ParkingBooking, Photo, ProgramSession, ShowerBooking, ShowerSlot, SpotTag, User } from './types'

// 1단계: 인메모리 목 스토어. 2단계에서 Supabase(React Query + RPC)로 교체한다.
export const MOCK_OTP = '123456'
const SHOWER_DAILY_LIMIT = 2

type Result = { ok: true } | { ok: false; error: string }
const fail = (error: string): Result => ({ ok: false, error })
const rid = () => Math.random().toString(36).slice(2, 10)

interface Ctx {
  user: User | null
  login: (phone: string, otp: string, nickname?: string) => Result
  logout: () => void

  sessions: ProgramSession[]
  bookings: Booking[]
  bookSession: (sessionId: string) => Result & { booking?: Booking }
  cancelBooking: (bookingId: string) => void

  slots: ShowerSlot[]
  showerBookings: ShowerBooking[]
  bookShower: (slotId: string) => Result
  cancelShower: (id: string) => void

  parking: ParkingBooking | null
  saveParking: (zone: 'P1' | 'P2', car: string, dates: string[]) => Result

  photos: Photo[]
  likedIds: Set<string>
  toggleLike: (photoId: string) => void
  uploadPhoto: (file: File, spot: SpotTag) => Promise<Result>

  notifications: AppNotification[]
  consent: boolean
  setConsent: (v: boolean) => void
  luckyEntered: boolean
  enterLuckyDraw: () => Result

  // admin
  setHidden: (photoId: string, hidden: boolean) => void
  publish: (title: string, body: string) => void
}

const AppCtx = createContext<Ctx | null>(null)
export const useApp = () => {
  const c = useContext(AppCtx)
  if (!c) throw new Error('AppStateProvider missing')
  return c
}

const readUser = (): User | null => {
  try { return JSON.parse(localStorage.getItem('sansa:user') ?? 'null') } catch { return null }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readUser)
  const [sessions, setSessions] = useState(seedSessions)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [slots, setSlots] = useState(seedSlots)
  const [showerBookings, setShowerBookings] = useState<ShowerBooking[]>([])
  const [parking, setParking] = useState<ParkingBooking | null>(null)
  const [photos, setPhotos] = useState(seedPhotos)
  const [likedIds, setLiked] = useState<Set<string>>(new Set())
  const [notifications, setNoti] = useState(seedNoti)
  const [consent, setConsentState] = useState(false)
  const [luckyEntered, setLucky] = useState(false)

  const login: Ctx['login'] = (phone, otp, nickname) => {
    if (otp !== MOCK_OTP) return fail('인증번호가 올바르지 않아요.')
    const u: User = {
      id: 'u-' + phone.replace(/\D/g, ''),
      nickname: nickname?.trim() || '산사러',
      phone,
      team_id: null,
      is_admin: phone.replace(/\D/g, '') === '01000000000', // 목: 관리자 테스트 번호
    }
    setUser(u)
    try { localStorage.setItem('sansa:user', JSON.stringify(u)) } catch { /* ignore */ }
    return { ok: true }
  }
  const logout = () => {
    setUser(null)
    try { localStorage.removeItem('sansa:user') } catch { /* ignore */ }
  }

  const bookSession: Ctx['bookSession'] = (sessionId) => {
    if (!user) return fail('로그인이 필요해요.')
    const s = sessions.find((x) => x.id === sessionId)
    if (!s) return fail('회차를 찾을 수 없어요.')
    if (bookings.some((b) => b.session_id === sessionId && b.status === 'confirmed')) return fail('이미 예약한 회차예요.')
    if (s.booked_count >= s.capacity) return fail('마감되었어요.')
    const booking: Booking = { id: rid(), user_id: user.id, session_id: sessionId, qr_code: `SANSA-${rid().toUpperCase()}`, status: 'confirmed' }
    setBookings((b) => [...b, booking])
    setSessions((arr) => arr.map((x) => (x.id === sessionId ? { ...x, booked_count: x.booked_count + 1 } : x)))
    return { ok: true, booking }
  }
  const cancelBooking = (id: string) => {
    const b = bookings.find((x) => x.id === id)
    if (!b || b.status !== 'confirmed') return
    setBookings((arr) => arr.map((x) => (x.id === id ? { ...x, status: 'cancelled' } : x)))
    setSessions((arr) => arr.map((x) => (x.id === b.session_id ? { ...x, booked_count: Math.max(0, x.booked_count - 1) } : x)))
  }

  const bookShower: Ctx['bookShower'] = (slotId) => {
    if (!user) return fail('로그인이 필요해요.')
    const slot = slots.find((s) => s.id === slotId)
    if (!slot) return fail('슬롯을 찾을 수 없어요.')
    const day = dayKey(slot.starts_at)
    const mine = showerBookings.filter((b) => b.status === 'confirmed' && dayKey(slots.find((s) => s.id === b.slot_id)!.starts_at) === day)
    if (mine.length >= SHOWER_DAILY_LIMIT) return fail(`샤워실은 팀당 하루 ${SHOWER_DAILY_LIMIT}회까지 예약할 수 있어요.`)
    if (slot.booked_count >= slot.capacity) return fail('마감된 슬롯이에요.')
    setShowerBookings((b) => [...b, { id: rid(), user_id: user.id, slot_id: slotId, status: 'confirmed' }])
    setSlots((arr) => arr.map((s) => (s.id === slotId ? { ...s, booked_count: s.booked_count + 1 } : s)))
    return { ok: true }
  }
  const cancelShower = (id: string) => {
    const b = showerBookings.find((x) => x.id === id)
    if (!b || b.status !== 'confirmed') return
    setShowerBookings((arr) => arr.map((x) => (x.id === id ? { ...x, status: 'cancelled' } : x)))
    setSlots((arr) => arr.map((s) => (s.id === b.slot_id ? { ...s, booked_count: Math.max(0, s.booked_count - 1) } : s)))
  }

  const saveParking: Ctx['saveParking'] = (zone, car, dates) => {
    if (!user) return fail('로그인이 필요해요.')
    if (!/^\d{2,3}[가-힣]\s?\d{4}$/.test(car.trim())) return fail('차량번호 형식을 확인해 주세요. (예: 123가 4567)')
    if (!dates.length) return fail('이용 일자를 선택해 주세요.')
    setParking({ id: rid(), user_id: user.id, zone, car_number: car.trim(), dates })
    return { ok: true }
  }

  const toggleLike = useCallback((photoId: string) => {
    setLiked((prev) => {
      const next = new Set(prev)
      const had = next.has(photoId)
      had ? next.delete(photoId) : next.add(photoId)
      setPhotos((arr) => arr.map((p) => (p.id === photoId ? { ...p, likes_count: p.likes_count + (had ? -1 : 1) } : p)))
      return next
    })
  }, [])

  const uploadPhoto: Ctx['uploadPhoto'] = async (file, spot) => {
    if (!user) return fail('로그인이 필요해요.')
    const url = await new Promise<string>((res) => {
      const r = new FileReader()
      r.onload = () => res(String(r.result))
      r.onerror = () => res(sceneArt(spot, Date.now() % 50))
      r.readAsDataURL(file)
    })
    setPhotos((arr) => [{ id: rid(), user_id: user.id, spot_tag: spot, url, likes_count: 0, is_hidden: false, created_at: new Date().toISOString(), nickname: user.nickname }, ...arr])
    return { ok: true }
  }

  const enterLuckyDraw = (): Result => {
    if (!user) return fail('로그인이 필요해요.')
    if (luckyEntered) return fail('이미 응모했어요.')
    setLucky(true)
    return { ok: true }
  }

  const setHidden = (id: string, hidden: boolean) => setPhotos((arr) => arr.map((p) => (p.id === id ? { ...p, is_hidden: hidden } : p)))
  const publish = (title: string, body: string) =>
    setNoti((arr) => [{ id: rid(), type: 'notice', title, body, created_at: new Date().toISOString() }, ...arr])

  const value = useMemo<Ctx>(
    () => ({ user, login, logout, sessions, bookings, bookSession, cancelBooking, slots, showerBookings, bookShower, cancelShower, parking, saveParking, photos, likedIds, toggleLike, uploadPhoto, notifications, consent, setConsent: setConsentState, luckyEntered, enterLuckyDraw, setHidden, publish }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, sessions, bookings, slots, showerBookings, parking, photos, likedIds, notifications, consent, luckyEntered],
  )
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}
