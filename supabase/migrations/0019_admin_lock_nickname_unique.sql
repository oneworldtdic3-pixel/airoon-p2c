-- 1) 테스트 번호(010-0000-0000) 자동 관리자 규칙 제거 + 해당 계정 관리자 해제
--    관리자는 이제 대시보드(SQL)에서만 지정한다.
update public.profiles set is_admin = false
 where is_admin and regexp_replace(coalesce(phone, ''), '\D', '', 'g') = '821000000000';

-- 4) 닉네임 중복 금지(대소문자·앞뒤 공백 무시). 기본값 '산사러'는 닉네임을 아직 안 정한 상태라 예외.
create unique index if not exists profiles_nickname_unique
  on public.profiles (lower(btrim(nickname)))
  where btrim(nickname) <> '산사러';

-- 가입 시 닉네임: 소셜 이름이 이미 쓰이고 있으면 '산사러'로 두고 앱에서 새로 정하게 한다(가입 자체는 실패하지 않게).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare nick text;
begin
  nick := left(btrim(coalesce(
    nullif(new.raw_user_meta_data ->> 'nickname', ''),
    nullif(new.raw_user_meta_data ->> 'name', ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'preferred_username', ''),
    '산사러')), 12);
  if nick <> '산사러' and exists (select 1 from profiles where lower(btrim(nickname)) = lower(nick)) then
    nick := '산사러';
  end if;
  insert into profiles (id, phone, nickname, is_admin)
  values (new.id, new.phone, nick, false)
  on conflict (id) do update set phone = coalesce(excluded.phone, profiles.phone);
  return new;
end $$;

-- 닉네임 사용 가능 여부(가입 전 확인용). 본인이 이미 쓰는 닉네임은 사용 가능으로 본다.
create or replace function public.nickname_available(nick text)
returns boolean language sql stable security definer set search_path = public as $$
  select btrim(nick) <> '산사러'
     and char_length(btrim(nick)) between 2 and 12
     and not exists (
       select 1 from profiles
        where lower(btrim(nickname)) = lower(btrim(nick))
          and id is distinct from auth.uid())
$$;
grant execute on function public.nickname_available(text) to anon, authenticated;
