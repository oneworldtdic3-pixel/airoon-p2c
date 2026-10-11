-- GoTrue 는 전화번호를 '+' 없이 저장하므로 숫자만 비교한다
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
    regexp_replace(coalesce(new.phone, ''), '\D', '', 'g') in ('821000000000')
  )
  on conflict (id) do update set phone = coalesce(excluded.phone, profiles.phone);
  return new;
end $$;

-- 이미 가입한 관리자 번호가 있으면 소급 적용
update profiles set is_admin = true where regexp_replace(coalesce(phone, ''), '\D', '', 'g') = '821000000000';
