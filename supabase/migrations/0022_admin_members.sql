-- 관리자 · 회원 목록. auth.users 의 가입일·마지막 로그인·로그인 수단은 클라이언트에서 못 읽으므로 관리자 전용 함수로 묶어 준다.
create or replace function public.admin_members()
returns table (
  id uuid, nickname text, phone text, is_admin boolean, kakao_alimtalk_consent boolean,
  providers text[], signed_up timestamptz, last_sign_in timestamptz,
  programs int, showers int, parking boolean, photos int
)
language sql stable security definer set search_path = public as $$
  select p.id, p.nickname, p.phone, p.is_admin, p.kakao_alimtalk_consent,
    (select coalesce(array_agg(distinct x order by x), '{}') from (
       select i.provider as x from auth.identities i where i.user_id = p.id
       union select 'naver' where exists (select 1 from naver_identities n where n.user_id = p.id)
     ) s),
    u.created_at, u.last_sign_in_at,
    (select count(*)::int from bookings b where b.user_id = p.id and b.status = 'confirmed'),
    (select count(*)::int from shower_bookings s where s.user_id = p.id and s.status = 'confirmed'),
    exists (select 1 from parking_bookings k where k.user_id = p.id),
    (select count(*)::int from photos f where f.user_id = p.id)
  from profiles p join auth.users u on u.id = p.id
  where public.is_admin()
  order by u.created_at desc
$$;
revoke execute on function public.admin_members() from anon, public;
grant execute on function public.admin_members() to authenticated;
