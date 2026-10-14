-- 프로그램 정리 (2026-10-14)
--  · 단주 만들기 · 사경 체험: 비활성(화면에서 내림, 기록은 보존)
--  · 1일차(11.06) 트래킹 회차 비활성 → 그 자리는 '입장 등록 14:00~' 안내(앱 상수)
--  · 공양 시간(아침 06:00 · 점심 12:00 · 저녁 17:00, 각 1시간)과 겹치는 회차 시간 이동
alter table public.programs add column if not exists is_active boolean not null default true;
alter table public.program_sessions add column if not exists is_active boolean not null default true;

update public.programs set is_active = false where title in ('단주 만들기', '사경 체험');
update public.program_sessions set is_active = false where program_id in (select id from public.programs where not is_active);

-- 11.06 15:30 트래킹 회차 비활성 + 그 회차의 예약(테스트 계정 1건) 취소 처리
update public.bookings set status = 'cancelled' where session_id = '90f79422-33d5-4868-83f9-ad9c9997acbb' and status = 'confirmed';
update public.program_sessions set is_active = false, booked_count = 0 where id = '90f79422-33d5-4868-83f9-ad9c9997acbb';

-- 공양 시간과 겹치는 회차 이동 (KST)
update public.program_sessions set starts_at = '2026-11-06 15:30+09' where id = '9f4b80e4-c972-4863-838d-194f6d92c34b'; -- 108선다 17:00 → 15:30
update public.program_sessions set starts_at = '2026-11-07 15:30+09' where id = 'ef4d11d9-44b2-4987-a34c-af22364b626f'; -- 108선다 16:30 → 15:30
update public.program_sessions set starts_at = '2026-11-07 16:00+09' where id = '4faad417-569e-4c1f-ad48-77ce85f438b8'; -- 싱잉볼 17:30 → 16:00
update public.program_sessions set starts_at = '2026-11-07 07:00+09' where id = 'ddf419a5-9815-430d-84f1-aa7da6dec745'; -- 사찰음식/예불 05:30 → 07:00
update public.program_sessions set starts_at = '2026-11-07 13:00+09' where id = 'd89df50c-df23-4e74-a91c-b88470849a93'; -- 사찰음식/예불 12:00 → 13:00
update public.program_sessions set starts_at = '2026-11-08 07:00+09' where id = '1658ee90-db8e-430c-954a-8424d48bf729'; -- 사찰음식/예불 05:30 → 07:00

-- 관리자 현황: 활성 프로그램만 집계
create or replace function public.admin_stats() returns json
language sql stable security definer set search_path = public as $$
  select case when is_admin() then json_build_object(
    'programs', (select json_agg(json_build_object('id', p.id, 'title', p.title,
                   'capacity', (select coalesce(sum(capacity),0) from program_sessions where program_id = p.id and is_active),
                   'booked', (select coalesce(sum(booked_count),0) from program_sessions where program_id = p.id and is_active)) order by p.sort) from programs p where p.is_active),
    'shower', (select json_agg(json_build_object('building', building, 'capacity', cap, 'booked', booked) order by building)
               from (select building, sum(capacity) cap, sum(booked_count) booked from shower_slots group by building) s),
    'parking', (select json_build_object('P1', count(*) filter (where zone = 'P1'), 'P2', count(*) filter (where zone = 'P2')) from parking_bookings),
    'users', (select count(*) from profiles),
    'lucky', (select count(*) from lucky_draw_entries)
  ) else null end
$$;
