-- 캠핑 사이트 배정 (결제는 네이버 스마트스토어, 앱은 '사이트 배정'만)
-- 여러 사찰·회차를 지원: events → event_maps(배치도) / zones(구역) → sites(사이트) → site_assignments(배정)
-- 테스트 데이터는 is_test = true 로 구분

-- ---- 행사 ---------------------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,                 -- 'ssanggyesa-1'
  temple_name text not null,                 -- 쌍계사
  edition int not null default 1,            -- 회차
  title text not null,                       -- 제1회 산사캠프 쌍계사
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  checkin_time text not null default '14:00',
  checkout_time text not null default '11:00',
  refund_rules jsonb not null default '[]'::jsonb,   -- [{label:'11/5까지', rate:100}, ...] 비어 있으면 표를 숨긴다
  consents jsonb not null default '[]'::jsonb,       -- [{key, title, body, required}] 행사별 동의 항목 ('세 가지 약속' 등)
  is_active boolean not null default true,
  is_test boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---- 배치도 (행사별 여러 장, 이미지 교체해도 사이트는 유지되고 좌표만 비율로 다시 찍는다) --------------
create table if not exists public.event_maps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null default '배치도',
  image_url text not null,
  width int not null default 0,
  height int not null default 0,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- ---- 구역 ---------------------------------------------------------------------------------------
create table if not exists public.zones (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  code text not null,                        -- A / B / C
  name text not null,                        -- 쌍계사 경내
  subtitle text not null default '',         -- Pet & Kids zone
  capacity int not null default 0,           -- 동 수
  price_won int not null default 380000,     -- 1사이트(1~2인)
  ground text not null default '',           -- 바닥 종류 (관리자 입력)
  toilet_distance text not null default '',  -- 화장실 거리
  shower_distance text not null default '',  -- 샤워실 거리
  pet_allowed boolean not null default false,
  photo_url text not null default '',
  remaining_override int,                    -- 관리자가 스마트스토어 재고에 맞춰 적는 '남은 자리'. null 이면 사이트 기준 자동
  recent_bookings int not null default 0,    -- '최근 N팀 예약'
  sold_out boolean not null default false,
  smartstore_url text not null default '',
  sort int not null default 0,
  unique (event_id, code)
);

-- ---- 사이트 -------------------------------------------------------------------------------------
create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  zone_id uuid not null references public.zones(id) on delete cascade,
  map_id uuid references public.event_maps(id) on delete set null,
  number text not null,                      -- 'A-01'
  x numeric(6,4) not null default 0,         -- 배치도 가로 비율 0~1
  y numeric(6,4) not null default 0,
  width_m numeric(4,1),                      -- 크기(m) — 미정이면 null
  depth_m numeric(4,1),
  ground text not null default '',
  pet_allowed boolean not null default false,
  status text not null default 'open' check (status in ('open','blocked')),
  sort int not null default 0,
  is_test boolean not null default false,
  unique (event_id, number)
);
create index if not exists sites_zone on public.sites(zone_id);

-- ---- 스마트스토어 예매번호 (관리자가 판매자센터 주문 목록을 붙여넣어 등록) --------------------------
create table if not exists public.ticket_orders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  zone_id uuid references public.zones(id) on delete set null,
  order_no text not null,
  buyer_name text not null default '',
  phone_last4 text not null default '',
  qty int not null default 1 check (qty between 1 and 10),
  note text not null default '',
  is_test boolean not null default false,
  imported_at timestamptz not null default now(),
  unique (event_id, order_no)
);

-- ---- 배정 ---------------------------------------------------------------------------------------
create table if not exists public.site_assignments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete restrict,
  order_id uuid not null references public.ticket_orders(id) on delete restrict,
  user_id uuid references public.profiles(id) on delete set null,
  adults int not null default 2 check (adults between 1 and 10),
  kids int not null default 0 check (kids between 0 and 10),
  infants int not null default 0 check (infants between 0 and 10),
  car_number text not null default '',
  group_key text,                            -- 일행 묶음(같은 값이면 옆자리로 함께 배정)
  qr_code text not null unique,
  status text not null default 'active' check (status in ('active','cancelled')),
  agreed_at timestamptz,
  note text not null default '',
  is_test boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- 사이트 하나에 활성 배정 하나, 예매번호(수량만큼)는 아래 함수에서 검사
create unique index if not exists site_assignments_one_per_site on public.site_assignments(site_id) where status = 'active';
create index if not exists site_assignments_order on public.site_assignments(order_id);
create index if not exists site_assignments_user on public.site_assignments(user_id);

-- ---- 동반자 (QR 팔찌 인원) ------------------------------------------------------------------------
create table if not exists public.assignment_members (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.site_assignments(id) on delete cascade,
  name text not null,
  phone text not null default '',
  is_lead boolean not null default false,
  qr_code text not null unique,
  created_at timestamptz not null default now()
);

-- ---- 빈자리 알림 신청 ---------------------------------------------------------------------------
create table if not exists public.vacancy_alerts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  zone_id uuid not null references public.zones(id) on delete cascade,
  phone text not null,
  user_id uuid references public.profiles(id) on delete set null,
  notified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (zone_id, phone)
);

-- 기존 주차 등록과 같은 데이터로: 배정에서 넣은 차량번호는 parking_bookings 에 저장하고 어느 배정에서 왔는지만 기록
alter table public.parking_bookings add column if not exists assignment_id uuid references public.site_assignments(id) on delete set null;

-- ---- RLS ----------------------------------------------------------------------------------------
alter table public.events enable row level security;
alter table public.event_maps enable row level security;
alter table public.zones enable row level security;
alter table public.sites enable row level security;
alter table public.ticket_orders enable row level security;
alter table public.site_assignments enable row level security;
alter table public.assignment_members enable row level security;
alter table public.vacancy_alerts enable row level security;

create policy "public read" on public.events for select using (is_active or is_admin());
create policy "admin all" on public.events for all using (is_admin()) with check (is_admin());
create policy "public read" on public.event_maps for select using (true);
create policy "admin all" on public.event_maps for all using (is_admin()) with check (is_admin());
create policy "public read" on public.zones for select using (true);
create policy "admin all" on public.zones for all using (is_admin()) with check (is_admin());
create policy "public read" on public.sites for select using (true);
create policy "admin all" on public.sites for all using (is_admin()) with check (is_admin());
create policy "admin all" on public.ticket_orders for all using (is_admin()) with check (is_admin());
create policy "own or admin read" on public.site_assignments for select using (user_id = auth.uid() or is_admin());
create policy "admin write" on public.site_assignments for all using (is_admin()) with check (is_admin());
create policy "own or admin read" on public.assignment_members for select
  using (is_admin() or exists (select 1 from site_assignments a where a.id = assignment_id and a.user_id = auth.uid()));
create policy "admin write" on public.assignment_members for all using (is_admin()) with check (is_admin());
create policy "admin read" on public.vacancy_alerts for select using (is_admin());
create policy "admin write" on public.vacancy_alerts for all using (is_admin()) with check (is_admin());

alter publication supabase_realtime add table public.sites;
alter publication supabase_realtime add table public.site_assignments;
alter publication supabase_realtime add table public.zones;

-- ---- 함수 ---------------------------------------------------------------------------------------
-- 사이트별 점유 상태 (누구나): 배정 내용은 숨기고 '찼다' 만 알려 준다
create or replace function public.site_occupancy(p_event uuid) returns table (site_id uuid, taken boolean, group_key text)
language sql stable security definer set search_path = public as $$
  select s.id, a.id is not null, case when a.user_id = auth.uid() then a.group_key end
  from sites s left join site_assignments a on a.site_id = s.id and a.status = 'active'
  where s.event_id = p_event
$$;
grant execute on function public.site_occupancy(uuid) to anon, authenticated;

-- 예매번호 확인: 구역·수량·남은 배정 수를 돌려준다 (예매번호 + 연락처 뒷 4자리)
create or replace function public.verify_order(p_event uuid, p_order_no text, p_last4 text) returns json
language plpgsql stable security definer set search_path = public as $$
declare o ticket_orders%rowtype; used int;
begin
  select * into o from ticket_orders where event_id = p_event and order_no = btrim(p_order_no);
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if o.phone_last4 <> '' and o.phone_last4 <> right(regexp_replace(p_last4, '\D', '', 'g'), 4) then raise exception 'ORDER_PHONE_MISMATCH'; end if;
  select count(*) into used from site_assignments where order_id = o.id and status = 'active';
  return json_build_object('order_id', o.id, 'zone_id', o.zone_id, 'qty', o.qty, 'used', used, 'buyer_name', o.buyer_name);
end $$;
grant execute on function public.verify_order(uuid, text, text) to anon, authenticated;

-- 배정: 사이트 행을 잠가 동시 선택 경쟁을 막는다. 예매번호 없이는 불가.
create or replace function public.assign_site(
  p_event uuid, p_order_no text, p_last4 text, p_site_ids uuid[],
  p_adults int, p_kids int, p_infants int,
  p_car text, p_parking_zone text, p_members jsonb, p_consents jsonb
) returns json
language plpgsql security definer set search_path = public as $$
declare
  o ticket_orders%rowtype; s sites%rowtype; z zones%rowtype;
  used int; gk text; a site_assignments%rowtype; m jsonb; ids uuid[] := '{}'; qrs text[] := '{}';
  first_id uuid;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if now() < program_booking_opens_at() and not is_admin() then raise exception 'BOOKING_NOT_OPEN'; end if;
  if coalesce(array_length(p_site_ids, 1), 0) = 0 then raise exception 'SITE_REQUIRED'; end if;
  if p_adults < 1 then raise exception 'ADULTS_REQUIRED'; end if;

  select * into o from ticket_orders where event_id = p_event and order_no = btrim(p_order_no) for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if o.phone_last4 <> '' and o.phone_last4 <> right(regexp_replace(p_last4, '\D', '', 'g'), 4) then raise exception 'ORDER_PHONE_MISMATCH'; end if;
  select count(*) into used from site_assignments where order_id = o.id and status = 'active';
  if used + array_length(p_site_ids, 1) > o.qty then raise exception 'ORDER_QTY_EXCEEDED'; end if;

  -- 필수 동의 3가지 (유의사항·환불 / 개인정보 / 세 가지 약속)
  if not (coalesce(p_consents->>'terms','') = 'true' and coalesce(p_consents->>'privacy','') = 'true' and coalesce(p_consents->>'promises','') = 'true') then
    raise exception 'CONSENT_REQUIRED';
  end if;

  gk := case when array_length(p_site_ids, 1) > 1 then 'G-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)) end;

  foreach first_id in array p_site_ids loop
    -- 잠금: 같은 사이트를 동시에 고르면 둘째는 여기서 기다렸다가 '이미 찼음' 을 받는다
    select * into s from sites where id = first_id and event_id = p_event for update;
    if not found then raise exception 'SITE_NOT_FOUND'; end if;
    if s.status <> 'open' then raise exception 'SITE_BLOCKED'; end if;
    if o.zone_id is not null and s.zone_id <> o.zone_id then raise exception 'SITE_ZONE_MISMATCH'; end if;
    if exists (select 1 from site_assignments where site_id = s.id and status = 'active') then raise exception 'SITE_TAKEN'; end if;
    select * into z from zones where id = s.zone_id;
    if not z.pet_allowed and coalesce(p_consents->>'pet','') = 'true' then raise exception 'PET_NOT_ALLOWED'; end if;

    insert into site_assignments (event_id, site_id, order_id, user_id, adults, kids, infants, car_number, group_key, qr_code, agreed_at)
    values (p_event, s.id, o.id, auth.uid(), p_adults, p_kids, p_infants, btrim(coalesce(p_car, '')), gk,
            'SANSA-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)), now())
    returning * into a;
    ids := ids || a.id; qrs := qrs || a.qr_code;
  end loop;

  -- 동반자 (첫 배정에 묶는다). 대표자는 is_lead
  insert into assignment_members (assignment_id, name, phone, is_lead, qr_code)
  values (ids[1], coalesce(nullif(btrim(o.buyer_name), ''), (select nickname from profiles where id = auth.uid())), '', true,
          'SANSA-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)));
  for m in select * from jsonb_array_elements(coalesce(p_members, '[]'::jsonb)) loop
    if btrim(coalesce(m->>'name', '')) <> '' then
      insert into assignment_members (assignment_id, name, phone, qr_code)
      values (ids[1], left(btrim(m->>'name'), 30), left(regexp_replace(coalesce(m->>'phone', ''), '[^0-9]', '', 'g'), 11),
              'SANSA-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)));
    end if;
  end loop;

  -- 차량: 기존 주차 등록과 같은 테이블 (1인 1건) → 중복 등록이 생기지 않는다
  if btrim(coalesce(p_car, '')) <> '' then
    if p_car !~ '^\d{2,3}[가-힣]\s?\d{4}$' then raise exception 'CAR_NUMBER_INVALID'; end if;
    insert into parking_bookings (user_id, zone, car_number, dates, assignment_id)
    values (auth.uid(), coalesce(nullif(p_parking_zone, ''), 'P1'), btrim(p_car),
            (select array_agg(d::date) from generate_series((select starts_at from events where id = p_event)::date, (select ends_at from events where id = p_event)::date, '1 day') d),
            ids[1])
    on conflict (user_id) do update set zone = excluded.zone, car_number = excluded.car_number, dates = excluded.dates, assignment_id = excluded.assignment_id, updated_at = now();
  end if;

  return json_build_object('assignment_ids', ids, 'qr_codes', qrs, 'group_key', gk);
end $$;
grant execute on function public.assign_site(uuid, text, text, uuid[], int, int, int, text, text, jsonb, jsonb) to authenticated;

-- 내 배정 (사이트·구역·동반자 포함)
create or replace function public.my_assignments(p_event uuid) returns json
language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object(
    'id', a.id, 'site_number', s.number, 'zone_code', z.code, 'zone_name', z.name, 'adults', a.adults, 'kids', a.kids, 'infants', a.infants,
    'car_number', a.car_number, 'group_key', a.group_key, 'qr_code', a.qr_code, 'status', a.status, 'created_at', a.created_at,
    'members', (select coalesce(json_agg(json_build_object('id', m.id, 'name', m.name, 'phone', m.phone, 'is_lead', m.is_lead, 'qr_code', m.qr_code) order by m.is_lead desc, m.created_at), '[]'::json) from assignment_members m where m.assignment_id = a.id)
  ) order by a.created_at), '[]'::json)
  from site_assignments a join sites s on s.id = a.site_id join zones z on z.id = s.zone_id
  where a.event_id = p_event and a.user_id = auth.uid() and a.status = 'active'
$$;
grant execute on function public.my_assignments(uuid) to authenticated;

-- 빈자리 알림 신청 (로그인 없이도 전화번호로)
create or replace function public.request_vacancy_alert(p_zone uuid, p_phone text) returns void
language plpgsql security definer set search_path = public as $$
declare ph text := regexp_replace(p_phone, '\D', '', 'g');
begin
  if ph !~ '^01[016789]\d{7,8}$' then raise exception 'PHONE_INVALID'; end if;
  insert into vacancy_alerts (event_id, zone_id, phone, user_id)
  select z.event_id, z.id, ph, auth.uid() from zones z where z.id = p_zone
  on conflict (zone_id, phone) do update set user_id = coalesce(excluded.user_id, vacancy_alerts.user_id);
end $$;
grant execute on function public.request_vacancy_alert(uuid, text) to anon, authenticated;

-- 관리자: 배정 취소 (사이트를 다시 연다)
create or replace function public.admin_cancel_assignment(p_assignment uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'FORBIDDEN'; end if;
  update site_assignments set status = 'cancelled', updated_at = now() where id = p_assignment;
end $$;
grant execute on function public.admin_cancel_assignment(uuid) to authenticated;

-- 관리자: 수동 배정/변경 (예매번호 없이도 가능 — 현장 조정용)
create or replace function public.admin_assign_site(p_site uuid, p_order_no text, p_adults int, p_kids int, p_car text, p_note text) returns json
language plpgsql security definer set search_path = public as $$
declare s sites%rowtype; o ticket_orders%rowtype; a site_assignments%rowtype;
begin
  if not is_admin() then raise exception 'FORBIDDEN'; end if;
  select * into s from sites where id = p_site for update;
  if not found then raise exception 'SITE_NOT_FOUND'; end if;
  if exists (select 1 from site_assignments where site_id = s.id and status = 'active') then raise exception 'SITE_TAKEN'; end if;
  select * into o from ticket_orders where event_id = s.event_id and order_no = btrim(p_order_no);
  if not found then
    insert into ticket_orders (event_id, zone_id, order_no, note) values (s.event_id, s.zone_id, btrim(p_order_no), '관리자 수동 등록') returning * into o;
  end if;
  insert into site_assignments (event_id, site_id, order_id, adults, kids, car_number, qr_code, note, agreed_at)
  values (s.event_id, s.id, o.id, greatest(p_adults, 1), greatest(p_kids, 0), btrim(coalesce(p_car, '')),
          'SANSA-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)), coalesce(p_note, ''), now())
  returning * into a;
  return json_build_object('id', a.id, 'qr_code', a.qr_code);
end $$;
grant execute on function public.admin_assign_site(uuid, text, int, int, text, text) to authenticated;

-- 관리자: 예매번호 목록 붙여넣기 (한 줄에 "예매번호, 구역코드, 수량, 이름, 연락처뒷4" — 쉼표/탭 구분)
create or replace function public.admin_import_orders(p_event uuid, p_rows jsonb) returns int
language plpgsql security definer set search_path = public as $$
declare r jsonb; n int := 0; zid uuid;
begin
  if not is_admin() then raise exception 'FORBIDDEN'; end if;
  for r in select * from jsonb_array_elements(p_rows) loop
    if btrim(coalesce(r->>'order_no', '')) = '' then continue; end if;
    select id into zid from zones where event_id = p_event and upper(code) = upper(coalesce(r->>'zone', ''));
    insert into ticket_orders (event_id, zone_id, order_no, buyer_name, phone_last4, qty, is_test)
    values (p_event, zid, btrim(r->>'order_no'), coalesce(r->>'buyer_name', ''), right(regexp_replace(coalesce(r->>'phone', ''), '\D', '', 'g'), 4),
            greatest(coalesce((r->>'qty')::int, 1), 1), coalesce((r->>'is_test')::boolean, false))
    on conflict (event_id, order_no) do update set zone_id = coalesce(excluded.zone_id, ticket_orders.zone_id), buyer_name = excluded.buyer_name,
      phone_last4 = case when excluded.phone_last4 <> '' then excluded.phone_last4 else ticket_orders.phone_last4 end, qty = excluded.qty;
    n := n + 1;
  end loop;
  return n;
end $$;
grant execute on function public.admin_import_orders(uuid, jsonb) to authenticated;

-- 구역별 요약 (홈 카드): 남은 자리(관리자 값 우선) · 최근 예약 팀
create or replace function public.zone_summary(p_event uuid) returns json
language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object(
    'id', z.id, 'code', z.code, 'name', z.name, 'subtitle', z.subtitle, 'capacity', z.capacity, 'price_won', z.price_won, 'ground', z.ground,
    'toilet_distance', z.toilet_distance, 'shower_distance', z.shower_distance, 'pet_allowed', z.pet_allowed, 'photo_url', z.photo_url,
    'sold_out', z.sold_out, 'smartstore_url', z.smartstore_url, 'recent_bookings', z.recent_bookings,
    'remaining', coalesce(z.remaining_override, greatest(z.capacity - (select count(*) from site_assignments a join sites s on s.id = a.site_id where s.zone_id = z.id and a.status = 'active'), 0)),
    'site_count', (select count(*) from sites s where s.zone_id = z.id),
    'taken', (select count(*) from site_assignments a join sites s on s.id = a.site_id where s.zone_id = z.id and a.status = 'active')
  ) order by z.sort, z.code), '[]'::json)
  from zones z where z.event_id = p_event
$$;
grant execute on function public.zone_summary(uuid) to anon, authenticated;

-- ---- 시드: 제1회 쌍계사 ---------------------------------------------------------------------------
insert into public.events (slug, temple_name, edition, title, starts_at, ends_at, checkin_time, checkout_time, consents)
values ('ssanggyesa-1', '쌍계사', 1, '제1회 산사캠프 쌍계사', '2026-11-06 14:00+09', '2026-11-08 11:00+09', '14:00', '11:00',
  '[{"key":"promise1","title":"화기 전면 금지 · 취사 없음","body":"라이터·버너·향초처럼 불을 쓰는 물품은 가져올 수 없습니다. 식사는 공양간과 산사장터에서 합니다."},
    {"key":"promise2","title":"QR 팔찌 상시 착용","body":"입장과 프로그램 체크인 모두 팔찌로 합니다. 2박 3일 내내 착용해 주세요."},
    {"key":"promise3","title":"21시부터 고요의 시간","body":"대화는 낮은 목소리로, 소리 나는 기기는 꺼 둡니다."}]'::jsonb)
on conflict (slug) do nothing;

insert into public.zones (event_id, code, name, subtitle, capacity, pet_allowed, sort)
select e.id, v.code, v.name, v.subtitle, v.capacity, v.pet, v.sort
from public.events e, (values
  ('A', '쌍계사 경내', '천년 고찰 안에서 하룻밤', 30, false, 1),
  ('B', '쌍계초 Pet & Kids', '반려견·아이와 함께', 85, true, 2),
  ('C', '주차장 · 언덕', '차 바로 옆, 넓은 언덕', 135, false, 3)
) as v(code, name, subtitle, capacity, pet, sort)
where e.slug = 'ssanggyesa-1'
on conflict (event_id, code) do nothing;
