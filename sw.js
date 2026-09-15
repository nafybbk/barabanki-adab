// ============================================================
// SERVICE WORKER — teen kaam:
//  1. Web Share Target (pehle jaisa hi — phone se koi tasveer/PDF is
//     app par share ho to gallery/upload.html par bhej deta hai).
//  2. App-shell caching: apni CSS/JS/fonts/icons + Google Fonts
//     stale-while-revalidate (cache se turant serve, background mein
//     refresh) — app turant khule, "loading" na dikhe.
//  3. Book PDFs/covers: cache-first — ek baar khuli kitab dobara
//     bina internet ke bhi turant khulti hai. Kabhi khud-ba-khud
//     delete nahi hota (BOOK_CACHE ko activate handler chhoo tak
//     nahi karta) — hatana ho to reader page ke "hata dein" button se.
//
// IMPORTANT: jab bhi assets/css|js/* mein koi badlaav karo aur HTML
// files ke `?v=N` bump karo, SHELL_CACHE ka version bhi yahan bump
// karna — warna purana shell cache hi serve hota rahega.
// ============================================================

const SHELL_CACHE = "adab-shell-v16";
const BOOK_CACHE = "adab-books-v1";
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("adab-shell-") && k !== SHELL_CACHE)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method === "POST" && url.pathname.endsWith("/share-target")) {
    event.respondWith(handleShare(req));
    return;
  }

  if (req.method !== "GET") return;

  // Book PDFs & covers: cache-first, fetch + store on first read.
  if (url.pathname.includes("/assets/pdf/") || /\.pdf$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(req, BOOK_CACHE));
    return;
  }

  // Site's own static assets + Google Fonts: stale-while-revalidate.
  const isOwnStatic = url.origin === self.location.origin && /\/assets\/(css|js|img|vendor)\//.test(url.pathname);
  const isFontHost = FONT_HOSTS.includes(url.hostname);
  if (isOwnStatic || isFontHost) {
    event.respondWith(staleWhileRevalidate(req, SHELL_CACHE));
    return;
  }

  // HTML pages, Supabase, Cloudinary calls: normal network — keeps
  // admin-edited/live content fresh.
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const fresh = await fetch(request);
  if (fresh && fresh.ok) cache.put(request, fresh.clone());
  return fresh;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((fresh) => {
      if (fresh && fresh.ok) cache.put(request, fresh.clone());
      return fresh;
    })
    .catch(() => null);
  return cached || (await networkPromise) || fetch(request);
}

async function handleShare(request) {
  try {
    const form = await request.formData();
    const files = form.getAll("media").filter((f) => f && f.size);
    const sharedUrl = (form.get("url") || form.get("text") || "").toString();

    const cache = await caches.open("bazm-shared");
    await cache.put(
      "shared-files-meta",
      new Response(JSON.stringify({ count: files.length, url: sharedUrl, at: Date.now() }), {
        headers: { "Content-Type": "application/json" },
      })
    );
    await Promise.all(
      files.map((f, i) =>
        cache.put(
          `shared-file-${i}`,
          new Response(f, { headers: { "Content-Type": f.type || "application/octet-stream", "X-File-Name": encodeURIComponent(f.name || `shared-${i}`) } })
        )
      )
    );
    return Response.redirect("./gallery/upload.html?shared=" + files.length, 303);
  } catch {
    return Response.redirect("./gallery/upload.html", 303);
  }
}
