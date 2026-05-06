"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string } | null;

function safeNext(raw: FormDataEntryValue | null): string {
  const value = typeof raw === "string" ? raw : "";
  // Only allow same-origin relative redirects.
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return "/";
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"));

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해 주세요." };
  }

  const sb = await createClient();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: translateAuthError(error.message) };
  }

  // 이메일 확인 후 최초 로그인인 경우 profile row가 없을 수 있으므로 보장
  if (data.user) {
    const { data: existing } = await sb
      .from("users_profile")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();
    if (!existing) {
      const userType = (data.user.user_metadata?.user_type as string) ?? "other";
      await sb.from("users_profile").insert({
        id: data.user.id,
        user_type: userType,
        organization: (data.user.user_metadata?.organization as string) ?? null,
        specialty: (data.user.user_metadata?.specialty as string) ?? null,
      });
    }
  }

  redirect(next);
}

export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const userType = String(formData.get("user_type") ?? "other");
  const organization = String(formData.get("organization") ?? "").trim();
  const specialty = String(formData.get("specialty") ?? "").trim();
  const pharmaSubType = userType === "pharma"
    ? String(formData.get("pharma_sub_type") ?? "pharma")
    : null;

  if (!email || !password) {
    return { error: "이메일과 비밀번호는 필수입니다." };
  }
  if (password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 합니다." };
  }

  const sb = await createClient();
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: {
        user_type: userType,
        organization,
        specialty,
      },
    },
  });
  if (error) {
    return { error: translateAuthError(error.message) };
  }

  const next = safeNext(formData.get("next"));

  // Create profile row if we have a user id and session (no email confirmation required).
  if (data.user && data.session) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (sb as any).from("users_profile").upsert(
      {
        id: data.user.id,
        user_type: userType,
        pharma_sub_type: pharmaSubType,
        organization: organization || null,
        specialty: specialty || null,
      },
      { onConflict: "id" },
    );
    redirect(next);
  }

  // Email confirmation is required; route back to login with a hint.
  redirect("/login?check-email=1");
}

export async function logoutAction() {
  const sb = await createClient();
  await sb.auth.signOut();
  redirect("/");
}

export async function resetPasswordAction(email: string): Promise<void> {
  const sb = await createClient();
  const redirectTo =
    (process.env.NEXT_PUBLIC_APP_URL ?? "https://biomice.xyz") +
    "/auth/reset-password";
  await sb.auth.resetPasswordForEmail(email, { redirectTo });
}

function translateAuthError(raw: string): string {
  if (/invalid login credentials/i.test(raw)) return "이메일 또는 비밀번호가 올바르지 않습니다.";
  if (/user already registered/i.test(raw)) return "이미 가입된 이메일입니다.";
  if (/rate limit/i.test(raw)) return "요청이 너무 잦습니다. 잠시 후 다시 시도해 주세요.";
  return raw;
}
