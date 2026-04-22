"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { AuthField } from "@/components/auth/AuthCard";
import { submitPharmaInquiry, type InquiryState } from "./actions";

const INTEREST_OPTIONS = [
  "홈 상단 배너",
  "학술대회 상세 하단 배너",
  "이메일 스폰서",
  "카테고리 스폰서",
  "기타 (문의 내용에 작성)",
];

export function PharmaInquiryForm() {
  const [state, formAction, pending] = useActionState<InquiryState, FormData>(
    submitPharmaInquiry,
    null,
  );

  if (state?.ok) {
    return (
      <div
        style={{
          padding: 20,
          background: "var(--bm-success-subtle)",
          color: "var(--bm-success)",
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        {state.message}
      </div>
    );
  }

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        <AuthField
          id="company"
          label="회사명 *"
          type="text"
          required
          placeholder="(주)예시제약"
          autoComplete="organization"
        />
        <AuthField
          id="name"
          label="담당자명 *"
          type="text"
          required
          placeholder="홍길동"
          autoComplete="name"
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        <AuthField
          id="email"
          label="이메일 *"
          type="email"
          required
          placeholder="contact@example.com"
          autoComplete="email"
        />
        <AuthField
          id="phone"
          label="연락처"
          type="tel"
          placeholder="010-0000-0000"
          autoComplete="tel"
        />
      </div>

      {/* 관심 상품 */}
      <div>
        <label
          htmlFor="interest"
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--bm-text-secondary)",
            marginBottom: 6,
          }}
        >
          관심 상품
        </label>
        <select
          id="interest"
          name="interest"
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid var(--bm-border)",
            borderRadius: 6,
            fontSize: 14,
            color: "var(--bm-text-primary)",
            background: "var(--bm-bg)",
            outline: "none",
          }}
        >
          <option value="">선택해 주세요</option>
          {INTEREST_OPTIONS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      {/* 문의 내용 */}
      <div>
        <label
          htmlFor="message"
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--bm-text-secondary)",
            marginBottom: 6,
          }}
        >
          문의 내용
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="광고 집행 목적, 예산, 기간 등 자세히 적어주시면 빠른 상담이 가능합니다."
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid var(--bm-border)",
            borderRadius: 6,
            fontSize: 14,
            color: "var(--bm-text-primary)",
            background: "var(--bm-bg)",
            resize: "vertical",
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
      </div>

      {state?.ok === false && (
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
          {state.message}
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" disabled={pending}>
        {pending ? "전송 중..." : "문의 보내기"}
      </Button>
    </form>
  );
}
