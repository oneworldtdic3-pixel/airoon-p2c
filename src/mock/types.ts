// DB 스키마(supabase/migrations)와 동일한 형태 — 2단계에서 Supabase 응답으로 교체
export interface Program {
  id: string; title: string; description: string; location: string
  pet_allowed: boolean; capacity: number; emoji: string; duration: string
}
export interface ProgramSession { id: string; program_id: string; starts_at: string; capacity: number; booked_count: number }
export interface Booking { id: string; user_id: string; session_id: string; qr_code: string; status: 'confirmed' | 'cancelled' | 'noshow' }
export interface ShowerSlot { id: string; building: string; gender: 'F' | 'M'; starts_at: string; capacity: number; booked_count: number }
export interface ShowerBooking { id: string; user_id: string; slot_id: string; status: 'confirmed' | 'cancelled' | 'noshow' }
export interface ParkingBooking { id: string; user_id: string; zone: 'P1' | 'P2'; car_number: string; dates: string[] }
export type SpotTag = '일주문' | '대웅전 계단' | '차밭 능선' | '불일폭포'
export interface Photo { id: string; user_id: string; spot_tag: SpotTag; url: string; likes_count: number; is_hidden: boolean; created_at: string; nickname: string }
export interface AppNotification { id: string; type: 'booth' | 'luckydraw' | 'reminder' | 'market' | 'notice'; title: string; body: string; created_at: string }
export interface User { id: string; nickname: string; phone: string; team_id: string | null; is_admin: boolean }
