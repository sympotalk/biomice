"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthCard,
  Field,
  TextInput,
  AuthDivider,
  GoogleButton,
  KakaoButton,
} from "@/components/auth/AuthCard";
import { loginAction, resetPasswordAction } from "./actions";
import { createClient } from "@/lib/supabase/client";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

export function LoginForm({
  checkEmail,
  next,
}: {
  checkEmail?: boolean;
  next?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("email", email);
      fd.set("password", password);
      if (next) fd.set("next", next);
      const result = await loginAction(null, fd);
      if (result?.error) setError(result.error);
    });
  };

  const handleReset = () => {
    if (!email.trim()) {
      setError("비밀번호를 찾으려면 이메일을 먼저 입력해 주세요.");
      return;
    }
    startTransition(async () => {
      await resetPasswordAction(email.trim());
      setResetSent(true);
    });
  };

  const handleSocial = (provider: "google" | "kakao") => {
    const sb = createClient();
    sb.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${BASE_URL}/auth/callback?next=${next ?? "/"}` },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <AuthCard
        title="biomice 로그인"
        subtitle="가입 없이도 모든 학술대회를 볼 수 있지만, 로그인하면 즐겨찾기와 맞춤 알림을 받을 수 있어요."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {checkEmail && (
            <div
              style={{
                padding: 12,
                background: "var(--bm-success-subtle)",
                color: "var(--bm-success)",
                fontSize: 13,
                borderRadius: 6,
              }}
            >
              인증 메일을 보냈습니다. 메일함을 확인해 주세요.
            </div>
          )}
          {resetSent && (
            <div
              style={{
                padding: 12,
                background: "var(--bm-success-subtle)",
                color: "var(--bm-success)",
                fontSize: 13,
                borderRadius: 6,
              }}
            >
              비밀번호 재설정 메일을 보냈습니다. 메일함을 확인해 주세요.
            </div>
          )}

          <Field label="이메일" required>
            <TextInput
              name="email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="name@example.com"
              autoComplete="email"
              required
            />
          </Field>

          <Field
            label="비밀번호"
            required
            actionLabel="비밀번호 찾기"
            onAction={handleReset}
          >
            <TextInput
              name="password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              required
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "비밀번호 숨기기" : "비밀번호 보기"}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: 10,
                    width: 24,
                    height: 24,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "var(--bm-text-tertiary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  {showPw ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2" />
                      <path d="M2 2l12 12" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2" />
                    </svg>
                  )}
                </button>
              }
            />
          </Field>

          {/* 로그인 유지 */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "var(--bm-text-secondary)",
              cursor: "pointer",
            }}
          >
            <span
              onClick={() => setRemember((v) => !v)}
              style={{
                width: 16,
                height: 16,
                borderRadius: 3,
                border: `1.5px solid ${remember ? "var(--bm-primary)" : "var(--bm-border-strong)"}`,
                background: remember ? "var(--bm-primary)" : "var(--bm-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                cursor: "pointer",
              }}
            >
              {remember && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 5l2 2 4-4" />
                </svg>
              )}
            </span>
            로그인 유지
          </label>

          {error && (
            <div
              style={{
                padding: 10,
                background: "var(--bm-danger-subtle)",
                color: "var(--bm-danger)",
                fontSize: 13,
                borderRadius: 6,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            style={{
              height: 48,
              borderRadius: 6,
              border: "none",
              background: "var(--bm-primary)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              cursor: pending ? "default" : "pointer",
              opacity: pending ? 0.7 : 1,
              fontFamily: "inherit",
              transition: "opacity .15s",
            }}
          >
            {pending ? "로그인 중…" : "로그인"}
          </button>

          <AuthDivider label="또는" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <GoogleButton onClick={() => handleSocial("google")} />
            <KakaoButton onClick={() => handleSocial("kakao")} />
          </div>
        </div>
      </AuthCard>

      <div
        style={{
          marginTop: 20,
          textAlign: "center",
          fontSize: 13,
          color: "var(--bm-text-secondary)",
        }}
      >
        아직 계정이 없으신가요?{" "}
        <Link
          href="/signup"
          style={{ color: "var(--bm-primary)", fontWeight: 600, textDecoration: "none" }}
        >
          회원가입
        </Link>
      </div>
    </form>
  );
}
