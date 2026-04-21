"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AuthCard, AuthField } from "@/components/auth/AuthCard";
import { signupAction, type AuthState } from "../login/actions";

const USER_TYPES = [
  { value: "doctor", label: "의사" },
  { value: "pharma", label: "제약사" },
  { value: "other", label: "기타" },
];

export function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signupAction,
    null,
  );

  return (
    <form action={formAction}>
      <AuthCard
        title="biomice 회원가입"
        caption="가입 후 학술대회 즐겨찾기와 알림을 받을 수 있습니다"
        footer={
          <>
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              style={{
                color: "var(--bm-primary)",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              로그인
            </Link>
          </>
        }
      >
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
          label="비밀번호 (8자 이상)"
          type="password"
          required
          autoComplete="new-password"
        />

        <fieldset
          style={{
            border: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <legend
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--bm-text-primary)",
            }}
          >
            사용자 유형
          </legend>
          <div style={{ display: "flex", gap: 8 }}>
            {USER_TYPES.map((t, i) => (
              <label
                key={t.value}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 38,
                  border: "1px solid var(--bm-border)",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 13,
                  color: "var(--bm-text-secondary)",
                  background: "var(--bm-bg)",
                }}
              >
                <input
                  type="radio"
                  name="user_type"
                  value={t.value}
                  defaultChecked={i === 0}
                  style={{ marginRight: 6 }}
                />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>

        <AuthField
          id="organization"
          label="소속 (병원명 · 회사명)"
          placeholder="예: OO병원 내과"
        />
        <AuthField
          id="specialty"
          label="진료과 / 담당 분야 (선택)"
          placeholder="예: 내과, 심혈관"
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
          {pending ? "가입 중..." : "가입하기"}
        </Button>

        <p
          style={{
            fontSize: 11,
            color: "var(--bm-text-tertiary)",
            margin: 0,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          가입 시 biomice의{" "}
          <Link
            href="/terms"
            style={{ color: "var(--bm-text-secondary)", textDecoration: "underline" }}
          >
            이용약관
          </Link>
          과{" "}
          <Link
            href="/privacy"
            style={{ color: "var(--bm-text-secondary)", textDecoration: "underline" }}
          >
            개인정보 처리방침
          </Link>
          에 동의하게 됩니다.
        </p>
      </AuthCard>
    </form>
  );
}
