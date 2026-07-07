import type { Metadata } from "next";
import Link from "next/link";
import { HandHeart, Heart, ShieldCheck, Sparkles } from "lucide-react";
import { PageContainer } from "@/components/page-container";

export const metadata: Metadata = {
  title: "About — ResQ India",
  description: "The mission, principles, and roadmap behind ResQ India's emergency community platform.",
};

export default function AboutPage() {
  return (
    <PageContainer>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About ResQ India</h1>
        <p className="mt-4 text-lg text-foreground/70">
          ResQ India exists because the minutes right after someone goes missing, an emergency starts,
          or a disaster hits are the ones that matter most &mdash; and they&apos;re usually spent making
          phone calls, not coordinating help.
        </p>

        <section className="mt-12">
          <h2 className="text-xl font-semibold">The problem we&apos;re building for</h2>
          <p className="mt-3 text-foreground/70">
            When a family member goes missing, a stranger collapses in public, or a flood cuts off a
            neighborhood, the people best positioned to help are often nearby &mdash; a volunteer with
            search-and-rescue training, a hospital with a free bed, a neighbor with a car. What&apos;s
            usually missing isn&apos;t willingness, it&apos;s a fast, trustworthy way to connect the
            person who needs help with the people who can give it.
          </p>
          <p className="mt-3 text-foreground/70">
            ResQ India is a single platform for that coordination: missing persons, one-tap SOS, blood
            donation, and disaster response today, with hospital directories, ambulance requests,
            volunteer networks, NGO case management, and shelter finding built around the same
            foundation.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold">What we believe</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div className="flex gap-3">
              <ShieldCheck className="h-6 w-6 shrink-0 text-foreground/70" aria-hidden />
              <div>
                <h3 className="font-medium">Trust is the product</h3>
                <p className="mt-1 text-sm text-foreground/70">
                  An emergency platform is only as useful as it is trustworthy. Verification, audit
                  logging, and role-based access aren&apos;t afterthoughts here &mdash; they&apos;re
                  load-bearing.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Heart className="h-6 w-6 shrink-0 text-foreground/70" aria-hidden />
              <div>
                <h3 className="font-medium">Privacy protects people</h3>
                <p className="mt-1 text-sm text-foreground/70">
                  Public share pages show only what helps find someone &mdash; never a reporter&apos;s
                  contact details, a patient&apos;s medical history, or anything not needed for the case
                  at hand.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <HandHeart className="h-6 w-6 shrink-0 text-foreground/70" aria-hidden />
              <div>
                <h3 className="font-medium">Community does the work</h3>
                <p className="mt-1 text-sm text-foreground/70">
                  Volunteers, NGOs, hospitals, and donors are the ones who actually help &mdash; the
                  platform&apos;s job is to get the right alert to the right person, fast.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Sparkles className="h-6 w-6 shrink-0 text-foreground/70" aria-hidden />
              <div>
                <h3 className="font-medium">Built in the open, honestly</h3>
                <p className="mt-1 text-sm text-foreground/70">
                  Four modules are live today. The rest are being built module by module, with no
                  feature marked &quot;done&quot; until it&apos;s actually tested end-to-end.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold">What&apos;s live today</h2>
          <ul className="mt-3 list-inside list-disc space-y-1.5 text-foreground/70">
            <li>Missing person reporting with QR-code public share pages and sighting timelines</li>
            <li>One-tap SOS with live location and trusted-contact notification</li>
            <li>Emergency blood donation requests with donor response tracking</li>
            <li>Disaster mode status reporting — mark safe, or request rescue, food, water, or medicine</li>
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-semibold">What&apos;s coming next</h2>
          <p className="mt-3 text-foreground/70">
            Missing children and elderly workflows with extra verification, lost pet reporting, hospital
            and ambulance coordination, a verified volunteer network with skills and reputation, NGO case
            dashboards, shelter finding, a native mobile app, and admin tooling for moderation and
            analytics &mdash; roughly in that order.
          </p>
        </section>

        <div className="mt-14 flex flex-wrap items-center gap-3 border-t border-border pt-8">
          <Link
            href="/register"
            className="rounded-md bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
          >
            Create an account
          </Link>
          <Link href="/" className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold hover:bg-surface">
            Back to home
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
