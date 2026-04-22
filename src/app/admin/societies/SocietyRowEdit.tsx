"use client";

import { useState, useTransition } from "react";
import { updateSocietyLogoUrl, updateSocietyVerified } from "./actions";

export function SocietyRowEdit({
  id,
  logoUrl,
  isVerified,
}: {
  id: number;
  logoUrl: string | null;
  isVerified: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(logoUrl ?? "");

  const save = () => {
    startTransition(async () => {
      await updateSocietyLogoUrl(id, draft);
      setEditing(false);
    });
  };

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      {editing ? (
        <>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="https://icons.duckduckgo.com/ip3/example.or.kr.ico"
            style={{
              padding: "4px 8px",
              borderRadius: 4,
              border: "1px solid var(--bm-border)",
              fontSize: 11,
              width: 280,
              background: "var(--bm-bg)",
              color: "var(--bm-text-primary)",
            }}
          />
          <button
            type="button"
            disabled={pending}
            onClick={save}
            style={actionBtn("var(--bm-primary)", "#fff", pending)}
          >
            저장
          </button>
          <button
            type="button"
            onClick={() => { setEditing(false); setDraft(logoUrl ?? ""); }}
            style={actionBtn("transparent", "var(--bm-text-secondary)", false)}
          >
            취소
          </button>
        </>
      ) : (
        <>
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              width={20}
              height={20}
              style={{ borderRadius: 3, objectFit: "contain", background: "white" }}
            />
          ) : (
            <span style={{ fontSize: 11, color: "var(--bm-text-tertiary)" }}>로고 없음</span>
          )}
          <button
            type="button"
            onClick={() => setEditing(true)}
            style={actionBtn("var(--bm-bg)", "var(--bm-text-primary)", false)}
          >
            수정
          </button>
        </>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => startTransition(() => updateSocietyVerified(id, isVerified))}
        style={actionBtn(
          isVerified ? "var(--bm-accent-subtle)" : "var(--bm-bg)",
          isVerified ? "var(--bm-accent)" : "var(--bm-text-tertiary)",
          pending,
        )}
      >
        {isVerified ? "✓ 인증됨" : "인증"}
      </button>
    </div>
  );
}

function actionBtn(
  bg: string,
  color: string,
  disabled: boolean,
): React.CSSProperties {
  return {
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: 4,
    border: "1px solid var(--bm-border)",
    background: bg,
    color,
    cursor: disabled ? "default" : "pointer",
    opacity: disabled ? 0.5 : 1,
    fontWeight: 500,
  };
}
