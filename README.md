# 할 일 캘린더 (helpmetodo)

카테고리별로 할 일을 등록하고 캘린더에서 날짜별로 관리하는 웹 앱입니다.
회원가입/로그인을 지원하며, 친구를 추가해 서로의 할 일을 구경할 수 있습니다.

## 기능

- 왼쪽 캘린더에서 날짜 클릭 → 오른쪽에 해당 날짜의 할 일 표시
- 각 날짜 칸에 남은 할 일 개수 표시, 모두 완료하면 체크 아이콘으로 전환
- 카테고리를 자유롭게 추가/이름변경/삭제 (색상 지정 가능)
- 할 일 추가 시 카테고리 지정, 체크 시 완료 처리
- 이메일/비밀번호로 회원가입 및 로그인 (닉네임과 공유용 회원 코드 자동 발급)
- 닉네임 또는 회원 코드로 다른 사용자를 검색해 친구 요청 전송
- 받은 요청 수락 시 서로 친구가 되고, 친구의 캘린더를 읽기 전용으로 볼 수 있음

## 시작하기

### 1. Supabase 프로젝트 준비

1. [supabase.com](https://supabase.com)에서 새 프로젝트를 만듭니다.
2. 프로젝트의 **SQL Editor**에서 [`supabase/schema.sql`](supabase/schema.sql) 내용을 실행합니다.
   (`profiles`, `friendships`, `categories`, `todos` 테이블과 회원가입 시 프로필을 자동
   생성하는 트리거, 소유자/친구 권한을 구분하는 RLS 정책이 함께 만들어집니다.)
   이어서 [`supabase/routines.sql`](supabase/routines.sql)과 [`supabase/profile.sql`](supabase/profile.sql)도
   실행해 루틴 테이블과 프로필 사진/소개글(`avatars` 스토리지 버킷 포함)을 추가합니다.
   (이미 `schema.sql`을 실행해 사용 중인 DB라면 이 두 파일만 실행하면 됩니다.
   `schema.sql`을 다시 실행하면 기존 할 일/카테고리가 지워지니 주의하세요.)
3. Supabase 대시보드의 **Project Settings → API**에서 `Project URL`과 `anon public` 키를 확인합니다.
4. (선택) **Authentication → Providers → Email**에서 "Confirm email"을 끄면 가입 즉시
   로그인되고, 켜두면 이메일 인증 링크를 확인한 뒤 로그인할 수 있습니다.

### 2. 환경 변수 설정

`.env.local.example`을 복사해 `.env.local`을 만들고 값을 채워주세요.

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 개발 서버 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) (배포본은 https://helpmetodo.vercel.app/ )
에서 확인할 수 있습니다. 로그인하지 않은 상태로 접속하면 `/login`으로 이동합니다.
`/signup`에서 계정을 만들면 자동으로 프로필(닉네임 + 회원 코드)이 생성됩니다.

## 참고

- 할 일/카테고리는 각 사용자 소유이며(`user_id`), 본인은 자유롭게 수정/삭제할 수 있고
  친구는 읽기만 가능하도록 RLS 정책이 구성되어 있습니다.
- 친구 관계는 `friendships` 테이블에서 요청(`pending`)과 수락(`accepted`) 상태로 관리되며,
  요청을 보낸 쪽과 받은 쪽 모두 언제든 관계를 삭제(취소/거절/친구 끊기)할 수 있습니다.
