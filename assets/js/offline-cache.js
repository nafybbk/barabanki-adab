// ============================================================
// OFFLINE CACHE helper — book-reader page ke liye. Actual caching
// sw.js karta hai (cache-first strategy); yeh sirf status check
// karne aur user ki marzi se hatane ke liye hai.
// ============================================================

const OfflineCache = {
  BOOK_CACHE: "adab-books-v1",

  async isCached(url) {
    if (!("caches" in window)) return false;
    try {
      const cache = await caches.open(this.BOOK_CACHE);
      return !!(await cache.match(url));
    } catch {
      return false;
    }
  },

  async remove(url) {
    if (!("caches" in window)) return;
    try {
      const cache = await caches.open(this.BOOK_CACHE);
      await cache.delete(url);
    } catch {}
  },
};
