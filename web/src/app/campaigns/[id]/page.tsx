import { CampaignDetail } from "@/components/campaigns/campaign-detail";
import { PageContainer } from "@/components/page-container";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PageContainer>
      <CampaignDetail campaignId={id} />
    </PageContainer>
  );
}
