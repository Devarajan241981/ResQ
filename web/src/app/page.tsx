"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/language-context";

const MODULES = [
  {
    href: "/missing-persons",
    title: "Missing Persons",
    description: "Report a missing person, share via QR code, and track sighting reports.",
  },
  {
    href: "/sos",
    title: "SOS",
    description: "One-tap emergency alert with live location to trusted contacts and nearby volunteers.",
  },
  {
    href: "/blood-donation",
    title: "Blood Donation",
    description: "Post an emergency blood request or find nearby donors by blood group.",
  },
  {
    href: "/disaster-mode",
    title: "Disaster Mode",
    description: "Mark yourself safe or request rescue, food, water, or medicine during an active disaster.",
  },
] as const;

export default function Home() {
  const { t } = useLanguage();

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">{t("home.title")}</h1>
      <p className="mt-2 max-w-2xl text-foreground/70">{t("home.subtitle")}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {MODULES.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="rounded-lg border border-border p-5 transition-colors hover:bg-surface"
          >
            <h2 className="text-lg font-medium">{mod.title}</h2>
            <p className="mt-1 text-sm text-foreground/70">{mod.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
