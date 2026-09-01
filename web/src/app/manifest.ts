import type { MetadataRoute } from "next";

// Makes ResQ installable as a PWA. The home-screen icon opens straight to the
// one-button SOS launch page (start_url), so an emergency is one tap away.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ResQ SOS",
    short_name: "SOS",
    description: "One-tap emergency SOS — alert your trusted contacts and nearby responders.",
    start_url: "/sos-launch",
    scope: "/",
    display: "standalone",
    background_color: "#DC2626",
    theme_color: "#DC2626",
    orientation: "portrait",
    icons: [
      { src: "/sos-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/sos-icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
