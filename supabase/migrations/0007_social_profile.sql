-- 소셜 로그인(카카오·구글) 가입자: 전화번호가 없으므로 공급자 프로필 이름을 닉네임으로 받는다
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, phone, nickname, is_admin)
  values (
    new.id,
    new.phone,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'nickname', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'preferred_username', ''),
      '산사러'
    ),
    coalesce(new.phone, '') in ('+821000000000')
  )
  on conflict (id) do update set phone = coalesce(excluded.phone, profiles.phone);
  return new;
end $$;
