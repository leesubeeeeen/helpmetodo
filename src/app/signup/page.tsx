"use client";

import { signup } from "@/lib/actions/auth";
import Link from "next/link";
import { useActionState } from "react";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(signup, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-1 text-xl font-bold text-slate-800">회원가입</h1>
        <p className="mb-6 text-sm text-slate-400">
          닉네임은 친구들에게 보여지는 이름이에요.
        </p>

        {state?.message ? (
          <div className="space-y-4">
            <p className="rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-700">
              {state.message}
            </p>
            <Link
              href="/login"
              className="block w-full rounded-lg bg-indigo-500 px-3.5 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-indigo-600"
            >
              로그인하러 가기
            </Link>
          </div>
        ) : (
          <form action={formAction} className="space-y-3">
            <div>
              <label htmlFor="nickname" className="mb-1 block text-xs font-medium text-slate-500">
                닉네임
              </label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                required
                minLength={2}
                maxLength={20}
                autoComplete="nickname"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="다른 사람에게 보일 이름"
              />
            </div>

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
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="8자 이상"
              />
            </div>

            <div>
              <label
                htmlFor="passwordConfirm"
                className="mb-1 block text-xs font-medium text-slate-500"
              >
                비밀번호 확인
              </label>
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="비밀번호를 다시 입력"
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
              {pending ? "가입 중..." : "회원가입"}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-slate-400">
          이미 계정이 있나요?{" "}
          <Link href="/login" className="font-medium text-indigo-500 hover:text-indigo-600">
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}
