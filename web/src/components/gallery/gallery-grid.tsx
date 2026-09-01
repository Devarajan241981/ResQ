"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { apiFetch, extractErrorMessage } from "@/lib/api/client";
import type { GalleryImage, PaginatedResponse } from "@/lib/api/types";

export function GalleryGrid({ refreshKey = 0 }: { refreshKey?: number }) {
  const { t } = useLanguage();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<PaginatedResponse<GalleryImage>>("/gallery/images/")
      .then((data) => {
        if (cancelled) return;
        setImages(data.results);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(extractErrorMessage(err));
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (status === "loading") return <p className="text-foreground/70">{t("common.loading")}</p>;
  if (status === "error") return <p role="alert" className="text-red-600">{error}</p>;
  if (images.length === 0) return <p className="text-foreground/70">{t("gallery.empty")}</p>;

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {images.map((img) => (
        <li key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-surface">
          <Image
            src={img.image}
            alt={img.caption || t("gallery.heading")}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 text-white">
            {img.caption && <p className="truncate text-sm font-medium drop-shadow">{img.caption}</p>}
            <p className="truncate text-xs text-white/80 drop-shadow">
              {t("community.list.byPrefix")} {img.uploader_name}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
