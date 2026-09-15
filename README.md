# 할 일 캘린더 (helpmetodo)

카테고리별로 할 일을 등록하고 캘린더에서 날짜별로 관리하는 개인용 웹 앱입니다.
로그인 없이 혼자 사용하는 것을 전제로 만들어졌습니다.

## 기능

- 왼쪽 캘린더에서 날짜 클릭 → 오른쪽에 해당 날짜의 할 일 표시
- 각 날짜 칸에 남은 할 일 개수 표시, 모두 완료하면 체크 아이콘으로 전환
- 카테고리를 자유롭게 추가/이름변경/삭제 (색상 지정 가능)
- 할 일 추가 시 카테고리 지정, 체크 시 완료 처리

## 시작하기

### 1. Supabase 프로젝트 준비

1. [supabase.com](https://supabase.com)에서 새 프로젝트를 만듭니다.
2. 프로젝트의 **SQL Editor**에서 [`supabase/schema.sql`](supabase/schema.sql) 내용을 실행합니다.
   (`categories`, `todos` 테이블이 생성됩니다. 카테고리는 미리 채워진 값 없이, 앱 안에서 직접 추가/수정/삭제합니다.)
3. Supabase 대시보드의 **Project Settings → API**에서 `Project URL`과 `anon public` 키를 확인합니다.

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

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

## 참고

- 로그인 기능이 없으므로 `anon` 키로 테이블에 자유롭게 접근할 수 있도록 RLS 정책을 열어두었습니다.
  개인용으로만 사용하고, URL/키를 외부에 공개하지 마세요.
- 여러 사람이 함께 쓰거나 공개 배포할 계획이라면 인증(RLS 정책 강화)을 추가로 구현해야 합니다.
