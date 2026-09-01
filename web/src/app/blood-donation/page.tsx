import { RequestList, RequestListHeader } from "@/components/blood-donation/request-list";
import { PageContainer } from "@/components/page-container";
import { PageHero } from "@/components/page-hero";
import { PHOTOS } from "@/lib/media/stock-photos";

export default function BloodDonationPage() {
  return (
    <>
      <PageHero photo={PHOTOS.bloodDonation} titleKey="nav.bloodDonation" subtitleKey="modules.bloodDonation.description" />
      <PageContainer>
      <RequestListHeader />
      <RequestList />
      </PageContainer>
    </>
  );
}
