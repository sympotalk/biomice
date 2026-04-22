"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalIcon } from "@/components/ui/Icon";
import type { SocietyWithCount } from "@/lib/queries";

function SocietyAvatar({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  const [err, setErr] = useState(false);

  if (logoUrl && !err) {
    return (
      <img
        src={logoUrl}
        alt=""
        width={40}
        height={40}
        onError={() => setErr(true)}
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          objectFit: "contain",
          background: "white",
          padding: 3,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 8,
        background: "var(--bm-primary-subtle)",
        color: "var(--bm-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 15,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {name.slice(2, 4)}
    </div>
  );
}

export function SocietyGrid({ societies }: { societies: SocietyWithCount[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 12,
      }}
    >
      {societies.map((s) => (
        <Link
          key={s.id}
          href={`/societies/${s.slug}`}
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
              background: "var(--bm-surface)",
              border: "1px solid var(--bm-border)",
              borderRadius: 10,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              transition: "border-color .15s, box-shadow .15s",
            }}
            className="card-hover"
          >
            <SocietyAvatar name={s.name} logoUrl={s.logo_url} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--bm-text-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {s.name}
              </div>
              <div
                style={{
                  marginTop: 3,
                  fontSize: 12,
                  color: "var(--bm-text-tertiary)",
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                {s.conference_count > 0 ? (
                  <span>예정 {s.conference_count}건</span>
                ) : (
                  <span>예정 일정 없음</span>
                )}
                {s.website_url && (
                  <ExternalIcon style={{ width: 11, height: 11, opacity: 0.5 }} />
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
