-- 홈 팝업 (아래에서 올라오는 시트). 관리자 > 팝업 탭에서 등록·수정·노출 관리
create table if not exists public.popups (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  image_url text not null default '',      -- 공개 URL (관리자 업로드: photos 버킷 <관리자uid>/popups/...)
  link text not null default '',           -- '/about' 같은 앱 내부 경로 또는 https:// 외부 주소. 비우면 버튼 없음
  button_label text not null default '자세히 보기',
  starts_at timestamptz,                   -- 비우면 즉시
  ends_at timestamptz,                     -- 비우면 계속
  is_active boolean not null default false,
  sort int not null default 0,             -- 작을수록 먼저
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.popups enable row level security;
create policy "public read live" on public.popups for select
  using ((is_active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at > now())) or is_admin());
create policy "admin all" on public.popups for all using (is_admin()) with check (is_admin());

alter publication supabase_realtime add table public.popups;
