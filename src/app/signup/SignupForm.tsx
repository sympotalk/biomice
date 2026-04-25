"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  AuthCard,
  Field,
  TextInput,
  AuthDivider,
  GoogleButton,
  KakaoButton,
} from "@/components/auth/AuthCard";
import { signupAction } from "../login/actions";
import { createClient } from "@/lib/supabase/client";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "";

const SPECIALTY_LIST = [
  "내과","외과","정형외과","산부인과","소아과","신경과",
  "정신건강의학과","피부과","안과","이비인후과","비뇨의학과",
  "재활의학과","영상의학과","마취통증의학과","가정의학과",
  "응급의학과","진단검사의학과","병리과","치과","한방",
];
const PHARMA_AREAS = [
  "심혈관","당뇨·대사","종양학","면역·감염","호흡기",
  "소화기","정신·신경","여성건강","희귀질환","백신","의료기기",
];
const STEP_LABELS = ["직군 선택", "기본 정보", "추가 정보", "약관 동의"];

// ─── Stepper ─────────────────────────────────────────────────────────────────

function Stepper({ step }: { step: number }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: "var(--bm-text-tertiary)", fontWeight: 600, fontFamily: "var(--font-mono)", letterSpacing: 0.4 }}>
          STEP {step}/4
        </span>
        <span style={{ fontSize: 12, color: "var(--bm-text-secondary)" }}>
          {STEP_LABELS[step - 1]}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i <= step ? "var(--bm-primary)" : "var(--bm-border)",
              transition: "background .2s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── StepNav ─────────────────────────────────────────────────────────────────

function StepNav({
  step,
  onPrev,
  onNext,
  nextLabel,
  pending,
}: {
  step: number;
  onPrev?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  pending?: boolean;
}) {
  return (
    <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
      {step > 1 && (
        <button
          type="button"
          onClick={onPrev}
          style={{
            height: 48,
            padding: "0 24px",
            borderRadius: 6,
            border: "1px solid var(--bm-border)",
            background: "var(--bm-bg)",
            fontSize: 15,
            fontWeight: 600,
            color: "var(--bm-text-primary)",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          이전
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={pending}
        style={{
          flex: 1,
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
        {pending ? "처리 중…" : (nextLabel ?? (step === 4 ? "가입 완료" : "다음"))}
      </button>
    </div>
  );
}

// ─── Role Card ───────────────────────────────────────────────────────────────

function RoleCard({
  value,
  title,
  desc,
  icon,
  selected,
  onClick,
}: {
  value: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        textAlign: "left",
        padding: "18px 16px",
        cursor: "pointer",
        fontFamily: "inherit",
        borderRadius: 8,
        border: `1.5px solid ${selected ? "var(--bm-primary)" : "var(--bm-border)"}`,
        background: selected ? "var(--bm-primary-subtle)" : "var(--bm-bg)",
        transition: "all .12s",
        width: "100%",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 10,
          flexShrink: 0,
          background: selected ? "var(--bm-primary)" : "var(--bm-bg-muted)",
          color: selected ? "#fff" : "var(--bm-text-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--bm-text-primary)" }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--bm-text-secondary)", whiteSpace: "pre-line", marginTop: 2, lineHeight: 1.5 }}>{desc}</div>
      </div>
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          flexShrink: 0,
          border: `1.5px solid ${selected ? "var(--bm-primary)" : "var(--bm-border-strong)"}`,
          background: selected ? "var(--bm-primary)" : "var(--bm-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected && <span style={{ width: 8, height: 8, borderRadius: 4, background: "#fff", display: "block" }} />}
      </div>
    </button>
  );
}

// ─── Step 1: Role ─────────────────────────────────────────────────────────────

function Step1({ role, setRole }: { role: string; setRole: (v: string) => void }) {
  const roles = [
    {
      v: "doctor",
      title: "의사",
      desc: "의사 면허 보유자\n전공의·전문의·교수",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4v8a4 4 0 0 0 8 0V4" /><path d="M10 4h4M18 4h4" />
          <path d="M16 20v4a4 4 0 0 0 4 4 4 4 0 0 0 4-4v-2" /><circle cx="24" cy="18" r="2.5" />
        </svg>
      ),
    },
    {
      v: "pharma",
      title: "제약사·의료기기",
      desc: "마케팅, MSL, 영업\n학술지원 담당자",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="9" width="22" height="16" rx="2" /><path d="M11 9V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
          <path d="M16 14v7M12.5 17.5h7" />
        </svg>
      ),
    },
    {
      v: "other",
      title: "기타",
      desc: "학회 사무국·연구원\n의료 관계자",
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="12" r="4" /><path d="M4 26c0-4 3-7 7-7s7 3 7 7" />
          <circle cx="22" cy="13" r="3" /><path d="M17 24c0-3 2-5 5-5s5 2 5 5" />
        </svg>
      ),
    },
  ];

  return (
    <AuthCard title="biomice를 어떻게 이용하시나요?" subtitle="직군에 맞춰 필요한 정보만 받을게요. 나중에 변경할 수 있어요.">
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {roles.map((r) => (
          <RoleCard key={r.v} value={r.v} title={r.title} desc={r.desc} icon={r.icon} selected={role === r.v} onClick={() => setRole(r.v)} />
        ))}
      </div>
    </AuthCard>
  );
}

// ─── Step 2: Basic info ───────────────────────────────────────────────────────

function Step2({
  email, setEmail,
  password, setPassword,
  confirmPw, setConfirmPw,
  name, setName,
  pwError,
}: {
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  confirmPw: string; setConfirmPw: (v: string) => void;
  name: string; setName: (v: string) => void;
  pwError?: string;
}) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const pwMatch = confirmPw && password === confirmPw;

  const eyeBtn = (show: boolean, toggle: () => void) => (
    <button
      type="button"
      onClick={toggle}
      style={{
        position: "absolute", right: 10, top: 10, width: 24, height: 24,
        border: "none", background: "transparent", cursor: "pointer",
        color: "var(--bm-text-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" /><circle cx="8" cy="8" r="2" />
        {!show && <path d="M2 2l12 12" />}
      </svg>
    </button>
  );

  const handleSocial = (provider: "google" | "kakao") => {
    const sb = createClient();
    sb.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${BASE_URL}/auth/callback` },
    });
  };

  return (
    <AuthCard title="기본 정보를 입력해주세요" subtitle="이메일은 로그인 및 학술대회 알림에 사용됩니다.">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Field label="이름" required>
          <TextInput name="name" type="text" value={name} onChange={setName} placeholder="홍길동" autoComplete="name" required />
        </Field>

        <Field label="이메일" required>
          <TextInput name="email" type="email" value={email} onChange={setEmail} placeholder="name@example.com" autoComplete="email" required />
        </Field>

        <Field label="비밀번호" required hint="영문·숫자·특수문자 포함 8자 이상" error={pwError}>
          <TextInput
            name="password" type={showPw ? "text" : "password"}
            value={password} onChange={setPassword}
            autoComplete="new-password" required
            suffix={eyeBtn(showPw, () => setShowPw((v) => !v))}
          />
        </Field>

        <Field label="비밀번호 확인" required>
          <TextInput
            name="confirmPassword" type={showConfirm ? "text" : "password"}
            value={confirmPw} onChange={setConfirmPw}
            autoComplete="new-password" required
            suffix={
              confirmPw ? (
                pwMatch ? (
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--bm-success)", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6l2.5 2.5L10 3" /></svg>
                    일치
                  </span>
                ) : (
                  eyeBtn(showConfirm, () => setShowConfirm((v) => !v))
                )
              ) : eyeBtn(showConfirm, () => setShowConfirm((v) => !v))
            }
          />
        </Field>

        <AuthDivider label="또는 소셜 계정으로 가입" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <GoogleButton onClick={() => handleSocial("google")} />
          <KakaoButton onClick={() => handleSocial("kakao")} />
        </div>
      </div>
    </AuthCard>
  );
}

// ─── Step 3a: Doctor ──────────────────────────────────────────────────────────

function Step3Doctor({
  specialty, setSpecialty,
  organization, setOrganization,
  rank, setRank,
}: {
  specialty: string; setSpecialty: (v: string) => void;
  organization: string; setOrganization: (v: string) => void;
  rank: string; setRank: (v: string) => void;
}) {
  const ranks = [
    { v: "resident", label: "전공의" },
    { v: "specialist", label: "전문의" },
    { v: "professor", label: "교수" },
    { v: "other", label: "기타" },
  ];

  const toggleBtn = (current: string, v: string, label: string, set: (v: string) => void) => {
    const on = current === v;
    return (
      <button
        key={v}
        type="button"
        onClick={() => set(v)}
        style={{
          height: 40,
          border: `1.5px solid ${on ? "var(--bm-primary)" : "var(--bm-border)"}`,
          background: on ? "var(--bm-primary-subtle)" : "var(--bm-bg)",
          color: on ? "var(--bm-primary)" : "var(--bm-text-secondary)",
          borderRadius: 4,
          fontSize: 13,
          fontWeight: on ? 600 : 500,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <AuthCard title="의사 정보를 알려주세요" subtitle="전공에 맞는 학술대회를 우선 추천해드려요.">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Field label="전공 과목" required>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {SPECIALTY_LIST.map((s) => {
              const on = specialty === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpecialty(on ? "" : s)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    height: 30,
                    padding: "0 12px",
                    borderRadius: 999,
                    background: on ? "var(--bm-primary-subtle)" : "var(--bm-bg-muted)",
                    color: on ? "var(--bm-primary)" : "var(--bm-text-secondary)",
                    fontSize: 12,
                    fontWeight: on ? 600 : 500,
                    border: `1px solid ${on ? "var(--bm-primary)" : "transparent"}`,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="소속 병원·기관" required hint="예: 서울대학교병원, 삼성서울병원">
          <TextInput name="organization" value={organization} onChange={setOrganization} placeholder="병원명 입력" />
        </Field>

        <Field label="직급" required>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {ranks.map((r) => toggleBtn(rank, r.v, r.label, setRank))}
          </div>
        </Field>

        <div style={{ padding: 12, borderRadius: 6, background: "var(--bm-bg-muted)", fontSize: 11, color: "var(--bm-text-tertiary)", lineHeight: 1.6, display: "flex", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="7" cy="7" r="5.5" /><path d="M7 4.5v3M7 9.5v.1" />
          </svg>
          <span>의사 면허번호는 수집하지 않습니다. biomice는 학술대회 정보 제공 플랫폼이며 진료·처방 활동과 무관합니다.</span>
        </div>
      </div>
    </AuthCard>
  );
}

// ─── Step 3b: Pharma ──────────────────────────────────────────────────────────

function Step3Pharma({
  company, setCompany,
  pharmaAreas, setPharmaAreas,
  pharmaJob, setPharmaJob,
}: {
  company: string; setCompany: (v: string) => void;
  pharmaAreas: string[]; setPharmaAreas: (v: string[]) => void;
  pharmaJob: string; setPharmaJob: (v: string) => void;
}) {
  const jobOpts = ["마케팅", "MSL", "영업", "학술", "기타"];
  const toggleArea = (a: string) =>
    setPharmaAreas(pharmaAreas.includes(a) ? pharmaAreas.filter((x) => x !== a) : [...pharmaAreas, a]);

  return (
    <AuthCard title="회사 정보를 알려주세요" subtitle="담당 분야에 맞는 학술대회와 광고 기회를 안내해드려요.">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Field label="회사명" required>
          <TextInput name="organization" value={company} onChange={setCompany} placeholder="예: 한국화이자제약" />
        </Field>

        <Field label="담당 분야" required hint="여러 개 선택 가능">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {PHARMA_AREAS.map((a) => {
              const on = pharmaAreas.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleArea(a)}
                  style={{
                    height: 32, padding: "0 12px", borderRadius: 999,
                    border: `1px solid ${on ? "var(--bm-primary)" : "var(--bm-border)"}`,
                    background: on ? "var(--bm-primary-subtle)" : "var(--bm-bg)",
                    color: on ? "var(--bm-primary)" : "var(--bm-text-secondary)",
                    fontSize: 12, fontWeight: on ? 600 : 500, cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {a}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="직무" required>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {jobOpts.map((j) => {
              const on = pharmaJob === j;
              return (
                <button
                  key={j}
                  type="button"
                  onClick={() => setPharmaJob(on ? "" : j)}
                  style={{
                    height: 40,
                    border: `1.5px solid ${on ? "var(--bm-primary)" : "var(--bm-border)"}`,
                    background: on ? "var(--bm-primary-subtle)" : "var(--bm-bg)",
                    color: on ? "var(--bm-primary)" : "var(--bm-text-secondary)",
                    borderRadius: 4, fontSize: 12, fontWeight: on ? 600 : 500,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {j}
                </button>
              );
            })}
          </div>
        </Field>
      </div>
    </AuthCard>
  );
}

// ─── Step 4: Terms ────────────────────────────────────────────────────────────

type AgreeState = { tos: boolean; privacy: boolean; marketing: boolean; notify: boolean };

function Step4({ agree, setAgree }: {
  agree: AgreeState;
  setAgree: (v: AgreeState) => void;
}) {
  const items = [
    { k: "tos", label: "이용약관 동의", required: true },
    { k: "privacy", label: "개인정보처리방침 동의", required: true },
    { k: "marketing", label: "마케팅 정보 수신 (뉴스레터)", required: false, hint: "주 1회 관심 분야 학술대회 요약을 이메일로 보내드려요" },
    { k: "notify", label: "학술대회 알림 받기", required: false, hint: "즐겨찾기한 학술대회 D-7 알림" },
  ];
  const allChecked = items.every((i) => agree[i.k as keyof AgreeState]);
  const toggleAll = () => {
    const next = !allChecked;
    setAgree({ tos: next, privacy: next, marketing: next, notify: next });
  };

  return (
    <AuthCard title="마지막으로 약관에 동의해주세요">
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {/* 전체 동의 */}
        <button
          type="button"
          onClick={toggleAll}
          style={{
            display: "flex", alignItems: "center", gap: 10, padding: "14px 12px",
            borderRadius: 6, background: "var(--bm-primary-subtle)",
            cursor: "pointer", marginBottom: 8, border: "none", fontFamily: "inherit", width: "100%", textAlign: "left",
          }}
        >
          <CheckIcon checked={allChecked} size={20} round />
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--bm-text-primary)" }}>전체 동의</span>
          <span style={{ fontSize: 11, color: "var(--bm-text-tertiary)", marginLeft: "auto" }}>선택 항목 포함</span>
        </button>

        {items.map((item) => (
          <button
            key={item.k}
            type="button"
            onClick={() => setAgree({ ...agree, [item.k]: !agree[item.k as keyof AgreeState] } as AgreeState)}
            style={{
              display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px",
              cursor: "pointer", borderRadius: 4, border: "none", background: "transparent", fontFamily: "inherit", width: "100%", textAlign: "left",
            }}
          >
            <CheckIcon checked={agree[item.k as keyof AgreeState]} size={18} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, color: "var(--bm-text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: item.required ? "var(--bm-danger)" : "var(--bm-text-tertiary)", fontSize: 11, fontWeight: 600 }}>
                  [{item.required ? "필수" : "선택"}]
                </span>
                {item.label}
              </div>
              {(item as { hint?: string }).hint && (
                <div style={{ fontSize: 11, color: "var(--bm-text-tertiary)", marginTop: 3 }}>
                  {(item as { hint: string }).hint}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </AuthCard>
  );
}

function CheckIcon({ checked, size, round }: { checked: boolean; size: number; round?: boolean }) {
  return (
    <span
      style={{
        width: size, height: size, flexShrink: 0, marginTop: 2,
        borderRadius: round ? size : 3,
        border: `1.5px solid ${checked ? "var(--bm-primary)" : "var(--bm-border-strong)"}`,
        background: checked ? "var(--bm-primary)" : "var(--bm-bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {checked && (
        <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 5l2 2 4-4" />
        </svg>
      )}
    </span>
  );
}

// ─── Main SignupForm ──────────────────────────────────────────────────────────

export function SignupForm() {
  const [step, setStep] = useState(1);
  const [pending, startTransition] = useTransition();

  // Step 1
  const [role, setRole] = useState("doctor");

  // Step 2
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState<string | undefined>();

  // Step 3 — doctor
  const [specialty, setSpecialty] = useState("");
  const [organization, setOrganization] = useState("");
  const [rank, setRank] = useState("specialist");

  // Step 3 — pharma
  const [pharmaAreas, setPharmaAreas] = useState<string[]>([]);
  const [pharmaJob, setPharmaJob] = useState("");

  // Step 4
  const [agree, setAgree] = useState<AgreeState>({ tos: false, privacy: false, marketing: false, notify: true });

  const [error, setError] = useState<string | null>(null);

  const next = () => {
    setError(null);
    if (step === 2) {
      if (!name.trim() || !email.trim() || !password) {
        setError("이름, 이메일, 비밀번호는 필수입니다.");
        return;
      }
      if (password.length < 8) {
        setPwError("비밀번호는 8자 이상이어야 합니다.");
        return;
      }
      if (password !== confirmPw) {
        setPwError("비밀번호가 일치하지 않습니다.");
        return;
      }
      setPwError(undefined);
    }
    if (step === 4) {
      if (!agree.tos || !agree.privacy) {
        setError("필수 약관에 동의해 주세요.");
        return;
      }
      // 최종 제출
      startTransition(async () => {
        const fd = new FormData();
        fd.set("email", email);
        fd.set("password", password);
        fd.set("user_type", role);
        fd.set("organization", role === "pharma" ? organization : organization);
        fd.set("specialty", role === "doctor" ? specialty : pharmaAreas.join(", "));
        fd.set("name", name);
        fd.set("notify_enabled", String(agree.notify));
        fd.set("newsletter_opt_in", String(agree.marketing));
        const result = await signupAction(null, fd);
        if (result?.error) setError(result.error);
      });
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <div>
      <Stepper step={step} />

      {step === 1 && <Step1 role={role} setRole={setRole} />}
      {step === 2 && (
        <Step2
          email={email} setEmail={setEmail}
          password={password} setPassword={setPassword}
          confirmPw={confirmPw} setConfirmPw={setConfirmPw}
          name={name} setName={setName}
          pwError={pwError}
        />
      )}
      {step === 3 && role === "doctor" && (
        <Step3Doctor specialty={specialty} setSpecialty={setSpecialty} organization={organization} setOrganization={setOrganization} rank={rank} setRank={setRank} />
      )}
      {step === 3 && role !== "doctor" && (
        <Step3Pharma company={organization} setCompany={setOrganization} pharmaAreas={pharmaAreas} setPharmaAreas={setPharmaAreas} pharmaJob={pharmaJob} setPharmaJob={setPharmaJob} />
      )}
      {step === 4 && <Step4 agree={agree} setAgree={setAgree} />}

      {error && (
        <div style={{ marginTop: 12, padding: 12, background: "var(--bm-danger-subtle)", color: "var(--bm-danger)", fontSize: 13, borderRadius: 6 }}>
          {error}
        </div>
      )}

      <StepNav step={step} onPrev={() => setStep((s) => s - 1)} onNext={next} pending={pending} />

      {step === 1 && (
        <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "var(--bm-text-secondary)" }}>
          이미 계정이 있으신가요?{" "}
          <Link href="/login" style={{ color: "var(--bm-primary)", fontWeight: 600, textDecoration: "none" }}>
            로그인
          </Link>
        </div>
      )}
    </div>
  );
}
