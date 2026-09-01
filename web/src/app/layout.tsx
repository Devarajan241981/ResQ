import type { Metadata } from "next";
import { Baloo_2, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site-header";
import { FloatingActionRail } from "@/components/floating-action-rail";
import { HelpAssistant } from "@/components/help-assistant";
import { PwaRegister } from "@/components/pwa-register";
import { Footer } from "@/components/footer";

// Restore the saved brand accent + accessibility preferences before first paint
// so there's no flash of the default theme on reload.
const BOOT_SCRIPT = `(function(){try{var r=document.documentElement;var b=localStorage.getItem('resq-brand');if(b)r.style.setProperty('--brand',b);var a=localStorage.getItem('resq-a11y');if(a){var s=JSON.parse(a);if(s.contrast)r.classList.add('a11y-contrast');if(s.hideImages)r.classList.add('a11y-hide-images');if(s.bigCursor)r.classList.add('a11y-big-cursor');if(s.spacing)r.classList.add('a11y-spacing');if(s.lineHeight)r.classList.add('a11y-line-height');if(s.fontScale&&s.fontScale!==100)r.style.fontSize=s.fontScale+'%';}}catch(e){}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Distinctive rounded display face for the ResQ Bharath wordmark. Ships Latin +
// Devanagari; other Indic scripts gracefully fall back to the UI sans.
const brandFont = Baloo_2({
  variable: "--font-brand",
  subsets: ["latin", "devanagari"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "ResQ Bharath — Emergency Community Platform",
  description:
    "Community emergency platform for Bharath: missing persons, SOS, blood donation, and disaster coordination.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${brandFont.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
        <Providers>
          <PwaRegister />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <FloatingActionRail />
          <HelpAssistant />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
