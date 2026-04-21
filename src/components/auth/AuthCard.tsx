import type { ReactNode } from "react";

type Props = {
  title: string;
  caption?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ title, caption, children, footer }: Props) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 420,
        margin: "0 auto",
        padding: "32px 28px",
        background: "var(--bm-surface)",
        border: "1px solid var(--bm-border)",
        borderRadius: 12,
        boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: -0.3,
          color: "var(--bm-text-primary)",
          textAlign: "center",
        }}
      >
        {title}
      </h1>
      {caption && (
        <p
          style={{
            margin: "8px 0 28px",
            fontSize: 13,
            color: "var(--bm-text-secondary)",
            textAlign: "center",
          }}
        >
          {caption}
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
      {footer && (
        <div
          style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: "1px solid var(--bm-border)",
            fontSize: 13,
            color: "var(--bm-text-secondary)",
            textAlign: "center",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

export function AuthField({
  id,
  label,
  type = "text",
  required,
  autoComplete,
  placeholder,
  defaultValue,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label
      htmlFor={id}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        fontSize: 13,
        fontWeight: 500,
        color: "var(--bm-text-primary)",
      }}
    >
      {label}
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
        style={{
          height: 44,
          padding: "0 14px",
          fontSize: 14,
          fontFamily: "inherit",
          color: "var(--bm-text-primary)",
          background: "var(--bm-bg)",
          border: "1.5px solid var(--bm-border)",
          borderRadius: 6,
          outline: "none",
        }}
      />
    </label>
  );
}
