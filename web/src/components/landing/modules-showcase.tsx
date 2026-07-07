import Link from "next/link";
import {
  Ambulance,
  Baby,
  Building2,
  Droplet,
  HandHeart,
  HeartPulse,
  Hospital,
  PawPrint,
  Siren,
  Tent,
  TriangleAlert,
  UserSearch,
} from "lucide-react";
import type { ComponentType } from "react";

interface ModuleInfo {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href?: string;
  live: boolean;
}

const MODULES: ModuleInfo[] = [
  {
    icon: UserSearch,
    title: "Missing Persons",
    description: "Report, share via QR code, and track sighting reports with AI-assisted risk scoring.",
    href: "/missing-persons",
    live: true,
  },
  {
    icon: Siren,
    title: "SOS",
    description: "One-tap emergency alert with live location to trusted contacts and nearby volunteers.",
    href: "/sos",
    live: true,
  },
  {
    icon: Droplet,
    title: "Blood Donation",
    description: "Post an emergency blood request or find nearby donors by blood group and city.",
    href: "/blood-donation",
    live: true,
  },
  {
    icon: TriangleAlert,
    title: "Disaster Mode",
    description: "Mark yourself safe, or request rescue, food, water, or medicine during active disasters.",
    href: "/disaster-mode",
    live: true,
  },
  {
    icon: Baby,
    title: "Missing Children",
    description: "A dedicated workflow with extra verification and priority alerts for child safety cases.",
    live: false,
  },
  {
    icon: HeartPulse,
    title: "Missing Elderly",
    description: "Support for dementia and Alzheimer's cases, with a large emergency button and medical history.",
    live: false,
  },
  {
    icon: PawPrint,
    title: "Lost Pets",
    description: "Upload photos and details of a lost pet; nearby shelters and vets can respond directly.",
    live: false,
  },
  {
    icon: Hospital,
    title: "Hospital Directory",
    description: "Find emergency, trauma, government, and private hospitals with live navigation and calling.",
    live: false,
  },
  {
    icon: Ambulance,
    title: "Ambulance",
    description: "Request an ambulance and track status, with nearby provider notification.",
    live: false,
  },
  {
    icon: HandHeart,
    title: "Nearby Volunteers",
    description: "Verified volunteers by skill — medical, search & rescue, animal rescue, transport.",
    live: false,
  },
  {
    icon: Building2,
    title: "NGOs",
    description: "Verified NGO dashboards to accept, update, and close community assistance cases.",
    live: false,
  },
  {
    icon: Tent,
    title: "Shelter Finder",
    description: "Government, NGO, and temporary shelters with live capacity and contact details.",
    live: false,
  },
];

export function ModulesShowcase() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">One platform, every kind of emergency</h2>
        <p className="mx-auto mt-3 max-w-2xl text-foreground/70">
          Twelve community-driven modules built around how emergencies actually unfold in India — four
          are live today, the rest are actively being built in the open.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          const content = (
            <>
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-surface p-2.5">
                  <Icon className="h-5 w-5" />
                </div>
                {mod.live ? (
                  <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600">
                    Live
                  </span>
                ) : (
                  <span className="rounded-full bg-gray-500/10 px-2.5 py-0.5 text-xs font-medium text-foreground/50">
                    Coming soon
                  </span>
                )}
              </div>
              <h3 className="mt-4 font-semibold">{mod.title}</h3>
              <p className="mt-1 text-sm text-foreground/70">{mod.description}</p>
            </>
          );

          const className =
            "rounded-xl border border-border p-5 transition-colors" +
            (mod.live ? " hover:bg-surface" : " opacity-80");

          return mod.href ? (
            <Link key={mod.title} href={mod.href} className={className}>
              {content}
            </Link>
          ) : (
            <div key={mod.title} className={className}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
