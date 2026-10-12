-- 사진 댓글. 운영 DB 적용 완료.
create table if not exists photo_comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references photos(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 300),
  created_at timestamptz not null default now()
);
create index if not exists photo_comments_photo_idx on photo_comments (photo_id, created_at);
alter table photo_comments enable row level security;
create policy "public read" on photo_comments for select using (true);
create policy "own insert" on photo_comments for insert with check (user_id = auth.uid());
create policy "own or admin delete" on photo_comments for delete using (user_id = auth.uid() or is_admin());
alter publication supabase_realtime add table photo_comments;
