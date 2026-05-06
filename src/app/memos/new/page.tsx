import { redirect } from "next/navigation";
import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { getMyProfile } from "@/lib/queries";
import { getMyDoctors } from "@/app/actions/myDoctors";
import { MemoForm } from "../MemoForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "새 메모 작성 · BioMICE" };

export default async function NewMemoPage() {
  const me = await getMyProfile();
  if (!me) redirect("/login?next=/memos/new");
  if (me.profile?.user_type !== "pharma") redirect("/");

  const myDoctors = await getMyDoctors();

  return (
    <>
      <Header />
      <main className="bm-main" style={{ paddingTop: 24, paddingBottom: 64, maxWidth: 640 }}>
        <h1 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 800 }}>새 메모 작성</h1>
        <MemoForm myDoctors={myDoctors} />
      </main>
      <Footer />
    </>
  );
}
