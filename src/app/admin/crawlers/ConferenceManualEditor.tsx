"use client";

import { useState, useTransition } from "react";
import { updateConferenceManualFields } from "./actions";

type Row = {
  id: number;
  event_name: string;
  society_name: string;
  start_date: string;
  country_code: string;
  source_type: string;
  conference_type: string;
  is_kams_certified: boolean;
  related_korean_society: string | null;
  cme_credits_kr: number | null;
  cme_credits: number | null;
};

export function ConferenceManualEditor({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <div
        style={{
          padding: "24px 16px",
          background: "var(--bm-bg-muted)",
          borderRadius: 8,
          textAlign: "center",
          fontSize: 13,
          color: "var(--bm-text-tertiary)",
        }}
      >
        등록된 국제 학술대회가 없습니다. 먼저 위 어댑터를 실행해 데이터를
        수집하세요.
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--bm-surface)",
        border: "1px solid var(--bm-border)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1.6fr) 88px 80px 90px minmax(0, 1.2fr) 70px",
          gap: 12,
          padding: "10px 16px",
          background: "var(--bm-bg-muted)",
          fontSize: 11,
          fontWeight: 700,
          color: "var(--bm-text-tertiary)",
          textTransform: "uppercase",
          letterSpacing: 0.4,
        }}
      >
        <div>학술대회</div>
        <div>일자</div>
        <div>국가</div>
        <div>KAMS 인정</div>
        <div>연관 국내학회</div>
        <div>평점 (KR)</div>
      </div>

      {rows.map((r) => (
        <EditorRow key={r.id} row={r} />
      ))}
    </div>
  );
}

function EditorRow({ row }: { row: Row }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    cme_credits_kr: row.cme_credits_kr?.toString() ?? "",
    related_korean_society: row.related_korean_society ?? "",
    is_kams_certified: row.is_kams_certified,
  });
  const isDirty =
    draft.cme_credits_kr !== (row.cme_credits_kr?.toString() ?? "") ||
    draft.related_korean_society !== (row.related_korean_society ?? "") ||
    draft.is_kams_certified !== row.is_kams_certified;

  const submit = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", String(row.id));
      fd.set("cme_credits_kr", draft.cme_credits_kr);
      fd.set("related_korean_society", draft.related_korean_society);
      if (draft.is_kams_certified) fd.set("is_kams_certified", "on");
      const res = await updateConferenceManualFields(fd);
      if (res.error) {
        setError(res.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "minmax(0, 1.6fr) 88px 80px 90px minmax(0, 1.2fr) 70px",
        gap: 12,
        padding: "10px 16px",
        borderTop: "1px solid var(--bm-border)",
        alignItems: "center",
      }}
    >
      {/* 학술대회 이름 + 학회 + 출처 */}
      <div style={{ minWidth: 0, overflow: "hidden" }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--bm-text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {row.event_name}
        </div>
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            marginTop: 2,
          }}
        >
          <span
            style={{
              fontSize: 10,
              color: "var(--bm-text-tertiary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              minWidth: 0,
            }}
          >
            {row.society_name}
          </span>
          <span
            style={{
              fontSize: 9,
              padding: "1px 5px",
              background: "var(--bm-bg-muted)",
              color: "var(--bm-text-secondary)",
              borderRadius: 3,
              fontFamily: "var(--font-mono)",
            }}
          >
            {row.source_type}
          </span>
        </div>
      </div>

      {/* 일자 */}
      <div
        className="mono-num"
        style={{
          fontSize: 11,
          color: "var(--bm-text-secondary)",
        }}
      >
        {row.start_date}
      </div>

      {/* 국가 */}
      <div
        style={{
          fontSize: 11,
          color: "var(--bm-text-secondary)",
        }}
      >
        {row.country_code}
      </div>

      {/* KAMS 인정 toggle */}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          fontSize: 11,
        }}
      >
        <input
          type="checkbox"
          checked={draft.is_kams_certified}
          onChange={(e) =>
            setDraft((d) => ({ ...d, is_kams_certified: e.target.checked }))
          }
          disabled={isPending}
        />
        {draft.is_kams_certified ? "✓" : "—"}
      </label>

      {/* 연관 국내 학회 */}
      <input
        type="text"
        value={draft.related_korean_society}
        onChange={(e) =>
          setDraft((d) => ({ ...d, related_korean_society: e.target.value }))
        }
        placeholder="예: 대한심장학회"
        disabled={isPending}
        style={{
          width: "100%",
          minWidth: 0,
          height: 28,
          padding: "0 8px",
          border: "1px solid var(--bm-border)",
          borderRadius: 4,
          fontSize: 12,
          fontFamily: "inherit",
          outline: "none",
        }}
      />

      {/* 평점 (KR) + 저장 */}
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <input
          type="number"
          step="0.5"
          min="0"
          max="99"
          value={draft.cme_credits_kr}
          onChange={(e) =>
            setDraft((d) => ({ ...d, cme_credits_kr: e.target.value }))
          }
          disabled={isPending}
          style={{
            width: "100%",
            minWidth: 0,
            height: 28,
            padding: "0 6px",
            border: "1px solid var(--bm-border)",
            borderRadius: 4,
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            outline: "none",
            textAlign: "right",
          }}
        />
      </div>

      {/* 저장 버튼 — 별도 row */}
      {(isDirty || isPending || saved || error) && (
        <div
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 8,
            paddingTop: 4,
          }}
        >
          {error && (
            <span style={{ fontSize: 11, color: "var(--bm-danger)" }}>
              {error}
            </span>
          )}
          {saved && (
            <span style={{ fontSize: 11, color: "var(--bm-success)" }}>
              ✓ 저장됨
            </span>
          )}
          <button
            type="button"
            onClick={submit}
            disabled={!isDirty || isPending}
            style={{
              height: 26,
              padding: "0 12px",
              border: "none",
              borderRadius: 4,
              background: isDirty
                ? "var(--bm-primary)"
                : "var(--bm-bg-muted)",
              color: isDirty ? "#fff" : "var(--bm-text-tertiary)",
              fontSize: 11,
              fontWeight: 600,
              cursor: isDirty && !isPending ? "pointer" : "default",
              fontFamily: "inherit",
            }}
          >
            {isPending ? "저장 중..." : "저장"}
          </button>
        </div>
      )}
    </div>
  );
}
