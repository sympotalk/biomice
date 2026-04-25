import type { ReactNode, CSSProperties } from "react";

// ─── AuthCard ─────────────────────────────────────────────────────────────────

type CardProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, children }: CardProps) {
  return (
    <div
      style={{
        background: "var(--bm-surface)",
        border: "1px solid var(--bm-border)",
        borderRadius: 12,
        padding: 32,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {title && (
        <h1
          style={{
            margin: "0 0 6px",
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: -0.4,
            color: "var(--bm-text-primary)",
          }}
        >
          {title}
        </h1>
      )}
      {subtitle && (
        <p
          style={{
            margin: "0 0 28px",
            fontSize: 13,
            color: "var(--bm-text-secondary)",
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

type FieldProps = {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
  style?: CSSProperties;
};

export function Field({
  label,
  required,
  hint,
  error,
  actionLabel,
  onAction,
  children,
  style,
}: FieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      {label && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--bm-text-secondary)" }}>
            {label}{" "}
            {required && (
              <span style={{ color: "var(--bm-danger)" }}>*</span>
            )}
          </label>
          {actionLabel && (
            <button
              type="button"
              onClick={onAction}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--bm-primary)",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                padding: 0,
              }}
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
      {children}
      {hint && !error && (
        <div style={{ fontSize: 11, color: "var(--bm-text-tertiary)" }}>{hint}</div>
      )}
      {error && (
        <div
          style={{
            fontSize: 11,
            color: "var(--bm-danger)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 11 11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <circle cx="5.5" cy="5.5" r="4" />
            <path d="M5.5 3.5v2.5M5.5 7.5v.5" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}

// ─── TextInput ────────────────────────────────────────────────────────────────

type TextInputProps = {
  name?: string;
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  suffix?: ReactNode;
  error?: boolean;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
};

export function TextInput({
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  suffix,
  error,
  disabled,
  required,
  autoComplete,
  defaultValue,
}: TextInputProps) {
  return (
    <div style={{ position: "relative" }}>
      <input
        name={name}
        type={type}
        value={value}
        defaultValue={defaultValue}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        style={{
          width: "100%",
          height: 44,
          padding: suffix ? "0 90px 0 14px" : "0 14px",
          borderRadius: 4,
          border: `1px solid ${error ? "var(--bm-danger)" : "var(--bm-border)"}`,
          background: disabled ? "var(--bm-bg-muted)" : "var(--bm-bg)",
          fontSize: 14,
          color: "var(--bm-text-primary)",
          fontFamily: "inherit",
          boxSizing: "border-box",
          outline: "none",
          transition: "border-color .12s",
        }}
        onFocus={(e) => {
          if (!error) e.currentTarget.style.borderColor = "var(--bm-primary)";
        }}
        onBlur={(e) => {
          if (!error) e.currentTarget.style.borderColor = "var(--bm-border)";
        }}
      />
      {suffix}
    </div>
  );
}

// ─── AuthField (backward-compat) ─────────────────────────────────────────────
// Legacy wrapper used by PharmaInquiryForm — combines Field + TextInput

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
    <Field label={label} required={required}>
      <TextInput
        name={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    </Field>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function AuthDivider({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        color: "var(--bm-text-tertiary)",
        fontSize: 11,
        margin: "4px 0",
      }}
    >
      <div style={{ flex: 1, height: 1, background: "var(--bm-border)" }} />
      <span>{label}</span>
      <div style={{ flex: 1, height: 1, background: "var(--bm-border)" }} />
    </div>
  );
}

// ─── Social buttons ───────────────────────────────────────────────────────────

export function GoogleButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 44,
        border: "1px solid var(--bm-border)",
        borderRadius: 6,
        background: "var(--bm-bg)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontSize: 13,
        fontWeight: 600,
        color: "var(--bm-text-primary)",
        fontFamily: "inherit",
        width: "100%",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16">
        <path
          fill="#4285F4"
          d="M15.68 8.18c0-.57-.05-1.11-.15-1.64H8v3.1h4.3c-.18 1-.75 1.84-1.6 2.41v2h2.59c1.52-1.4 2.39-3.46 2.39-5.87z"
        />
        <path
          fill="#34A853"
          d="M8 16c2.16 0 3.97-.72 5.29-1.95l-2.59-2c-.72.48-1.63.77-2.7.77-2.08 0-3.84-1.4-4.47-3.29H.86v2.07A8 8 0 0 0 8 16z"
        />
        <path
          fill="#FBBC04"
          d="M3.53 9.53A4.8 4.8 0 0 1 3.28 8c0-.53.09-1.05.25-1.53V4.4H.86A8 8 0 0 0 0 8c0 1.29.31 2.51.86 3.6l2.67-2.07z"
        />
        <path
          fill="#EA4335"
          d="M8 3.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 8 0 8 8 0 0 0 .86 4.4l2.67 2.07C4.16 4.58 5.92 3.18 8 3.18z"
        />
      </svg>
      Google로 계속
    </button>
  );
}

export function KakaoButton({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        height: 44,
        border: "none",
        borderRadius: 6,
        background: "#FEE500",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontSize: 13,
        fontWeight: 700,
        color: "#191600",
        fontFamily: "inherit",
        width: "100%",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="#191600">
        <path d="M9 2C4.58 2 1 4.86 1 8.39c0 2.28 1.49 4.28 3.73 5.4-.16.56-.6 2.17-.69 2.52 0 0-.01.12.06.17.08.05.17.01.17.01.23-.03 2.67-1.73 3.09-2.02.5.07 1.02.11 1.54.11 4.42 0 8-2.86 8-6.39C17 4.86 13.42 2 9 2z" />
      </svg>
      카카오로 계속
    </button>
  );
}
