"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { MyDoctor } from "@/app/actions/myDoctors";
import { createMemo, updateMemo, type MemoType, type VisitMemo } from "@/app/actions/memos";
import { MEMO_TYPE_LABELS } from "./constants";

const MEMO_TYPES: MemoType[] = ["visit", "meeting", "note"];

type Props = {
  myDoctors: MyDoctor[];
  existing?: VisitMemo;
};

export function MemoForm({ myDoctors, existing }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [memoType, setMemoType] = useState<MemoType>(existing?.memo_type ?? "visit");
  const [visitDate, setVisitDate] = useState(existing?.visit_date ?? new Date().toISOString().slice(0, 10));
  const [doctorId, setDoctorId] = useState<string>(existing?.doctor_id?.toString() ?? "");
  const [content, setContent] = useState(existing?.content ?? "");
  const [isShared, setIsShared] = useState(existing?.is_shared ?? false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) { setError("내용을 입력해주세요."); return; }
    setError(null);

    startTransition(async () => {
      let result;
      if (existing) {
        result = await updateMemo(existing.id, content);
        if (!result.error) router.push("/memos");
      } else {
        result = await createMemo({
          doctorId: doctorId ? parseInt(doctorId) : undefined,
          memoType,
          visitDate,
          content,
          isShared,
        });
        if (!result.error) router.push("/memos");
      }
      if (result.error) setError(result.error);
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* 유형 */}
      {!existing && (
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>유형</label>
          <div style={{ display: "flex", gap: 8 }}>
            {MEMO_TYPES.map((t) => {
              const info = MEMO_TYPE_LABELS[t];
              const isActive = memoType === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMemoType(t)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: 999,
                    border: isActive ? "none" : "1px solid var(--bm-border)",
                    background: isActive ? info.bg : "var(--bm-surface)",
                    color: isActive ? info.color : "var(--bm-text-secondary)",
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    cursor: "pointer",
                    transition: "all .1s",
                  }}
                >
                  {info.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 날짜 */}
      {!existing && (
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>날짜</label>
          <input
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid var(--bm-border)",
              background: "var(--bm-surface)",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>
      )}

      {/* 의료진 */}
      {!existing && (
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>
            의료진 <span style={{ fontSize: 12, fontWeight: 400, color: "var(--bm-text-tertiary)" }}>(선택)</span>
          </label>
          <select
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid var(--bm-border)",
              background: "var(--bm-surface)",
              fontSize: 13,
              outline: "none",
              width: "100%",
            }}
          >
            <option value="">의료진 없음</option>
            {myDoctors.map((md) => {
              const doc = md.hospital_doctors;
              if (!doc) return null;
              const hospital = doc.hospitals?.name ?? "";
              return (
                <option key={md.doctor_id} value={md.doctor_id.toString()}>
                  {hospital ? `[${hospital}] ` : ""}{doc.name}{doc.department ? ` — ${doc.department}` : ""}
                </option>
              );
            })}
          </select>
          {myDoctors.length === 0 && (
            <p style={{ fontSize: 12, color: "var(--bm-text-tertiary)", marginTop: 4 }}>
              내 의료진을 먼저 등록하면 여기서 선택할 수 있습니다.
            </p>
          )}
        </div>
      )}

      {/* 내용 */}
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="메모 내용을 입력하세요…"
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid var(--bm-border)",
            background: "var(--bm-surface)",
            fontSize: 14,
            lineHeight: 1.6,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* 팀 공유 */}
      {!existing && (
        <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
          <input
            type="checkbox"
            checked={isShared}
            onChange={(e) => setIsShared(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: "var(--bm-primary)" }}
          />
          <span style={{ fontSize: 13 }}>팀에 공유</span>
        </label>
      )}

      {error && (
        <div style={{ fontSize: 13, color: "#E05151", background: "#FEF2F2", padding: "10px 14px", borderRadius: 8 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button
          type="submit"
          disabled={isPending}
          style={{
            flex: 1,
            padding: "12px 0",
            background: "var(--bm-primary)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 700,
            cursor: isPending ? "not-allowed" : "pointer",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {isPending ? "저장 중…" : existing ? "수정 완료" : "메모 저장"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/memos")}
          style={{
            padding: "12px 20px",
            background: "var(--bm-bg-muted)",
            color: "var(--bm-text-secondary)",
            border: "none",
            borderRadius: 10,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          취소
        </button>
      </div>
    </form>
  );
}
