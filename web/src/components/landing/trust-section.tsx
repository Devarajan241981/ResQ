import { Lock, ShieldCheck, UserCheck } from "lucide-react";

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Verification first",
    description:
      "Reporting and volunteering require phone verification. High-trust actions are gated behind verified accounts, and reports are risk-scored to flag incomplete or suspicious submissions.",
  },
  {
    icon: Lock,
    title: "Security by design",
    description:
      "JWT auth with refresh-token rotation, per-device session management, audit logging on every state change, and role-based access control across citizen, volunteer, NGO, hospital, and admin roles.",
  },
  {
    icon: UserCheck,
    title: "Privacy-respecting",
    description:
      "Public share pages expose only what's needed to help find someone — never private contact details, medical history, or reporter identity.",
  },
] as const;

export function TrustSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Built to be trusted with emergencies</h2>
        <p className="mx-auto mt-3 max-w-2xl text-foreground/70">
          A platform that coordinates real emergencies has to earn trust on privacy and security, not
          just features.
        </p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {PRINCIPLES.map((p) => (
          <div key={p.title} className="rounded-xl border border-border p-6">
            <p.icon className="h-6 w-6" aria-hidden />
            <h3 className="mt-4 font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm text-foreground/70">{p.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
