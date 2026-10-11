# 산사캠프 (SANSA CAMP) 웹앱

React + Vite + TypeScript + Tailwind · Supabase (Auth / Postgres / Storage / Realtime)

## 실행

```bash
npm install
cp .env.example .env   # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 입력
npm run dev            # http://localhost:5173
npm run build
```

## Supabase

- 프로젝트: `sansa-camp` (ap-northeast-2)
- 마이그레이션: `supabase/migrations/0001` ~ `0006` 순서대로 적용 (이미 적용됨)
- 정원·제한 검사는 전부 DB 함수(`book_session`, `book_shower`, `toggle_like` …)에서 트랜잭션으로 처리
- RLS: 본인 예약·사진만 읽고 쓰기, 쓰기는 함수 경유. 관리자는 `profiles.is_admin`

### 전화번호 인증 SMS (솔라피)

실제 문자는 Supabase Auth **Send SMS Hook** → Edge Function `send-sms` → 솔라피(SOLAPI) API 로 보낸다.
키 값은 코드에 두지 않고 대시보드에만 넣는다.

1. Edge Functions → `send-sms` → Secrets 에 입력
   - `SOLAPI_API_KEY`, `SOLAPI_API_SECRET` — 솔라피 콘솔의 API Key / Secret
   - `SOLAPI_SENDER_NUMBER` — 솔라피에 등록·승인된 발신번호 (`01012345678` 형식)
2. Authentication → Hooks → **Send SMS** → Enable, HTTPS 선택
   - URL: `https://<project-ref>.supabase.co/functions/v1/send-sms`
   - Generate secret 로 만든 `v1,whsec_…` 값을 그대로 `send-sms` 의 `SEND_SMS_HOOK_SECRET` 시크릿에 넣는다 (회전 시 `|` 로 이어 붙이면 둘 다 허용)
3. 함수는 `verify_jwt=false` 로 배포되며 훅의 Standard Webhooks 서명으로 호출자를 검증한다.
4. Authentication → Providers → Phone → **SMS OTP Expiry** 를 `300`(5분)으로 둔다. 문자 문구 "5분 안에 입력"과 맞춘 값이며 기본값 60초면 참가자가 자주 만료를 겪는다. 늘리면 `send-sms` 의 문구도 같이 바꾼다.

문자 내용: `[산사캠프] 인증번호 123456 / 5분 안에 입력해 주세요.`
발송 실패 시 앱에는 "인증 문자를 보내지 못했습니다. 잠시 후 다시 시도해주세요." 가 뜨고, 재발송은 60초 쿨다운 뒤에 가능하다.
원인은 Edge Functions → `send-sms` → Logs 에서 본다.

### 테스트 번호 (실제 문자 없이 개발)

훅이 켜져 있어도 테스트 번호는 Auth 가 훅을 호출하지 않으므로 그대로 쓸 수 있다. 출시 전에 삭제한다.
Authentication → Providers → Phone → **Test phone numbers** 에 등록:

| 번호 | OTP | 용도 |
|---|---|---|
| `+821012345678` | `123456` | 일반 사용자 |
| `+821000000000` | `123456` | 관리자 (가입 시 `is_admin = true` 자동) |

대시보드 입력란에는 `+` 없이 `821012345678=123456, 821000000000=123456` 형식으로 넣는다.

앱에서는 `010-1234-5678` 형식으로 입력하면 `+82` 로 변환된다.
다른 번호를 관리자로 올리려면: `update profiles set is_admin = true where phone = '+82…';`

### 시드 데이터

- 프로그램 9종 / 회차 29개 / 샤워 슬롯 216개 / 알림 5건 / 배너 3건 / 개발용 사진 24장
- `photos.storage_path` 와 `banners.image_path` 가 `seed:` 로 시작하면 클라이언트가 일러스트로 그린다. 실제 업로드는 `photos` 버킷 경로.
