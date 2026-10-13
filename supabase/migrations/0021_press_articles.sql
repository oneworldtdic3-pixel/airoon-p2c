-- 언론 보도: 운영자가 기사 링크를 등록하면 더보기 '산사캠프 소식'에 즉시 노출. 삭제 대신 숨김(is_hidden).
create table if not exists public.press_articles (
  id uuid primary key default gen_random_uuid(),
  url text not null unique check (url ~* '^https?://'),
  title text not null check (char_length(btrim(title)) between 2 and 200),
  outlet text not null default '' check (char_length(outlet) <= 40),
  image_url text check (image_url is null or image_url ~* '^https?://'),
  published_at date,
  is_hidden boolean not null default false,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists press_articles_list on public.press_articles (is_hidden, published_at desc nulls last, created_at desc);

alter table public.press_articles enable row level security;
grant select on public.press_articles to anon, authenticated;
grant insert, update on public.press_articles to authenticated;

do $$ begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='press_articles' and policyname='press read') then
    create policy "press read" on public.press_articles for select using (not is_hidden or public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='press_articles' and policyname='press admin insert') then
    create policy "press admin insert" on public.press_articles for insert to authenticated with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='press_articles' and policyname='press admin update') then
    create policy "press admin update" on public.press_articles for update to authenticated using (public.is_admin()) with check (public.is_admin());
  end if;
  if not exists (select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='press_articles') then
    alter publication supabase_realtime add table public.press_articles;
  end if;
end $$;
