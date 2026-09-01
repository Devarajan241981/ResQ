import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { AdminGuard } from "@/components/admin/admin-guard";
import { PageContainer } from "@/components/page-container";

export default function AdminPage() {
  return (
    <PageContainer>
      <AdminGuard>
        <AdminDashboard />
      </AdminGuard>
    </PageContainer>
  );
}
