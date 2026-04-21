"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SpecialtyChip } from "@/components/ui/Chip";

type Props = {
  categories: { category: string; count: number }[];
  current?: string;
};

export function FilterChips({ categories, current }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const go = (category?: string) => {
    const params = new URLSearchParams(sp.toString());
    if (category) params.set("category", category);
    else params.delete("category");
    params.delete("page");
    router.push(`/conferences${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <SpecialtyChip label="전체" active={!current} onClick={() => go()} />
      {categories.map((c) => (
        <SpecialtyChip
          key={c.category}
          label={c.category}
          count={c.count}
          active={current === c.category}
          onClick={() => go(c.category)}
        />
      ))}
    </div>
  );
}
