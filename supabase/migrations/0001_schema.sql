-- 산사캠프 스키마
create extension if not exists pgcrypto;

create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- auth.users 와 1:1. 시드 사용자를 넣기 쉽도록 FK 는 두지 않고 트리거로 동기화한다.
create table profiles (
  id uuid primary key,
  nickname text not null default '산사러',
  phone text,
  team_id uuid references teams(id) on delete set null,
  is_admin boolean not null default false,
  kakao_alimtalk_consent boolean not null default false,
  created_at timestamptz not null default now()
);

create table programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  location text not null default '',
  duration text not null default '',
  pet_allowed boolean not null default false,
  capacity int not null check (capacity > 0),
  sort int not null default 0
);

create table program_sessions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs(id) on delete cascade,
  starts_at timestamptz not null,
  capacity int not null check (capacity > 0),
  booked_count int not null default 0 check (booked_count >= 0)
);
create index on program_sessions (program_id, starts_at);

create type booking_status as enum ('confirmed', 'cancelled', 'noshow');

create table bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  session_id uuid not null references program_sessions(id) on delete cascade,
  qr_code text not null unique,
  status booking_status not null default 'confirmed',
  created_at timestamptz not null default now()
);
create unique index bookings_one_active on bookings (user_id, session_id) where status = 'confirmed';
create index on bookings (user_id);

create table shower_slots (
  id uuid primary key default gen_random_uuid(),
  building text not null,
  gender char(1) not null check (gender in ('F', 'M')),
  starts_at timestamptz not null,
  capacity int not null default 4 check (capacity > 0),
  booked_count int not null default 0 check (booked_count >= 0)
);
create index on shower_slots (building, starts_at);

create table shower_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  slot_id uuid not null references shower_slots(id) on delete cascade,
  status booking_status not null default 'confirmed',
  created_at timestamptz not null default now()
);
create unique index shower_one_active on shower_bookings (user_id, slot_id) where status = 'confirmed';
create index on shower_bookings (user_id);

create table parking_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  zone text not null check (zone in ('P1', 'P2')),
  car_number text not null,
  dates date[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  spot_tag text not null check (spot_tag in ('일주문', '대웅전 계단', '차밭 능선', '불일폭포')),
  -- 'photos' 버킷 내 경로. 개발용 시드는 'seed:<spot>:<n>' 형식
  storage_path text not null,
  likes_count int not null default 0,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);
create index on photos (created_at desc);
create index on photos (likes_count desc);

create table photo_likes (
  user_id uuid not null references profiles(id) on delete cascade,
  photo_id uuid not null references photos(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, photo_id)
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('booth', 'luckydraw', 'reminder', 'market', 'notice')),
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now()
);
create index on notifications (created_at desc);

create table lucky_draw_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table banners (
  id uuid primary key default gen_random_uuid(),
  sponsor text not null,
  title text not null,
  sub text not null default '',
  image_path text not null,
  link text not null default '/more',
  bg text not null default '#0B9659',
  is_active boolean not null default true,
  sort int not null default 0
);

-- 가입 시 프로필 생성. 관리자 번호는 아래 목록으로 지정(운영 시 SQL 로 is_admin 갱신)
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, phone, nickname, is_admin)
  values (
    new.id,
    new.phone,
    coalesce(nullif(new.raw_user_meta_data ->> 'nickname', ''), '산사러'),
    new.phone in ('+821000000000')
  )
  on conflict (id) do update set phone = excluded.phone;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
