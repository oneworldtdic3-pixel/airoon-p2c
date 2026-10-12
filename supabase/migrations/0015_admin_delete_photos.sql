-- 관리자 사진 삭제 RPC. 대시보드 SQL Editor 에서 실행한다 (MCP 는 delete 가 포함된 문장을 확인 없이 실행하지 않는다).
create or replace function admin_delete_photo(p_photo uuid) returns void
language plpgsql security definer set search_path = public, storage as $$
declare p photos%rowtype;
begin
  if not is_admin() then raise exception 'FORBIDDEN'; end if;
  select * into p from photos where id = p_photo;
  if not found then return; end if;
  delete from photo_likes where photo_id = p_photo;
  delete from photos where id = p_photo;
  if p.storage_path not like 'seed:%' then
    delete from storage.objects where bucket_id = 'photos' and name = p.storage_path;
  end if;
end $$;

-- 사진 전체 삭제 (출시 전 테스트 데이터 정리용). 삭제한 장수를 돌려준다
create or replace function admin_delete_all_photos() returns int
language plpgsql security definer set search_path = public, storage as $$
declare n int;
begin
  if not is_admin() then raise exception 'FORBIDDEN'; end if;
  select count(*) into n from photos;
  delete from photo_likes;
  delete from photos;
  delete from storage.objects where bucket_id = 'photos';
  return n;
end $$;

revoke all on function admin_delete_photo(uuid), admin_delete_all_photos() from public, anon;
grant execute on function admin_delete_photo(uuid), admin_delete_all_photos() to authenticated;
