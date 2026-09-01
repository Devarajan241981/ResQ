// Minimal service worker so ResQ is installable as a PWA and the SOS launch
// page still opens when offline (network-first for navigations, cache fallback).
const CACHE = "resq-sos-v1";
const SHELL = ["/sos-launch"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/sos-launch").then((r) => r || fetch(request))),
    );
  }
});
