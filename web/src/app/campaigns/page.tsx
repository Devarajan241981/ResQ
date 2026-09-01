import { CampaignList, CampaignListHeader } from "@/components/campaigns/campaign-list";
import { PageContainer } from "@/components/page-container";
import { PageHero } from "@/components/page-hero";
import { PHOTOS } from "@/lib/media/stock-photos";

export default function CampaignsPage() {
  return (
    <>
      <PageHero photo={PHOTOS.campaigns} titleKey="nav.campaigns" subtitleKey="modules.campaigns.description" />
      <PageContainer>
      <CampaignListHeader />
      <CampaignList />
      </PageContainer>
    </>
  );
}
