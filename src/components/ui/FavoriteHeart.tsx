"use client";

import { useState, type MouseEvent } from "react";
import { HeartIcon } from "./Icon";

type Props = {
  active?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  size?: number;
};

export function FavoriteHeart({ active, onClick, size = 36 }: Props) {
  const [hov, setHov] = useState(false);
  const [burst, setBurst] = useState(false);

  const handle = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!active) {
      setBurst(true);
      setTimeout(() => setBurst(false), 400);
    }
    onClick?.(e);
  };

  return (
    <button
      type="button"
      onClick={handle}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      aria-label={active ? "즐겨찾기 해제" : "즐겨찾기"}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        background: hov ? "var(--bm-bg-muted)" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: active ? "var(--bm-favorite)" : "var(--bm-text-tertiary)",
        transition: "all .14s",
        position: "relative",
      }}
    >
      <HeartIcon
        filled={active}
        style={{
          transform: burst ? "scale(1.25)" : "scale(1)",
          transition: "transform .25s cubic-bezier(.2,1.6,.5,1)",
        }}
      />
    </button>
  );
}
