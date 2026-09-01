"use client";

import { Droplet, MapPin, Navigation, Phone, ShieldPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { getCurrentPosition } from "@/lib/geolocation";
import { useLanguage } from "@/lib/i18n/language-context";
import type { Hospital, PaginatedResponse } from "@/lib/api/types";

export function HospitalsDirectory() {
  const { t } = useLanguage();
  const [items, setItems] = useState<Hospital[] | null>(null);
  const [located, setLocated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCurrentPosition()
      .then((pos) =>
        apiFetch<Hospital[]>(`/hospitals/nearby/?lat=${pos.latitude}&lng=${pos.longitude}&radius_km=30`).then((data) => {
          if (cancelled) return;
          setItems([...data].sort((a, b) => (a.distance_km ?? 1e9) - (b.distance_km ?? 1e9)));
          setLocated(true);
        }),
      )
      .catch(() =>
        apiFetch<PaginatedResponse<Hospital>>("/hospitals/")
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
        <h1 className="text-2xl font-bold tracking-tight">{t("hospitals.title")}</h1>
        <p className="mt-1 text-foreground/60">{t("hospitals.sub")}</p>
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
          {items.map((h) => {
            const callNumber = h.emergency_phone || h.phone;
            return (
              <li key={h.id} className="rounded-xl border border-border bg-background p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-bold">{h.name}</h2>
                    <p className="text-sm capitalize text-foreground/60">
                      {h.hospital_type.replace("_", " ")} · {h.city}
                    </p>
                  </div>
                  {h.distance_km != null && (
                    <span className="shrink-0 rounded-full bg-[color:var(--brand)]/10 px-2.5 py-1 text-xs font-semibold text-[color:var(--brand)]">
                      {h.distance_km.toFixed(1)} km
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {h.has_trauma_center && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600">
                      <ShieldPlus className="h-3.5 w-3.5" aria-hidden />
                      {t("dir.trauma")}
                    </span>
                  )}
                  {h.has_blood_bank && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#138808]/10 px-2.5 py-1 text-xs font-medium text-[#138808]">
                      <Droplet className="h-3.5 w-3.5" aria-hidden />
                      {t("dir.bloodBank")}
                    </span>
                  )}
                </div>

                {h.address && (
                  <p className="mt-2 flex items-start gap-1.5 text-sm text-foreground/60">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    {h.address}
                  </p>
                )}

                {callNumber && (
                  <a
                    href={`tel:${callNumber}`}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    <Phone className="h-4 w-4" aria-hidden />
                    {h.emergency_phone ? t("dir.emergency") : t("dir.call")} · {callNumber}
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
