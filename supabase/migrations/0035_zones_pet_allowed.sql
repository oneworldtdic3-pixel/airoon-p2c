-- 제1회 쌍계사: 세 구역(쌍계사 경내 / 쌍계초 / 주차장 언덕) 모두 반려견 동반 가능
update public.zones z set pet_allowed = true
  from public.events e where e.id = z.event_id and e.slug = 'ssanggyesa-1';
update public.sites s set pet_allowed = true
  from public.events e where e.id = s.event_id and e.slug = 'ssanggyesa-1';
