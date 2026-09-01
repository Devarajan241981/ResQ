import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterWizard } from "@/components/auth/register-wizard";
import { PageContainer } from "@/components/page-container";

export default function RegisterPage() {
  return (
    <PageContainer>
      <AuthShell>
        <RegisterWizard />
      </AuthShell>
    </PageContainer>
  );
}
