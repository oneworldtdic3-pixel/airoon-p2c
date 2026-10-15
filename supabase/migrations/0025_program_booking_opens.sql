-- 프로그램 예약 오픈 시각(티켓 판매 마감 후 10월 말). 오픈 전에는 book_session 이 BOOKING_NOT_OPEN 으로 거부(관리자 제외).
-- 날짜를 바꾸려면 아래 함수만 다시 만들면 된다. 앱 쪽 PROGRAM_BOOKING_OPENS(constants.ts)도 같이 맞출 것.
create or replace function public.program_booking_opens_at() returns timestamptz
language sql immutable as $$ select timestamptz '2026-10-31 00:00:00+09' $$;
grant execute on function public.program_booking_opens_at() to anon, authenticated;
-- book_session: 'if now() < program_booking_opens_at() and not is_admin() then raise exception ''BOOKING_NOT_OPEN''' 한 줄 추가 (전체 정의는 DB 참조)
