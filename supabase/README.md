# Supabase 연동

## 1. 프로젝트 설정

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. **Settings → API**에서 URL, anon key, service_role key 확인
3. 프로젝트 루트에 `.env.local` 생성 후 아래 값 설정:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> `SUPABASE_SERVICE_ROLE_KEY`는 프리미엄 코드 적용 시 프로필 업데이트에만 사용됩니다. 클라이언트에 노출하지 마세요.

## 2. DB 마이그레이션

Supabase 대시보드 **SQL Editor**에서 `supabase/migrations/001_profiles.sql` 내용을 붙여넣고 실행하세요.

- `profiles` 테이블 생성 (이름, 프리미엄 여부)
- RLS 정책: 본인 프로필만 읽기/쓰기
- 가입 시 프로필 자동 생성 트리거 (선택)

## 3. 동작 요약

- **회원가입/로그인**: Supabase Auth (이메일·비밀번호)
- **세션**: Supabase가 발급한 JWT를 `Authorization: Bearer`로 API에 전달
- **프로필**: `profiles` 테이블에 `name`, `is_lifetime_premium` 저장
- **프리미엄 코드**: 기존 코드 DB 유지, 적용 시 Supabase `profiles.is_lifetime_premium`만 서버에서 갱신
