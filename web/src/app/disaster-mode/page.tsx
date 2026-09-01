"use client";

import { EventList } from "@/components/disaster-mode/event-list";
import { PageContainer } from "@/components/page-container";
import { PageHero } from "@/components/page-hero";
import { PHOTOS } from "@/lib/media/stock-photos";
import { useLanguage } from "@/lib/i18n/language-context";

export default function DisasterModePage() {
  const { t } = useLanguage();
  return (
    <>
      <PageHero photo={PHOTOS.disasterMode} titleKey="nav.disasterMode" subtitleKey="modules.disasterMode.description" />
      <PageContainer>
      <h1 className="mb-4 text-2xl font-semibold">{t("disasterMode.heading")}</h1>
      <EventList />
      </PageContainer>
    </>
  );
}
