import Image from "next/image";
import Link from "next/link";
import { PHOTOS } from "@/lib/media/stock-photos";

interface ModuleInfo {
  photo: string;
  title: string;
  description: string;
  href?: string;
  live: boolean;
}

const MODULES: ModuleInfo[] = [
  {
    photo: PHOTOS.missingPersons,
    title: "Missing Persons",
    description: "Report, share via QR code, and track sighting reports with AI-assisted risk scoring.",
    href: "/missing-persons",
    live: true,
  },
  {
    photo: PHOTOS.sos,
    title: "SOS",
    description: "One-tap emergency alert with live location to trusted contacts and nearby volunteers.",
    href: "/sos",
    live: true,
  },
  {
    photo: PHOTOS.bloodDonation,
    title: "Blood Donation",
    description: "Post an emergency blood request or find nearby donors by blood group and city.",
    href: "/blood-donation",
    live: true,
  },
  {
    photo: PHOTOS.disasterMode,
    title: "Disaster Mode",
    description: "Mark yourself safe, or request rescue, food, water, or medicine during active disasters.",
    href: "/disaster-mode",
    live: true,
  },
  {
    photo: PHOTOS.missingChildren,
    title: "Missing Children",
    description: "A dedicated workflow with extra verification and priority alerts for child safety cases.",
    live: false,
  },
  {
    photo: PHOTOS.missingElderly,
    title: "Missing Elderly",
    description: "Support for dementia and Alzheimer's cases, with a large emergency button and medical history.",
    live: false,
  },
  {
    photo: PHOTOS.lostPets,
    title: "Lost Pets",
    description: "Upload photos and details of a lost pet; nearby shelters and vets can respond directly.",
    live: false,
  },
  {
    photo: PHOTOS.hospitals,
    title: "Hospital Directory",
    description: "Find emergency, trauma, government, and private hospitals with live navigation and calling.",
    live: false,
  },
  {
    photo: PHOTOS.ambulance,
    title: "Ambulance",
    description: "Request an ambulance and track status, with nearby provider notification.",
    live: false,
  },
  {
    photo: PHOTOS.volunteers,
    title: "Nearby Volunteers",
    description: "Verified volunteers by skill — medical, search & rescue, animal rescue, transport.",
    live: false,
  },
  {
    photo: PHOTOS.ngos,
    title: "NGOs",
    description: "Verified NGO dashboards to accept, update, and close community assistance cases.",
    live: false,
  },
  {
    photo: PHOTOS.shelters,
    title: "Shelter Finder",
    description: "Government, NGO, and temporary shelters with live capacity and contact details.",
    live: false,
  },
];

function ModuleCard({ mod }: { mod: ModuleInfo }) {
  const card = (
    <div className="group relative aspect-[4/5] overflow-hidden rounded-xl">
      <Image
        src={mod.photo}
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={`object-cover transition-transform duration-500 ${mod.live ? "group-hover:scale-105" : "grayscale"}`}
      />
      <div
        aria-hidden
        className={`absolute inset-0 bg-gradient-to-t ${mod.live ? "from-black/90 via-black/20 to-transparent" : "from-black/85 via-black/40 to-black/10"}`}
      />

      <span
        className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
          mod.live ? "bg-green-500 text-white" : "bg-white/90 text-black"
        }`}
      >
        {mod.live ? "Live" : "Coming soon"}
      </span>

      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        <h3 className="font-bold">{mod.title}</h3>
        <p className="mt-1 text-sm text-white/80">{mod.description}</p>
      </div>
    </div>
  );

  return mod.href ? (
    <Link href={mod.href} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}

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
        {MODULES.map((mod) => (
          <ModuleCard key={mod.title} mod={mod} />
        ))}
      </div>
    </section>
  );
}
