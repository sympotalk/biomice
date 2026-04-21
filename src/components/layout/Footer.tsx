import Link from "next/link";

export function Footer() {
  return (
    <footer
      style={{
        marginTop: "auto",
        background: "var(--bm-bg-muted)",
        borderTop: "1px solid var(--bm-border)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "40px 20px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 32,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 800,
              fontSize: 20,
              color: "var(--bm-primary)",
              marginBottom: 8,
            }}
          >
            biomice
          </div>
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

        <FooterCol
          title="서비스"
          links={[
            { href: "/conferences", label: "전체 학술대회" },
            { href: "/conferences?view=featured", label: "Featured" },
            { href: "/conferences?view=upcoming", label: "이번 주" },
          ]}
        />

        <FooterCol
          title="계정"
          links={[
            { href: "/login", label: "로그인" },
            { href: "/signup", label: "회원가입" },
            { href: "/mypage", label: "마이페이지" },
          ]}
        />

        <FooterCol
          title="정보"
          links={[
            { href: "/about", label: "biomice 소개" },
            { href: "/advertise", label: "광고 문의" },
            { href: "/privacy", label: "개인정보 처리방침" },
            { href: "/terms", label: "이용약관" },
          ]}
        />
      </div>

      <div
        style={{
          borderTop: "1px solid var(--bm-border)",
          padding: "16px 20px",
          textAlign: "center",
          fontSize: 11,
          color: "var(--bm-text-tertiary)",
        }}
      >
        © {new Date().getFullYear()} biomice. 본 사이트의 학술대회 정보는 대한의학회(KAMS)
        공개자료를 기반으로 합니다.
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
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
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
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
