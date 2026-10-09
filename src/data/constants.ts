import type { SpotTag } from './types'

export const EVENT_DAYS = ['2026-11-06', '2026-11-07', '2026-11-08'] as const
export const SPOTS: SpotTag[] = ['일주문', '대웅전 계단', '차밭 능선', '불일폭포']
export const SHOWER_BUILDINGS = [
  { building: '샤워동 A', gender: 'F' as const },
  { building: '샤워동 B', gender: 'M' as const },
  { building: '샤워동 C', gender: 'F' as const },
  { building: '샤워동 D', gender: 'M' as const },
]
export interface SponsorLogo { name: string; src?: string; h?: number }
/** 주최·주관·후원·언론사. 로고는 public/sponsors (투명 PNG, 높이 160px) */
export const SPONSOR_TIERS: { tier: string; items: SponsorLogo[] }[] = [
  { tier: '주최', items: [{ name: '하동 쌍계사', src: '/sponsors/ssanggyesa.png', h: 22 }, { name: '한국불교문화사업단', src: '/sponsors/kbcc.png', h: 24 }] },
  { tier: '주관', items: [{ name: '산사캠프 사무국', src: '/wordmark.png', h: 30 }] },
  { tier: '후원', items: [{ name: '농협', src: '/sponsors/nh.png', h: 26 }, { name: 'NH투자증권', src: '/sponsors/nhis.png', h: 20 }, { name: '㈜도반HC', src: '/sponsors/dobanhc.png', h: 22 }] },
  { tier: '언론사', items: [{ name: '불교닷컴' }] },
]
/** 개발용 테스트 번호 — Supabase 대시보드 Phone 공급자의 Test phone numbers 에 같은 값을 등록해야 한다 */
export const TEST_PHONES = { user: '+821012345678', admin: '+821000000000', otp: '123456' }
