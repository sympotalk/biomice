"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getDepartmentColor } from "@/lib/departments";

type DeptCount = { department: string; count: number };

export function DepartmentFilterTabs({ counts }: { counts: DeptCount[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("department") ?? "";

  if (counts.length === 0) return null;

  function navigate(dept: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (dept) {
      params.set("department", dept);
    } else {
      params.delete("department");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        overflowX: "auto",
        padding: "2px 0 8px",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {/* 전체 탭 */}
      <button
        type="button"
        onClick={() => navigate("")}
        style={{
          flexShrink: 0,
          height: 30,
          padding: "0 14px",
          borderRadius: 999,
          border: current === "" ? "2px solid var(--bm-primary)" : "1px solid var(--bm-border)",
          background: current === "" ? "var(--bm-primary-subtle)" : "var(--bm-surface)",
          color: current === "" ? "var(--bm-primary)" : "var(--bm-text-secondary)",
          fontSize: 13,
          fontWeight: current === "" ? 700 : 500,
          cursor: "pointer",
          transition: "all .12s",
        }}
      >
        전체
      </button>

      {counts.map(({ department, count }) => {
        const active = current === department;
        const color = getDepartmentColor(department);
        return (
          <button
            key={department}
            type="button"
            onClick={() => navigate(department)}
            style={{
              flexShrink: 0,
              height: 30,
              padding: "0 14px",
              borderRadius: 999,
              border: active ? `2px solid ${color}` : "1px solid var(--bm-border)",
              background: active ? color : "var(--bm-surface)",
              color: active ? "#fff" : "var(--bm-text-secondary)",
              fontSize: 13,
              fontWeight: active ? 700 : 500,
              cursor: "pointer",
              transition: "all .12s",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            {department}
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                opacity: 0.75,
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
