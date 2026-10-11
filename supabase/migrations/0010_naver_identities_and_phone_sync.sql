-- 네이버 로그인: 네이버 고유 ID ↔ auth.users 매핑. Edge Function(service role) 만 접근. 클라이언트 정책 없음.
create table if not exists naver_identities (
  naver_id text primary key,
  user_id uuid not null unique,
  created_at timestamptz not null default now()
);
alter table naver_identities enable row level security;
revoke all on naver_identities from anon, authenticated;

-- 소셜 계정에 휴대폰을 연결(phone_change)하면 profiles.phone 도 따라가게
create or replace function sync_profile_phone() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.phone is distinct from old.phone then
    update profiles set phone = new.phone where id = new.id;
  end if;
  return new;
end $$;
create trigger on_auth_user_phone_changed
  after update of phone on auth.users
  for each row execute function sync_profile_phone();
