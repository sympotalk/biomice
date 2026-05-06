import { redirect } from "next/navigation";
import Link from "next/link";
import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { getMyProfile } from "@/lib/queries";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "내 프로필 · BioMICE" };

export default async function ProfilePage() {
  const me = await getMyProfile();
  if (!me) redirect("/login?next=/profile");

  const profile = me.profile;
  const email = me.user.email ?? "";

  // profile row가 없을 경우 기본값 (최초 로그인)
  const safeProfile = profile ?? {
    id: me.user.id,
    created_at: "",
    updated_at: "",
    display_name: null,
    organization: null,
    specialty: null,
    phone: null,
    user_type: (me.user.user_metadata?.user_type as string) ?? null,
    pharma_sub_type: null,
    newsletter_opt_in: true,
    notify_days: [7, 1],
    notify_enabled: true,
  };

  return (
    <>
      <Header />
      <main className="bm-main" style={{ paddingTop: 24, paddingBottom: 64, maxWidth: 520 }}>
        {/* 뒤로가기 */}
        <Link
          href="/mypage"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 13,
            color: "var(--bm-text-secondary)",
            textDecoration: "none",
            marginBottom: 20,
          }}
        >
          ← 마이페이지
        </Link>

        <h1 style={{ margin: "0 0 24px", fontSize: 20, fontWeight: 800 }}>내 프로필</h1>

        <ProfileForm profile={safeProfile} email={email} />
      </main>
      <Footer />
    </>
  );
}
