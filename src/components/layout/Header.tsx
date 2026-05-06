"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/ui/SearchBar";
import { CloseIcon, MenuIcon, SearchIcon } from "@/components/ui/Icon";
import { useRouter } from "next/navigation";
import { UserMenu } from "./UserMenu";

const ADMIN_EMAILS = ["sympotalk@gmail.com"];

type Props = {
  userEmail?: string | null;
  userType?: string | null;
};

export function Header({ userEmail, userType }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isAdmin = ADMIN_EMAILS.includes((userEmail ?? "").toLowerCase());
  const isPharma = userType === "pharma";

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
            className="bm-header-logo"
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
              style={{ display: "block", width: "auto" }}
            />
          </Link>

          {/* Desktop nav */}
          <nav
            className="bm-show-desktop-flex bm-header-nav"
            style={{
              flex: 1,
              alignItems: "center",
            }}
          >
            <Link href="/conferences" style={navLinkStyle}>
              학술대회
            </Link>
            <Link href="/conferences?view=international" style={navLinkStyle}>
              국제
            </Link>
            <Link href="/societies" style={navLinkStyle}>
              학회
            </Link>
            <Link href="/pharma" style={{ ...navLinkStyle, color: "var(--bm-accent)" }}>
              제약사
            </Link>
            {isPharma && (
              <>
                <Link href="/browse" style={navLinkStyle}>의료진 검색</Link>
                <Link href="/memos" style={navLinkStyle}>메모</Link>
                <Link href="/team" style={navLinkStyle}>팀</Link>
              </>
            )}
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

          {/* Mobile right group: 검색 → 햄버거 */}
          <div
            className="bm-show-mobile-flex"
            style={{ marginLeft: "auto", gap: 0, alignItems: "center" }}
          >
            <button
              type="button"
              onClick={() => {
                setOpen(true);
                // 드로어 열고 검색 입력에 자동 포커스 — 작은 트릭
                setTimeout(() => {
                  const el = document.querySelector<HTMLInputElement>(
                    ".bm-drawer input[type='text']",
                  );
                  el?.focus();
                }, 240);
              }}
              aria-label="검색"
              style={{
                width: 44,
                height: 44,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--bm-text-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              <SearchIcon width={20} height={20} />
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="메뉴 열기"
              style={{
                width: 44,
                height: 44,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--bm-text-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              <MenuIcon width={22} height={22} />
            </button>
          </div>
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
              <DrawerLink
                href="/conferences"
                label="국내 학술대회"
                sub="대한의학회 등록 일정"
                onClick={() => setOpen(false)}
              />
              <DrawerLink
                href="/conferences?view=international"
                label="국제 학술대회"
                sub="ESC · AHA · ASCO 등 해외 일정"
                onClick={() => setOpen(false)}
              />
              <DrawerLink
                href="/societies"
                label="학회"
                sub="국내 의학 학회"
                onClick={() => setOpen(false)}
              />
              <DrawerLink
                href="/pharma"
                label="제약사 광고 문의"
                sub="배너·스폰서십 안내"
                onClick={() => setOpen(false)}
                accent
              />

              {/* 빠른 접근 */}
              <div className="bm-drawer-section-title">빠른 접근</div>
              <DrawerLink
                href="/conferences?view=upcoming"
                label="이번 주 학술대회"
                sub="D-7 이내 임박 일정"
                onClick={() => setOpen(false)}
              />
              <DrawerLink
                href="/conferences?view=featured"
                label="주요 학술대회"
                sub="에디터 추천 / 주목 학회"
                onClick={() => setOpen(false)}
              />
              <DrawerLink
                href="/conferences?view=calendar"
                label="캘린더 뷰"
                sub="월별 일정 한눈에"
                onClick={() => setOpen(false)}
              />

              {isPharma && (
                <>
                  <div className="bm-drawer-section-title">MR 전용</div>
                  <DrawerLink
                    href="/browse"
                    label="의료진 검색"
                    sub="전국 병원 의사 검색·진료시간"
                    onClick={() => setOpen(false)}
                  />
                  <DrawerLink
                    href="/memos"
                    label="메모·방문록"
                    sub="방문 기록·미팅 노트"
                    onClick={() => setOpen(false)}
                  />
                  <DrawerLink
                    href="/team"
                    label="팀 관리"
                    sub="공유 핀·팀 메모 피드"
                    onClick={() => setOpen(false)}
                  />
                </>
              )}

              {isAdmin && (
                <>
                  <div className="bm-drawer-section-title">관리</div>
                  <DrawerLink
                    href="/admin"
                    label="관리자 대시보드"
                    sub="배너·학술대회 CRUD"
                    onClick={() => setOpen(false)}
                  />
                </>
              )}

              {userEmail && (
                <>
                  <div className="bm-drawer-section-title">내 계정</div>
                  <DrawerLink
                    href="/mypage"
                    label="마이페이지"
                    sub="즐겨찾기·알림 설정"
                    onClick={() => setOpen(false)}
                  />
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

function DrawerLink({
  href,
  label,
  sub,
  onClick,
  accent,
}: {
  href: string;
  label: string;
  sub: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <Link href={href} className="bm-drawer-link" onClick={onClick}>
      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: accent ? "var(--bm-accent)" : "var(--bm-text-primary)",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--bm-text-tertiary)",
            marginTop: 2,
            fontWeight: 400,
          }}
        >
          {sub}
        </div>
      </div>
      <Chevron />
    </Link>
  );
}

const navLinkStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 500,
  color: "var(--bm-text-primary)",
  textDecoration: "none",
  padding: "8px 0",
  letterSpacing: -0.2,
};
