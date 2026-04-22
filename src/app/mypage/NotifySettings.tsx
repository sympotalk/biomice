"use client";

import { useTransition } from "react";
import { updateNotifySettings } from "./actions";

interface Props {
  enabled: boolean;
  days: number[];
}

const ALL_DAYS = [
  { value: 30, label: "30일 전" },
  { value: 14, label: "14일 전" },
  { value: 7, label: "7일 전" },
  { value: 3, label: "3일 전" },
  { value: 1, label: "1일 전 (당일 전날)" },
];

export function NotifySettings({ enabled, days }: Props) {
  const [pending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLFormElement>) {
    const fd = new FormData(e.currentTarget);
    startTransition(() => updateNotifySettings(fd));
  }

  return (
    <section
      style={{
        background: "var(--bm-surface)",
        border: "1px solid var(--bm-border)",
        borderRadius: 12,
        padding: 24,
        marginBottom: 32,
        opacity: pending ? 0.6 : 1,
        transition: "opacity .15s",
      }}
    >
      <h2
        style={{
          margin: "0 0 16px",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: -0.3,
          color: "var(--bm-text-primary)",
        }}
      >
        이메일 알림 설정
      </h2>

      <form onChange={handleChange}>
        {/* 알림 전체 on/off */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            marginBottom: 20,
          }}
        >
          <input
            type="checkbox"
            name="notify_enabled"
            value="1"
            defaultChecked={enabled}
            style={{ width: 18, height: 18, accentColor: "var(--bm-primary)", cursor: "pointer" }}
          />
          <span style={{ fontSize: 15, fontWeight: 500, color: "var(--bm-text-primary)" }}>
            즐겨찾기 학술대회 이메일 알림 받기
          </span>
        </label>

        {/* 알림 시점 선택 */}
        <div
          style={{
            paddingLeft: 28,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "var(--bm-text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 4,
            }}
          >
            알림 시점
          </div>
          {ALL_DAYS.map(({ value, label }) => (
            <label
              key={value}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name="notify_days"
                value={String(value)}
                defaultChecked={days.includes(value)}
                style={{ width: 16, height: 16, accentColor: "var(--bm-primary)", cursor: "pointer" }}
              />
              <span style={{ fontSize: 14, color: "var(--bm-text-secondary)" }}>
                {label}
              </span>
            </label>
          ))}
        </div>

        {/* hidden: 체크박스가 하나도 없을 때 enabled=false 보장 */}
        <input type="hidden" name="_dummy" value="1" />
      </form>

      {pending && (
        <div
          style={{
            marginTop: 12,
            fontSize: 12,
            color: "var(--bm-text-tertiary)",
          }}
        >
          저장 중…
        </div>
      )}
    </section>
  );
}
