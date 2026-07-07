import { SosPanel } from "@/components/sos/sos-panel";
import { TrustedContacts } from "@/components/sos/trusted-contacts";
import { PageContainer } from "@/components/page-container";

export default function SosPage() {
  return (
    <PageContainer>
      <SosPanel />
      <TrustedContacts />
    </PageContainer>
  );
}
