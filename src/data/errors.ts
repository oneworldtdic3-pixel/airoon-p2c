const MESSAGES: Record<string, string> = {
  AUTH_REQUIRED: '로그인이 필요합니다',
  SESSION_NOT_FOUND: '회차를 찾을 수 없습니다',
  ALREADY_BOOKED: '이미 예약한 회차입니다',
  PROGRAM_DUPLICATE: '같은 프로그램은 한 번만 예약할 수 있습니다',
  PROGRAM_DAILY_LIMIT: '프로그램은 1인당 하루 3개까지 예약할 수 있습니다',
  PROGRAM_OVERLAP: '이미 예약한 프로그램과 시간이 겹칩니다',
  SESSION_FULL: '마감된 회차입니다',
  BOOKING_NOT_OPEN: '프로그램 예약은 11월 1일부터 가능합니다',
  BOOKING_NOT_FOUND: '예약을 찾을 수 없습니다',
  SLOT_NOT_FOUND: '슬롯을 찾을 수 없습니다',
  SLOT_FULL: '마감된 슬롯입니다',
  DAILY_LIMIT: '샤워실은 1인당 하루 2회까지 예약할 수 있습니다',
  NOSHOW_LIMIT: '노쇼 2회로 오늘은 샤워실 예약이 제한됩니다',
  CAR_NUMBER_INVALID: '차량번호 형식을 확인해 주세요 (예: 123가 4567)',
  DATES_REQUIRED: '이용 일자를 선택해 주세요',
  PHOTO_NOT_FOUND: '사진을 찾을 수 없습니다',
  QUOTE_NOT_FOUND: '문구를 찾을 수 없습니다',
  QUOTE_LENGTH: '문구는 2자 이상 40자 이하로 적어 주세요',
  ALREADY_ENTERED: '이미 응모했습니다',
  FORBIDDEN: '권한이 없습니다',
  // 캠핑 사이트 배정
  ORDER_NOT_FOUND: '예매번호를 찾을 수 없습니다. 스마트스토어 주문번호를 확인해 주세요',
  ORDER_PHONE_MISMATCH: '예매한 분의 연락처 뒷 4자리가 맞지 않습니다',
  ORDER_QTY_EXCEEDED: '이 예매번호로 배정할 수 있는 사이트 수를 넘었습니다',
  SITE_REQUIRED: '사이트를 선택해 주세요',
  SITE_NOT_FOUND: '사이트를 찾을 수 없습니다',
  SITE_BLOCKED: '지금은 선택할 수 없는 사이트입니다',
  SITE_TAKEN: '방금 다른 분이 선택한 자리예요. 다른 사이트를 골라 주세요',
  SITE_ZONE_MISMATCH: '구매한 구역의 사이트만 선택할 수 있습니다',
  ADULTS_REQUIRED: '성인 인원을 1명 이상 입력해 주세요',
  CONSENT_REQUIRED: '필수 동의 항목에 모두 체크해 주세요',
  PET_NOT_ALLOWED: '이 구역은 반려견 동반이 되지 않습니다',
  PHONE_INVALID: '휴대폰 번호를 확인해 주세요',
  site_assignments_one_per_site: '방금 다른 분이 선택한 자리예요. 다른 사이트를 골라 주세요',
  sites_event_id_number_key: '같은 번호의 사이트가 이미 있습니다',
  URL_INVALID: '기사 주소(https://…)를 확인해 주세요',
  FETCH_FAILED: '기사 정보를 읽지 못했습니다. 제목·언론사를 직접 입력해 주세요',
  press_articles_url_key: '이미 등록된 기사입니다',
  NICKNAME_TAKEN: '이미 다른 분이 쓰는 닉네임입니다',
  profiles_nickname_unique: '이미 다른 분이 쓰는 닉네임입니다',
  NICKNAME_INVALID: '닉네임은 2–12자로 정해 주세요 (\'산사러\' 제외)',
  TITLE_REQUIRED: '제목을 입력해 주세요',
  NAVER_NOT_CONFIGURED: '네이버 로그인이 아직 설정되지 않았습니다. 운영자에게 문의하거나 다른 방법으로 로그인해 주세요.',
  NAVER_ERROR: '네이버 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.',
  not_configured: '네이버 로그인이 아직 설정되지 않았습니다. 운영자에게 문의하거나 다른 방법으로 로그인해 주세요.',
  naver_error: '네이버 로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.',
  internal: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  origin_not_allowed: '이 주소에서는 네이버 로그인을 쓸 수 없습니다 (허용 도메인 설정 필요).',
  auth_required: '먼저 로그인해 주세요.',
  identity_already_exists: '이미 다른 계정에 연결된 로그인 수단입니다.',
  'Identity is already linked': '이미 다른 계정에 연결된 로그인 수단입니다.',
}

/** Supabase/Postgres 오류 → 사용자 문구 */
export function toMessage(e: unknown): string {
  const msg = typeof e === 'object' && e && 'message' in e ? String((e as { message: unknown }).message) : String(e)
  for (const code of Object.keys(MESSAGES)) if (msg.includes(code)) return MESSAGES[code]
  if (/manual linking/i.test(msg)) return '계정 연결 기능이 꺼져 있습니다. 운영자가 Supabase에서 Manual linking을 켜야 합니다.'
  if (/phone/i.test(msg) && /already|exists|registered|in use/i.test(msg)) return '이미 다른 계정에서 쓰는 휴대폰 번호입니다.'
  if (/identity.*already.*linked|already.*(exists|registered)/i.test(msg)) return '이미 다른 계정에 연결된 로그인 수단입니다.'
  if (/SMS_SEND_FAILED|SMS_NOT_CONFIGURED|hook|sending sms|sms.*(fail|error)|twilio|messaging service/i.test(msg)) return '인증 문자를 보내지 못했습니다. 잠시 후 다시 시도해주세요.'
  if (/otp|token/i.test(msg) && /invalid|expired/i.test(msg)) return '인증번호가 올바르지 않거나 만료되었습니다'
  if (/PGRST202|could not find the function/i.test(msg)) return '서버에 이 기능의 SQL이 아직 적용되지 않았습니다. 운영자에게 알려주세요.'
  if (/rate limit|too many/i.test(msg)) return '요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요'
  if (/network|fetch/i.test(msg)) return '네트워크 연결을 확인해 주세요'
  return msg || '알 수 없는 오류가 발생했습니다'
}
