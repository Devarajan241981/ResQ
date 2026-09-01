import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { PageContainer } from "@/components/page-container";

export default function LoginPage() {
  return (
    <PageContainer>
      <AuthShell>
        <LoginForm />
      </AuthShell>
    </PageContainer>
  );
}
