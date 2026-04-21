"use client";

import { useState, type KeyboardEvent } from "react";
import { SearchIcon } from "./Icon";
import { radius } from "@/lib/tokens";

type Props = {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  onSubmit?: (v: string) => void;
  size?: "md" | "lg";
};

export function SearchBar({
  placeholder = "학회명, 주제, 학회 사무국 검색",
  value = "",
  onChange,
  onSubmit,
  size = "md",
}: Props) {
  const [focused, setFocused] = useState(false);
  const [internal, setInternal] = useState(value);
  const current = onChange ? value : internal;
  const h = size === "lg" ? 48 : 40;

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmit?.(current);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        height: h,
        padding: "0 14px",
        background: "var(--bm-bg)",
        border: `1.5px solid ${focused ? "var(--bm-primary)" : "var(--bm-border)"}`,
        borderRadius: radius.input,
        transition: "border-color .14s",
        boxShadow: focused ? "0 0 0 3px rgba(26,111,170,0.12)" : "none",
      }}
    >
      <SearchIcon style={{ color: "var(--bm-text-tertiary)" }} />
      <input
        value={current}
        onChange={(e) => (onChange ? onChange(e.target.value) : setInternal(e.target.value))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: 14,
          color: "var(--bm-text-primary)",
          fontFamily: "inherit",
        }}
      />
    </div>
  );
}
