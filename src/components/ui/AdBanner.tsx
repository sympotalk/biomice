import { Button } from "./Button";
import { ExternalIcon } from "./Icon";
import { radius } from "@/lib/tokens";

type Size = "wide" | "square" | "mini" | "compact";

type Props = {
  size?: Size;
  label?: string;
  sponsor?: string;
  title?: string;
  cta?: string;
  href?: string;
};

const DIMS: Record<Size, { h: number }> = {
  wide: { h: 120 },
  square: { h: 240 },
  mini: { h: 72 },
  compact: { h: 72 },
};

export function AdBanner({
  size = "wide",
  label = "AD",
  sponsor,
  title,
  cta,
  href,
}: Props) {
  const d = DIMS[size];
  const isCompact = size === "compact" || size === "mini";

  const inner = (
    <div
      style={{
        position: "relative",
        height: d.h,
        width: "100%",
        background:
          size === "compact"
            ? "var(--bm-bg)"
            : "linear-gradient(135deg, #F8F4EC 0%, #F0E6D2 100%)",
        border:
          size === "compact"
            ? "1px dashed var(--bm-border-strong)"
            : "1px solid var(--bm-border)",
        borderRadius: radius.card,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        padding: isCompact ? "0 14px" : "0 24px",
        gap: 12,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 8,
          right: 10,
          fontSize: 9,
          fontWeight: 600,
          color: "var(--bm-text-tertiary)",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </span>
      <div
        style={{
          width: isCompact ? 44 : 56,
          height: isCompact ? 44 : 56,
          flexShrink: 0,
          background:
            size === "compact"
              ? "linear-gradient(135deg,var(--bm-primary),var(--bm-success))"
              : "var(--bm-accent)",
          color: "#fff",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: isCompact ? 16 : 18,
          fontWeight: 700,
          fontFamily: "var(--font-mono)",
        }}
      >
        {(sponsor || "Rx").slice(0, 2).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {sponsor && (
          <div
            style={{
              fontSize: 11,
              color: "var(--bm-text-tertiary)",
              marginBottom: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {sponsor}
          </div>
        )}
        <div
          style={{
            fontSize: isCompact ? 13 : 15,
            fontWeight: 600,
            color: "var(--bm-text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
          {size === "compact" && (
            <span
              style={{
                color: "var(--bm-primary)",
                marginLeft: 4,
                fontWeight: 600,
              }}
            >
              →
            </span>
          )}
        </div>
      </div>
      {!isCompact && cta && (
        <Button variant="outline" size="sm" iconRight={<ExternalIcon />}>
          {cta}
        </Button>
      )}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        {inner}
      </a>
    );
  }
  return inner;
}
