-- 앱 푸시 알림 (Web Push): 기기 구독 + 발송 기록 + VAPID 키(Vault) + 크론(리마인드) + 트리거(공지) → Edge Function send-push
-- VAPID 개인키는 send-push 가 처음 호출될 때(kind=init) 서버에서 만들어 Vault 에 넣는다. 공유 비밀은 alimtalk_cron_secret 공용.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_id uuid references public.profiles(id) on delete set null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user on public.push_subscriptions(user_id);
alter table public.push_subscriptions enable row level security;
create policy "admin read" on public.push_subscriptions for select using (is_admin());

create table if not exists public.push_log (
  kind text not null check (kind in ('reminder','notice')),
  ref_id uuid not null,
  subscription_id uuid not null references public.push_subscriptions(id) on delete cascade,
  status text not null check (status in ('sent','failed')),
  error text,
  created_at timestamptz not null default now(),
  primary key (kind, ref_id, subscription_id)
);
alter table public.push_log enable row level security;
create policy "admin read" on public.push_log for select using (is_admin());

-- 구독 등록/갱신 — 로그인 전에도 가능, 로그인 상태면 그 계정에 묶는다
create or replace function public.push_subscribe(p_endpoint text, p_p256dh text, p_auth text, p_ua text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p_endpoint !~ '^https://' or length(p_endpoint) > 1000 or length(p_p256dh) > 200 or length(p_auth) > 100 then raise exception 'BAD_SUBSCRIPTION'; end if;
  insert into push_subscriptions (endpoint, p256dh, auth, user_id, user_agent)
  values (p_endpoint, p_p256dh, p_auth, auth.uid(), left(p_ua, 300))
  on conflict (endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth,
    user_id = coalesce(auth.uid(), push_subscriptions.user_id), user_agent = excluded.user_agent, updated_at = now();
end $$;
create or replace function public.push_unsubscribe(p_endpoint text) returns void
language sql security definer set search_path = public as $$ delete from push_subscriptions where endpoint = p_endpoint $$;
grant execute on function public.push_subscribe(text, text, text, text) to anon, authenticated;
grant execute on function public.push_unsubscribe(text) to anon, authenticated;

-- VAPID 키: 공개키는 누구나, 개인키는 service_role 만
create or replace function public.push_vapid_public() returns text
language sql stable security definer set search_path = public, vault as $$
  select decrypted_secret from vault.decrypted_secrets where name = 'push_vapid_public' $$;
grant execute on function public.push_vapid_public() to anon, authenticated;

create or replace function public.push_vapid_get() returns json
language sql stable security definer set search_path = public, vault as $$
  select json_build_object(
    'public_key', (select decrypted_secret from vault.decrypted_secrets where name = 'push_vapid_public'),
    'private_jwk', (select decrypted_secret from vault.decrypted_secrets where name = 'push_vapid_private')) $$;
revoke all on function public.push_vapid_get() from public, anon, authenticated;
grant execute on function public.push_vapid_get() to service_role;

create or replace function public.push_vapid_set(p_public text, p_private text) returns void
language plpgsql security definer set search_path = public, vault as $$
begin
  if exists (select 1 from vault.secrets where name = 'push_vapid_private') then return; end if; -- 한 번 만들면 바꾸지 않음(기존 구독이 깨짐)
  perform vault.create_secret(p_public, 'push_vapid_public', 'Web Push VAPID 공개키');
  perform vault.create_secret(p_private, 'push_vapid_private', 'Web Push VAPID 개인키(JWK)');
end $$;
revoke all on function public.push_vapid_set(text, text) from public, anon, authenticated;
grant execute on function public.push_vapid_set(text, text) to service_role;

-- 관리자: 구독 기기 수
create or replace function public.push_subscriber_count() returns int
language sql stable security definer set search_path = public as $$ select case when is_admin() then (select count(*)::int from push_subscriptions) end $$;
grant execute on function public.push_subscriber_count() to authenticated;

-- Edge Function 호출
create or replace function public.push_call(p_body jsonb) returns bigint
language plpgsql security definer set search_path = public, vault, extensions as $$
declare s text; begin
  select decrypted_secret into s from vault.decrypted_secrets where name = 'alimtalk_cron_secret';
  return net.http_post(
    url := 'https://rdbdbfzpkcppezmercce.supabase.co/functions/v1/send-push',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', s),
    body := p_body, timeout_milliseconds := 30000);
end $$;
revoke all on function public.push_call(jsonb) from public, anon, authenticated;

create or replace function public.push_on_notification() returns trigger
language plpgsql security definer set search_path = public as $$
begin perform push_call(jsonb_build_object('kind', 'notice', 'notification_id', new.id)); return new; end $$;
create trigger notifications_push after insert on public.notifications for each row execute function public.push_on_notification();

select cron.schedule('push-reminders', '* * * * *', $c$ select public.push_call('{"kind":"reminder"}'::jsonb) $c$);
