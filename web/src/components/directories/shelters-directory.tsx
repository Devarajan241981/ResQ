"use client";

import { BedDouble, MapPin, Navigation, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { getCurrentPosition } from "@/lib/geolocation";
import { useLanguage } from "@/lib/i18n/language-context";
import type { PaginatedResponse, Shelter } from "@/lib/api/types";

export function SheltersDirectory() {
  const { t } = useLanguage();
  const [items, setItems] = useState<Shelter[] | null>(null);
  const [located, setLocated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCurrentPosition()
      .then((pos) =>
        apiFetch<Shelter[]>(`/shelters/nearby/?lat=${pos.latitude}&lng=${pos.longitude}&radius_km=30`).then((data) => {
          if (cancelled) return;
          setItems([...data].sort((a, b) => (a.distance_km ?? 1e9) - (b.distance_km ?? 1e9)));
          setLocated(true);
        }),
      )
      .catch(() =>
        apiFetch<PaginatedResponse<Shelter>>("/shelters/")
          .then((d) => !cancelled && setItems(d.results))
          .catch(() => !cancelled && setItems([])),
      );
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("shelters.title")}</h1>
        <p className="mt-1 text-foreground/60">{t("shelters.sub")}</p>
      </div>

      {!located && items && (
        <p className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm text-foreground/60">
          <Navigation className="h-4 w-4" aria-hidden />
          {t("dir.enableLocation")}
        </p>
      )}

      {items === null ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-surface" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-foreground/60">{t("dir.none")}</p>
      ) : (
        <ul className="grid gap-3">
          {items.map((s) => {
            const full = s.available_capacity <= 0;
            return (
              <li key={s.id} className="rounded-xl border border-border bg-background p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-bold">{s.name}</h2>
                    <p className="text-sm capitalize text-foreground/60">
                      {s.shelter_type.replace("_", " ")} · {s.city}
                    </p>
                  </div>
                  {s.distance_km != null && (
                    <span className="shrink-0 rounded-full bg-[color:var(--brand)]/10 px-2.5 py-1 text-xs font-semibold text-[color:var(--brand)]">
                      {s.distance_km.toFixed(1)} km
                    </span>
                  )}
                </div>

                <p
                  className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    full ? "bg-red-500/10 text-red-600" : "bg-[#138808]/10 text-[#138808]"
                  }`}
                >
                  <BedDouble className="h-3.5 w-3.5" aria-hidden />
                  {s.available_capacity} / {s.capacity} {t("dir.bedsFree")}
                </p>

                {s.address && (
                  <p className="mt-2 flex items-start gap-1.5 text-sm text-foreground/60">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    {s.address}
                  </p>
                )}

                {s.contact_phone && (
                  <a
                    href={`tel:${s.contact_phone}`}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[color:var(--brand)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                  >
                    <Phone className="h-4 w-4" aria-hidden />
                    {t("dir.call")} · {s.contact_phone}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
