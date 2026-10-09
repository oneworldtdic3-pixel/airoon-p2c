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

### 전화번호 로그인 (개발 단계)

SMS 공급자 연동 전까지는 대시보드의 테스트 번호를 쓴다.
Authentication → Providers → Phone → **Test phone numbers** 에 등록:

| 번호 | OTP | 용도 |
|---|---|---|
| `+821012345678` | `123456` | 일반 사용자 |
| `+821000000000` | `123456` | 관리자 (가입 시 `is_admin = true` 자동) |

앱에서는 `010-1234-5678` 형식으로 입력하면 `+82` 로 변환된다.
다른 번호를 관리자로 올리려면: `update profiles set is_admin = true where phone = '+82…';`

### 시드 데이터

- 프로그램 9종 / 회차 29개 / 샤워 슬롯 216개 / 알림 5건 / 배너 3건 / 개발용 사진 24장
- `photos.storage_path` 와 `banners.image_path` 가 `seed:` 로 시작하면 클라이언트가 일러스트로 그린다. 실제 업로드는 `photos` 버킷 경로.
