-- 프로그램 예약 오픈 시각을 11월 1일 0시(KST)로 변경. 앱 PROGRAM_BOOKING_OPENS(constants.ts)와 같은 값.
create or replace function public.program_booking_opens_at() returns timestamptz
language sql immutable as $$ select timestamptz '2026-11-01 00:00:00+09' $$;
