"use client";

import { useState, useTransition, type MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { HeartIcon } from "./Icon";
import { toggleBookmark } from "@/app/actions/bookmarks";

type Props = {
  /** Current bookmark state (server-provided). */
  active?: boolean;
  /** Conference id used when toggling via server action. Required for logged-in toggling. */
  conferenceId?: number;
  /** If false, clicking triggers an optimistic local toggle only (used in guest previews). */
  interactive?: boolean;
  size?: number;
};

export function FavoriteHeart({
  active,
  conferenceId,
  interactive = true,
  size = 36,
}: Props) {
  const pathname = usePathname();
  const [hov, setHov] = useState(false);
  const [burst, setBurst] = useState(false);
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const [isPending, startTransition] = useTransition();

  const effectiveActive = optimistic ?? active ?? false;

  const handle = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!interactive) return;

    if (!effectiveActive) {
      setBurst(true);
      setTimeout(() => setBurst(false), 400);
    }

    if (conferenceId != null) {
      // Optimistic UI flip
      setOptimistic(!effectiveActive);
      startTransition(async () => {
        const res = await toggleBookmark(conferenceId, pathname);
        if (res && "error" in res) {
          // Roll back on failure
          setOptimistic(effectiveActive);
        } else if (res && "bookmarked" in res) {
          setOptimistic(res.bookmarked);
        }
      });
    } else {
      setOptimistic(!effectiveActive);
    }
  };

  return (
    <button
      type="button"
      onClick={handle}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      aria-label={effectiveActive ? "즐겨찾기 해제" : "즐겨찾기"}
      aria-pressed={effectiveActive}
      disabled={isPending}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: "none",
        cursor: interactive ? "pointer" : "default",
        background: hov && interactive ? "var(--bm-bg-muted)" : "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: effectiveActive ? "var(--bm-favorite)" : "var(--bm-text-tertiary)",
        transition: "all .14s",
        position: "relative",
        opacity: isPending ? 0.6 : 1,
      }}
    >
      <HeartIcon
        filled={effectiveActive}
        style={{
          transform: burst ? "scale(1.25)" : "scale(1)",
          transition: "transform .25s cubic-bezier(.2,1.6,.5,1)",
        }}
      />
    </button>
  );
}
