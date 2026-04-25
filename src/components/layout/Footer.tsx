"use client";

import Link from "next/link";
import { useState } from "react";

type Group = {
  title: string;
  links: { href: string; label: string }[];
};

const GROUPS: Group[] = [
  {
    title: "서비스",
    links: [
      { href: "/conferences", label: "전체 학술대회" },
      { href: "/conferences?view=featured", label: "Featured" },
      { href: "/conferences?view=upcoming", label: "이번 주" },
      { href: "/societies", label: "학회 목록" },
    ],
  },
  {
    title: "계정",
    links: [
      { href: "/login", label: "로그인" },
      { href: "/signup", label: "회원가입" },
      { href: "/mypage", label: "마이페이지" },
    ],
  },
  {
    title: "정보",
    links: [
      { href: "/about", label: "BioMICE 소개" },
      { href: "/pharma", label: "광고 문의" },
      { href: "/privacy", label: "개인정보 처리방침" },
      { href: "/terms", label: "이용약관" },
    ],
  },
];

export function Footer() {
  return (
    <footer
      style={{
        marginTop: "auto",
        background: "var(--bm-bg-muted)",
        borderTop: "1px solid var(--bm-border)",
      }}
    >
      {/* Desktop: 4-column grid */}
      <div className="bm-show-desktop">
        <div className="bm-footer-desktop">
          <Brand />
          {GROUPS.map((g) => (
            <FooterCol key={g.title} title={g.title} links={g.links} />
          ))}
        </div>
      </div>

      {/* Mobile: brand + accordion */}
      <div className="bm-show-mobile" style={{ padding: "24px 14px 18px" }}>
        <Brand />
        <div
          style={{
            marginTop: 16,
            borderTop: "1px solid var(--bm-border)",
          }}
        >
          {GROUPS.map((g, i) => (
            <FooterAccordion key={g.title} title={g.title} links={g.links} defaultOpen={i === 0} />
          ))}
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid var(--bm-border)",
          padding: "14px 16px",
          textAlign: "center",
          fontSize: 11,
          color: "var(--bm-text-tertiary)",
          lineHeight: 1.5,
        }}
      >
        © {new Date().getFullYear()} BioMICE. 학술대회 정보는 대한의학회(KAMS) 공개자료
        기반.
      </div>
    </footer>
  );
}

function Brand() {
  return (
    <div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="바이오마이스 BioMICE"
        style={{
          display: "block",
          height: 22,
          width: "auto",
          marginBottom: 10,
        }}
      />
      <p
        style={{
          fontSize: 12,
          color: "var(--bm-text-secondary)",
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        국내 의학 학술대회 정보의 공식 허브.
        <br />
        대한의학회 산하 학회의 학술 일정을 한눈에.
      </p>
    </div>
  );
}

function FooterCol({ title, links }: Group) {
  return (
    <div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--bm-text-primary)",
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "grid",
          gap: 8,
        }}
      >
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              style={{
                fontSize: 12,
                color: "var(--bm-text-secondary)",
                textDecoration: "none",
              }}
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterAccordion({
  title,
  links,
  defaultOpen,
}: Group & { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid var(--bm-border)" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          padding: "14px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: "var(--bm-text-primary)",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "inherit",
        }}
        aria-expanded={open}
      >
        {title}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform .15s",
            color: "var(--bm-text-tertiary)",
          }}
        >
          <path d="M3 4.5l3 3 3-3" />
        </svg>
      </button>
      {open && (
        <div
          style={{
            paddingBottom: 12,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontSize: 12,
                color: "var(--bm-text-secondary)",
                textDecoration: "none",
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
