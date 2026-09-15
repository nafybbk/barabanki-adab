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
    bazm: "Bazm-e-Aziz", city: "Barabanki Guide", gallery: "Gallery", apps: "Apps", poets: "Poets",
    poetsFahrisht: "Poets of Barabanki", poetsEyebrow: "The Poets", ustadBadge: "Ustad Shayer",
    poetsIntro: "Barabanki's known and forgotten poets, in one place.",
    poetProfile: "Profile", moreComingSoon: "More poets will be added here over time.",
    readBooks: "Read Books", searchPoetry: "Search Poetry",
    aboutTitle: "About", joinBazm: "Join Bazm-e-Aziz",
    footerTagline: "Preserving verse, discipleship, and the spirit of Barabanki.",
    bzTitle: "Bazm", bzYourName: "Your name", bzYourPin: "PIN (4-6 digits)",
    bzLogin: "Log in", bzRegister: "New here? Register", bzHaveAccount: "Already registered? Log in",
    bzLogout: "Log out", bzPlaceholder: "Write a comment, a sher, or a whole ghazal...",
    bzSend: "Post", bzEmpty: "No one has written here yet — be the first.",
    bzLoading: "Loading...", bzAs: "Posting as",
    heroHeading: "A life story, lived in words.",
    aboutBazmLink: "About Bazm-e-Aziz",
    featuredBooksEyebrow: "Five Books", publishedBooksHeading: "Published collections",
    allBooksLink: "See all books",
    namoonaKalaamEyebrow: "A Sample of the Verse", chandAshaarHeading: "A few ashaar",
    pooraDeewanLink: "Read the full deewan",
    shagirdHeading: "Join the circle of shagirds",
    shagirdBody: "Share your writings, reels, and photos — under your own name, become part of this literary family.",
    cityEyebrow: "The City of Barabanki", citySoilHeading: "The soil that raised a poet",
    cityTareekh: "History", cityDargah: "Dargah", cityKhidmaat: "Services", cityGuideCard: "Guide",
    offlineSaved: "This book is saved for offline reading", offlineRemove: "Remove",
    offlineWillSave: "This book will be saved for offline reading once it loads.",
    bazmDirTitle: "All Bazms", bazmDirIntro: "Join any Bazm below, or start your own.",
    bazmLoginPrompt: "Sign in with Gmail to join a Bazm", bazmLoggedInAs: "Signed in as",
    bazmLogoutBtn: "Sign out",
    bazmProfileHeading: "Just one more step", bazmProfileNote: "Your name and phone number, so other members know who you are.",
    bazmNamePh: "Your name", bazmPhonePh: "Phone number", bazmSaveBtn: "Save",
    bazmJoinBtn: "Join", bazmLeaveBtn: "Leave", bazmMembers: "members",
    bazmCreateToggle: "+ Start a new Bazm", bazmCreateNamePh: "Bazm's name",
    bazmCreateDescPh: "Short description (optional)", bazmCreateSubmit: "Submit for approval",
    bazmPendingBadge: "Pending approval", bazmWhatsappApprove: "Message on WhatsApp for approval",
    bazmMyBazms: "Bazms you started", bazmErr_NAAM_KHALI: "Please enter a name",
    bazmErr_PROFILE_MISSING: "Please complete your profile first", bazmErr_BAZM_PENDING: "This Bazm is still pending approval",
    bazmErr_BOHOT_ACCOUNTS: "Too many accounts from this device — please try again later",
    bazmErr_default: "Something went wrong, please try again",
  },
  hi: {
    home: "मुख्य पृष्ठ", books: "किताबें", poetry: "शायरी संग्रह", shagird: "शागिर्द मंडली",
    bazm: "बज़्म-ए-अज़ीज़", city: "बाराबंकी गाइड", gallery: "गैलरी", apps: "ऐप्स", poets: "शायर",
    poetsFahrisht: "बाराबंकी के शायर", poetsEyebrow: "शायर", ustadBadge: "उस्ताद शायर",
    poetsIntro: "बाराबंकी के जाने-पहचाने और गुमशुदा शायर, एक ही जगह।",
    poetProfile: "परिचय", moreComingSoon: "यहाँ आगे और शायर जोड़े जाएँगे।",
    readBooks: "किताबें पढ़ें", searchPoetry: "शायरी खोजें",
    aboutTitle: "परिचय", joinBazm: "बज़्म-ए-अज़ीज़ में शामिल हों",
    footerTagline: "शायरी, शागिर्दी और बाराबंकी की रूह को महफ़ूज़ रखने की एक कोशिश।",
    bzTitle: "बज़्म", bzYourName: "अपना नाम", bzYourPin: "पिन (4-6 अंक)",
    bzLogin: "दाख़िल हों", bzRegister: "नए हैं? रजिस्टर करें", bzHaveAccount: "पहले से रजिस्टर्ड? दाख़िल हों",
    bzLogout: "बाहर निकलें", bzPlaceholder: "कोई तब्सेरा, शेर, या पूरी ग़ज़ल लिखें...",
    bzSend: "भेजें", bzEmpty: "अभी तक किसी ने कुछ नहीं लिखा — सबसे पहले आप लिखें।",
    bzLoading: "लोड हो रहा है...", bzAs: "के नाम से पोस्ट हो रहा है",
    heroHeading: "लफ़्ज़ों में बसी एक ज़िंदगी की दास्तान।",
    aboutBazmLink: "बज़्म-ए-अज़ीज़ के बारे में",
    featuredBooksEyebrow: "पाँच किताबें", publishedBooksHeading: "शाया-शुदा मजमुए",
    allBooksLink: "सब किताबें देखें",
    namoonaKalaamEyebrow: "नमूना कलाम", chandAshaarHeading: "चंद अश'आर",
    pooraDeewanLink: "पूरा दीवान पढ़ें",
    shagirdHeading: "शागिर्दों की महफ़िल में शामिल हों",
    shagirdBody: "अपनी तहरीरें, रील्स, और तस्वीरें साझा करें — अपने नाम के साथ, इस अदबी ख़ानदान का हिस्सा बनें।",
    cityEyebrow: "शहर-ए-बाराबंकी", citySoilHeading: "वह मिट्टी जिसने शायर पैदा किए",
    cityTareekh: "तारीख़", cityDargah: "दरगाह", cityKhidmaat: "ख़िदमात", cityGuideCard: "गाइड",
    offlineSaved: "यह किताब ऑफ़लाइन पढ़ने के लिए सेव हो गई है", offlineRemove: "हटाएँ",
    offlineWillSave: "लोड होते ही यह किताब ऑफ़लाइन पढ़ने के लिए सेव हो जाएगी।",
    bazmDirTitle: "सारी बज़्में", bazmDirIntro: "नीचे किसी भी बज़्म में शामिल हों, या अपनी बज़्म बनाएं।",
    bazmLoginPrompt: "बज़्म में शामिल होने के लिए Gmail से लॉगिन करें", bazmLoggedInAs: "लॉगिन है",
    bazmLogoutBtn: "लॉगआउट",
    bazmProfileHeading: "बस एक आख़िरी क़दम", bazmProfileNote: "आपका नाम और फ़ोन नंबर, ताकि बाकी सदस्य आपको पहचान सकें।",
    bazmNamePh: "आपका नाम", bazmPhonePh: "फ़ोन नंबर", bazmSaveBtn: "सेव करें",
    bazmJoinBtn: "शामिल हों", bazmLeaveBtn: "छोड़ दें", bazmMembers: "सदस्य",
    bazmCreateToggle: "+ नई बज़्म बनाएं", bazmCreateNamePh: "बज़्म का नाम",
    bazmCreateDescPh: "मुख़्तसर तआरुफ़ (वैकल्पिक)", bazmCreateSubmit: "मंज़ूरी के लिए भेजें",
    bazmPendingBadge: "मंज़ूरी का इंतज़ार", bazmWhatsappApprove: "मंज़ूरी के लिए WhatsApp करें",
    bazmMyBazms: "आपकी बनाई बज़्में", bazmErr_NAAM_KHALI: "कृपया नाम लिखें",
    bazmErr_PROFILE_MISSING: "पहले अपनी प्रोफ़ाइल पूरी करें", bazmErr_BAZM_PENDING: "यह बज़्म अभी मंज़ूरी के इंतज़ार में है",
    bazmErr_BOHOT_ACCOUNTS: "इस डिवाइस से बहुत ज़्यादा अकाउंट बन चुके — कृपया बाद में कोशिश करें",
    bazmErr_default: "कुछ गड़बड़ हो गई, दोबारा कोशिश करें",
  },
  ur: {
    home: "صفحہ اول", books: "کتابیں", poetry: "شاعری آرکائیو", shagird: "شاگرد حلقہ",
    bazm: "بزم عزیز", city: "بارہ بنکی گائیڈ", gallery: "گیلری", apps: "ایپس", poets: "شعرا",
    poetsFahrisht: "بارہ بنکی کے شعرا", poetsEyebrow: "شعرا", ustadBadge: "استاد شاعر",
    poetsIntro: "بارہ بنکی کے معروف اور گمشدہ شعرا، ایک ہی جگہ۔",
    poetProfile: "تعارف", moreComingSoon: "یہاں آگے اور شعرا شامل کیے جائیں گے۔",
    readBooks: "کتابیں پڑھیں", searchPoetry: "شاعری تلاش کریں",
    aboutTitle: "تعارف", joinBazm: "بزم عزیز میں شامل ہوں",
    footerTagline: "شاعری، شاگردی اور بارہ بنکی کی روح کو محفوظ رکھنے کی ایک کوشش۔",
    bzTitle: "بزم", bzYourName: "اپنا نام", bzYourPin: "پن (٤ سے ٦ ہندسے)",
    bzLogin: "داخل ہوں", bzRegister: "نئے ہیں؟ رجسٹر کریں", bzHaveAccount: "پہلے سے رجسٹرڈ؟ داخل ہوں",
    bzLogout: "باہر نکلیں", bzPlaceholder: "کوئی تبصرہ، شعر، یا پوری غزل لکھیں۔۔۔",
    bzSend: "بھیجیں", bzEmpty: "ابھی تک کسی نے کچھ نہیں لکھا — سب سے پہلے آپ لکھیں۔",
    bzLoading: "لوڈ ہو رہا ہے۔۔۔", bzAs: "کے نام سے پوسٹ ہو رہا ہے",
    heroHeading: "لفظوں میں بسی ایک زندگی کی داستان۔",
    aboutBazmLink: "بزم عزیز کے بارے میں",
    featuredBooksEyebrow: "پانچ کتابیں", publishedBooksHeading: "شائع شدہ مجموعے",
    allBooksLink: "سب کتابیں دیکھیں",
    namoonaKalaamEyebrow: "نمونۂ کلام", chandAshaarHeading: "چند اشعار",
    pooraDeewanLink: "پورا دیوان پڑھیں",
    shagirdHeading: "شاگردوں کی محفل میں شامل ہوں",
    shagirdBody: "اپنی تحریریں، ریلز، اور تصویریں شیئر کریں — اپنے نام کے ساتھ، اس ادبی خاندان کا حصہ بنیں۔",
    cityEyebrow: "شہرِ بارہ بنکی", citySoilHeading: "وہ مٹی جس نے شاعر پیدا کیے",
    cityTareekh: "تاریخ", cityDargah: "درگاہ", cityKhidmaat: "خدمات", cityGuideCard: "گائیڈ",
    offlineSaved: "یہ کتاب آف لائن پڑھنے کے لیے محفوظ ہو گئی ہے", offlineRemove: "ہٹائیں",
    offlineWillSave: "لوڈ ہوتے ہی یہ کتاب آف لائن پڑھنے کے لیے محفوظ ہو جائے گی۔",
    bazmDirTitle: "ساری بزمیں", bazmDirIntro: "نیچے کسی بھی بزم میں شامل ہوں، یا اپنی بزم بنائیں۔",
    bazmLoginPrompt: "بزم میں شامل ہونے کے لیے Gmail سے لاگ ان کریں", bazmLoggedInAs: "لاگ ان ہے",
    bazmLogoutBtn: "لاگ آؤٹ",
    bazmProfileHeading: "بس ایک آخری قدم", bazmProfileNote: "آپ کا نام اور فون نمبر، تاکہ باقی ارکان آپ کو پہچان سکیں۔",
    bazmNamePh: "آپ کا نام", bazmPhonePh: "فون نمبر", bazmSaveBtn: "محفوظ کریں",
    bazmJoinBtn: "شامل ہوں", bazmLeaveBtn: "چھوڑ دیں", bazmMembers: "ارکان",
    bazmCreateToggle: "+ نئی بزم بنائیں", bazmCreateNamePh: "بزم کا نام",
    bazmCreateDescPh: "مختصر تعارف (اختیاری)", bazmCreateSubmit: "منظوری کے لیے بھیجیں",
    bazmPendingBadge: "منظوری کا انتظار", bazmWhatsappApprove: "منظوری کے لیے WhatsApp کریں",
    bazmMyBazms: "آپ کی بنائی بزمیں", bazmErr_NAAM_KHALI: "براہ کرم نام لکھیں",
    bazmErr_PROFILE_MISSING: "پہلے اپنی پروفائل مکمل کریں", bazmErr_BAZM_PENDING: "یہ بزم ابھی منظوری کے انتظار میں ہے",
    bazmErr_BOHOT_ACCOUNTS: "اس ڈیوائس سے بہت زیادہ اکاؤنٹس بن چکے — براہ کرم بعد میں کوشش کریں",
    bazmErr_default: "کچھ گڑبڑ ہو گئی، دوبارہ کوشش کریں",
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
