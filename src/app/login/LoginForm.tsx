"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AuthCard, AuthField } from "@/components/auth/AuthCard";
import { loginAction, type AuthState } from "./actions";

export function LoginForm({ checkEmail }: { checkEmail?: boolean }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    loginAction,
    null,
  );

  return (
    <form action={formAction}>
      <AuthCard
        title="biomice 로그인"
        caption="의학 학술대회 정보를 한 곳에서"
        footer={
          <>
            아직 회원이 아니신가요?{" "}
            <Link
              href="/signup"
              style={{
                color: "var(--bm-primary)",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              회원가입
            </Link>
          </>
        }
      >
        {checkEmail && (
          <div
            role="status"
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

        <AuthField
          id="email"
          label="이메일"
          type="email"
          required
          autoComplete="email"
          placeholder="name@example.com"
        />
        <AuthField
          id="password"
          label="비밀번호"
          type="password"
          required
          autoComplete="current-password"
        />

        {state?.error && (
          <div
            role="alert"
            style={{
              padding: 10,
              background: "var(--bm-danger-subtle)",
              color: "var(--bm-danger)",
              fontSize: 13,
              borderRadius: 6,
            }}
          >
            {state.error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={pending}
        >
          {pending ? "로그인 중..." : "로그인"}
        </Button>
      </AuthCard>
    </form>
  );
}
