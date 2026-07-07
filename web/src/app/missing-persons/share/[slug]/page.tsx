import { PublicReportView } from "@/components/missing-persons/public-report-view";
import { PageContainer } from "@/components/page-container";

export default async function PublicMissingPersonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <PageContainer>
      <PublicReportView slug={slug} />
    </PageContainer>
  );
}
