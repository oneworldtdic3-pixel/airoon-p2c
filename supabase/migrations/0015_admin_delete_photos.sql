-- 관리자 사진 삭제. Supabase 는 storage.objects 를 SQL 로 직접 지우지 못하게 막으므로(storage.protect_delete)
-- DB 행만 함수에서 지우고, 저장소 파일은 앱이 Storage API(remove)로 지운다. 관리자가 남의 파일을 지울 수 있게 스토리지 정책 추가.
-- 운영 DB 적용 완료 (2026-10-12).

-- 사진 1장: 좋아요·행 삭제 후 storage_path 반환 (앱이 'seed:' 가 아니면 Storage API 로 파일 삭제)
create or replace function admin_delete_photo(p_photo uuid) returns text
language plpgsql security definer set search_path = public as $$
declare p photos%rowtype;
begin
  if not is_admin() then raise exception 'FORBIDDEN'; end if;
  select * into p from photos where id = p_photo;
  if not found then return null; end if;
  delete from photo_likes where photo_id = p_photo;
  delete from photos where id = p_photo;
  return p.storage_path;
end $$;

-- 전체: DB 행만 삭제, 장수 반환. 파일은 앱이 미리 모은 경로로 Storage API remove.
create or replace function admin_delete_all_photos() returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not is_admin() then raise exception 'FORBIDDEN'; end if;
  select count(*) into n from photos;
  delete from photo_likes;
  delete from photos;
  return n;
end $$;

revoke all on function admin_delete_photo(uuid), admin_delete_all_photos() from public, anon;
grant execute on function admin_delete_photo(uuid), admin_delete_all_photos() to authenticated;

create policy "photos admin delete" on storage.objects for delete using (bucket_id = 'photos' and public.is_admin());
