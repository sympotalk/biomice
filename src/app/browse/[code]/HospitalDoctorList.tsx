"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Doctor = {
  id: number;
  external_id: string;
  name: string;
  department: string | null;
  specialty: string | null;
  position: string | null;
  profile_url: string | null;
  notes: string | null;
};

type ScheduleDay = ("AM" | "PM" | "휴진")[];

type ScheduleRaw = {
  weekdays: Record<string, ScheduleDay>;
  updatedAt?: string;
} | null;

const WEEKDAYS = ["월", "화", "수", "목", "금", "토"];

function ScheduleCell({ slots }: { slots?: ScheduleDay }) {
  if (!slots || slots.length === 0)
    return <td style={{ textAlign: "center", color: "var(--bm-text-tertiary)", fontSize: 11 }}>—</td>;
  return (
    <td style={{ textAlign: "center", padding: "4px 2px" }}>
      {slots.map((s, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            fontSize: 10,
            fontWeight: 600,
            padding: "1px 5px",
            borderRadius: 4,
            margin: "1px",
            background: s === "AM" ? "#E8F4FD" : s === "PM" ? "#E8F9EE" : "#F5F5F5",
            color: s === "AM" ? "#1A73E8" : s === "PM" ? "#1A8A4A" : "#999",
          }}
        >
          {s}
        </span>
      ))}
    </td>
  );
}

function ScheduleModal({ doctor, code, onClose }: { doctor: Doctor; code: string; onClose: () => void }) {
  const [schedule, setSchedule] = useState<ScheduleRaw>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/hospitals/${code}/doctors/${doctor.external_id}/schedule`)
      .then((r) => r.json())
      .then((d) => setSchedule(d.schedule))
      .catch(() => setSchedule(null))
      .finally(() => setLoading(false));
  }, [code, doctor.external_id]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bm-surface)",
          borderRadius: 14,
          padding: 24,
          maxWidth: 480,
          width: "100%",
          boxShadow: "0 8px 32px rgba(0,0,0,.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{doctor.name}</div>
            {doctor.department && (
              <div style={{ fontSize: 13, color: "var(--bm-text-secondary)", marginTop: 2 }}>
                {doctor.department}{doctor.position ? ` · ${doctor.position}` : ""}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "var(--bm-text-tertiary)", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {doctor.specialty && (
          <div style={{ fontSize: 12, color: "var(--bm-text-secondary)", marginBottom: 14, background: "var(--bm-bg-muted)", padding: "6px 10px", borderRadius: 8 }}>
            {doctor.specialty}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--bm-text-tertiary)", fontSize: 13 }}>진료시간 로딩 중…</div>
        ) : schedule?.weekdays ? (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr>
                <th style={{ padding: "4px 8px", background: "var(--bm-bg-muted)", borderRadius: 4, fontSize: 11 }}>요일</th>
                {WEEKDAYS.map((d) => (
                  <th key={d} style={{ padding: "4px 6px", background: "var(--bm-bg-muted)", fontSize: 11, textAlign: "center" }}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "6px 8px", fontSize: 11, color: "var(--bm-text-secondary)" }}>진료</td>
                {WEEKDAYS.map((d) => (
                  <ScheduleCell key={d} slots={schedule.weekdays[d]} />
                ))}
              </tr>
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0", color: "var(--bm-text-tertiary)", fontSize: 13 }}>
            진료시간 정보를 가져올 수 없습니다.
          </div>
        )}

        {doctor.notes && (
          <div style={{ marginTop: 12, fontSize: 12, color: "#E07020", background: "#FFF8F0", padding: "8px 12px", borderRadius: 8 }}>
            ⚠ {doctor.notes}
          </div>
        )}

        {doctor.profile_url && (
          <a
            href={doctor.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block", marginTop: 14, textAlign: "center", fontSize: 13, color: "var(--bm-primary)", textDecoration: "none" }}
          >
            병원 공식 프로필 보기 →
          </a>
        )}
      </div>
    </div>
  );
}

export function HospitalDoctorList({ code, hospitalName }: { code: string; hospitalName: string }) {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hospitals/${code}/doctors`);
      if (res.status === 401) { router.push("/login?next=/browse"); return; }
      if (res.status === 403) { router.push("/"); return; }
      if (!res.ok) throw new Error("서버 오류");
      const data = await res.json();
      setDoctors(data.doctors ?? []);
    } catch {
      setError("의사 정보를 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, [code, router]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const filtered = doctors.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      (d.department ?? "").toLowerCase().includes(q) ||
      (d.specialty ?? "").toLowerCase().includes(q)
    );
  });

  const byDept = new Map<string, Doctor[]>();
  for (const d of filtered) {
    const dept = d.department ?? "기타";
    if (!byDept.has(dept)) byDept.set(dept, []);
    byDept.get(dept)!.push(d);
  }

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        <Link href="/browse" style={{ fontSize: 13, color: "var(--bm-text-secondary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
          ← 병원 목록
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 8 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: -0.4 }}>
              {hospitalName} 의료진
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--bm-text-secondary)" }}>
              총 {doctors.length}명
            </p>
          </div>
          <input
            type="text"
            placeholder="이름 · 진료과 · 전문분야 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px 14px",
              borderRadius: 24,
              border: "1px solid var(--bm-border)",
              background: "var(--bm-surface)",
              fontSize: 13,
              minWidth: 220,
              outline: "none",
            }}
          />
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--bm-text-tertiary)" }}>불러오는 중…</div>
      )}
      {error && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#E05151" }}>{error}</div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--bm-text-tertiary)" }}>
          {search ? "검색 결과가 없습니다." : "등록된 의사 정보가 없습니다."}
        </div>
      )}

      {[...byDept.entries()].map(([dept, list]) => (
        <section key={dept} style={{ marginBottom: 32 }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "var(--bm-text-primary)", display: "flex", alignItems: "center", gap: 8 }}>
            {dept}
            <span style={{ fontSize: 12, fontWeight: 500, color: "var(--bm-text-tertiary)" }}>{list.length}명</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
            {list.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoctor(doc)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  padding: 14,
                  background: "var(--bm-surface)",
                  border: "1px solid var(--bm-border)",
                  borderRadius: 10,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "border-color .12s",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--bm-text-primary)" }}>{doc.name}</div>
                {doc.position && (
                  <div style={{ fontSize: 11, color: "var(--bm-text-secondary)" }}>{doc.position}</div>
                )}
                {doc.specialty && (
                  <div style={{
                    fontSize: 11,
                    color: "var(--bm-text-tertiary)",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}>
                    {doc.specialty}
                  </div>
                )}
                <div style={{ fontSize: 11, color: "var(--bm-primary)", marginTop: 2 }}>진료시간 확인 →</div>
              </button>
            ))}
          </div>
        </section>
      ))}

      {selectedDoctor && (
        <ScheduleModal doctor={selectedDoctor} code={code} onClose={() => setSelectedDoctor(null)} />
      )}
    </>
  );
}
