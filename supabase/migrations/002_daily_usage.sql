-- 무료 사용 일일 제한(5회)을 계정 단위로 저장하기 위한 컬럼 추가
alter table public.profiles
  add column if not exists free_usage_count integer not null default 0,
  add column if not exists free_usage_date date;

