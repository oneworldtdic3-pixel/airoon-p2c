import type { AppNotification, Photo, Program, ProgramSession, ShowerSlot, SpotTag } from './types'
import { sceneArt } from './art'

export const EVENT_DAYS = ['2026-11-06', '2026-11-07', '2026-11-08'] as const
const kst = (day: string, hm: string) => `${day}T${hm}:00+09:00`

export const programs: Program[] = [
  { id: 'p1', title: '불일폭포 트래킹', emoji: '🥾', pet_allowed: true, capacity: 30, location: '쌍계사 ~ 불일폭포', duration: '90분', description: '쌍계사 뒤편 숲길을 따라 불일폭포까지 걷는 가벼운 트래킹. 반려견 동반 가능해요.' },
  { id: 'p2', title: '쌍계사 역사 탐방', emoji: '🏯', pet_allowed: false, capacity: 25, location: '쌍계사 경내', duration: '60분', description: '천 년 고찰 쌍계사의 이야기를 해설사와 함께 천천히 걸으며 만나요.' },
  { id: 'p3', title: '108선다 차 명상', emoji: '🍵', pet_allowed: false, capacity: 100, location: '차밭 능선', duration: '80분', description: '하동 녹차밭 위에서 108잔의 차를 나누는 고요한 시간. 100명 한정.' },
  { id: 'p4', title: '스님과의 대화', emoji: '💬', pet_allowed: false, capacity: 40, location: '대웅전 앞마당', duration: '60분', description: '고민도 질문도 편하게. 스님과 둘러앉아 나누는 따뜻한 이야기.' },
  { id: 'p5', title: '싱잉볼 체험', emoji: '🔔', pet_allowed: false, capacity: 20, location: '체험부스존', duration: '45분', description: '맑은 울림에 몸을 맡기는 사운드 명상.' },
  { id: 'p6', title: '요가·선명상', emoji: '🧘', pet_allowed: true, capacity: 30, location: '캠핑존 잔디마당', duration: '60분', description: '아침 공기와 함께하는 요가와 선명상. 반려견 동반 가능해요.' },
  { id: 'p7', title: '사찰음식/예불 체험', emoji: '🍲', pet_allowed: false, capacity: 40, location: '공양간 · 대웅전', duration: '90분', description: '사찰음식 공양과 새벽 예불을 함께 경험해요.' },
  { id: 'p8', title: '단주 만들기', emoji: '📿', pet_allowed: false, capacity: 24, location: '체험부스존', duration: '50분', description: '나만의 단주(염주 팔찌)를 직접 꿰어 보아요.' },
  { id: 'p9', title: '사경 체험', emoji: '🖌️', pet_allowed: false, capacity: 24, location: '체험부스존', duration: '60분', description: '마음을 가라앉히며 한 글자씩 옮겨 쓰는 사경.' },
]

// 프로그램별 회차 (일자 × 시각)
const PLAN: Record<string, Record<string, string[]>> = {
  p1: { '2026-11-06': ['15:30'], '2026-11-07': ['09:00', '14:00'], '2026-11-08': ['08:30'] },
  p2: { '2026-11-06': ['16:00'], '2026-11-07': ['10:30', '15:00'] },
  p3: { '2026-11-06': ['17:00'], '2026-11-07': ['16:30'] },
  p4: { '2026-11-06': ['19:00'], '2026-11-07': ['13:00', '19:00'] },
  p5: { '2026-11-06': ['15:00'], '2026-11-07': ['11:00', '14:30', '17:30'], '2026-11-08': ['09:30'] },
  p6: { '2026-11-07': ['07:00'], '2026-11-08': ['07:00'] },
  p7: { '2026-11-07': ['05:30', '12:00'], '2026-11-08': ['05:30'] },
  p8: { '2026-11-06': ['16:30'], '2026-11-07': ['10:00', '15:30'] },
  p9: { '2026-11-06': ['18:00'], '2026-11-07': ['11:30', '16:00'], '2026-11-08': ['09:00'] },
}
const BOOKED_SEED = [0, 0.4, 0.75, 1, 0.2, 0.9, 0.55]

export const sessions: ProgramSession[] = programs.flatMap((p, pi) =>
  Object.entries(PLAN[p.id]).flatMap(([day, times]) =>
    times.map((t, ti) => {
      const r = BOOKED_SEED[(pi + ti + Number(day.slice(-1))) % BOOKED_SEED.length]
      return {
        id: `${p.id}-${day.slice(-2)}${t.replace(':', '')}`,
        program_id: p.id,
        starts_at: kst(day, t),
        capacity: p.capacity,
        booked_count: Math.round(p.capacity * r),
      }
    }),
  ),
)

export const SHOWER_BUILDINGS = [
  { building: '샤워동 A', gender: 'F' as const },
  { building: '샤워동 B', gender: 'M' as const },
  { building: '샤워동 C', gender: 'F' as const },
  { building: '샤워동 D', gender: 'M' as const },
]
const showerHours: Record<string, [number, number]> = { '2026-11-06': [15, 22], '2026-11-07': [6, 22], '2026-11-08': [6, 10] }

export const showerSlots: ShowerSlot[] = EVENT_DAYS.flatMap((day) =>
  SHOWER_BUILDINGS.flatMap((b, bi) => {
    const [from, to] = showerHours[day]
    const out: ShowerSlot[] = []
    for (let m = from * 60, i = 0; m < to * 60; m += 30, i++) {
      const hh = String(Math.floor(m / 60)).padStart(2, '0')
      const mm = String(m % 60).padStart(2, '0')
      out.push({
        id: `s-${b.building.slice(-1)}-${day.slice(-2)}${hh}${mm}`,
        building: b.building,
        gender: b.gender,
        starts_at: kst(day, `${hh}:${mm}`),
        capacity: 4,
        booked_count: (i * 7 + bi * 3) % 5 === 0 ? 4 : (i + bi) % 4,
      })
    }
    return out
  }),
)

export const SPOTS: SpotTag[] = ['일주문', '대웅전 계단', '차밭 능선', '불일폭포']
const nick = ['고요한토끼', '달빛산책', '차한잔', '연등지기', '숲속곰', '새벽종소리', '구름위에', '돌담길', '솔바람', '여우비', '풍경소리', '온기']
const minsAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString()

export const photos: Photo[] = Array.from({ length: 24 }, (_, i) => {
  const spot = SPOTS[i % 4]
  return {
    id: `ph${i + 1}`,
    user_id: `seed-${i % 12}`,
    spot_tag: spot,
    url: sceneArt(spot, i + 1),
    likes_count: [48, 31, 27, 22, 19, 15, 12, 9, 8, 6, 5, 4][i % 12] + (i < 12 ? 10 : 0),
    is_hidden: false,
    created_at: minsAgo(i * 17 + 4),
    nickname: nick[i % nick.length],
  }
})

export const notifications: AppNotification[] = [
  { id: 'n1', type: 'booth', title: '싱잉볼 체험 잔여석 5석', body: '오늘 14:30 회차 잔여석이 얼마 남지 않았어요.', created_at: minsAgo(8) },
  { id: 'n2', type: 'luckydraw', title: '럭키드로우 응모 마감 임박', body: '오늘 18:00 마감! 더보기에서 응모해 주세요.', created_at: minsAgo(55) },
  { id: 'n3', type: 'reminder', title: '예약 리마인드', body: '내일 09:00 불일폭포 트래킹 예약이 있어요. 10분 전까지 모여 주세요.', created_at: minsAgo(180) },
  { id: 'n4', type: 'market', title: '산사장터 오픈', body: '오늘 13:00부터 산사장터가 열려요. 차·간식·소품을 만나보세요.', created_at: minsAgo(600) },
  { id: 'n5', type: 'notice', title: '고요의 시간 안내', body: '매일 21시부터는 고요의 시간입니다. 대화는 낮은 목소리로 부탁드려요.', created_at: minsAgo(1500) },
]

export const sponsors = {
  HOST: ['하동군', '쌍계사'],
  PARTNER: ['하동녹차협동조합', '지리산 로컬푸드', '산책 아웃도어'],
  BOOTH: ['차담', '고요 향초', '달빛 베이커리', '연등공방', '숲 커피', '돌담 문구', '온기 담요', '솔향 비누'],
}
