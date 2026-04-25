"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/ui/SearchBar";
import { CloseIcon, MenuIcon } from "@/components/ui/Icon";
import { useRouter } from "next/navigation";
import { UserMenu } from "./UserMenu";

const ADMIN_EMAILS = ["sympotalk@gmail.com"];

type Props = {
  userEmail?: string | null;
};

export function Header({ userEmail }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isAdmin = ADMIN_EMAILS.includes((userEmail ?? "").toLowerCase());

  const submit = (q: string) => {
    const url = q.trim()
      ? `/conferences?q=${encodeURIComponent(q.trim())}`
      : "/conferences";
    router.push(url);
    setOpen(false);
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "var(--bm-bg)",
        borderBottom: "1px solid var(--bm-border)",
        backdropFilter: "saturate(1.5) blur(6px)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 20px",
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: 24,
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="바이오마이스 BioMICE" height={28} style={{ display: "block" }} />
        </Link>

        <nav
          style={{
            display: "flex",
            gap: 20,
            flex: 1,
            alignItems: "center",
          }}
          className="hidden md:flex"
        >
          <Link href="/conferences" style={navLinkStyle}>
            학술대회
          </Link>
          <Link href="/conferences?view=upcoming" style={navLinkStyle}>
            이번 주
          </Link>
          <Link href="/conferences?view=featured" style={navLinkStyle}>
            Featured
          </Link>
          <Link href="/societies" style={navLinkStyle}>
            학회
          </Link>
          <Link href="/pharma" style={{ ...navLinkStyle, color: "var(--bm-accent)" }}>
            제약사
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              style={{
                ...navLinkStyle,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--bm-text-tertiary)",
                border: "1px solid var(--bm-border)",
                padding: "3px 10px",
                borderRadius: 4,
              }}
            >
              관리자
            </Link>
          )}
        </nav>

        <div style={{ flex: 1, maxWidth: 340 }} className="hidden md:block">
          <SearchBar onSubmit={submit} />
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }} className="hidden md:flex">
          {userEmail ? (
            <UserMenu email={userEmail} />
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  로그인
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">
                  회원가입
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="메뉴 열기"
          className="md:hidden"
          style={{
            marginLeft: "auto",
            width: 40,
            height: 40,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--bm-text-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {open && (
        <div
          className="md:hidden"
          style={{
            borderTop: "1px solid var(--bm-border)",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            background: "var(--bm-bg)",
          }}
        >
          <SearchBar onSubmit={submit} />
          <Link href="/conferences" style={navLinkStyle} onClick={() => setOpen(false)}>
            학술대회
          </Link>
          <Link
            href="/conferences?view=upcoming"
            style={navLinkStyle}
            onClick={() => setOpen(false)}
          >
            이번 주
          </Link>
          <Link
            href="/conferences?view=featured"
            style={navLinkStyle}
            onClick={() => setOpen(false)}
          >
            Featured
          </Link>
          <Link href="/societies" style={navLinkStyle} onClick={() => setOpen(false)}>
            학회
          </Link>
          <Link
            href="/pharma"
            style={{ ...navLinkStyle, color: "var(--bm-accent)" }}
            onClick={() => setOpen(false)}
          >
            제약사
          </Link>
          {userEmail ? (
            <div style={{ marginTop: 4 }}>
              <UserMenu email={userEmail} />
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <Link href="/login" style={{ flex: 1 }} onClick={() => setOpen(false)}>
                <Button variant="outline" size="sm" fullWidth>
                  로그인
                </Button>
              </Link>
              <Link href="/signup" style={{ flex: 1 }} onClick={() => setOpen(false)}>
                <Button variant="primary" size="sm" fullWidth>
                  회원가입
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

const navLinkStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: "var(--bm-text-primary)",
  textDecoration: "none",
  padding: "6px 0",
};
