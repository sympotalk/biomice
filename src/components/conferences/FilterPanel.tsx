"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SpecialtyChip } from "@/components/ui/Chip";

type Props = {
  categories: { category: string; count: number }[];
  cities: { city: string; count: number }[];
  currentCategory?: string;
  currentCity?: string;
  currentDate?: string; // "this-month" | "next-month" | "3-months" | ""
};

const DATE_OPTIONS = [
  { label: "이번 달", value: "this-month" },
  { label: "다음 달", value: "next-month" },
  { label: "3개월", value: "3-months" },
  { label: "6개월", value: "6-months" },
];

export function FilterPanel({
  categories,
  cities,
  currentCategory,
  currentCity,
  currentDate,
}: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const go = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v);
      else params.delete(k);
    }
    params.delete("page");
    router.push(`/conferences${params.size ? `?${params.toString()}` : ""}`);
  };

  const hasFilters = currentCategory || currentCity || currentDate;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* 전문과목 */}
      {categories.length > 0 && (
        <div>
          <div style={sectionLabel}>전문과목</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <SpecialtyChip
              label="전체"
              active={!currentCategory}
              onClick={() => go({ category: undefined })}
            />
            {categories.map((c) => (
              <SpecialtyChip
                key={c.category}
                label={c.category}
                count={c.count}
                active={currentCategory === c.category}
                onClick={() =>
                  go({ category: currentCategory === c.category ? undefined : c.category })
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* 도시 */}
      {cities.length > 0 && (
        <div>
          <div style={sectionLabel}>개최 도시</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <SpecialtyChip
              label="전체"
              active={!currentCity}
              onClick={() => go({ city: undefined })}
            />
            {cities.map((c) => (
              <SpecialtyChip
                key={c.city}
                label={c.city}
                count={c.count}
                active={currentCity === c.city}
                onClick={() =>
                  go({ city: currentCity === c.city ? undefined : c.city })
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* 날짜 범위 */}
      <div>
        <div style={sectionLabel}>기간</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <SpecialtyChip
            label="전체"
            active={!currentDate}
            onClick={() => go({ date: undefined })}
          />
          {DATE_OPTIONS.map((d) => (
            <SpecialtyChip
              key={d.value}
              label={d.label}
              active={currentDate === d.value}
              onClick={() =>
                go({ date: currentDate === d.value ? undefined : d.value })
              }
            />
          ))}
        </div>
      </div>

      {/* 필터 초기화 */}
      {hasFilters && (
        <div>
          <button
            type="button"
            onClick={() =>
              go({ category: undefined, city: undefined, date: undefined, q: undefined })
            }
            style={{
              fontSize: 12,
              color: "var(--bm-text-tertiary)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px 0",
              textDecoration: "underline",
            }}
          >
            필터 전체 초기화
          </button>
        </div>
      )}
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "var(--bm-text-tertiary)",
  textTransform: "uppercase",
  letterSpacing: 0.8,
  marginBottom: 8,
};
