"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { logoutAction } from "@/app/login/actions";

const USER_TYPE_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  doctor: { label: "의사", color: "#2D9D5A", bg: "#E8F9EE" },
  pharma: { label: "제약사·의료기기", color: "#1A73E8", bg: "#E8F4FD" },
  other: { label: "일반", color: "#888", bg: "#F0F0F0" },
};

type Props = {
  email: string;
  userType?: string;
  displayName?: string;
  organization?: string;
};

export function UserMenu({ email, userType, displayName, organization }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const typeInfo = userType ? USER_TYPE_LABEL[userType] : null;
  const label = displayName || organization || email;
  const initial = label.slice(0, 1).toUpperCase();

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          height: 36,
          padding: "0 12px",
          background: open ? "var(--bm-primary-subtle)" : "var(--bm-bg-muted)",
          border: open ? "1px solid var(--bm-primary)" : "1px solid var(--bm-border)",
          borderRadius: 999,
          fontFamily: "inherit",
          fontSize: 13,
          color: "var(--bm-text-primary)",
          cursor: "pointer",
          transition: "all .1s",
        }}
        aria-expanded={open}
      >
        {/* 아바타 */}
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "var(--bm-primary)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          {initial}
        </span>
        {/* 레이블 */}
        <span
          style={{
            maxWidth: 120,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {displayName || organization || email}
        </span>
        {/* 드롭다운 화살표 */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            color: "var(--bm-text-tertiary)",
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform .15s",
            flexShrink: 0,
          }}
        >
          <polyline points="4 6 8 10 12 6" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            marginTop: 8,
            minWidth: 220,
            background: "var(--bm-surface)",
            border: "1px solid var(--bm-border)",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
            padding: "10px 0",
            zIndex: 200,
          }}
        >
          {/* 프로필 헤더 */}
          <div
            style={{
              padding: "8px 16px 12px",
              borderBottom: "1px solid var(--bm-border)",
              marginBottom: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--bm-primary)",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {initial}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--bm-text-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {displayName || "이름 없음"}
                </div>
                {organization && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--bm-text-secondary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginTop: 1,
                    }}
                  >
                    {organization}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {typeInfo && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: typeInfo.bg,
                    color: typeInfo.color,
                  }}
                >
                  {typeInfo.label}
                </span>
              )}
              <span
                style={{
                  fontSize: 11,
                  color: "var(--bm-text-tertiary)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 160,
                }}
              >
                {email}
              </span>
            </div>
          </div>

          {/* 메뉴 항목 */}
          <MenuItem href="/profile" onClick={() => setOpen(false)}>
            프로필 수정
          </MenuItem>
          <MenuItem href="/mypage" onClick={() => setOpen(false)}>
            마이페이지
          </MenuItem>

          <div style={{ height: 1, background: "var(--bm-border)", margin: "6px 0" }} />

          <form ref={formRef} action={logoutAction} style={{ padding: "0 8px" }}>
            <Button type="submit" variant="ghost" size="sm" fullWidth>
              로그아웃
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 16px",
        fontSize: 13,
        color: "var(--bm-text-primary)",
        textDecoration: "none",
        transition: "background .1s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = "var(--bm-bg-muted)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
      }}
    >
      {children}
    </Link>
  );
}
