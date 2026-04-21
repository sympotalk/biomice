import type { ReactNode } from "react";
import { EmptyIcon } from "./Icon";

type Props = {
  title?: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({
  title = "학술대회를 찾을 수 없습니다",
  description = "검색어를 변경하거나 필터를 초기화해 보세요.",
  action,
}: Props) {
  return (
    <div
      style={{
        padding: "48px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 16,
      }}
    >
      <div style={{ color: "var(--bm-text-tertiary)", opacity: 0.7 }}>
        <EmptyIcon />
      </div>
      <div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "var(--bm-text-primary)",
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div
          style={{ fontSize: 13, color: "var(--bm-text-secondary)", maxWidth: 320 }}
        >
          {description}
        </div>
      </div>
      {action}
    </div>
  );
}
