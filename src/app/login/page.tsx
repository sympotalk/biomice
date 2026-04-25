import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "./LoginForm";

type SearchParams = Promise<{ "check-email"?: string; next?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  return (
    <AuthShell width={440}>
      <LoginForm
        checkEmail={sp["check-email"] === "1"}
        next={sp.next}
      />
    </AuthShell>
  );
}
