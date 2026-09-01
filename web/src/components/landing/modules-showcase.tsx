"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CloudRain,
  Droplet,
  Megaphone,
  Search,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TranslationKey } from "@/lib/i18n/translations";
import { PHOTOS } from "@/lib/media/stock-photos";

interface LiveModule {
  photo: string;
  icon: LucideIcon;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  href: string;
  accent: string;
}

// Accent bars rotate through the national palette: saffron, navy, green.
const LIVE_MODULES: LiveModule[] = [
  { photo: PHOTOS.missingPersons, icon: Search, titleKey: "modules.missingPersons.title", descKey: "modules.missingPersons.description", href: "/missing-persons", accent: "bg-[#FF9933]" },
  { photo: PHOTOS.sos, icon: ShieldAlert, titleKey: "modules.sos.title", descKey: "modules.sos.description", href: "/sos", accent: "bg-[#123a6b]" },
  { photo: PHOTOS.bloodDonation, icon: Droplet, titleKey: "modules.bloodDonation.title", descKey: "modules.bloodDonation.description", href: "/blood-donation", accent: "bg-[#138808]" },
  { photo: PHOTOS.disasterMode, icon: CloudRain, titleKey: "modules.disasterMode.title", descKey: "modules.disasterMode.description", href: "/disaster-mode", accent: "bg-[#FF9933]" },
  { photo: PHOTOS.campaigns, icon: Megaphone, titleKey: "modules.campaigns.title", descKey: "modules.campaigns.description", href: "/campaigns", accent: "bg-[#123a6b]" },
];

function LiveModuleCard({ mod, featured }: { mod: LiveModule; featured?: boolean }) {
  const { t } = useLanguage();
  const Icon = mod.icon;

  return (
    <Link
      href={mod.href}
      className={`group flex flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-shadow hover:shadow-md ${
        featured ? "sm:col-span-2 sm:row-span-2" : ""
      }`}
    >
      <span aria-hidden className={`h-1 ${mod.accent}`} />
      <div className={`relative ${featured ? "aspect-[16/10] flex-1 sm:aspect-auto sm:min-h-64" : "aspect-[16/10]"}`}>
        <Image
          src={mod.photo}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-black shadow">
          <span className="h-1.5 w-1.5 rounded-full bg-green-600" aria-hidden />
          {t("modules.live")}
        </span>
      </div>
      <div className="flex items-start gap-3 p-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-surface text-foreground/70">
          <Icon className="h-4.5 w-4.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 font-bold">
            {t(mod.titleKey)}
            <ArrowRight className="h-4 w-4 shrink-0 text-foreground/40 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </h3>
          <p className="mt-1 text-sm text-foreground/70">{t(mod.descKey)}</p>
        </div>
      </div>
    </Link>
  );
}

export function ModulesShowcase() {
  const { t } = useLanguage();

  return (
    <section className="bg-surface">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">{t("modules.heading")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-foreground/70">{t("modules.subheading")}</p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LIVE_MODULES.map((mod, i) => (
            <LiveModuleCard key={mod.titleKey} mod={mod} featured={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
