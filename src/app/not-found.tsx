import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 20px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div
            className="mono-num"
            style={{
              fontSize: 80,
              fontWeight: 800,
              color: "var(--bm-primary-subtle)",
              lineHeight: 1,
              letterSpacing: -2,
            }}
          >
            404
          </div>
          <h1
            style={{
              margin: "16px 0 8px",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--bm-text-primary)",
            }}
          >
            페이지를 찾을 수 없습니다
          </h1>
          <p
            style={{
              margin: "0 0 24px",
              fontSize: 14,
              color: "var(--bm-text-secondary)",
            }}
          >
            URL이 올바른지 확인해 주세요. 학술대회가 삭제되었을 수도 있습니다.
          </p>
          <Link href="/">
            <Button variant="primary">홈으로</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
