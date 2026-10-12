-- 샤워동 4곳, 1곳당 30분 슬롯마다 50명 수용 (기존 4명 → 50명). 기존 예약은 그대로 둔다.
alter table public.shower_slots alter column capacity set default 50;
update public.shower_slots set capacity = 50 where capacity <> 50;
