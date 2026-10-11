-- 빈 제목 알림 차단 (클라이언트 폼 오작동으로 들어온 1건 정리 포함)
delete from notifications where btrim(title) = '';
alter table notifications add constraint notifications_title_not_blank check (btrim(title) <> '');

create or replace function admin_publish_notification(p_type text, p_title text, p_body text) returns notifications
language plpgsql security definer set search_path = public as $$
declare n notifications%rowtype;
begin
  if not is_admin() then raise exception 'FORBIDDEN'; end if;
  if btrim(coalesce(p_title, '')) = '' then raise exception 'TITLE_REQUIRED'; end if;
  insert into notifications (type, title, body) values (p_type, btrim(p_title), btrim(coalesce(p_body, ''))) returning * into n;
  return n;
end $$;
