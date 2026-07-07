"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { PHOTOS } from "@/lib/media/stock-photos";

const SLIDES = [
  {
    photo: PHOTOS.missingPersons,
    title: "Every minute counts when someone goes missing",
    description: "File a report with photos in under a minute, and share it instantly via a QR code.",
    href: "/missing-persons/new",
    cta: "Report someone missing",
  },
  {
    photo: PHOTOS.sos,
    title: "One tap sends help your way",
    description: "SOS shares your live location with trusted contacts and nearby verified volunteers.",
    href: "/sos",
    cta: "See how SOS works",
  },
  {
    photo: PHOTOS.bloodDonation,
    title: "A donor nearby could save a life today",
    description: "Post an urgent blood request or register as a donor — matched by blood group and city.",
    href: "/blood-donation",
    cta: "View blood requests",
  },
  {
    photo: PHOTOS.disasterMode,
    title: "Coordinated response when disaster strikes",
    description: "Mark yourself safe, or request rescue, food, water, or medicine during active disasters.",
    href: "/disaster-mode",
    cta: "View active alerts",
  },
] as const;

const AUTO_ADVANCE_MS = 6000;

export function InFocusCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[index];

  return (
    <section aria-label="In focus" className="mx-auto w-full max-w-6xl px-4 py-16">
      <h2 className="text-center text-3xl font-bold tracking-tight">In focus</h2>

      <div className="relative mt-8 overflow-hidden rounded-2xl">
        <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
          <Image
            key={slide.photo}
            src={slide.photo}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 1152px"
            className="object-cover transition-opacity duration-500"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
            <h3 className="max-w-xl text-xl font-bold sm:text-3xl">{slide.title}</h3>
            <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">{slide.description}</p>
            <Link
              href={slide.href}
              className="mt-4 inline-block rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
            >
              {slide.cta}
            </Link>
          </div>
        </div>

        <button
          type="button"
          aria-label="Previous"
          onClick={() => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm hover:bg-black/60"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => setIndex((i) => (i + 1) % SLIDES.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm hover:bg-black/60"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.title}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
