-- 카카오 알림톡: 발송 기록 + 크론(리마인드) + 트리거(공지) → Edge Function send-alimtalk. 운영 DB 적용 완료.
-- 공유 비밀은 Vault 'alimtalk_cron_secret' 에 보관하고 alimtalk_check_secret() 로만 검증한다.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

create table if not exists alimtalk_log (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('reminder','notice')),
  ref_id uuid not null,            -- reminder: bookings.id / notice: notifications.id
  user_id uuid not null references profiles(id) on delete cascade,
  phone text not null,
  status text not null check (status in ('sent','failed','skipped')),
  error text,
  created_at timestamptz not null default now(),
  unique (kind, ref_id, user_id)
);
alter table alimtalk_log enable row level security;
create policy "admin read" on alimtalk_log for select using (is_admin());

-- select vault.create_secret(encode(gen_random_bytes(24),'hex'), 'alimtalk_cron_secret', '…');

create or replace function alimtalk_check_secret(p text) returns boolean
language sql security definer set search_path = public, vault as $$
  select exists (select 1 from vault.decrypted_secrets where name = 'alimtalk_cron_secret' and decrypted_secret = p);
$$;
revoke all on function alimtalk_check_secret(text) from public, anon, authenticated;
grant execute on function alimtalk_check_secret(text) to service_role;

create or replace function alimtalk_call(p_body jsonb) returns bigint
language plpgsql security definer set search_path = public, vault, extensions as $$
declare s text; begin
  select decrypted_secret into s from vault.decrypted_secrets where name = 'alimtalk_cron_secret';
  return net.http_post(
    url := 'https://rdbdbfzpkcppezmercce.supabase.co/functions/v1/send-alimtalk',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', s),
    body := p_body, timeout_milliseconds := 20000);
end $$;
revoke all on function alimtalk_call(jsonb) from public, anon, authenticated;

create or replace function alimtalk_on_notification() returns trigger
language plpgsql security definer set search_path = public as $$
begin perform alimtalk_call(jsonb_build_object('kind', 'notice', 'notification_id', new.id)); return new; end $$;
create trigger notifications_alimtalk after insert on notifications for each row execute function alimtalk_on_notification();

select cron.schedule('alimtalk-reminders', '* * * * *', $c$ select public.alimtalk_call('{"kind":"reminder"}'::jsonb) $c$);
