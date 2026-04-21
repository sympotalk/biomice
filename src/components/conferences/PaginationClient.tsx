"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/Pagination";

type Props = {
  current: number;
  total: number;
};

export function PaginationClient({ current, total }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const go = (page: number) => {
    const params = new URLSearchParams(sp.toString());
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    router.push(`/conferences${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return <Pagination current={current} total={total} onChange={go} />;
}
