import { RequestList, RequestListHeader } from "@/components/blood-donation/request-list";

export default function BloodDonationPage() {
  return (
    <div>
      <RequestListHeader />
      <RequestList />
    </div>
  );
}
