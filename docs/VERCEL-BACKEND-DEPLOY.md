# Vercel에서 코드 생성/레디임 쓰기 (백엔드 배포)

프론트는 Vercel, API는 별도 서버에 두고 연동하는 방법입니다.

---

## 1. 백엔드 배포 (Railway 추천)

1. **Railway 가입**  
   https://railway.app → GitHub 로그인

2. **New Project → Deploy from GitHub repo**  
   이 저장소 선택 후, **Root Directory를 `backend`로 지정**  
   (백엔드만 배포하려면 반드시 `backend`로 설정)

3. **빌드/시작 설정**
   - Build Command: `npm install`
   - Start Command: `npm start`  
   (또는 Railway가 자동으로 `npm start` 인식)

4. **환경 변수 설정** (Railway 프로젝트 → Variables)
   - `CORS_ORIGINS` = **Vercel 배포 주소**  
     예: `https://project1.vercel.app`  
     (여러 개면 쉼표로: `https://a.vercel.app,https://b.vercel.app`)
   - (선택) `JWT_SECRET` = 랜덤 문자열
   - (선택) `CODE_HASH_SECRET` = 랜덤 문자열

5. **도메인 발급**  
   Railway 프로젝트 → Settings → Networking → **Generate Domain**  
   → 예: `https://project1-production-xxxx.up.railway.app`  
   이 주소를 **API 주소**로 사용합니다.

---

## 2. Vercel 환경 변수 설정

1. Vercel 대시보드 → 해당 프로젝트 → **Settings → Environment Variables**

2. 추가:
   - **Name**: `NEXT_PUBLIC_API_BASE`
   - **Value**: Railway에서 발급한 API 주소  
     예: `https://project1-production-xxxx.up.railway.app`
   - Environment: Production (및 Preview 원하면 선택)

3. **재배포**  
   Deployments → 맨 위 배포 옆 ⋮ → **Redeploy**  
   (환경 변수 반영을 위해 한 번 다시 배포해야 합니다.)

---

## 3. 확인

- **코드 생성**:  
  `https://<내-vercel-주소>/admin/premium-codes`  
  → 페이지 들어가면 코드 1개 생성 후 크게 표시 + 복사 가능해야 함.

- **로그인/회원가입/코드 레디임**  
  메인 페이지에서 로그인 → 프리미엄 코드 입력 → 적용 시,  
  위에서 설정한 API 주소로 요청이 가므로 정상 동작해야 합니다.

---

## 대안: Render 사용 시

1. https://render.com → New → **Web Service**
2. 이 GitHub 저장소 연결, **Root Directory**: `backend`
3. Build: `npm install`, Start: `npm start`
4. 환경 변수에 `CORS_ORIGINS` = Vercel URL 설정
5. 생성된 URL(예: `https://premium-api.onrender.com`)을  
   Vercel의 `NEXT_PUBLIC_API_BASE`에 넣고 재배포.

---

## 요약

| 구분 | 값 |
|------|-----|
| 백엔드 배포 | Railway(또는 Render)에서 **Root Directory = `backend`** 로 배포 |
| Railway/Render 환경 변수 | `CORS_ORIGINS` = Vercel 사이트 URL |
| Vercel 환경 변수 | `NEXT_PUBLIC_API_BASE` = 백엔드 URL |
| 랜덤 코드 받는 링크 | `https://<Vercel-도메인>/admin/premium-codes` |

**참고**: Railway 무료 플랜은 일정 시간 미사용 시 슬립됩니다. 첫 요청이 느릴 수 있습니다.
