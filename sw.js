// Service worker voor de iteratie-preview: alles direct uit cache openen,
// op de achtergrond verversen. Verzoeken met ?t= (de verversknop) gaan
// altijd puur over het netwerk.
const CACHE = "vop-v15";
const PRECACHE = [
  "./", "index.html", "pakket.html", "gegevens.html", "betaal.html",
  "gelukt.html", "knoppen.html",
  "assets/hero-t2.webp", "assets/opening.mp4", "assets/kranten.webp", "assets/philip.png", "assets/vossius4.png", "assets/wijs-bijles.png",
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
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      const hit = await c.match(e.request);
      const net = fetch(e.request)
        .then((r) => { if (r.ok) c.put(e.request, r.clone()); return r; })
        .catch(() => hit);
      return hit || net;
    })
  );
});
