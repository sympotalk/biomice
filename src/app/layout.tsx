import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "biomice — 의학 학술대회 플랫폼",
  description:
    "국내 전체 의학 학술대회 정보를 한 곳에서. 대한의학회 산하 학회의 학술대회 일정·등록 정보를 빠르게 찾아보세요.",
  metadataBase: new URL("https://biomice.kr"),
  openGraph: {
    title: "biomice — 의학 학술대회 플랫폼",
    description: "국내 의학 학술대회의 공식 허브",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="bm min-h-full flex flex-col">{children}</body>
    </html>
  );
}
