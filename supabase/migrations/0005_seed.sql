-- 시드: 프로그램·회차·샤워 슬롯·알림·배너·개발용 사진
do $$
declare
  pid uuid;
  d date;
  t text;
  plan jsonb := '{
    "불일폭포 트래킹": {"2026-11-06":["15:30"],"2026-11-07":["09:00","14:00"],"2026-11-08":["08:30"]},
    "쌍계사 역사 탐방": {"2026-11-06":["16:00"],"2026-11-07":["10:30","15:00"]},
    "108선다 차 명상": {"2026-11-06":["17:00"],"2026-11-07":["16:30"]},
    "스님과의 대화": {"2026-11-06":["19:00"],"2026-11-07":["13:00","19:00"]},
    "싱잉볼 체험": {"2026-11-06":["15:00"],"2026-11-07":["11:00","14:30","17:30"],"2026-11-08":["09:30"]},
    "요가·선명상": {"2026-11-07":["07:00"],"2026-11-08":["07:00"]},
    "사찰음식/예불 체험": {"2026-11-07":["05:30","12:00"],"2026-11-08":["05:30"]},
    "단주 만들기": {"2026-11-06":["16:30"],"2026-11-07":["10:00","15:30"]},
    "사경 체험": {"2026-11-06":["18:00"],"2026-11-07":["11:30","16:00"],"2026-11-08":["09:00"]}
  }';
  prog record;
begin
  insert into programs (title, description, location, duration, pet_allowed, capacity, sort) values
    ('불일폭포 트래킹', '쌍계사 뒤편 숲길을 따라 불일폭포까지 걷는 가벼운 트래킹. 반려견과 함께 걸을 수 있습니다.', '쌍계사 ~ 불일폭포', '90분', true, 30, 1),
    ('쌍계사 역사 탐방', '천 년 고찰 쌍계사의 이야기를 해설사와 천천히 걸으며 듣습니다.', '쌍계사 경내', '60분', false, 25, 2),
    ('108선다 차 명상', '하동 녹차밭 위에서 108잔의 차를 나누는 고요한 시간. 백 명만 앉습니다.', '차밭 능선', '80분', false, 100, 3),
    ('스님과의 대화', '고민도 질문도 편하게. 스님과 둘러앉아 나누는 한 시간.', '대웅전 앞마당', '60분', false, 40, 4),
    ('싱잉볼 체험', '맑은 울림에 몸을 맡기는 사운드 명상. 눕는 자리를 준비합니다.', '체험부스존', '45분', false, 20, 5),
    ('요가·선명상', '아침 공기 속 요가와 선명상. 반려견도 옆에 앉을 수 있습니다.', '캠핑존 잔디마당', '60분', true, 30, 6),
    ('사찰음식/예불 체험', '사찰음식 공양과 새벽 예불을 한 번에 경험합니다.', '공양간 · 대웅전', '90분', false, 40, 7),
    ('단주 만들기', '나만의 단주(염주 팔찌)를 직접 꿰어 봅니다.', '체험부스존', '50분', false, 24, 8),
    ('사경 체험', '마음을 가라앉히며 한 글자씩 옮겨 쓰는 사경.', '체험부스존', '60분', false, 24, 9);

  for prog in select id, title, capacity from programs loop
    for d, t in
      select k::date, v from jsonb_each(plan -> prog.title) e(k, vv), jsonb_array_elements_text(vv) v
    loop
      insert into program_sessions (program_id, starts_at, capacity)
      values (prog.id, (d::text || ' ' || t || ':00')::timestamp at time zone 'Asia/Seoul', prog.capacity);
    end loop;
  end loop;

  -- 샤워 슬롯: 4개 동, 30분 단위
  for prog in select * from (values ('샤워동 A','F'),('샤워동 B','M'),('샤워동 C','F'),('샤워동 D','M')) b(building, gender) loop
    insert into shower_slots (building, gender, starts_at)
    select prog.building, prog.gender, s
    from (
      select generate_series(timestamp '2026-11-06 15:00', timestamp '2026-11-06 21:30', interval '30 min') s
      union all select generate_series(timestamp '2026-11-07 06:00', timestamp '2026-11-07 21:30', interval '30 min')
      union all select generate_series(timestamp '2026-11-08 06:00', timestamp '2026-11-08 09:30', interval '30 min')
    ) x(s_local), lateral (select s_local at time zone 'Asia/Seoul' s) y;
  end loop;
end $$;

insert into notifications (type, title, body, created_at) values
  ('booth', '싱잉볼 체험, 다섯 자리 남음', '오늘 14:30 회차, 다섯 자리 남았습니다.', now() - interval '8 min'),
  ('luckydraw', '럭키드로우 오늘 18시 마감', '오늘 18:00에 마감합니다. 더보기 탭에서 응모할 수 있습니다.', now() - interval '55 min'),
  ('reminder', '내일 아침 트래킹 예약', '내일 09:00 불일폭포 트래킹. 일주문 앞에 10분 전까지 모입니다.', now() - interval '3 hour'),
  ('market', '산사장터 오픈', '오늘 13:00부터 산사장터가 열립니다. 차, 간식, 소품.', now() - interval '10 hour'),
  ('notice', '고요의 시간 안내', '매일 21시부터 고요의 시간입니다. 대화는 낮은 목소리로.', now() - interval '25 hour');

insert into banners (sponsor, title, sub, image_path, link, bg, sort) values
  ('하동녹차협동조합', '첫물 녹차 시음', '산사장터 3번 부스 · 무료', 'seed:banner:0', '/more', '#1F6B45', 1),
  ('산책 아웃도어', '캠핑 체어 현장 20% 할인', '팔찌 제시 시 · 11.6–11.8', 'seed:banner:1', '/more', '#1E3F5C', 2),
  ('달빛 베이커리', '새벽 예불 후 따뜻한 빵', '공양간 앞 · 05:30–07:00', 'seed:banner:2', '/more', '#5C3A1E', 3);

-- 개발용 사진: 가상 사용자 12명 + 사진 24장 (storage_path 'seed:' 는 클라이언트가 일러스트로 렌더)
do $$
declare
  nicks text[] := array['고요한토끼','달빛산책','차한잔','연등지기','숲속곰','새벽종소리','구름위에','돌담길','솔바람','여우비','풍경소리','온기'];
  spots text[] := array['일주문','대웅전 계단','차밭 능선','불일폭포'];
  likes int[] := array[48,31,27,22,19,15,12,9,8,6,5,4];
  uid uuid;
  i int;
begin
  for i in 1..24 loop
    uid := ('00000000-0000-4000-8000-' || lpad(((i - 1) % 12 + 1)::text, 12, '0'))::uuid;
    insert into profiles (id, nickname) values (uid, nicks[(i - 1) % 12 + 1]) on conflict (id) do nothing;
    insert into photos (user_id, spot_tag, storage_path, likes_count, created_at)
    values (uid, spots[(i - 1) % 4 + 1], 'seed:' || spots[(i - 1) % 4 + 1] || ':' || i, likes[(i - 1) % 12 + 1] + case when i <= 12 then 10 else 0 end, now() - (i * 17 + 4) * interval '1 min');
  end loop;
end $$;
