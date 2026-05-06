import { redirect } from "next/navigation";
import Link from "next/link";
import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { getMyProfile } from "@/lib/queries";
import { getMyTeams } from "@/app/actions/teams";
import { TeamCreateJoin } from "./TeamCreateJoin";

export const dynamic = "force-dynamic";
export const metadata = { title: "팀 관리 · BioMICE" };

export default async function TeamPage() {
  const me = await getMyProfile();
  if (!me) redirect("/login?next=/team");
  if (me.profile?.user_type !== "pharma") redirect("/");

  const teams = await getMyTeams();

  return (
    <>
      <Header />
      <main className="bm-main" style={{ paddingTop: 24, paddingBottom: 64 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, letterSpacing: -0.4 }}>팀 관리</h1>
          <p style={{ margin: 0, fontSize: 13, color: "var(--bm-text-secondary)" }}>
            팀을 만들거나 초대 코드로 참여해 학회·메모를 함께 관리하세요.
          </p>
        </div>

        {teams.length > 0 && (
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>내 팀 ({teams.length})</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {teams.map((team) => (
                <Link
                  key={team.id}
                  href={`/team/${team.id}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 20px",
                    background: "var(--bm-surface)",
                    border: "1px solid var(--bm-border)",
                    borderRadius: 12,
                    textDecoration: "none",
                    color: "inherit",
                    transition: "border-color .12s",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{team.name}</div>
                    <div style={{ fontSize: 12, color: "var(--bm-text-secondary)", marginTop: 3 }}>
                      멤버 {team.memberCount}명 · {team.role === "owner" ? "팀장" : "멤버"}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--bm-text-tertiary)" }}>→</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <TeamCreateJoin hasTeam={teams.length > 0} />
      </main>
      <Footer />
    </>
  );
}
