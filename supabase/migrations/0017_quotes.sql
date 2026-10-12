-- 캠퍼 한 줄 문구 + 좋아요. 가장 많은 좋아요를 받은 문구가 홈 상단 헤드라인이 된다.
-- 운영 DB 적용 완료.
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references profiles(id) on delete cascade,  -- 1인 1문구 (다시 쓰면 교체, 좋아요 유지)
  body text not null check (char_length(btrim(body)) between 2 and 40),
  likes_count int not null default 0,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists quote_likes (
  user_id uuid not null references profiles(id) on delete cascade,
  quote_id uuid not null references quotes(id) on delete cascade,
  active boolean not null default true,  -- 취소는 행 삭제 대신 false 로
  created_at timestamptz not null default now(),
  primary key (user_id, quote_id)
);
create index if not exists quotes_rank_idx on quotes (is_hidden, likes_count desc, created_at desc);
alter table quotes enable row level security;
alter table quote_likes enable row level security;
create policy "public read" on quotes for select using (not is_hidden or user_id = auth.uid() or is_admin());
create policy "own read" on quote_likes for select using (user_id = auth.uid());
alter publication supabase_realtime add table quotes;

create or replace function upsert_quote(p_body text) returns quotes
language plpgsql security definer set search_path = public as $$
declare q quotes%rowtype; b text := btrim(p_body);
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  if char_length(b) < 2 or char_length(b) > 40 then raise exception 'QUOTE_LENGTH'; end if;
  insert into quotes (user_id, body) values (auth.uid(), b)
  on conflict (user_id) do update set body = excluded.body, is_hidden = false, updated_at = now()
  returning * into q;
  return q;
end $$;

create or replace function toggle_quote_like(p_quote uuid) returns int
language plpgsql security definer set search_path = public as $$
declare n int; cur boolean;
begin
  if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
  perform 1 from quotes where id = p_quote for update;
  if not found then raise exception 'QUOTE_NOT_FOUND'; end if;
  select active into cur from quote_likes where user_id = auth.uid() and quote_id = p_quote;
  if cur is null then
    insert into quote_likes (user_id, quote_id, active) values (auth.uid(), p_quote, true);
    update quotes set likes_count = likes_count + 1 where id = p_quote returning likes_count into n;
  elsif cur then
    update quote_likes set active = false where user_id = auth.uid() and quote_id = p_quote;
    update quotes set likes_count = greatest(0, likes_count - 1) where id = p_quote returning likes_count into n;
  else
    update quote_likes set active = true where user_id = auth.uid() and quote_id = p_quote;
    update quotes set likes_count = likes_count + 1 where id = p_quote returning likes_count into n;
  end if;
  return n;
end $$;

create or replace function admin_set_quote_hidden(p_quote uuid, p_hidden boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'FORBIDDEN'; end if;
  update quotes set is_hidden = p_hidden where id = p_quote;
end $$;

revoke all on function upsert_quote(text), toggle_quote_like(uuid), admin_set_quote_hidden(uuid, boolean) from public, anon;
grant execute on function upsert_quote(text), toggle_quote_like(uuid), admin_set_quote_hidden(uuid, boolean) to authenticated;
