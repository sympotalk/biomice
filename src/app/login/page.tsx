import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { LoginForm } from "./LoginForm";

type SearchParams = Promise<{ "check-email"?: string; next?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  return (
    <>
      <Header />
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 20px",
        }}
      >
        <LoginForm
          checkEmail={sp["check-email"] === "1"}
          next={sp.next}
        />
      </main>
      <Footer />
    </>
  );
}
