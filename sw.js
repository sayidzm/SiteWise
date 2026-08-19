const CACHE_NAME = "workout-tracker-sitewise-redesign-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/tokens.css",
  "./css/base.css",
  "./css/layout.css",
  "./css/components.css",
  "./css/workout.css",
  "./css/responsive.css",
  "./js/app.js",
  "./js/router.js",
  "./js/components/bottom-nav.js",
  "./js/data/program-data.js",
  "./js/data/program-content.js",
  "./js/models/workout-session.js",
  "./js/services/app-data.js",
  "./js/services/data-portability-service.js",
  "./js/services/history-service.js",
  "./js/services/pr-service.js",
  "./js/services/progress-service.js",
  "./js/services/progression-service.js",
  "./js/services/pwa-service.js",
  "./js/services/previous-performance-service.js",
  "./js/services/session-repository.js",
  "./js/services/settings-service.js",
  "./js/services/wake-lock-service.js",
  "./js/services/workout-session-service.js",
  "./js/storage/index.js",
  "./js/storage/migrations.js",
  "./js/storage/schema.js",
  "./js/storage/storage.js",
  "./js/utils/dates.js",
  "./js/views/history.js",
  "./js/views/home.js",
  "./js/views/program.js",
  "./js/views/progress.js",
  "./js/views/settings.js",
  "./js/views/workout.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(() => caches.match(new URL("./index.html", self.registration.scope).href))
    );
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request, { ignoreSearch: true });

  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  return cached || (await networkPromise) || new Response("Offline", { status: 503, statusText: "Offline" });
}
