import { CommunityList, CommunityListHeader } from "@/components/community/community-list";
import { PageContainer } from "@/components/page-container";
import { PageHero } from "@/components/page-hero";
import { PHOTOS } from "@/lib/media/stock-photos";

export default function CommunityPage() {
  return (
    <>
      <PageHero photo={PHOTOS.ngos} titleKey="nav.community" subtitleKey="community.form.subheading" />
      <PageContainer>
      <CommunityListHeader />
      <CommunityList />
      </PageContainer>
    </>
  );
}
