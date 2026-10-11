export type SpotTag = '일주문' | '대웅전 계단' | '차밭 능선' | '불일폭포'
export type BookingStatus = 'confirmed' | 'cancelled' | 'noshow'

export interface Profile { id: string; nickname: string; phone: string | null; team_id: string | null; is_admin: boolean; kakao_alimtalk_consent: boolean }
export interface Program { id: string; title: string; description: string; location: string; duration: string; pet_allowed: boolean; capacity: number; sort: number }
export interface ProgramSession { id: string; program_id: string; starts_at: string; capacity: number; booked_count: number }
export interface Booking { id: string; user_id: string; session_id: string; qr_code: string; status: BookingStatus }
export interface ShowerSlot { id: string; building: string; gender: 'F' | 'M'; starts_at: string; capacity: number; booked_count: number }
export interface ShowerBooking { id: string; user_id: string; slot_id: string; status: BookingStatus }
export interface ParkingBooking { id: string; user_id: string; zone: 'P1' | 'P2'; car_number: string; dates: string[] }
export interface Photo { id: string; user_id: string; spot_tag: SpotTag; storage_path: string; url: string; likes_count: number; is_hidden: boolean; created_at: string; nickname: string }
export interface AppNotification { id: string; type: 'booth' | 'luckydraw' | 'reminder' | 'market' | 'notice'; title: string; body: string; created_at: string }
export interface Banner { id: string; sponsor: string; title: string; sub: string; image_path: string; image: string; link: string; bg: string; is_active: boolean; sort: number }
export interface AdminStats {
  programs: { id: string; title: string; capacity: number; booked: number }[]
  shower: { building: string; capacity: number; booked: number }[]
  parking: { P1: number; P2: number }
  users: number
  lucky: number
}
