alter table teams enable row level security;
alter table profiles enable row level security;
alter table programs enable row level security;
alter table program_sessions enable row level security;
alter table bookings enable row level security;
alter table shower_slots enable row level security;
alter table shower_bookings enable row level security;
alter table parking_bookings enable row level security;
alter table photos enable row level security;
alter table photo_likes enable row level security;
alter table notifications enable row level security;
alter table lucky_draw_entries enable row level security;
alter table banners enable row level security;

-- 공개 읽기
create policy "public read" on programs for select using (true);
create policy "public read" on program_sessions for select using (true);
create policy "public read" on shower_slots for select using (true);
create policy "public read" on notifications for select using (true);
create policy "public read active" on banners for select using (is_active or is_admin());
create policy "public read visible" on photos for select using (not is_hidden or user_id = auth.uid() or is_admin());
create policy "team read" on teams for select using (true);

-- 프로필: 본인만 읽고 수정(관리자는 전체 읽기). is_admin/team_id 는 클라이언트에서 못 바꾼다.
create policy "own read" on profiles for select using (id = auth.uid() or is_admin());
create policy "own update" on profiles for update using (id = auth.uid())
  with check (id = auth.uid() and is_admin = (select is_admin from profiles where id = auth.uid()) and team_id is not distinct from (select team_id from profiles where id = auth.uid()));

-- 예약·좋아요·응모: 읽기는 본인(관리자 전체). 쓰기는 전부 함수(security definer) 경유
create policy "own read" on bookings for select using (user_id = auth.uid() or is_admin());
create policy "own read" on shower_bookings for select using (user_id = auth.uid() or is_admin());
create policy "own read" on parking_bookings for select using (user_id = auth.uid() or is_admin());
create policy "own read" on photo_likes for select using (user_id = auth.uid());
create policy "own read" on lucky_draw_entries for select using (user_id = auth.uid() or is_admin());

-- 사진: 본인 행만 생성·수정·삭제. 숨김/좋아요 수는 함수로만.
create policy "own insert" on photos for insert with check (user_id = auth.uid());
create policy "own update" on photos for update using (user_id = auth.uid())
  with check (user_id = auth.uid() and is_hidden = (select is_hidden from photos p where p.id = photos.id) and likes_count = (select likes_count from photos p where p.id = photos.id));
create policy "own delete" on photos for delete using (user_id = auth.uid());

-- 관리자: 배너·알림·프로그램·슬롯 직접 관리
create policy "admin all" on banners for all using (is_admin()) with check (is_admin());
create policy "admin all" on notifications for all using (is_admin()) with check (is_admin());
create policy "admin all" on programs for all using (is_admin()) with check (is_admin());
create policy "admin all" on program_sessions for all using (is_admin()) with check (is_admin());
create policy "admin all" on shower_slots for all using (is_admin()) with check (is_admin());
create policy "admin update" on bookings for update using (is_admin()) with check (is_admin());
create policy "admin update" on shower_bookings for update using (is_admin()) with check (is_admin());
