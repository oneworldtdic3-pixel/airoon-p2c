-- 비로그인(anon) 은 RPC 호출 불가. 트리거 함수는 아무도 직접 호출 못 함.
revoke execute on function
  book_session(uuid), cancel_booking(uuid), book_shower(uuid), cancel_shower(uuid),
  upsert_parking(text, text, date[]), toggle_like(uuid), enter_lucky_draw(),
  admin_set_photo_hidden(uuid, boolean), admin_publish_notification(text, text, text), admin_stats(), is_admin()
from anon, public;
revoke execute on function handle_new_user() from anon, authenticated, public;
-- is_admin 은 RLS 정책에서 쓰므로 anon 도 실행 가능해야 한다(결과는 항상 false)
grant execute on function is_admin() to anon;
