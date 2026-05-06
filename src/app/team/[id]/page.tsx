import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { getMyProfile } from "@/lib/queries";
import { getMyTeams, getTeamMembers, getTeamPins } from "@/app/actions/teams";
import { TeamDashboard } from "./TeamDashboard";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function TeamDetailPage({ params }: { params: Params }) {
  const me = await getMyProfile();
  if (!me) redirect("/login?next=/team");
  if (me.profile?.user_type !== "pharma") redirect("/");

  const { id } = await params;
  const teamId = parseInt(id);
  if (isNaN(teamId)) notFound();

  const [teams, members, pins] = await Promise.all([
    getMyTeams(),
    getTeamMembers(teamId),
    getTeamPins(teamId),
  ]);

  const team = teams.find((t) => t.id === teamId);
  if (!team) notFound();

  const myUserId = me.user.id;

  return (
    <>
      <Header />
      <main className="bm-main" style={{ paddingTop: 24, paddingBottom: 64 }}>
        <div style={{ marginBottom: 20 }}>
          <Link href="/team" style={{ fontSize: 13, color: "var(--bm-text-secondary)", textDecoration: "none", display: "inline-block", marginBottom: 8 }}>
            ← 팀 목록
          </Link>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 8 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>{team.name}</h1>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--bm-text-secondary)" }}>
                멤버 {members.length}명 · {team.role === "owner" ? "팀장" : "멤버"}
              </p>
            </div>
          </div>
        </div>

        <TeamDashboard
          team={team}
          members={members}
          pins={pins}
          myUserId={myUserId}
        />
      </main>
      <Footer />
    </>
  );
}
