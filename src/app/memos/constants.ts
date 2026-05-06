import type { MemoType } from "@/app/actions/memos";

export const MEMO_TYPE_LABELS: Record<MemoType, { label: string; color: string; bg: string }> = {
  visit: { label: "방문", color: "#1A73E8", bg: "#E8F4FD" },
  meeting: { label: "회의", color: "#7B5EA7", bg: "#F3EEFF" },
  note: { label: "노트", color: "#2D9D5A", bg: "#E8F9EE" },
};
