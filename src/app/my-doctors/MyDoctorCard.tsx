"use client";

import { useState, useTransition } from "react";
import type { MyDoctor } from "@/app/actions/myDoctors";
import { removeMyDoctor, updateDoctorGrade, updateDoctorMemo } from "@/app/actions/myDoctors";
import { GRADE_LABELS } from "./constants";

const GRADES = ["A", "B", "C", "D"] as const;

export function MyDoctorCard({ myDoctor }: { myDoctor: MyDoctor }) {
  const doc = myDoctor.hospital_doctors;
  const hospital = doc?.hospitals;
  const [grade, setGrade] = useState(myDoctor.visit_grade ?? "");
  const [memo, setMemo] = useState(myDoctor.memo ?? "");
  const [editingMemo, setEditingMemo] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!doc) return null;

  const handleGradeChange = (g: string) => {
    setGrade(g);
    startTransition(async () => { await updateDoctorGrade(myDoctor.doctor_id, g); });
  };

  const handleMemoSave = () => {
    setEditingMemo(false);
    startTransition(async () => { await updateDoctorMemo(myDoctor.doctor_id, memo); });
  };

  const handleRemove = () => {
    if (!confirm(`${doc.name}을(를) 내 의료진에서 제거하시겠습니까?`)) return;
    startTransition(async () => { await removeMyDoctor(myDoctor.doctor_id); });
  };

  const gradeInfo = grade ? GRADE_LABELS[grade] : null;

  return (
    <div style={{
      background: "var(--bm-surface)",
      border: "1px solid var(--bm-border)",
      borderRadius: 12,
      padding: "14px 16px",
      display: "flex",
      gap: 16,
      alignItems: "flex-start",
      opacity: isPending ? 0.7 : 1,
      transition: "opacity .15s",
    }}>
      {/* 등급 배지 */}
      <div style={{ flexShrink: 0 }}>
        {gradeInfo ? (
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: gradeInfo.bg,
            color: gradeInfo.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 800,
          }}>
            {grade}
          </div>
        ) : (
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--bm-bg-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            color: "var(--bm-text-tertiary)",
          }}>
            ?
          </div>
        )}
      </div>

      {/* 정보 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
          <div>
            <span style={{ fontSize: 15, fontWeight: 700 }}>{doc.name}</span>
            {doc.position && <span style={{ fontSize: 12, color: "var(--bm-text-secondary)", marginLeft: 6 }}>{doc.position}</span>}
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {hospital && (
              <a
                href={`/browse/${hospital.code}`}
                style={{ fontSize: 11, color: "var(--bm-primary)", textDecoration: "none" }}
              >
                {hospital.name}
              </a>
            )}
            <button
              onClick={handleRemove}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--bm-text-tertiary)", padding: 0 }}
            >
              제거
            </button>
          </div>
        </div>

        {doc.department && (
          <div style={{ fontSize: 12, color: "var(--bm-text-secondary)", marginTop: 2 }}>{doc.department}</div>
        )}
        {doc.specialty && (
          <div style={{ fontSize: 11, color: "var(--bm-text-tertiary)", marginTop: 3 }}>{doc.specialty}</div>
        )}

        {/* 등급 선택 */}
        <div style={{ display: "flex", gap: 5, marginTop: 10 }}>
          {GRADES.map((g) => {
            const info = GRADE_LABELS[g];
            return (
              <button
                key={g}
                onClick={() => handleGradeChange(g)}
                style={{
                  padding: "3px 10px",
                  borderRadius: 999,
                  border: grade === g ? "none" : "1px solid var(--bm-border)",
                  background: grade === g ? info.bg : "var(--bm-surface)",
                  color: grade === g ? info.color : "var(--bm-text-secondary)",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all .1s",
                }}
              >
                {g}등급
              </button>
            );
          })}
        </div>

        {/* 메모 */}
        <div style={{ marginTop: 10 }}>
          {editingMemo ? (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={2}
                style={{
                  flex: 1,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid var(--bm-border)",
                  background: "var(--bm-surface)",
                  fontSize: 12,
                  resize: "none",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <button
                  onClick={handleMemoSave}
                  style={{ padding: "4px 12px", background: "var(--bm-primary)", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
                >
                  저장
                </button>
                <button
                  onClick={() => { setEditingMemo(false); setMemo(myDoctor.memo ?? ""); }}
                  style={{ padding: "4px 12px", background: "var(--bm-bg-muted)", color: "var(--bm-text-secondary)", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setEditingMemo(true)}
              style={{
                fontSize: 12,
                color: memo ? "var(--bm-text-primary)" : "var(--bm-text-tertiary)",
                background: "var(--bm-bg-muted)",
                padding: "6px 10px",
                borderRadius: 8,
                cursor: "pointer",
                minHeight: 32,
              }}
            >
              {memo || "메모 추가 (클릭)"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
