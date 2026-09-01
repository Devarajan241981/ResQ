"use client";

import Link from "next/link";
import {
  CalendarDays,
  CloudRain,
  Droplet,
  Image as ImageIcon,
  Megaphone,
  PhoneCall,
  Search,
  ShieldAlert,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TranslationKey } from "@/lib/i18n/translations";

interface Category {
  icon: LucideIcon;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  href: string;
}

const CATEGORIES: Category[] = [
  { icon: Search, titleKey: "modules.missingPersons.title", descKey: "modules.missingPersons.description", href: "/missing-persons" },
  { icon: ShieldAlert, titleKey: "modules.sos.title", descKey: "modules.sos.description", href: "/sos" },
  { icon: Droplet, titleKey: "modules.bloodDonation.title", descKey: "modules.bloodDonation.description", href: "/blood-donation" },
  { icon: CloudRain, titleKey: "modules.disasterMode.title", descKey: "modules.disasterMode.description", href: "/disaster-mode" },
  { icon: Megaphone, titleKey: "modules.campaigns.title", descKey: "modules.campaigns.description", href: "/campaigns" },
  { icon: Users, titleKey: "nav.community", descKey: "infoCat.community.desc", href: "/community" },
  { icon: PhoneCall, titleKey: "infoCat.helplines.title", descKey: "infoCat.helplines.desc", href: "/sos" },
  { icon: CalendarDays, titleKey: "nav.calendar", descKey: "infoCat.calendar.desc", href: "/calendar" },
  { icon: ImageIcon, titleKey: "infoCat.awareness.title", descKey: "infoCat.awareness.desc", href: "/gallery" },
];

export function InformationCategories() {
  const { t } = useLanguage();

  return (
    <section className="bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">{t("infoCategories.heading")}</h2>
          <span aria-hidden className="mx-auto mt-3 block h-1 w-16 rounded bg-[color:var(--brand)]" />
          <p className="mx-auto mt-3 max-w-2xl text-foreground/70">{t("infoCategories.subheading")}</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.titleKey}
              href={c.href}
              className="group flex items-start gap-4 rounded-xl border border-border bg-background p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[color:var(--brand)]/10 text-[color:var(--brand)]">
                <c.icon className="h-6 w-6" aria-hidden />
              </span>
              <div className="min-w-0">
                <h3 className="font-bold group-hover:text-[color:var(--brand)]">{t(c.titleKey)}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-foreground/70">{t(c.descKey)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
