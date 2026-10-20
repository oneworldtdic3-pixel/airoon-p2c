-- 사진 댓글 알림: 댓글이 달리면 사진 올린 사람 + 그 사진에 먼저 댓글 단 사람(본인 제외)에게
--  · 앱 알림 탭 '내 소식'(user_notifications) 에 쌓고
--  · 휴대폰 푸시(send-push kind=comment) 로 바로 알린다
create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('comment')),
  photo_id uuid references public.photos(id) on delete cascade,
  comment_id uuid references public.photo_comments(id) on delete cascade,
  on_my_photo boolean not null default false,   -- true: 내 사진에 달린 댓글 / false: 내가 댓글 단 사진의 새 댓글
  actor_nickname text not null default '',
  body text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists user_notifications_user on public.user_notifications (user_id, created_at desc);
alter table public.user_notifications enable row level security;
create policy "own read" on public.user_notifications for select using (user_id = auth.uid());
create policy "own update" on public.user_notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
alter publication supabase_realtime add table public.user_notifications;

-- 푸시 발송 기록에 댓글 종류 추가
alter table public.push_log drop constraint if exists push_log_kind_check;
alter table public.push_log add constraint push_log_kind_check check (kind in ('reminder','notice','comment'));

create or replace function public.photo_comment_notify() returns trigger
language plpgsql security definer set search_path = public as $$
declare owner uuid; nick text;
begin
  select user_id into owner from photos where id = new.photo_id;
  select coalesce(nullif(btrim(nickname), ''), '산사러') into nick from profiles where id = new.user_id;
  insert into user_notifications (user_id, kind, photo_id, comment_id, on_my_photo, actor_nickname, body)
  select r.uid, 'comment', new.photo_id, new.id, r.uid = owner, coalesce(nick, '산사러'), left(new.body, 120)
  from (
    select owner as uid
    union
    select distinct c.user_id from photo_comments c where c.photo_id = new.photo_id and c.id <> new.id
  ) r
  where r.uid is not null and r.uid <> new.user_id;
  if found then perform push_call(jsonb_build_object('kind', 'comment', 'comment_id', new.id)); end if;
  return new;
end $$;
create trigger photo_comments_notify after insert on public.photo_comments for each row execute function public.photo_comment_notify();
