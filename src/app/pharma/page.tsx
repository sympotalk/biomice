import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { PharmaInquiryForm } from "./PharmaInquiryForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "제약사·후원 문의 · biomice",
  description: "biomice 광고 배너 및 학술대회 스폰서십 문의 페이지입니다.",
};

const BENEFITS = [
  {
    icon: "📊",
    title: "타깃 의료진 도달",
    desc: "국내 의사·의료 전문가 대상 직접 노출. 학술대회 관심 의료진에게 집중 도달.",
  },
  {
    icon: "📅",
    title: "학술대회 스폰서십",
    desc: "개별 학술대회 상세 페이지 배너 노출. D-day 카운트다운과 함께 높은 주목도.",
  },
  {
    icon: "💌",
    title: "뉴스레터 광고",
    desc: "D-7/D-1 알림 이메일에 스폰서 메시지 포함. 오픈율 높은 학술 맞춤 타깃 광고.",
  },
  {
    icon: "📈",
    title: "성과 리포트",
    desc: "노출수, 클릭수, CTR을 대시보드에서 실시간 확인. 월별 성과 리포트 제공.",
  },
];

const SLOTS = [
  { name: "홈 상단 배너", desc: "메인 페이지 히어로 아래 전체폭 배너", price: "월 100만원~" },
  { name: "학술대회 상세 하단", desc: "각 학술대회 상세 페이지 하단 배너", price: "건당 30만원~" },
  { name: "이메일 스폰서", desc: "D-7/D-1 알림 이메일 하단 브랜딩", price: "월 50만원~" },
  { name: "카테고리 스폰서", desc: "특정 전문과목 학술대회 목록 상단 배너", price: "월 70만원~" },
];

export default function PharmaPage() {
  return (
    <>
      <Header />
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 20px 80px" }}>
        {/* 히어로 */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div
            style={{
              display: "inline-block",
              fontSize: 12,
              fontWeight: 700,
              color: "var(--bm-accent)",
              background: "var(--bm-accent-subtle)",
              padding: "4px 12px",
              borderRadius: 20,
              marginBottom: 16,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Pharma & Sponsor
          </div>
          <h1
            style={{
              margin: "0 0 16px",
              fontSize: "clamp(28px,5vw,44px)",
              fontWeight: 800,
              letterSpacing: -1,
              color: "var(--bm-text-primary)",
              lineHeight: 1.2,
            }}
          >
            의료진에게 직접 닿는
            <br />
            가장 효율적인 채널
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 16,
              color: "var(--bm-text-secondary)",
              lineHeight: 1.7,
              maxWidth: 480,
              marginInline: "auto",
            }}
          >
            biomice는 국내 의학 학술대회 정보를 탐색하는
            <br />의사·의료 전문가가 방문하는 플랫폼입니다.
          </p>
        </div>

        {/* 혜택 그리드 */}
        <section style={{ marginBottom: 56 }}>
          <h2
            style={{
              margin: "0 0 24px",
              fontSize: 20,
              fontWeight: 700,
              color: "var(--bm-text-primary)",
              textAlign: "center",
            }}
          >
            왜 biomice인가요?
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                style={{
                  background: "var(--bm-surface)",
                  border: "1px solid var(--bm-border)",
                  borderRadius: 10,
                  padding: "20px 20px",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{b.icon}</div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--bm-text-primary)",
                    marginBottom: 8,
                  }}
                >
                  {b.title}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "var(--bm-text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 광고 슬롯 */}
        <section style={{ marginBottom: 56 }}>
          <h2
            style={{
              margin: "0 0 24px",
              fontSize: 20,
              fontWeight: 700,
              color: "var(--bm-text-primary)",
              textAlign: "center",
            }}
          >
            광고 상품
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            {SLOTS.map((s) => (
              <div
                key={s.name}
                style={{
                  background: "var(--bm-surface)",
                  border: "1px solid var(--bm-border)",
                  borderRadius: 10,
                  padding: "20px 20px",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--bm-text-primary)",
                    marginBottom: 6,
                  }}
                >
                  {s.name}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--bm-text-secondary)",
                    marginBottom: 12,
                    lineHeight: 1.5,
                  }}
                >
                  {s.desc}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--bm-primary)",
                  }}
                >
                  {s.price}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 문의 폼 */}
        <section
          style={{
            background: "var(--bm-surface)",
            border: "1px solid var(--bm-border)",
            borderRadius: 12,
            padding: "36px 40px",
          }}
        >
          <h2
            style={{
              margin: "0 0 8px",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--bm-text-primary)",
            }}
          >
            광고·스폰서십 문의
          </h2>
          <p
            style={{
              margin: "0 0 28px",
              fontSize: 14,
              color: "var(--bm-text-secondary)",
            }}
          >
            아래 양식을 작성하시면 영업일 기준 1~2일 내 연락드립니다.
          </p>
          <PharmaInquiryForm />
        </section>
      </main>
      <Footer />
    </>
  );
}
