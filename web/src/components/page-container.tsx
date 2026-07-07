import type { ReactNode } from "react";

/** Standard content width/padding for app pages (as opposed to full-bleed landing sections). */
export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-5xl px-4 py-8">{children}</div>;
}
