import { ReportList, ReportListHeader } from "@/components/missing-persons/report-list";
import { PageContainer } from "@/components/page-container";

export default function MissingPersonsPage() {
  return (
    <PageContainer>
      <ReportListHeader />
      <ReportList />
    </PageContainer>
  );
}
