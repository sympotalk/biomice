"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ViewToggle({ current }: { current: "grid" | "calendar" }) {
  const router = useRouter();
  const sp = useSearchParams();

  const go = (view: "grid" | "calendar") => {
    const params = new URLSearchParams(sp.toString());
    if (view === "grid") params.delete("view");
    else params.set("view", "calendar");
    params.delete("page");
    router.push(`/conferences${params.size ? `?${params.toString()}` : ""}`);
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 2,
        background: "var(--bm-surface)",
        border: "1px solid var(--bm-border)",
        borderRadius: 8,
        padding: 3,
      }}
    >
      <ToggleBtn
        icon={<GridIcon />}
        label="그리드"
        active={current === "grid"}
        onClick={() => go("grid")}
      />
      <ToggleBtn
        icon={<CalendarIcon />}
        label="캘린더"
        active={current === "calendar"}
        onClick={() => go("calendar")}
      />
    </div>
  );
}

function ToggleBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: 6,
        border: "none",
        cursor: "pointer",
        background: active ? "var(--bm-primary)" : "transparent",
        color: active ? "#fff" : "var(--bm-text-tertiary)",
        transition: "background .15s, color .15s",
      }}
    >
      {icon}
    </button>
  );
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor" />
      <rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor" />
      <rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor" />
      <rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1 6h12" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 1v2M10 1v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="4.5" cy="9" r="1" fill="currentColor" />
      <circle cx="7" cy="9" r="1" fill="currentColor" />
      <circle cx="9.5" cy="9" r="1" fill="currentColor" />
    </svg>
  );
}
