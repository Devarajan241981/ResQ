"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { EmergencyHelplineBar } from "./emergency-helpline-bar";
import { Navbar } from "./navbar";

/**
 * On the homepage the hero should stand alone at first (just the image + search).
 * The header (helpline bar + navbar) is hidden at the very top and slides in as a
 * fixed bar once the visitor scrolls. On every other page the header is a normal
 * in-flow bar.
 */
export function SiteHeader() {
  const isHome = usePathname() === "/";
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setShown(window.scrollY > 240);
    // Defer the initial read out of the effect body (avoids sync setState-in-effect).
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isHome]);

  if (!isHome) {
    return (
      <>
        <EmergencyHelplineBar />
        <Navbar />
      </>
    );
  }

  return (
    <div
      aria-hidden={!shown}
      className={`fixed inset-x-0 top-0 z-40 shadow-lg transition-transform duration-300 ${
        shown ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <EmergencyHelplineBar />
      <Navbar />
    </div>
  );
}
