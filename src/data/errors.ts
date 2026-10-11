const MESSAGES: Record<string, string> = {
  AUTH_REQUIRED: '로그인이 필요합니다',
  SESSION_NOT_FOUND: '회차를 찾을 수 없습니다',
  ALREADY_BOOKED: '이미 예약한 회차입니다',
  SESSION_FULL: '마감된 회차입니다',
  BOOKING_NOT_FOUND: '예약을 찾을 수 없습니다',
  SLOT_NOT_FOUND: '슬롯을 찾을 수 없습니다',
  SLOT_FULL: '마감된 슬롯입니다',
  DAILY_LIMIT: '샤워실은 팀당 하루 2회까지 예약할 수 있습니다',
  NOSHOW_LIMIT: '노쇼 2회로 오늘은 샤워실 예약이 제한됩니다',
  CAR_NUMBER_INVALID: '차량번호 형식을 확인해 주세요 (예: 123가 4567)',
  DATES_REQUIRED: '이용 일자를 선택해 주세요',
  PHOTO_NOT_FOUND: '사진을 찾을 수 없습니다',
  ALREADY_ENTERED: '이미 응모했습니다',
  FORBIDDEN: '권한이 없습니다',
  TITLE_REQUIRED: '제목을 입력해 주세요',
  NAVER_NOT_CONFIGURED: '네이버 로그인이 아직 설정되지 않았습니다. 운영자에게 문의하거나 다른 방법으로 로그인해 주세요.',
  NAVER_ERROR: '네이버 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.',
  not_configured: '네이버 로그인이 아직 설정되지 않았습니다. 운영자에게 문의하거나 다른 방법으로 로그인해 주세요.',
  naver_error: '네이버 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.',
  internal: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  origin_not_allowed: '이 주소에서는 네이버 로그인을 쓸 수 없습니다 (허용 도메인 설정 필요).',
  auth_required: '먼저 로그인해 주세요.',
}

/** Supabase/Postgres 오류 → 사용자 문구 */
export function toMessage(e: unknown): string {
  const msg = typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : String(e)
  for (const code of Object.keys(MESSAGES)) if (msg.includes(code)) return MESSAGES[code]
  if (/manual linking/i.test(msg)) return '계정 연결 기능이 꺼져 있습니다. 운영자가 Supabase에서 Manual linking을 켜야 합니다.'
  if (/identity.*already.*linked|already.*(exists|registered)/i.test(msg)) return '이미 다른 계정에 연결된 로그인 수단입니다.'
  if (/phone.*already|already.*phone/i.test(msg)) return '이미 다른 계정에서 쓰는 휴대폰 번호입니다.'
  if (/otp|token/i.test(msg) && /invalid|expired/i.test(msg)) return '인증번호가 올바르지 않거나 만료되었습니다'
  if (/rate limit|too many/i.test(msg)) return '요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요'
  if (/network|fetch/i.test(msg)) return '네트워크 연결을 확인해 주세요'
  return msg || '알 수 없는 오류가 발생했습니다'
}
