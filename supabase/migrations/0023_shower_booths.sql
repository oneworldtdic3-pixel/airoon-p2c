-- 샤워 부스 실제 배치: 주차장(C 캠핑존) 4개 + 쌍계사 경내 1개, 부스 1개(3×6m) = 남 6 · 여 6 (30분 슬롯마다)
-- 기존 '샤워동 A~D' 슬롯은 이름만 바꿔 예약을 그대로 보존하고, 나머지 부스는 같은 시간표로 새로 만든다.
alter table public.shower_slots alter column capacity set default 6;

update public.shower_slots set building = '주차장 1', capacity = 6 where building = '샤워동 A'; -- F
update public.shower_slots set building = '주차장 1', capacity = 6 where building = '샤워동 B'; -- M
update public.shower_slots set building = '주차장 2', capacity = 6 where building = '샤워동 C'; -- F
update public.shower_slots set building = '주차장 2', capacity = 6 where building = '샤워동 D'; -- M

do $$
declare b record;
begin
  for b in select * from (values ('주차장 3','F'),('주차장 3','M'),('주차장 4','F'),('주차장 4','M'),('쌍계사','F'),('쌍계사','M')) v(building, gender) loop
    if not exists (select 1 from public.shower_slots where building = b.building and gender = b.gender) then
      insert into public.shower_slots (building, gender, starts_at, capacity)
      select b.building, b.gender, s, 6
      from (
        select generate_series(timestamp '2026-11-06 15:00', timestamp '2026-11-06 21:30', interval '30 min') s
        union all select generate_series(timestamp '2026-11-07 06:00', timestamp '2026-11-07 21:30', interval '30 min')
        union all select generate_series(timestamp '2026-11-08 06:00', timestamp '2026-11-08 09:30', interval '30 min')
      ) x(s_local), lateral (select s_local at time zone 'Asia/Seoul' s) y;
    end if;
  end loop;
end $$;
