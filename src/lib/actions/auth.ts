"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";

export type AuthFormState = { error?: string; message?: string } | undefined;

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해주세요." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "이메일 또는 비밀번호가 올바르지 않아요." };
  }

  redirect("/");
}

export async function signup(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (nickname.length < 2) {
    return { error: "닉네임은 2자 이상 입력해주세요." };
  }
  if (!email) {
    return { error: "이메일을 입력해주세요." };
  }
  if (password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 해요." };
  }
  if (password !== passwordConfirm) {
    return { error: "비밀번호가 일치하지 않아요." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nickname } },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("already been registered")) {
      return { error: "이미 가입된 이메일이에요." };
    }
    if (msg.includes("database error saving new user")) {
      return { error: "이미 사용 중인 닉네임이에요. 다른 닉네임을 입력해주세요." };
    }
    return { error: error.message };
  }

  if (data.session) {
    redirect("/");
  }

  return {
    message: "가입이 거의 끝났어요! 이메일함의 인증 링크를 확인한 뒤 로그인해주세요.",
  };
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
