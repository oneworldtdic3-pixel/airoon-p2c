import type { SpotTag } from './types'
import { fmtTime } from '../lib/format'

/** 프로그램 예약 오픈 시각 — 티켓 판매 마감 후 10월 말. DB program_booking_opens_at() 과 같은 값 */
export const PROGRAM_BOOKING_OPENS = '2026-10-31T00:00:00+09:00'
export const PROGRAM_BOOKING_LABEL = '10월 말'
export const programBookingOpen = () => Date.now() >= Date.parse(PROGRAM_BOOKING_OPENS)

/** 프로그램 시간대 확정 전: 회차 시각 대신 '시간 협의중' 으로 표시. 확정되면 false 로 */
export const PROGRAM_TIME_TBD = true
/** 회차 시각 표시 (확정 전엔 '시간 협의중', 같은 날 여러 회차면 'n회차') */
export const sessionLabel = (iso: string, idx?: number, total?: number) =>
  PROGRAM_TIME_TBD ? (total && total > 1 && idx !== undefined ? `${idx + 1}회차` : '시간 협의중') : fmtTime(iso)

export const EVENT_DAYS = ['2026-11-06', '2026-11-07', '2026-11-08'] as const
export const SPOTS: SpotTag[] = ['일주문', '대웅전 계단', '차밭 능선', '불일폭포']
/** 샤워 부스 — 주차장(C 캠핑존) 4개 + 쌍계사 경내 1개. 부스 1개(3×6m) = 남 6 · 여 6 (30분 슬롯마다). DB shower_slots.building 과 같은 이름 */
export const SHOWER_BOOTHS = [
  { building: '주차장 1', zone: '주차장' }, { building: '주차장 2', zone: '주차장' }, { building: '주차장 3', zone: '주차장' }, { building: '주차장 4', zone: '주차장' },
  { building: '쌍계사', zone: '쌍계사' },
] as const
export const SHOWER_BOOTH_CAPACITY = 6
export interface SponsorLogo { name: string; src?: string; h?: number }
/** 주최·주관·후원·언론사. 로고는 public/sponsors (투명 PNG, 높이 160px) */
export const SPONSOR_TIERS: { tier: string; items: SponsorLogo[] }[] = [
  { tier: '주최', items: [{ name: '하동 쌍계사', src: '/sponsors/ssanggyesa.png', h: 26 }] },
  { tier: '주관', items: [{ name: '산사캠프 사무국', src: '/wordmark.png', h: 30 }] },
  { tier: '후원', items: [{ name: '한국불교문화사업단', src: '/sponsors/kbcc.png', h: 24 }, { name: '농협', src: '/sponsors/nh.png', h: 26 }, { name: 'NH증권', src: '/sponsors/nhis.png', h: 20 }, { name: '도반HC', src: '/sponsors/dobanhc.png', h: 22 }, { name: '붓쯔 BUDDHZ', src: '/sponsors/buddhz.png', h: 30 }] },
  { tier: '부스\n참여업체', items: [{ name: '하동 쌍계사', src: '/sponsors/ssanggyesa.png', h: 26 }, { name: '붓쯔 BUDDHZ', src: '/sponsors/buddhz.png', h: 30 }, { name: 'FAS CARE', src: '/sponsors/fascare.png', h: 32 }] },
]
/** 개발용 테스트 번호 — Supabase 대시보드 Phone 공급자의 Test phone numbers 에 같은 값을 등록해야 한다 */
export const TEST_PHONES = { user: '+821012345678', admin: '+821000000000', otp: '123456' }

export const SOCIAL = [
  { id: 'instagram', name: '인스타그램', handle: '@sansacamp', url: 'https://www.instagram.com/sansacamp' },
  { id: 'youtube', name: '유튜브', handle: '@sansacamp', url: 'https://www.youtube.com/@sansacamp' },
] as const

/** 공양·예불 — 예약 없는 고정 안내 일정. 첫날 14:00 입재, 마지막 날 11:00 회향에 맞춤 */
export interface MealSlot { id: string; day: (typeof EVENT_DAYS)[number]; time: string; title: string; location: string; kind: 'meal' | 'ritual' | 'info'; note: string }
export const MEALS: MealSlot[] = [
  { id: 'info-1-in', day: '2026-11-06', time: '14:00', title: '입장 등록 (체크인)', location: '종합안내소', kind: 'info', note: '14:00부터 · QR 팔찌 수령' },
  { id: 'rit-1-e', day: '2026-11-06', time: '17:55', title: '저녁예불 및 법고', location: '대웅전', kind: 'ritual', note: '자율참여' },
  { id: 'meal-1-d', day: '2026-11-06', time: '17:00', title: '저녁공양', location: '공양간', kind: 'meal', note: '예약 없이 이용' },
  { id: 'rit-2-m', day: '2026-11-07', time: '04:20', title: '새벽예불', location: '대웅전', kind: 'ritual', note: '자율참여' },
  { id: 'meal-2-b', day: '2026-11-07', time: '06:00', title: '아침공양', location: '공양간', kind: 'meal', note: '예약 없이 이용' },
  { id: 'meal-2-l', day: '2026-11-07', time: '12:00', title: '점심공양', location: '공양간', kind: 'meal', note: '예약 없이 이용' },
  { id: 'meal-2-d', day: '2026-11-07', time: '17:00', title: '저녁공양', location: '공양간', kind: 'meal', note: '예약 없이 이용' },
  { id: 'rit-2-e', day: '2026-11-07', time: '17:55', title: '저녁예불 및 법고', location: '대웅전', kind: 'ritual', note: '자율참여' },
  { id: 'rit-3-m', day: '2026-11-08', time: '04:20', title: '새벽예불', location: '대웅전', kind: 'ritual', note: '자율참여' },
  { id: 'meal-3-b', day: '2026-11-08', time: '06:00', title: '아침공양', location: '공양간', kind: 'meal', note: '예약 없이 이용' },
]
export const mealAt = (m: MealSlot) => `${m.day}T${m.time}:00+09:00`
export const mealTag = (m: MealSlot) => (m.kind === 'meal' ? '공양' : m.kind === 'ritual' ? '예불' : '입장')
