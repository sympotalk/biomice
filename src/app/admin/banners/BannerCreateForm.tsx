"use client";

import { useActionState, useRef } from "react";
import { createBanner } from "./actions";

const SLOTS = [
  { value: "list_sidebar", label: "목록 사이드바 (280×280)" },
  { value: "detail_top", label: "상세 페이지 상단 (728×90)" },
  { value: "home_hero", label: "홈 히어로 (1200×200)" },
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid var(--bm-border)",
  fontSize: 13,
  background: "var(--bm-bg)",
  color: "var(--bm-text-primary)",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--bm-text-secondary)",
  marginBottom: 6,
};

export function BannerCreateForm() {
  const [state, action, pending] = useActionState(createBanner, { error: null });
  const formRef = useRef<HTMLFormElement>(null);

  // Reset form after success
  if (state?.error === null && formRef.current?.dataset.submitted === "true") {
    formRef.current.reset();
    delete formRef.current.dataset.submitted;
  }

  return (
    <form
      ref={formRef}
      action={(fd) => {
        if (formRef.current) formRef.current.dataset.submitted = "true";
        action(fd);
      }}
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" }}
    >
      <div>
        <label style={labelStyle}>슬롯 *</label>
        <select name="slot_name" required style={inputStyle}>
          {SLOTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>광고주명</label>
        <input name="advertiser_name" type="text" style={inputStyle} placeholder="예: ABC 제약" />
      </div>

      <div>
        <label style={labelStyle}>배너 제목</label>
        <input name="title" type="text" style={inputStyle} placeholder="배너 제목 (선택)" />
      </div>

      <div>
        <label style={labelStyle}>우선순위 (높을수록 먼저)</label>
        <input name="priority" type="number" defaultValue={0} min={0} style={inputStyle} />
      </div>

      <div style={{ gridColumn: "1 / -1" }}>
        <label style={labelStyle}>링크 URL *</label>
        <input
          name="link_url"
          type="url"
          required
          style={inputStyle}
          placeholder="https://example.com/campaign"
        />
      </div>

      <div style={{ gridColumn: "1 / -1" }}>
        <label style={labelStyle}>이미지 URL *</label>
        <input
          name="image_url"
          type="url"
          required
          style={inputStyle}
          placeholder="https://cdn.example.com/banner.png"
        />
      </div>

      {state?.error && (
        <div
          style={{
            gridColumn: "1 / -1",
            padding: "10px 14px",
            borderRadius: 6,
            background: "var(--bm-danger-subtle, #fdecea)",
            color: "var(--bm-danger, #d92b3a)",
            fontSize: 13,
          }}
        >
          {state.error}
        </div>
      )}

      <div style={{ gridColumn: "1 / -1" }}>
        <button
          type="submit"
          disabled={pending}
          style={{
            padding: "10px 24px",
            borderRadius: 6,
            border: "none",
            background: "var(--bm-primary)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            cursor: pending ? "default" : "pointer",
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? "저장 중…" : "배너 등록"}
        </button>
      </div>
    </form>
  );
}
