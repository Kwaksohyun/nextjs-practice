# Dev Blog

Next.js 16 + Supabase 개인 개발 블로그입니다.

## 기능

- 메인 글 목록 + 카테고리 필터
- 마크다운 글 작성 / 수정 / 삭제 (로그인 필요)
- 카테고리 추가·삭제·**드래그 순서 변경**
- 글별 댓글, 좋아요, **URL 복사**
- CSS Modules (`styles/modules/`) — Tailwind 미사용

## 시작하기

### 1. Supabase SQL 실행

[supabase/schema.sql](./supabase/schema.sql) 전체를 **SQL Editor**에 붙여넣고 Run.

### 2. Supabase Auth

- **회원가입:** `/auth/signup` (또는 Supabase Dashboard에서 사용자 추가)
- 이메일 인증을 켜 두었다면, 메일 확인 링크가 `/auth/callback`으로 돌아오도록 Redirect URLs에 포함되어 있어야 합니다.
- 인증 없이 바로 쓰려면: Dashboard → **Authentication → Providers → Email** → **Confirm email** 끄기

### 3. 환경 변수

`.env.example` → `.env.local` 복사 후 값 입력.

Vercel에도 동일 변수 + `NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app` 등록.

### 4. Auth URL (로그인 리다이렉트)

Supabase → **Authentication → URL Configuration**

- Site URL: 배포 URL
- Redirect URLs: `http://localhost:3000/**`, `https://your-app.vercel.app/**`

### 5. 로컬 실행

```bash
npm install
npm run dev
```

- `/` — 블로그 홈
- `/write` — 글 작성 + 내 글 목록 (로그인)
- `/write/edit/[id]` — 글 수정
- `/admin/categories` — 카테고리 관리
- `/auth/login` — 로그인
- `/auth/signup` — 회원가입
- `/posts/[slug]` — 글 상세 (작성자는 비공개 글·수정 버튼 가능)

## 폴더 구조

```
app/                 # 라우트
components/blog/     # 블로그 UI
components/write/    # 글 작성 폼
components/admin/    # 카테고리 드래그 관리
components/auth/     # 로그인
lib/supabase/        # Supabase 클라이언트
lib/actions/         # Server Actions
lib/data/            # 데이터 조회
styles/modules/      # CSS Modules
supabase/schema.sql  # DB 스키마 + RLS
```
