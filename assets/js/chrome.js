// ============================================================
// SITE CHROME — top navigation + footer, shared across all pages.
// Reads from SITE_DATA (data.js). Nav labels come from UI_STRINGS
// (i18n.js) so the whole chrome switches language instantly.
// ============================================================

const NAV_ITEMS = [
  { href: "/index.html", key: "home", ui: "home" },
  { href: "/books/index.html", key: "books", ui: "books" },
  { href: "/poetry/index.html", key: "poetry", ui: "poetry" },
  { href: "/shagird/index.html", key: "shagird", ui: "shagird" },
  { href: "/gallery/index.html", key: "gallery", ui: "gallery" },
  { href: "/bazm.html", key: "bazm", ui: "bazm" },
  { href: "/city/index.html", key: "city", ui: "city" },
  { href: "/poets/index.html", key: "poets", ui: "poets" },
  { href: "/apps/index.html", key: "apps", ui: "apps" },
];

function resolveHref(href) {
  const depth = window.location.pathname.split("/").filter(Boolean).length - 1;
  const prefix = depth > 0 ? "../".repeat(depth) : "";
  return prefix + href.replace(/^\//, "");
}

function siteHeader(active) {
  const { poet } = SITE_DATA;
  const linksHTML = NAV_ITEMS.map(
    (l) => `<a href="${resolveHref(l.href)}" data-ui="${l.ui}"${active === l.key ? ' class="nav-active"' : ""}></a>`
  ).join("");

  return `
  <div class="topbar">
    <div class="topbar-inner">
      <a href="${resolveHref("/index.html")}" class="brand">
        <div class="brand-mark">${poet.takhallusUrdu.charAt(0)}</div>
        <div class="brand-text">
          <div class="name-ur">${poet.nameUrdu}</div>
          <div class="name-sub">${poet.takhallus} · ${SITE_DATA.city.name}</div>
        </div>
      </a>
      <nav class="nav-links" id="navLinks">${linksHTML}</nav>
      <div id="lang-toggle" class="lang-toggle-desktop"></div>
      <button class="nav-toggle" id="navToggle" aria-label="Menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="nav-mobile" id="navMobile">
      ${linksHTML}
      <div id="lang-toggle-mobile"></div>
    </div>
  </div>`;
}

function siteFooter() {
  const { poet } = SITE_DATA;
  return `
  <footer>
    <div class="section">
      <div class="footer-grid">
        <div>
          <div class="h-urdu" style="font-size: 26px; color: var(--gold-pale); margin-bottom: 10px;">${poet.nameUrdu}</div>
          <p style="max-width: 380px; opacity: 0.85; font-size: 14px;" data-ui="footerTagline"></p>
        </div>
        <div>
          <div class="footer-heading">Adab</div>
          <div class="footer-links">
            <a href="${resolveHref("/books/index.html")}" data-ui="books"></a>
            <a href="${resolveHref("/poetry/index.html")}" data-ui="poetry"></a>
            <a href="${resolveHref("/shagird/index.html")}" data-ui="shagird"></a>
            <a href="${resolveHref("/gallery/index.html")}" data-ui="gallery"></a>
            <a href="${resolveHref("/bazm.html")}" data-ui="bazm"></a>
          </div>
        </div>
        <div>
          <div class="footer-heading">${SITE_DATA.city.name}</div>
          <div class="footer-links">
            <a href="${resolveHref("/city/index.html")}">Safarnama</a>
            <a href="${resolveHref("/city/dargah.html")}">Dargah</a>
            <a href="${resolveHref("/city/services.html")}">Khidmaat</a>
            <a href="${resolveHref("/city/guide.html")}">Guide</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© <span id="year"></span> ${poet.name} — Bazm-e-Aziz, Barabanki</span>
        <span>Mohabbat se banaya gaya · <a href="${resolveHref("/admin/index.html")}" style="opacity:0.5;">Admin</a></span>
      </div>
    </div>
  </footer>`;
}

function mountSiteChrome(active) {
  const headerEl = document.getElementById("site-header");
  const footerEl = document.getElementById("site-footer");
  if (headerEl) headerEl.innerHTML = siteHeader(active);
  if (footerEl) footerEl.innerHTML = siteFooter();

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const toggle = document.getElementById("navToggle");
  const mobile = document.getElementById("navMobile");
  if (toggle && mobile) {
    toggle.addEventListener("click", () => {
      const open = mobile.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  // Mirror the desktop lang toggle into the header container id expected by i18n.js
  const desktopLang = document.querySelector(".lang-toggle-desktop");
  if (desktopLang) desktopLang.id = "lang-toggle";
}

// PWA: service worker register karo (HTTPS ya localhost par hi chalega).
// Isi se "mobile app" wala hissa milta hai — phone par site install ho kar
// share-target ban jaati hai (photo share karo -> seedha gallery upload).
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    navigator.serviceWorker.register(resolveHref("/sw.js")).catch(() => {});
  } catch {}
}

document.addEventListener("DOMContentLoaded", () => {
  const active = document.body.getAttribute("data-page") || "";
  mountSiteChrome(active);
  registerServiceWorker();
});
