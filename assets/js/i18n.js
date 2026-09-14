// ============================================================
// LANGUAGE TOGGLE — Urdu / Hindi / English
// Elements marked with data-i18n-key read the matching field
// from SITE_DATA based on current language suffix:
//   lang "ur" -> field + "Urdu"
//   lang "hi" -> field + "Hindi"
//   lang "en" -> field (no suffix)
// Static UI strings (buttons, labels) come from UI_STRINGS below.
// ============================================================

const UI_STRINGS = {
  en: {
    home: "Home", books: "Books", poetry: "Poetry Archive", shagird: "Shagird Circle",
    bazm: "Bazm-e-Aziz", city: "Barabanki Guide", gallery: "Gallery",
    readBooks: "Read Books", searchPoetry: "Search Poetry",
    aboutTitle: "About", joinBazm: "Join Bazm-e-Aziz",
    footerTagline: "Preserving verse, discipleship, and the spirit of Barabanki.",
  },
  hi: {
    home: "मुख्य पृष्ठ", books: "किताबें", poetry: "शायरी संग्रह", shagird: "शागिर्द मंडली",
    bazm: "बज़्म-ए-अज़ीज़", city: "बाराबंकी गाइड", gallery: "गैलरी",
    readBooks: "किताबें पढ़ें", searchPoetry: "शायरी खोजें",
    aboutTitle: "परिचय", joinBazm: "बज़्म-ए-अज़ीज़ में शामिल हों",
    footerTagline: "शायरी, शागिर्दी और बाराबंकी की रूह को महफ़ूज़ रखने की एक कोशिश।",
  },
  ur: {
    home: "صفحہ اول", books: "کتابیں", poetry: "شاعری آرکائیو", shagird: "شاگرد حلقہ",
    bazm: "بزم عزیز", city: "بارہ بنکی گائیڈ", gallery: "گیلری",
    readBooks: "کتابیں پڑھیں", searchPoetry: "شاعری تلاش کریں",
    aboutTitle: "تعارف", joinBazm: "بزم عزیز میں شامل ہوں",
    footerTagline: "شاعری، شاگردی اور بارہ بنکی کی روح کو محفوظ رکھنے کی ایک کوشش۔",
  },
};

const LangStore = {
  KEY: "bazm_lang",
  get() { return localStorage.getItem(this.KEY) || "en"; },
  set(lang) { localStorage.setItem(this.KEY, lang); },
};

function fieldForLang(base, lang) {
  if (lang === "ur") return base + "Urdu";
  if (lang === "hi") return base + "Hindi";
  return base;
}

function applyLanguage(lang) {
  document.documentElement.setAttribute("lang", lang === "en" ? "en" : lang === "hi" ? "hi" : "ur");
  document.body.setAttribute("dir", lang === "ur" ? "rtl" : "ltr");
  document.body.classList.toggle("lang-urdu", lang === "ur");
  document.body.classList.toggle("lang-hindi", lang === "hi");
  document.body.classList.toggle("lang-english", lang === "en");

  // Static UI strings
  document.querySelectorAll("[data-ui]").forEach((el) => {
    const key = el.getAttribute("data-ui");
    if (UI_STRINGS[lang] && UI_STRINGS[lang][key]) el.textContent = UI_STRINGS[lang][key];
  });

  // Toggle button active state
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  // Let the current page re-render its dynamic (data-driven) content
  if (typeof window.renderPageContent === "function") window.renderPageContent(lang);
}

function initLanguageToggle() {
  const current = LangStore.get();
  const container = document.getElementById("lang-toggle");
  if (container) {
    container.innerHTML = `
      <button class="lang-btn" data-lang="en">EN</button>
      <button class="lang-btn" data-lang="hi">हि</button>
      <button class="lang-btn" data-lang="ur">اردو</button>
    `;
    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".lang-btn");
      if (!btn) return;
      LangStore.set(btn.dataset.lang);
      applyLanguage(btn.dataset.lang);
    });
  }
  applyLanguage(current);
}

document.addEventListener("DOMContentLoaded", initLanguageToggle);
