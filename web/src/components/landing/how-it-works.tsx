import { BellRing, CircleCheck, ScanSearch, Users } from "lucide-react";

const STEPS = [
  {
    icon: ScanSearch,
    title: "Report or request help",
    description: "File a missing person report, trigger SOS, or post a blood/rescue request in under a minute.",
  },
  {
    icon: BellRing,
    title: "Geo-targeted alerts go out",
    description: "Nearby verified volunteers, trusted contacts, and relevant responders are notified instantly.",
  },
  {
    icon: Users,
    title: "The community responds",
    description: "Volunteers, NGOs, hospitals, and donors coordinate directly through the platform.",
  },
  {
    icon: CircleCheck,
    title: "Case tracked to resolution",
    description: "Status updates, sightings, and timelines are logged until the case is marked resolved.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="border-y border-border bg-surface/50">
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight">How it works</h2>

        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
                  <step.icon className="h-5 w-5" aria-hidden />
                </div>
                <span className="text-sm font-medium text-foreground/40">Step {i + 1}</span>
              </div>
              <h3 className="mt-3 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-foreground/70">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
