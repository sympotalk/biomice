"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { logoutAction } from "@/app/login/actions";

type Props = {
  email: string;
};

export function UserMenu({ email }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          height: 36,
          padding: "0 12px",
          background: "var(--bm-bg-muted)",
          border: "1px solid var(--bm-border)",
          borderRadius: 999,
          fontFamily: "inherit",
          fontSize: 13,
          color: "var(--bm-text-primary)",
          cursor: "pointer",
        }}
      >
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
            fontFamily: "var(--font-mono)",
          }}
        >
          {email.slice(0, 1)}
        </span>
        <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
          {email}
        </span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            marginTop: 8,
            minWidth: 200,
            background: "var(--bm-surface)",
            border: "1px solid var(--bm-border)",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            padding: 8,
            zIndex: 50,
          }}
        >
          <Link href="/mypage" style={menuLink} onClick={() => setOpen(false)}>
            내 즐겨찾기
          </Link>
          <form ref={formRef} action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm" fullWidth>
              로그아웃
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

const menuLink: React.CSSProperties = {
  display: "block",
  padding: "8px 12px",
  fontSize: 13,
  color: "var(--bm-text-primary)",
  textDecoration: "none",
  borderRadius: 6,
};
