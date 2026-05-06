"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { TeamMember, TeamPin } from "@/app/actions/teams";
import { leaveTeam, unpinConference } from "@/app/actions/teams";
import { useRouter } from "next/navigation";

type Team = {
  id: number;
  name: string;
  owner_id: string;
  invite_code: string;
  role: string;
};

type Props = {
  team: Team;
  members: TeamMember[];
  pins: TeamPin[];
  myUserId: string;
};

export function TeamDashboard({ team, members, pins, myUserId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(team.invite_code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLeave = () => {
    if (!confirm("팀에서 나가시겠습니까?")) return;
    startTransition(async () => {
      await leaveTeam(team.id);
      router.push("/team");
    });
  };

  const handleUnpin = (conferenceId: number) => {
    startTransition(async () => { await unpinConference(team.id, conferenceId); });
  };

  const isOwner = team.role === "owner";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 초대 코드 */}
      <div style={{
        background: "var(--bm-surface)",
        border: "1px solid var(--bm-border)",
        borderRadius: 12,
        padding: "16px 20px",
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>초대 코드</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <code style={{
            flex: 1,
            padding: "8px 14px",
            background: "var(--bm-bg-muted)",
            borderRadius: 8,
            fontSize: 14,
            fontFamily: "monospace",
            letterSpacing: 1,
            wordBreak: "break-all",
          }}>
            {team.invite_code}
          </code>
          <button
            onClick={handleCopyCode}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid var(--bm-border)",
              background: copied ? "var(--bm-success-subtle)" : "var(--bm-surface)",
              color: copied ? "var(--bm-success)" : "var(--bm-text-secondary)",
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all .1s",
            }}
          >
            {copied ? "복사됨!" : "복사"}
          </button>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--bm-text-tertiary)" }}>
          이 코드를 팀원에게 공유하면 팀에 참여할 수 있습니다.
        </p>
      </div>

      {/* 멤버 */}
      <div>
        <h2 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>팀원 ({members.length}명)</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {members.map((m) => (
            <div key={m.id} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              background: "var(--bm-surface)",
              border: "1px solid var(--bm-border)",
              borderRadius: 10,
            }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  {m.users_profile?.display_name ?? "사용자"}
                </span>
                {m.user_id === myUserId && (
                  <span style={{ fontSize: 11, color: "var(--bm-primary)", marginLeft: 6 }}>(나)</span>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{
                  fontSize: 11,
                  color: m.role === "owner" ? "#E07020" : "var(--bm-text-tertiary)",
                  background: m.role === "owner" ? "#FFF3E8" : "var(--bm-bg-muted)",
                  padding: "2px 8px",
                  borderRadius: 999,
                }}>
                  {m.role === "owner" ? "팀장" : "멤버"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 공유 학회 핀 */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>공유된 학회 ({pins.length})</h2>
          <Link
            href="/conferences"
            style={{ fontSize: 13, color: "var(--bm-primary)", textDecoration: "none" }}
          >
            학회 검색 →
          </Link>
        </div>

        {pins.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "32px 24px",
            background: "var(--bm-surface)",
            border: "1px solid var(--bm-border)",
            borderRadius: 12,
            fontSize: 14,
            color: "var(--bm-text-tertiary)",
          }}>
            아직 공유된 학회가 없습니다.<br />
            학회 상세 페이지에서 팀에 공유해보세요.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pins.map((pin) => {
              const conf = pin.conferences;
              return (
                <div key={pin.id} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  background: "var(--bm-surface)",
                  border: "1px solid var(--bm-border)",
                  borderRadius: 10,
                  opacity: isPending ? 0.7 : 1,
                }}>
                  <div>
                    {conf ? (
                      <Link
                        href={`/conferences/${conf.id}`}
                        style={{ fontSize: 14, fontWeight: 600, textDecoration: "none", color: "var(--bm-text-primary)" }}
                      >
                        {conf.title}
                      </Link>
                    ) : (
                      <span style={{ fontSize: 14, fontWeight: 600 }}>학회 #{pin.conference_id}</span>
                    )}
                    {conf?.start_date && (
                      <div style={{ fontSize: 12, color: "var(--bm-text-secondary)", marginTop: 2 }}>
                        {new Date(conf.start_date).toLocaleDateString("ko-KR")}
                      </div>
                    )}
                  </div>
                  {(isOwner || pin.pinned_by === myUserId) && (
                    <button
                      onClick={() => handleUnpin(pin.conference_id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        color: "var(--bm-text-tertiary)",
                        padding: "4px 8px",
                      }}
                    >
                      제거
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 팀 나가기 */}
      {!isOwner && (
        <div style={{ borderTop: "1px solid var(--bm-border)", paddingTop: 20 }}>
          <button
            onClick={handleLeave}
            disabled={isPending}
            style={{
              padding: "10px 20px",
              background: "none",
              border: "1px solid #E05151",
              color: "#E05151",
              borderRadius: 8,
              fontSize: 13,
              cursor: "pointer",
              opacity: isPending ? 0.6 : 1,
            }}
          >
            팀 나가기
          </button>
        </div>
      )}
    </div>
  );
}
