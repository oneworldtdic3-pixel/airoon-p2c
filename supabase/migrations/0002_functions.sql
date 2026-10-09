-- 정원·제한 검사는 전부 DB 함수(트랜잭션 + 행 잠금)로 처리한다.

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from profiles where id = auth.uid()), false)
$$;

create or replace function book_session(p_session uuid) returns bookings
language plpgsql security definer set search_path = public as $$
declare
  s program_sessions%rowtype;
  b bookings%rowtype;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into s from program_sessions where id = p_session for update;
  if not found then raise exception 'SESSION_NOT_FOUND'; end if;
  if exists (select 1 from bookings where user_id = auth.uid() and session_id = p_session and status = 'confirmed') then
    raise exception 'ALREADY_BOOKED';
  end if;
  if s.booked_count >= s.capacity then raise exception 'SESSION_FULL'; end if;
  insert into bookings (user_id, session_id, qr_code)
  values (auth.uid(), p_session, 'SANSA-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)))
  returning * into b;
  update program_sessions set booked_count = booked_count + 1 where id = p_session;
  return b;
end $$;

create or replace function cancel_booking(p_booking uuid) returns void
language plpgsql security definer set search_path = public as $$
declare b bookings%rowtype;
begin
  select * into b from bookings where id = p_booking and user_id = auth.uid() for update;
  if not found then raise exception 'BOOKING_NOT_FOUND'; end if;
  if b.status <> 'confirmed' then return; end if;
  update bookings set status = 'cancelled' where id = p_booking;
  update program_sessions set booked_count = greatest(0, booked_count - 1) where id = b.session_id;
end $$;

-- 샤워실: 팀당 1일 2회(팀이 없으면 본인 기준), 당일 노쇼 2회면 당일 제한
create or replace function book_shower(p_slot uuid) returns shower_bookings
language plpgsql security definer set search_path = public as $$
declare
  sl shower_slots%rowtype;
  sb shower_bookings%rowtype;
  my_team uuid;
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
  select team_id into my_team from profiles where id = auth.uid();

  select count(*) into noshows from shower_bookings b join shower_slots x on x.id = b.slot_id
   where b.user_id = auth.uid() and b.status = 'noshow' and x.starts_at >= day_start and x.starts_at < day_end;
  if noshows >= 2 then raise exception 'NOSHOW_LIMIT'; end if;

  select count(*) into used from shower_bookings b
    join shower_slots x on x.id = b.slot_id
    join profiles p on p.id = b.user_id
   where b.status = 'confirmed' and x.starts_at >= day_start and x.starts_at < day_end
     and (b.user_id = auth.uid() or (my_team is not null and p.team_id = my_team));
  if used >= 2 then raise exception 'DAILY_LIMIT'; end if;

  if sl.booked_count >= sl.capacity then raise exception 'SLOT_FULL'; end if;
  insert into shower_bookings (user_id, slot_id) values (auth.uid(), p_slot) returning * into sb;
  update shower_slots set booked_count = booked_count + 1 where id = p_slot;
  return sb;
end $$;

create or replace function cancel_shower(p_booking uuid) returns void
language plpgsql security definer set search_path = public as $$
declare b shower_bookings%rowtype;
begin
  select * into b from shower_bookings where id = p_booking and user_id = auth.uid() for update;
  if not found then raise exception 'BOOKING_NOT_FOUND'; end if;
  if b.status <> 'confirmed' then return; end if;
  update shower_bookings set status = 'cancelled' where id = p_booking;
  update shower_slots set booked_count = greatest(0, booked_count - 1) where id = b.slot_id;
end $$;

create or replace function upsert_parking(p_zone text, p_car text, p_dates date[]) returns parking_bookings
language plpgsql security definer set search_path = public as $$
declare r parking_bookings%rowtype;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if p_car !~ '^\d{2,3}[가-힣]\s?\d{4}$' then raise exception 'CAR_NUMBER_INVALID'; end if;
  if coalesce(array_length(p_dates, 1), 0) = 0 then raise exception 'DATES_REQUIRED'; end if;
  insert into parking_bookings (user_id, zone, car_number, dates) values (auth.uid(), p_zone, p_car, p_dates)
  on conflict (user_id) do update set zone = excluded.zone, car_number = excluded.car_number, dates = excluded.dates, updated_at = now()
  returning * into r;
  return r;
end $$;

create or replace function toggle_like(p_photo uuid) returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  perform 1 from photos where id = p_photo for update;
  if not found then raise exception 'PHOTO_NOT_FOUND'; end if;
  if exists (select 1 from photo_likes where user_id = auth.uid() and photo_id = p_photo) then
    delete from photo_likes where user_id = auth.uid() and photo_id = p_photo;
    update photos set likes_count = greatest(0, likes_count - 1) where id = p_photo returning likes_count into n;
  else
    insert into photo_likes (user_id, photo_id) values (auth.uid(), p_photo);
    update photos set likes_count = likes_count + 1 where id = p_photo returning likes_count into n;
  end if;
  return n;
end $$;

create or replace function enter_lucky_draw() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if exists (select 1 from lucky_draw_entries where user_id = auth.uid()) then raise exception 'ALREADY_ENTERED'; end if;
  insert into lucky_draw_entries (user_id) values (auth.uid());
end $$;

create or replace function admin_set_photo_hidden(p_photo uuid, p_hidden boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'FORBIDDEN'; end if;
  update photos set is_hidden = p_hidden where id = p_photo;
end $$;

create or replace function admin_publish_notification(p_type text, p_title text, p_body text) returns notifications
language plpgsql security definer set search_path = public as $$
declare n notifications%rowtype;
begin
  if not is_admin() then raise exception 'FORBIDDEN'; end if;
  insert into notifications (type, title, body) values (p_type, p_title, p_body) returning * into n;
  return n;
end $$;

-- 관리자 대시보드용 집계
create or replace function admin_stats() returns json
language sql stable security definer set search_path = public as $$
  select case when is_admin() then json_build_object(
    'programs', (select json_agg(json_build_object('id', p.id, 'title', p.title,
                   'capacity', (select sum(capacity) from program_sessions where program_id = p.id),
                   'booked', (select sum(booked_count) from program_sessions where program_id = p.id)) order by p.sort) from programs p),
    'shower', (select json_agg(json_build_object('building', building, 'capacity', cap, 'booked', booked) order by building)
               from (select building, sum(capacity) cap, sum(booked_count) booked from shower_slots group by building) s),
    'parking', (select json_build_object('P1', count(*) filter (where zone = 'P1'), 'P2', count(*) filter (where zone = 'P2')) from parking_bookings),
    'users', (select count(*) from profiles),
    'lucky', (select count(*) from lucky_draw_entries)
  ) else null end
$$;
