import { EventList } from "@/components/disaster-mode/event-list";
import { PageContainer } from "@/components/page-container";

export default function DisasterModePage() {
  return (
    <PageContainer>
      <h1 className="mb-4 text-2xl font-semibold">Disaster Mode</h1>
      <EventList />
    </PageContainer>
  );
}
