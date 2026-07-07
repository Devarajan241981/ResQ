import { RequestList, RequestListHeader } from "@/components/blood-donation/request-list";
import { PageContainer } from "@/components/page-container";

export default function BloodDonationPage() {
  return (
    <PageContainer>
      <RequestListHeader />
      <RequestList />
    </PageContainer>
  );
}
