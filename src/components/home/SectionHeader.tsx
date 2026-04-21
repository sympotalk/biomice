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
  actionLabel = "전체 보기",
  actionHref,
}: Props) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 20,
        gap: 16,
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: -0.4,
            color: "var(--bm-text-primary)",
          }}
        >
          {title}
        </h2>
        {caption && (
          <div
            style={{
              fontSize: 13,
              color: "var(--bm-text-secondary)",
              marginTop: 4,
            }}
          >
            {caption}
          </div>
        )}
      </div>
      {actionHref && (
        <Link
          href={actionHref}
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--bm-primary)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            whiteSpace: "nowrap",
          }}
        >
          {actionLabel}
          <ChevronRightIcon />
        </Link>
      )}
    </div>
  );
}
