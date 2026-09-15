export default function SetupNotice() {
  return (
    <div className="mx-auto mt-16 max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
      <h2 className="mb-2 text-base font-semibold">Supabase 설정이 필요해요</h2>
      <p className="mb-3">
        아직 Supabase 프로젝트 정보가 입력되지 않았어요. 프로젝트 루트의{" "}
        <code className="rounded bg-amber-100 px-1 py-0.5">.env.local</code> 파일에
        아래 값을 채워주세요.
      </p>
      <pre className="mb-3 overflow-x-auto rounded-lg bg-amber-100 p-3 text-xs">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key`}
      </pre>
      <p>
        그리고 <code className="rounded bg-amber-100 px-1 py-0.5">supabase/schema.sql</code>{" "}
        파일 내용을 Supabase SQL Editor에서 실행한 뒤, 개발 서버를 재시작하면 돼요.
      </p>
    </div>
  );
}
