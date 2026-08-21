// Service worker voor de iteratie-preview: alles direct uit cache openen,
// op de achtergrond verversen. Verzoeken met ?t= (de verversknop) gaan
// altijd puur over het netwerk.
const CACHE = "vop-v102";
const PRECACHE = [
  "./", "index.html", "pakket.html", "gegevens.html", "betaal.html",
  "gelukt.html", "knoppen.html", "assets/sheet.css", "assets/sheet.js", "assets/morph.js", "assets/stapel.css", "assets/stapel.js", "assets/contactbar.css", "assets/contactbar.js",
  "assets/hero-t2.webp", "assets/opening.mp4", "assets/knipsel-parool-2pag.webp", "assets/knipsel-fd.webp", "assets/fd-woordmerk.png", "assets/parool.png", "assets/stichting-wiskunde-actief.png", "assets/philip.png", "assets/vossius4.png", "assets/wijs-bijles.png",
  "assets/TU.png", "assets/wiswizlogo.png", "assets/ideal.png", "assets/qr-mock.png", "assets/hendrik.png", "assets/louis.png", "assets/annabel.png"
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.searchParams.has("t")) return; // verversknop: vers van het net
  // HTML/navigaties: NETWERK EERST (18 aug — Philip zag na elke deploy eerst
  // de vorige versie uit de cache; een iteratie-preview mag nooit oud openen).
  // Cache is alleen nog het offline-vangnet. Assets blijven cache-eerst met
  // achtergrond-verversing (snel, en de deploys bumpen CACHE toch).
  // nacht r15: ook de gedeelde bar-bestanden (assets/contactbar.css/.js) netwerk-eerst — anders opent een verse index.html
  // één keer met de vorige bar-CSS uit de cache.
  const isHTML = e.request.mode === "navigate" ||
    (e.request.destination === "document") ||
    url.pathname.endsWith(".html") || url.pathname.endsWith("/") ||
    url.pathname.endsWith(".css") || url.pathname.endsWith(".js");
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      if (isHTML) {
        try {
          const r = await fetch(e.request);
          if (r.ok) c.put(e.request, r.clone());
          return r;
        } catch (_) {
          const hit = await c.match(e.request);
          if (hit) return hit;
          throw _;
        }
      }
      const hit = await c.match(e.request);
      const net = fetch(e.request)
        .then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; })
        .catch(() => hit);
      return hit || net;
    })
  );
});
