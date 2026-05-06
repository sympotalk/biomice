import { redirect, notFound } from "next/navigation";
import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { getMyProfile } from "@/lib/queries";
import { getMyDoctors } from "@/app/actions/myDoctors";
import { getMyMemos } from "@/app/actions/memos";
import { MemoForm } from "../MemoForm";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function EditMemoPage({ params }: { params: Params }) {
  const me = await getMyProfile();
  if (!me) redirect("/login?next=/memos");
  if (me.profile?.user_type !== "pharma") redirect("/");

  const { id } = await params;
  const memoId = parseInt(id);
  if (isNaN(memoId)) notFound();

  const [allMemos, myDoctors] = await Promise.all([
    getMyMemos(),
    getMyDoctors(),
  ]);

  const memo = allMemos.find((m) => m.id === memoId);
  if (!memo) notFound();

  return (
    <>
      <Header />
      <main className="bm-main" style={{ paddingTop: 24, paddingBottom: 64, maxWidth: 640 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: "var(--bm-text-secondary)", marginBottom: 8 }}>
            <a href="/memos" style={{ color: "var(--bm-text-secondary)", textDecoration: "none" }}>← 메모 목록</a>
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>메모 편집</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--bm-text-secondary)" }}>
            {new Date(memo.visit_date).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
            {memo.hospital_doctors && ` · ${memo.hospital_doctors.name}`}
          </p>
        </div>
        <MemoForm myDoctors={myDoctors} existing={memo} />
      </main>
      <Footer />
    </>
  );
}
