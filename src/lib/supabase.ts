import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY
if (!url || !key) throw new Error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 .env 에 없습니다')

export const supabase = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })

/** photos.storage_path → 표시용 URL. 'seed:' 접두는 개발용 일러스트 */
export function photoUrl(path: string) {
  if (path.startsWith('seed:') || path.startsWith('http') || path.startsWith('data:')) return path
  return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl
}
