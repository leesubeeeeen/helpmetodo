"use client";

import { login } from "@/lib/actions/auth";
import Link from "next/link";
import { useActionState } from "react";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-slate-800">로그인</h1>
        <p className="mb-6 text-sm text-slate-400">할 일 캘린더에 다시 오신 걸 환영해요.</p>

        <form action={formAction} className="space-y-3">
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-500">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-medium text-slate-500">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              placeholder="********"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-500">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-indigo-500 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:opacity-60"
          >
            {pending ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-400">
          아직 계정이 없나요?{" "}
          <Link href="/signup" className="font-medium text-indigo-500 hover:text-indigo-600">
            회원가입
          </Link>
        </p>
      </div>
    </main>
  );
}
