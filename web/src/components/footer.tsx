import Link from "next/link";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { href: "/missing-persons", label: "Missing Persons" },
      { href: "/sos", label: "SOS" },
      { href: "/blood-donation", label: "Blood Donation" },
      { href: "/disaster-mode", label: "Disaster Mode" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/register", label: "Sign up" },
    ],
  },
  {
    title: "About",
    links: [{ href: "/about", label: "About ResQ India" }],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-lg font-semibold">ResQ India</p>
            <p className="mt-2 text-sm text-foreground/60">
              Community-powered emergency coordination for missing persons, SOS, blood donation, and
              disasters.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-medium text-foreground/50">{col.title}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6 text-xs text-foreground/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} ResQ India. Built for community emergency response.</p>
          <p>
            If you are in immediate danger, contact local emergency services (112) directly — this
            platform supplements, not replaces, official emergency response.
          </p>
        </div>
      </div>
    </footer>
  );
}
