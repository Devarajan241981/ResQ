import { CommunityDetail } from "@/components/community/community-detail";
import { PageContainer } from "@/components/page-container";

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PageContainer>
      <CommunityDetail communityId={id} />
    </PageContainer>
  );
}
