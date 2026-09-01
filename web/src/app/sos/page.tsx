import { SosPanel } from "@/components/sos/sos-panel";
import { TrustedContacts } from "@/components/sos/trusted-contacts";
import { InstallSosButton } from "@/components/pwa-register";
import { PageContainer } from "@/components/page-container";
import { PageHero } from "@/components/page-hero";
import { PHOTOS } from "@/lib/media/stock-photos";

export default function SosPage() {
  return (
    <>
      <PageHero photo={PHOTOS.sos} titleKey="nav.sos" subtitleKey="modules.sos.description" />
      <PageContainer>
        <div className="flex justify-center">
          <InstallSosButton />
        </div>
        <SosPanel />
        <TrustedContacts />
      </PageContainer>
    </>
  );
}
