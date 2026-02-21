-- 프로필 테이블: auth.users와 1:1, 이름·프리미엄 상태 저장
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  is_lifetime_premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS 활성화
alter table public.profiles enable row level security;

-- 본인 프로필만 조회
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- 회원가입 시 본인 프로필만 삽입 (id = auth.uid())
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 본인 이름만 수정 가능 (is_lifetime_premium는 서버에서만 서비스 롤로 수정)
create policy "Users can update own name"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- (선택) auth.users 가입 시 프로필 자동 생성
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
