import { redirect } from "next/navigation";
import Link from "next/link";
import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { getMyProfile } from "@/lib/queries";
import { getMyMemos, type MemoType } from "@/app/actions/memos";
import { MemoListItem } from "./MemoListItem";
import { MEMO_TYPE_LABELS } from "./constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "메모·방문록 · BioMICE" };
export { MEMO_TYPE_LABELS } from "./constants";

const MEMO_TYPES: { value: MemoType | ""; label: string }[] = [
  { value: "", label: "전체" },
  { value: "visit", label: "방문" },
  { value: "meeting", label: "회의" },
  { value: "note", label: "노트" },
];

type SearchParams = Promise<{ type?: string; search?: string }>;

export default async function MemosPage({ searchParams }: { searchParams: SearchParams }) {
  const me = await getMyProfile();
  if (!me) redirect("/login?next=/memos");
  if (me.profile?.user_type !== "pharma") redirect("/");

  const params = await searchParams;
  const memoType = (params.type as MemoType) || undefined;
  const search = params.search || undefined;

  const memos = await getMyMemos({ memoType, search });

  return (
    <>
      <Header />
      <main className="bm-main" style={{ paddingTop: 24, paddingBottom: 64 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 8 }}>
            <div>
              <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 800, letterSpacing: -0.4 }}>
                메모·방문록
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: "var(--bm-text-secondary)" }}>
                {memos.length}건
              </p>
            </div>
            <Link
              href="/memos/new"
              style={{
                padding: "8px 18px",
                background: "var(--bm-primary)",
                color: "#fff",
                borderRadius: 24,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              + 새 메모
            </Link>
          </div>

          {/* 필터 탭 */}
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            {MEMO_TYPES.map(({ value, label }) => {
              const isActive = (memoType ?? "") === value;
              const href = value ? `?type=${value}${search ? `&search=${encodeURIComponent(search)}` : ""}` : search ? `?search=${encodeURIComponent(search)}` : "?";
              return (
                <Link
                  key={value}
                  href={href}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 500,
                    background: isActive ? "var(--bm-primary)" : "var(--bm-surface)",
                    color: isActive ? "#fff" : "var(--bm-text-secondary)",
                    border: isActive ? "none" : "1px solid var(--bm-border)",
                    textDecoration: "none",
                    transition: "all .12s",
                  }}
                >
                  {label}
                </Link>
              );
            })}

            {/* 검색 */}
            <form method="GET" style={{ display: "flex", gap: 0, marginLeft: "auto" }}>
              {memoType && <input type="hidden" name="type" value={memoType} />}
              <input
                name="search"
                type="text"
                placeholder="내용·의사명 검색"
                defaultValue={search ?? ""}
                style={{
                  padding: "6px 14px",
                  borderRadius: "24px 0 0 24px",
                  border: "1px solid var(--bm-border)",
                  borderRight: "none",
                  background: "var(--bm-surface)",
                  fontSize: 13,
                  outline: "none",
                  minWidth: 180,
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "6px 14px",
                  borderRadius: "0 24px 24px 0",
                  border: "1px solid var(--bm-border)",
                  background: "var(--bm-bg-muted)",
                  fontSize: 13,
                  cursor: "pointer",
                  color: "var(--bm-text-secondary)",
                }}
              >
                검색
              </button>
            </form>
          </div>
        </div>

        {memos.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "64px 24px",
            background: "var(--bm-surface)",
            border: "1px solid var(--bm-border)",
            borderRadius: 14,
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
              {search || memoType ? "검색 결과가 없습니다" : "메모가 없습니다"}
            </div>
            {!search && !memoType && (
              <>
                <div style={{ fontSize: 14, color: "var(--bm-text-secondary)", marginBottom: 20 }}>
                  방문 기록, 회의 메모, 노트를 남겨보세요.
                </div>
                <Link
                  href="/memos/new"
                  style={{
                    padding: "10px 24px",
                    background: "var(--bm-primary)",
                    color: "#fff",
                    borderRadius: 24,
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  첫 메모 작성
                </Link>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {memos.map((m) => (
              <MemoListItem key={m.id} memo={m} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
