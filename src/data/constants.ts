import type { SpotTag } from './types'

export const EVENT_DAYS = ['2026-11-06', '2026-11-07', '2026-11-08'] as const
export const SPOTS: SpotTag[] = ['일주문', '대웅전 계단', '차밭 능선', '불일폭포']
export const SHOWER_BUILDINGS = [
  { building: '샤워동 A', gender: 'F' as const },
  { building: '샤워동 B', gender: 'M' as const },
  { building: '샤워동 C', gender: 'F' as const },
  { building: '샤워동 D', gender: 'M' as const },
]
// 포스터 하단 표기 확인 전 임시값
export const sponsors = {
  HOST: ['하동군', '쌍계사'],
  PARTNER: ['하동녹차협동조합', '지리산 로컬푸드', '산책 아웃도어'],
  BOOTH: ['차담', '고요 향초', '달빛 베이커리', '연등공방', '숲 커피', '돌담 문구', '온기 담요', '솔향 비누'],
}
/** 개발용 테스트 번호 — Supabase 대시보드 Phone 공급자의 Test phone numbers 에 같은 값을 등록해야 한다 */
export const TEST_PHONES = { user: '+821012345678', admin: '+821000000000', otp: '123456' }
