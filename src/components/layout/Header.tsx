"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Close on route change (SPA navigation triggers re-render)
  useEffect(() => {
    setOpen(false);
  }, [/* re-mount per route via Next.js */]);

  const submit = (q: string) => {
    const url = q.trim()
      ? `/conferences?q=${encodeURIComponent(q.trim())}`
      : "/conferences";
    router.push(url);
    setOpen(false);
  };

  return (
    <>
      <header className="bm-header">
        <div className="bm-header-inner">
          {/* Logo (always visible) */}
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
            <img
              src="/logo.png"
              alt="바이오마이스 BioMICE"
              style={{ display: "block", height: 26, width: "auto" }}
            />
          </Link>

          {/* Desktop nav */}
          <nav
            className="bm-show-desktop-flex"
            style={{
              gap: 20,
              flex: 1,
              alignItems: "center",
            }}
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

          {/* Desktop search */}
          <div
            className="bm-show-desktop"
            style={{ flex: 1, maxWidth: 340 }}
          >
            <SearchBar onSubmit={submit} />
          </div>

          {/* Desktop auth buttons */}
          <div
            className="bm-show-desktop-flex"
            style={{ gap: 8, alignItems: "center" }}
          >
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

          {/* Mobile hamburger (always pushed to right) */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="메뉴 열기"
            className="bm-show-mobile-flex"
            style={{
              marginLeft: "auto",
              width: 40,
              height: 40,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--bm-text-primary)",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="bm-drawer-backdrop"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="bm-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="모바일 메뉴"
          >
            <div className="bm-drawer-header">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="BioMICE"
                  style={{ display: "block", height: 24, width: "auto" }}
                />
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="메뉴 닫기"
                style={{
                  width: 40,
                  height: 40,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--bm-text-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  borderRadius: 8,
                }}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="bm-drawer-body">
              {/* Search input */}
              <div style={{ marginBottom: 8 }}>
                <SearchBar onSubmit={submit} />
              </div>

              {/* Nav links */}
              <div className="bm-drawer-section-title">메뉴</div>
              <Link
                href="/conferences"
                className="bm-drawer-link"
                onClick={() => setOpen(false)}
              >
                <span>학술대회</span>
                <Chevron />
              </Link>
              <Link
                href="/conferences?view=upcoming"
                className="bm-drawer-link"
                onClick={() => setOpen(false)}
              >
                <span>이번 주</span>
                <Chevron />
              </Link>
              <Link
                href="/conferences?view=featured"
                className="bm-drawer-link"
                onClick={() => setOpen(false)}
              >
                <span>Featured</span>
                <Chevron />
              </Link>
              <Link
                href="/societies"
                className="bm-drawer-link"
                onClick={() => setOpen(false)}
              >
                <span>학회</span>
                <Chevron />
              </Link>
              <Link
                href="/pharma"
                className="bm-drawer-link"
                onClick={() => setOpen(false)}
                style={{ color: "var(--bm-accent)" }}
              >
                <span>제약사</span>
                <Chevron />
              </Link>

              {isAdmin && (
                <>
                  <div className="bm-drawer-section-title">관리</div>
                  <Link
                    href="/admin"
                    className="bm-drawer-link"
                    onClick={() => setOpen(false)}
                  >
                    <span>관리자 대시보드</span>
                    <Chevron />
                  </Link>
                </>
              )}

              {userEmail && (
                <>
                  <div className="bm-drawer-section-title">내 계정</div>
                  <Link
                    href="/mypage"
                    className="bm-drawer-link"
                    onClick={() => setOpen(false)}
                  >
                    <span>마이페이지</span>
                    <Chevron />
                  </Link>
                </>
              )}
            </div>

            <div className="bm-drawer-footer">
              {userEmail ? (
                <div style={{ fontSize: 13, color: "var(--bm-text-secondary)" }}>
                  <UserMenu email={userEmail} />
                </div>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="md" fullWidth>
                      로그인
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    <Button variant="primary" size="md" fullWidth>
                      회원가입
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}

function Chevron() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--bm-text-tertiary)" }}
    >
      <polyline points="6 4 10 8 6 12" />
    </svg>
  );
}

const navLinkStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: "var(--bm-text-primary)",
  textDecoration: "none",
  padding: "6px 0",
};
