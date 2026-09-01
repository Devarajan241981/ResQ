import { ReportList, ReportListHeader } from "@/components/missing-persons/report-list";
import { PageContainer } from "@/components/page-container";
import { PageHero } from "@/components/page-hero";
import { PHOTOS } from "@/lib/media/stock-photos";

export default function MissingPersonsPage() {
  return (
    <>
      <PageHero photo={PHOTOS.missingPersons} titleKey="nav.missingPersons" subtitleKey="modules.missingPersons.description" />
      <PageContainer>
      <ReportListHeader />
      <ReportList />
      </PageContainer>
    </>
  );
}
