import Link from "next/link";
import { ChevronRightIcon } from "@/components/ui/Icon";

type Props = {
  title: string;
  caption?: string;
  actionLabel?: string;
  actionHref?: string;
};

export function SectionHeader({
  title,
  caption,
  actionLabel = "더보기",
  actionHref,
}: Props) {
  return (
    <div
      className="bm-section-header"
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 14,
        gap: 16,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h2 className="bm-section-h2">{title}</h2>
        {caption && <div className="bm-section-caption">{caption}</div>}
      </div>
      {actionHref && (
        <Link
          href={actionHref}
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: "var(--bm-primary)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            whiteSpace: "nowrap",
            padding: "6px 0",
          }}
        >
          {actionLabel}
          <ChevronRightIcon width={12} height={12} />
        </Link>
      )}
    </div>
  );
}
