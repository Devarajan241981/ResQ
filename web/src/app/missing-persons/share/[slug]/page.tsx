import { PublicReportView } from "@/components/missing-persons/public-report-view";

export default async function PublicMissingPersonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PublicReportView slug={slug} />;
}
