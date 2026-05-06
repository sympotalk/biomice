"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTeam, joinTeamByCode } from "@/app/actions/teams";

export function TeamCreateJoin({ hasTeam }: { hasTeam: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<"create" | "join">("create");
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) { setError("팀 이름을 입력해주세요."); return; }
    setError(null);
    startTransition(async () => {
      const result = await createTeam(teamName.trim());
      if (result.error) { setError(result.error); return; }
      if (result.team) router.push(`/team/${result.team.id}`);
    });
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) { setError("초대 코드를 입력해주세요."); return; }
    setError(null);
    startTransition(async () => {
      const result = await joinTeamByCode(inviteCode.trim());
      if (result.error) { setError(result.error); return; }
      router.push("/team");
    });
  };

  return (
    <div style={{
      background: "var(--bm-surface)",
      border: "1px solid var(--bm-border)",
      borderRadius: 14,
      padding: 24,
      maxWidth: 480,
    }}>
      <div style={{ display: "flex", gap: 0, marginBottom: 20, background: "var(--bm-bg-muted)", borderRadius: 10, padding: 3 }}>
        {(["create", "join"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setError(null); }}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: 8,
              border: "none",
              background: tab === t ? "var(--bm-surface)" : "transparent",
              fontSize: 13,
              fontWeight: tab === t ? 700 : 500,
              color: tab === t ? "var(--bm-text-primary)" : "var(--bm-text-secondary)",
              cursor: "pointer",
              boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,.08)" : "none",
              transition: "all .1s",
            }}
          >
            {t === "create" ? "팀 만들기" : "초대 코드 입력"}
          </button>
        ))}
      </div>

      {tab === "create" ? (
        <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>팀 이름</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="예: ABC제약 서울 팀"
              maxLength={50}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid var(--bm-border)",
                background: "var(--bm-surface)",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          {error && <div style={{ fontSize: 13, color: "#E05151" }}>{error}</div>}
          <button
            type="submit"
            disabled={isPending}
            style={{
              padding: "11px 0",
              background: "var(--bm-primary)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? "생성 중…" : "팀 생성"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 8 }}>초대 코드</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="팀장에게 받은 초대 코드"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid var(--bm-border)",
                background: "var(--bm-surface)",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "monospace",
              }}
            />
          </div>
          {error && <div style={{ fontSize: 13, color: "#E05151" }}>{error}</div>}
          <button
            type="submit"
            disabled={isPending}
            style={{
              padding: "11px 0",
              background: "var(--bm-primary)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: isPending ? "not-allowed" : "pointer",
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? "참여 중…" : "팀 참여"}
          </button>
        </form>
      )}
    </div>
  );
}
