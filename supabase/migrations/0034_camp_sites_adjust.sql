-- 캠핑 사이트 보완
--  · 환불 규정: 숨기지 않고 스마트스토어와 같은 문구를 기본값으로. 관리자 수정 가능
--  · 가격: 스마트스토어 옵션 가격과 대조할 수 없어 기본값은 비워 두고 관리자가 입력 (events.pricing)
--  · 구역 가격(zones.price_won)은 쓰지 않는다 → 비움
alter table public.events add column if not exists refund_note text not null default '';
alter table public.events add column if not exists pricing jsonb not null default '{}'::jsonb; -- {site, adult, kid, infant}: 원 단위, 비어 있으면 화면에 '스마트스토어 참고'
alter table public.zones alter column price_won drop not null;
alter table public.zones alter column price_won drop default;
update public.zones set price_won = null;

update public.events set
  refund_rules = '[{"label":"11/1(일) 24시까지 취소","rate":100,"note":"전액 환불"},{"label":"11/2(월) 0시 이후","rate":0,"note":"취소·환불 불가"}]'::jsonb,
  refund_note = '11/1(일) 24시까지만 취소·환불 가능, 이후 불가. 양도는 직계가족만 가능.'
where slug = 'ssanggyesa-1' and refund_rules = '[]'::jsonb;
