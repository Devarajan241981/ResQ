"use client";

import Image from "next/image";
import { useLanguage } from "@/lib/i18n/language-context";
import type { TranslationKey } from "@/lib/i18n/translations";

interface Props {
  photo: string;
  titleKey: TranslationKey;
  subtitleKey?: TranslationKey;
}

/** Full-width photo banner used at the top of every module page so no page feels like a bare skeleton. */
export function PageHero({ photo, titleKey, subtitleKey }: Props) {
  const { t } = useLanguage();

  return (
    <section className="relative flex h-44 items-end overflow-hidden sm:h-56">
      <Image src={photo} alt="" fill priority sizes="100vw" className="object-cover" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="relative mx-auto w-full max-w-5xl px-4 pb-5 text-white">
        <h1 className="text-3xl font-bold drop-shadow sm:text-4xl">{t(titleKey)}</h1>
        {subtitleKey && <p className="mt-1 max-w-2xl text-sm text-white/90 drop-shadow">{t(subtitleKey)}</p>}
      </div>
    </section>
  );
}
