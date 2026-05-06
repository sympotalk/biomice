"use client";

import { useTransition } from "react";
import Link from "next/link";
import type { VisitMemo } from "@/app/actions/memos";
import { deleteMemo } from "@/app/actions/memos";
import { MEMO_TYPE_LABELS } from "./constants";

export function MemoListItem({ memo }: { memo: VisitMemo }) {
  const [isPending, startTransition] = useTransition();
  const typeInfo = MEMO_TYPE_LABELS[memo.memo_type] ?? MEMO_TYPE_LABELS.note;
  const doctor = memo.hospital_doctors;
  const conference = memo.conferences;

  const handleDelete = () => {
    if (!confirm("이 메모를 삭제하시겠습니까?")) return;
    startTransition(async () => { await deleteMemo(memo.id); });
  };

  return (
    <div style={{
      background: "var(--bm-surface)",
      border: "1px solid var(--bm-border)",
      borderRadius: 12,
      padding: "14px 16px",
      opacity: isPending ? 0.6 : 1,
      transition: "opacity .15s",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            color: typeInfo.color,
            background: typeInfo.bg,
            padding: "2px 8px",
            borderRadius: 999,
          }}>
            {typeInfo.label}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--bm-text-primary)" }}>
            {new Date(memo.visit_date).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
          </span>
          {doctor && (
            <span style={{ fontSize: 12, color: "var(--bm-text-secondary)" }}>
              {doctor.hospitals && (
                <Link href={`/browse/${doctor.hospitals.code}`} style={{ color: "var(--bm-primary)", textDecoration: "none" }}>
                  {doctor.hospitals.name}
                </Link>
              )}{" · "}
              {doctor.name}
              {doctor.department && ` (${doctor.department})`}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <Link
            href={`/memos/${memo.id}`}
            style={{ fontSize: 12, color: "var(--bm-primary)", textDecoration: "none" }}
          >
            편집
          </Link>
          <button
            onClick={handleDelete}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--bm-text-tertiary)", padding: 0 }}
          >
            삭제
          </button>
        </div>
      </div>

      <div style={{ fontSize: 14, color: "var(--bm-text-primary)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
        {memo.content.length > 200 ? memo.content.slice(0, 200) + "…" : memo.content}
      </div>

      {conference && (
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--bm-text-secondary)" }}>
          학회: {conference.title}
        </div>
      )}

      {memo.is_shared && (
        <div style={{ marginTop: 6, fontSize: 11, color: "var(--bm-text-tertiary)" }}>👥 팀 공유됨</div>
      )}
    </div>
  );
}
