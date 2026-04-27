import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/conferences", label: "학술대회" },
  { href: "/admin/banners", label: "배너 관리" },
  { href: "/admin/societies", label: "학회 관리" },
  { href: "/admin/crawlers", label: "크롤러" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        background: "var(--bm-bg)",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          background: "var(--bm-surface)",
          borderRight: "1px solid var(--bm-border)",
          padding: "24px 0",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "0 20px 20px",
            borderBottom: "1px solid var(--bm-border)",
            marginBottom: 8,
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: "var(--bm-primary)",
              textDecoration: "none",
              letterSpacing: -0.5,
            }}
          >
            biomice
          </Link>
          <div
            style={{
              marginTop: 2,
              fontSize: 11,
              fontWeight: 600,
              color: "var(--bm-text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Admin
          </div>
        </div>
        <nav style={{ padding: "8px 12px" }}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "block",
                padding: "10px 12px",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                color: "var(--bm-text-primary)",
                textDecoration: "none",
                marginBottom: 2,
              }}
              className="admin-nav-link"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main style={{ padding: "32px 40px", minWidth: 0 }}>{children}</main>
    </div>
  );
}
