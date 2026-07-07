export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Thin, testable wrapper around the browser Geolocation API. */
export function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not available in this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      () => reject(new Error("Could not get your location. Please enable location access.")),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}
