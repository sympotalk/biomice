"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/actions/profile";
import type { UsersProfile } from "@/lib/database.types";

const USER_TYPE_LABEL: Record<string, string> = {
  doctor: "의사",
  pharma: "제약사·의료기기",
  other: "기타",
};

const PHARMA_SUB_TYPE_LABEL: Record<string, string> = {
  pharma: "제약사",
  device: "의료기기",
};

type Props = {
  profile: UsersProfile;
  email: string;
};

export function ProfileForm({ profile, email }: Props) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [organization, setOrganization] = useState(profile.organization ?? "");
  const [specialty, setSpecialty] = useState(profile.specialty ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [pharmaSubType, setPharmaSubType] = useState(profile.pharma_sub_type ?? "pharma");
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const isPharma = profile.user_type === "pharma";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    startTransition(async () => {
      const result = await updateProfile({
        display_name: displayName,
        organization,
        specialty,
        phone,
        pharma_sub_type: isPharma ? pharmaSubType : undefined,
      });
      if (result.error) {
        setErrorMsg(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 읽기 전용: 이메일 + 회원유형 */}
      <div
        style={{
          background: "var(--bm-bg-muted)",
          border: "1px solid var(--bm-border)",
          borderRadius: 10,
          padding: "14px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <ReadonlyField label="이메일" value={email} />
        <ReadonlyField
          label="회원 유형"
          value={
            profile.user_type
              ? USER_TYPE_LABEL[profile.user_type] ?? profile.user_type
              : "미설정"
          }
          badge
        />
        {isPharma && profile.pharma_sub_type && (
          <ReadonlyField
            label="업종 구분"
            value={PHARMA_SUB_TYPE_LABEL[profile.pharma_sub_type] ?? profile.pharma_sub_type}
          />
        )}
      </div>

      {/* 편집 가능 필드 */}
      <FieldGroup label="표시 이름" hint="상대방에게 표시되는 이름 (이름 또는 닉네임)">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="홍길동"
          maxLength={50}
          style={inputStyle}
        />
      </FieldGroup>

      <FieldGroup label="소속" hint={isPharma ? "제약사 또는 의료기기 회사명" : "병원·기관명"}>
        <input
          type="text"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          placeholder={isPharma ? "예: ○○제약" : "예: 서울아산병원"}
          maxLength={100}
          style={inputStyle}
        />
      </FieldGroup>

      {isPharma ? (
        <>
          <FieldGroup label="담당 분야" hint="주요 담당 제품군 또는 therapeutic area">
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="예: 심혈관, 항암제"
              maxLength={100}
              style={inputStyle}
            />
          </FieldGroup>
          <FieldGroup label="연락처" hint="내부 공유 전화번호 (선택)">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              maxLength={20}
              style={inputStyle}
            />
          </FieldGroup>
          <FieldGroup label="업종 구분" hint="제약사 또는 의료기기 업종을 선택하세요">
            <div style={{ display: "flex", gap: 10 }}>
              {(["pharma", "device"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setPharmaSubType(v)}
                  style={{
                    flex: 1,
                    padding: "9px 0",
                    borderRadius: 8,
                    border: pharmaSubType === v
                      ? "2px solid var(--bm-primary)"
                      : "1px solid var(--bm-border)",
                    background: pharmaSubType === v
                      ? "var(--bm-primary-subtle)"
                      : "var(--bm-surface)",
                    color: pharmaSubType === v
                      ? "var(--bm-primary)"
                      : "var(--bm-text-secondary)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all .1s",
                    fontFamily: "inherit",
                  }}
                >
                  {PHARMA_SUB_TYPE_LABEL[v]}
                </button>
              ))}
            </div>
          </FieldGroup>
        </>
      ) : (
        <FieldGroup label="전문과목" hint="주 진료과 또는 전문 분야">
          <input
            type="text"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="예: 내과, 심장내과"
            maxLength={100}
            style={inputStyle}
          />
        </FieldGroup>
      )}

      {errorMsg && (
        <div style={{ color: "#E05151", fontSize: 13, padding: "8px 12px", background: "#FEF2F2", borderRadius: 8 }}>
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        style={{
          padding: "11px 0",
          background: saved ? "var(--bm-success, #2D9D5A)" : "var(--bm-primary)",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 700,
          cursor: isPending ? "not-allowed" : "pointer",
          opacity: isPending ? 0.7 : 1,
          transition: "background .2s",
          fontFamily: "inherit",
        }}
      >
        {saved ? "저장됐습니다!" : isPending ? "저장 중..." : "프로필 저장"}
      </button>
    </form>
  );
}

function ReadonlyField({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 12, color: "var(--bm-text-tertiary)" }}>{label}</span>
      {badge ? (
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 10px",
            borderRadius: 999,
            background: "var(--bm-primary-subtle)",
            color: "var(--bm-primary)",
          }}
        >
          {value}
        </span>
      ) : (
        <span style={{ fontSize: 13, color: "var(--bm-text-secondary)" }}>{value}</span>
      )}
    </div>
  );
}

function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "var(--bm-text-primary)" }}>
        {label}
      </label>
      {children}
      {hint && (
        <span style={{ fontSize: 11, color: "var(--bm-text-tertiary)" }}>{hint}</span>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--bm-border)",
  background: "var(--bm-surface)",
  fontSize: 14,
  color: "var(--bm-text-primary)",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};
