"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Globe, LayoutGrid, ShieldCheck, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { useLanguage } from "@/lib/i18n/language-context";
import type { PaginatedResponse, PublicFeedReport } from "@/lib/api/types";
import type { TranslationKey } from "@/lib/i18n/translations";
import { PHOTOS } from "@/lib/media/stock-photos";

interface ServiceCard {
  photo: string;
  titleKey: TranslationKey;
  href: string;
}

const SERVICES: ServiceCard[] = [
  { photo: PHOTOS.missingPersons, titleKey: "modules.missingPersons.title", href: "/missing-persons" },
  { photo: PHOTOS.sos, titleKey: "modules.sos.title", href: "/sos" },
  { photo: PHOTOS.bloodDonation, titleKey: "modules.bloodDonation.title", href: "/blood-donation" },
  { photo: PHOTOS.disasterMode, titleKey: "modules.disasterMode.title", href: "/disaster-mode" },
  { photo: PHOTOS.campaigns, titleKey: "modules.campaigns.title", href: "/campaigns" },
  { photo: PHOTOS.volunteers, titleKey: "nav.community", href: "/community" },
];

export function OnlineServices() {
  const { t } = useLanguage();
  const [missing, setMissing] = useState<number | null>(null);

  useEffect(() => {
    apiFetch<PaginatedResponse<PublicFeedReport>>("/missing-persons/")
      .then((d) => setMissing(d.count))
      .catch(() => {});
  }, []);

  const tiles: { icon: LucideIcon; value: string; labelKey: TranslationKey }[] = [
    { icon: LayoutGrid, value: "13", labelKey: "stats.modules" },
    { icon: ShieldCheck, value: "24/7", labelKey: "stats.response" },
    { icon: Globe, value: "10", labelKey: "stats.languages" },
    { icon: CalendarDays, value: missing != null ? `${missing}` : "—", labelKey: "stats.missingReports" },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
        {/* Blue services panel */}
        <div className="rounded-2xl bg-[color:var(--brand)] p-6 text-white shadow-lg">
          <h2 className="text-2xl font-bold">{t("onlineServices.heading")}</h2>
          <span aria-hidden className="mt-2 block h-1 w-14 rounded bg-white/70" />
          <div className="mt-5 grid grid-cols-2 gap-3">
            {tiles.map((tile) => (
              <div key={tile.labelKey} className="rounded-xl border border-white/20 bg-white/10 p-4 text-center">
                <tile.icon className="mx-auto h-6 w-6" aria-hidden />
                <p className="mt-2 text-2xl font-extrabold leading-none">{tile.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-white/80">{t(tile.labelKey)}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-sm text-white/85">{t("onlineServices.availSave")}</p>
            <Link
              href="/missing-persons"
              className="shrink-0 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-[color:var(--brand)] hover:bg-white/90"
            >
              {t("onlineServices.viewAll")}
            </Link>
          </div>
        </div>

        {/* Service cards carousel */}
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {SERVICES.map((s) => (
            <Link
              key={s.titleKey}
              href={s.href}
              className="group w-52 shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[4/3]">
                <Image src={s.photo} alt="" fill sizes="208px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <p className="px-4 py-3 font-semibold">{t(s.titleKey)}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
