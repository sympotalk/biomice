import { HeaderServer as Header } from "@/components/layout/HeaderServer";
import { Footer } from "@/components/layout/Footer";
import { SignupForm } from "./SignupForm";

export default function SignupPage() {
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
        <SignupForm />
      </main>
      <Footer />
    </>
  );
}
