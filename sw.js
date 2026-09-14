// ============================================================
// SERVICE WORKER — do kaam:
//  1. Web Share Target: phone se koi tasveer/PDF is app par share
//     ho to file ko cache mein rakh kar gallery/upload.html par
//     bhej deta hai (wahan se compress + Cloudinary upload).
//  2. (Filhal koi offline caching nahi — site chhoti hai; home
//     server ke waqt offline mode add kar sakte hain.)
// ============================================================

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === "POST" && url.pathname.endsWith("/share-target")) {
    event.respondWith(handleShare(event.request));
  }
});

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
