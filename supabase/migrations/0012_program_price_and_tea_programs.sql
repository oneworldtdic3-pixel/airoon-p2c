-- 프로그램 참가비 컬럼 + 차 체험 프로그램 2종 (사무국 전달 자료 2026-10-12). 운영 DB에는 적용됨.
alter table programs add column if not exists price int not null default 0;
comment on column programs.price is '참가비(원). 0 이면 무료. 결제는 현장에서, 앱은 안내만';
-- 티소믈리에 차 체험: 1만원 / 90분 / 11.06(금) 14:00, 11.07(토) 14:00 / 각 22명
-- 야생차 박물관 다례인성체험: 4천원 / 40분 / 11.07(토) 15:00 / 80명
