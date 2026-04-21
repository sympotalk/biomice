import { Button } from "./Button";
import { ExternalIcon } from "./Icon";
import { radius } from "@/lib/tokens";

type Size = "wide" | "square" | "mini";

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
  const inner = (
    <div
      style={{
        position: "relative",
        height: d.h,
        width: "100%",
        background: "linear-gradient(135deg, #F8F4EC 0%, #F0E6D2 100%)",
        border: "1px solid var(--bm-border)",
        borderRadius: radius.card,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        padding: size === "mini" ? "0 16px" : "0 24px",
        gap: 16,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          fontSize: 10,
          fontWeight: 600,
          color: "var(--bm-text-tertiary)",
          background: "rgba(255,255,255,0.7)",
          padding: "2px 6px",
          borderRadius: 3,
          letterSpacing: 0.5,
        }}
      >
        {label}
      </span>
      <div
        style={{
          width: size === "mini" ? 40 : 56,
          height: size === "mini" ? 40 : 56,
          flexShrink: 0,
          background: "var(--bm-accent)",
          color: "#fff",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size === "mini" ? 14 : 18,
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
            }}
          >
            {sponsor}
          </div>
        )}
        <div
          style={{
            fontSize: size === "mini" ? 13 : 15,
            fontWeight: 600,
            color: "var(--bm-text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </div>
      </div>
      {size !== "mini" && cta && (
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
