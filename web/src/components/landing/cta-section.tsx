"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";

export function CtaSection() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return null;

  return (
    <section className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-4 py-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight">Join the response network</h2>
        <p className="max-w-xl text-foreground/70">
          Sign up as a citizen, volunteer, NGO, or hospital — it takes less than a minute, and your
          account works across every module.
        </p>
        <Link
          href="/register"
          className="rounded-md bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700"
        >
          Create your free account
        </Link>
      </div>
    </section>
  );
}
