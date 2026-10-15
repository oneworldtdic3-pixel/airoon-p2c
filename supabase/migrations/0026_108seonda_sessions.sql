-- 108선다 차 명상 운영 계획 확정 (2026-10-15)
--  · 운영일: 토요일(11.07)만 · 09:00 / 11:00 / 13:30 / 15:30 4회 · 회차당 25명 (총 100명) · 사전예약제
--  · 1일차(11.06 15:30) 회차 비활성 (확정 예약 없음 — 테스트 예약 2건은 이미 취소 상태)
--  · programs.time_confirmed: 시간이 확정된 프로그램은 '시간 협의중' 대신 실제 시각을 보여준다
alter table public.programs add column if not exists time_confirmed boolean not null default false;

update public.programs set time_confirmed = true, capacity = 100 where id = '0b1f4a5e-9d23-47b2-ae7b-aa37f9fa0835';

update public.bookings set status = 'cancelled' where session_id = '9f4b80e4-c972-4863-838d-194f6d92c34b' and status = 'confirmed';
update public.program_sessions set is_active = false, booked_count = 0 where id = '9f4b80e4-c972-4863-838d-194f6d92c34b';

-- 기존 토요일 회차(15:30)는 그대로 4타임으로 쓰고 정원만 25명, 1~3타임 추가
update public.program_sessions set starts_at = '2026-11-07 15:30+09', capacity = 25 where id = 'ef4d11d9-44b2-4987-a34c-af22364b626f';
insert into public.program_sessions (program_id, starts_at, capacity, booked_count, is_active)
select '0b1f4a5e-9d23-47b2-ae7b-aa37f9fa0835', t, 25, 0, true
from unnest(array['2026-11-07 09:00+09', '2026-11-07 11:00+09', '2026-11-07 13:30+09']::timestamptz[]) t
where not exists (select 1 from public.program_sessions s where s.program_id = '0b1f4a5e-9d23-47b2-ae7b-aa37f9fa0835' and s.starts_at = t);
