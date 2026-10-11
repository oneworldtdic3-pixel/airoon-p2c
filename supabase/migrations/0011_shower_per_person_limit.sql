-- 샤워실 예약 제한을 "팀당" 에서 "1인당 하루 2회" 로 변경. 슬롯 정원(booked_count)은 그대로 — 다른 사람 예약이 차면 마감.
create or replace function book_shower(p_slot uuid) returns shower_bookings
language plpgsql security definer set search_path = public as $$
declare
  sl shower_slots%rowtype;
  sb shower_bookings%rowtype;
  day_start timestamptz;
  day_end timestamptz;
  used int;
  noshows int;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into sl from shower_slots where id = p_slot for update;
  if not found then raise exception 'SLOT_NOT_FOUND'; end if;
  day_start := date_trunc('day', sl.starts_at at time zone 'Asia/Seoul') at time zone 'Asia/Seoul';
  day_end := day_start + interval '1 day';

  select count(*) into noshows from shower_bookings b join shower_slots x on x.id = b.slot_id
   where b.user_id = auth.uid() and b.status = 'noshow' and x.starts_at >= day_start and x.starts_at < day_end;
  if noshows >= 2 then raise exception 'NOSHOW_LIMIT'; end if;

  select count(*) into used from shower_bookings b
    join shower_slots x on x.id = b.slot_id
   where b.user_id = auth.uid() and b.status = 'confirmed' and x.starts_at >= day_start and x.starts_at < day_end;
  if used >= 2 then raise exception 'DAILY_LIMIT'; end if;

  if sl.booked_count >= sl.capacity then raise exception 'SLOT_FULL'; end if;
  insert into shower_bookings (user_id, slot_id) values (auth.uid(), p_slot) returning * into sb;
  update shower_slots set booked_count = booked_count + 1 where id = p_slot;
  return sb;
end $$;
