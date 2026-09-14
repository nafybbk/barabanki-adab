// ============================================================
// SITE DATA — single source of truth
// This file can be edited directly, OR through the Admin Panel
// (admin/index.html) which writes back into localStorage and
// overlays on top of these defaults. See loadSiteData() at the
// bottom — pages should call that instead of using SITE_DATA raw.
// ============================================================

const SITE_DATA_DEFAULT = {
  poet: {
    // Naseer Ansari Barabankvi — Walid Sahab, site ka asal marqaz
    name: "Naseer Ansari Barabankvi",
    nameUrdu: "نصیر انصاری بارہ بنکوی",
    nameHindi: "नसीर अंसारी बाराबंकवी",
    takhallus: "Naseer",
    takhallusUrdu: "نصیر",
    takhallusHindi: "नसीर",
    tagline: "Panch kitabon ke shayer, Barabanki ki mitti ki awaaz",
    taglineUrdu: "پانچ کتابوں کے شاعر، بارہ بنکی کی مٹی کی آواز",
    taglineHindi: "पाँच किताबों के शायर, बाराबंकी की मिट्टी की आवाज़",
    bio: `Yahan Naseer Ansari Barabankvi sahab ka mukhtasar taaruf aayega —
    kab paida hue, kahan parhe-likhe, shayeri ka safar kaise shuru hua,
    kaunse mushairon mein shirkat ki, aur unke kalaam ka mizaj kya raha.`,
    bioUrdu: `یہاں نصیر انصاری بارہ بنکوی صاحب کا مختصر تعارف آئے گا — کب
    پیدا ہوئے، کہاں پڑھے لکھے، شاعری کا سفر کیسے شروع ہوا، کونسے
    مشاعروں میں شرکت کی، اور ان کے کلام کا مزاج کیا رہا۔`,
    bioHindi: `यहाँ नसीर अंसारी बाराबंकवी साहब का संक्षिप्त परिचय आएगा — कब
    पैदा हुए, कहाँ पढ़े-लिखे, शायरी का सफ़र कैसे शुरू हुआ, किन मुशायरों
    में शिरकत की, और उनके कलाम का मिज़ाज क्या रहा।`,
    photo: "assets/img/poet-portrait.jpg",
    years: "",
  },

  ustad: {
    // Naseer Ansari sahab ke Ustad — Bazm-e-Aziz unhi ke ehtaram mein hai
    name: "Azeez Sahab",
    nameUrdu: "عزیز صاحب",
    nameHindi: "अज़ीज़ साहब",
    note: `Azeez Sahab, Naseer Ansari Barabankvi ke ustad the, jinhone
    unhe shayeri ki islaah aur rehnumai di. Bazm-e-Aziz unhi ke naam
    aur ehtaram mein qayam ki gayi hai.`,
    noteUrdu: `عزیز صاحب، نصیر انصاری بارہ بنکوی کے استاد تھے، جنہوں نے
    انہیں شاعری کی اصلاح اور رہنمائی دی۔ بزم عزیز انہی کے نام اور
    احترام میں قائم کی گئی ہے۔`,
    noteHindi: `अज़ीज़ साहब, नसीर अंसारी बाराबंकवी के उस्ताद थे, जिन्होंने
    उन्हें शायरी की इस्लाह और रहनुमाई दी। बज़्म-ए-अज़ीज़ उन्हीं के नाम
    और एहतराम में क़ायम की गई है।`,
    photo: "assets/img/ustad-portrait.jpg",
  },

  bazm: {
    name: "Bazm-e-Aziz",
    nameUrdu: "بزم عزیز",
    nameHindi: "बज़्म-ए-अज़ीज़",
    intro: `Bazm-e-Aziz, Naseer Ansari Barabankvi sahab ke Ustad — Azeez
    Sahab — ke ehtaram mein qayam ki gayi ek adabi tanzeem hai. Ye un
    shagirdon aur muhibban-e-sukhan ki mehfil hai jo Naseer Ansari sahab
    ki sarparasti mein shayeri seekhte aur sunate hain.`,
    introUrdu: `بزم عزیز، نصیر انصاری بارہ بنکوی صاحب کے استاد — عزیز
    صاحب — کے احترام میں قائم کی گئی ایک ادبی تنظیم ہے۔ یہ ان شاگردوں
    اور محبان سخن کی محفل ہے جو نصیر انصاری صاحب کی سرپرستی میں شاعری
    سیکھتے اور سناتے ہیں۔`,
    introHindi: `बज़्म-ए-अज़ीज़, नसीर अंसारी बाराबंकवी साहब के उस्ताद —
    अज़ीज़ साहब — के एहतराम में क़ायम की गई एक अदबी तंज़ीम है। यह उन
    शागिर्दों और मुहिब्बान-ए-सुख़न की महफ़िल है जो नसीर अंसारी साहब की
    सरपरस्ती में शायरी सीखते और सुनाते हैं।`,
    founded: "",
  },

  books: [
    // Apni PDF se banaye flipbooks — quality Rekhta se behtar hai
    { id: "aina-e-fikr", title: "Aina-e-Fikr", titleUrdu: "آئینۂ فکر", titleHindi: "आईना-ए-फ़िक्र", year: "", cover: "assets/img/aina-e-fikr-cover.jpg", pdf: "assets/pdf/aina-e-fikr.pdf", description: "Fikr-o-khayal par mabni shayeri ka majmua.", pageCount: 330 },
    { id: "diwan-e-naseer", title: "Deewan-e-Naseer", titleUrdu: "دیوانِ نصیر", titleHindi: "दीवान-ए-नसीर", year: "2023", cover: "assets/img/diwan-e-naseer-cover.jpg", pdf: "assets/pdf/diwan-e-naseer.pdf", description: "Naseer Ansari Barabankvi ka deewan — ghazlon aur nazmon ka majmua.", pageCount: 306 },
    { id: "zikr-e-karbala", title: "Zikr-e-Karbala", titleUrdu: "ذکرِ کربلا", titleHindi: "ज़िक्र-ए-कर्बला", year: "2024", cover: "assets/img/zikr-e-qarbala-cover.jpg", pdf: "assets/pdf/zikr-e-qarbala.pdf", description: "Karbala ke waqiye par mabni marsiye aur kalaam.", pageCount: 370 },
    // In dono ki PDF abhi nahi hai — Rekhta par cover click karne se khulengi
    { id: "khushboo-ka-safar", title: "Khushboo Ka Safar", titleUrdu: "خوشبو کا سفر", titleHindi: "ख़ुशबू का सफ़र", year: "2020", cover: "assets/img/khushboo-ka-safar-cover.jpg", external: "https://www.rekhta.org/ebooks/detail/khushboo-ka-safar-naseer-ahmad-ansari-ebooks", description: "Naseer Ansari Barabankvi ka ek aur majmua-e-kalaam." },
    { id: "sarmaya-e-fikr", title: "Sarmaya-e-Fikr", titleUrdu: "سرمایۂ فکر", titleHindi: "सरमाया-ए-फ़िक्र", year: "2016", cover: "assets/img/sarmaya-e-fikr-cover.jpg", external: "https://www.rekhta.org/ebooks/detail/sarmaya-e-fikr-naseer-ahmad-ansari-ebooks", description: "Fikr-o-khayal par mabni shayeri ka majmua." },
  ],

  // ---- Cloudinary (adab-gallery) ----
  // Cloudinary account banane ke baad yahan cloud name daalein (ya Admin
  // Panel > Gallery & Media se). uploadPreset UNSIGNED hona chahiye.
  // Sab uploads "adab-gallery" folder mein, upload se pehle compress ho kar.
  cloudinary: {
    cloudName: "ahbbk",
    uploadPreset: "adab_unsigned",
  },

  // ---- Video & social links (YouTube / Instagram / Facebook) ----
  // Policy: YouTube -> inline embed; Insta/FB -> click par embed + link;
  // reels YouTube par upload kar ke yahan link paste karein.
  media: [
    // { url: "https://www.youtube.com/watch?v=XXXX", title: "Mushaira 2024" },
  ],

  poems: [
    {
      id: "p1", book: "Pehli Kitab", title: "Namoona Ghazal",
      text: "Yahan sher ka namoona rahega\nJab tak asli matn shamil na ho",
      textUrdu: "یہاں شعر کا نمونہ رہے گا\nجب تک اصل متن شامل نہ ہو",
      textHindi: "यहाँ शेर का नमूना रहेगा\nजब तक असल मतन शामिल न हो",
      tags: ["ghazal", "namoona"],
    },
  ],

  city: {
    name: "Barabanki", nameUrdu: "بارہ بنکی", nameHindi: "बाराबंकी",
    intro: `Barabanki, Uttar Pradesh ka ek zameen-zaad zila hai jo apni
    Ganga-Jamuni tehzeeb, sufi buzurgon ki dargahon, aur Urdu-Hindi
    shayeri ki roshan riwayat ke liye jaana jaata hai.`,
    introUrdu: `بارہ بنکی، اتر پردیش کا ایک زمین زاد ضلع ہے جو اپنی
    گنگا جمنی تہذیب، صوفی بزرگوں کی درگاہوں، اور اردو ہندی شاعری کی
    روشن روایت کے لیے جانا جاتا ہے۔`,
    introHindi: `बाराबंकी, उत्तर प्रदेश का एक ज़मीन-ज़ाद ज़िला है जो अपनी
    गंगा-जमुनी तहज़ीब, सूफ़ी बुज़ुर्गों की दरगाहों, और उर्दू-हिंदी
    शायरी की रोशन रिवायत के लिए जाना जाता है।`,
    history: `Barabanki ki tareekh sadiyon purani hai — Awadh ke nawabi
    daur se lekar azadi ki tehreek tak, is shehr ne adab, siyasat aur
    tasawwuf teeno mein apna kirdar ada kiya.`,
    historyUrdu: `بارہ بنکی کی تاریخ صدیوں پرانی ہے — اودھ کے نوابی
    دور سے لے کر آزادی کی تحریک تک، اس شہر نے ادب، سیاست اور تصوف
    تینوں میں اپنا کردار ادا کیا۔`,
    historyHindi: `बाराबंकी का इतिहास सदियों पुराना है — अवध के नवाबी
    दौर से लेकर आज़ादी की तहरीक तक, इस शहर ने अदब, सियासत और तसव्वुफ़
    तीनों में अपना किरदार अदा किया।`,
  },

  poets: [
    { name: "Khumar Barabankvi", nameUrdu: "خمار بارہ بنکوی", nameHindi: "ख़ुमार बाराबंकवी", years: "1919 – 1999", intro: "Khumar Barabankvi Urdu adab ke un chand shayeron mein se hain jinhone ghazal ko naya rang diya. Barabanki unki janm-bhoomi hai." },
    { name: "Aur Shayer", nameUrdu: "اور شاعر", nameHindi: "और शायर", years: "—", intro: "Barabanki se taalluq rakhne wale doosre shayeron ka zikr yahan." },
  ],

  dargah: [
    { name: "Dargah Haji Waris Ali Shah, Dewa Sharif", distance: "Barabanki shehr se ~12 km", note: "Dewa Sharif apne urs ke liye mash'hoor hai jahan har saal lakhon zaireen aate hain." },
    { name: "Satrikh Sharif", distance: "Barabanki se qareeb", note: "Satrikh apni qadeem tareekhi aur sufiyana ahmiyat ke liye jaana jaata hai." },
    { name: "Masauli Sharif", distance: "Barabanki se qareeb", note: "Masauli mein bhi sufi buzurgon ki aramgaahen hain." },
  ],

  emergency: [
    { label: "Police (Barabanki Kotwali)", number: "100" },
    { label: "Fire Brigade", number: "101" },
    { label: "Ambulance", number: "108 / 102" },
    { label: "District Hospital Barabanki", number: "" },
    { label: "Women Helpline", number: "1090" },
    { label: "Child Helpline", number: "1098" },
  ],

  hospitals: [{ name: "District Combined Hospital, Barabanki", type: "Government" }],
  schools: [{ name: "Prominent School #1", type: "Senior Secondary" }],
  parks: [{ name: "City Park #1" }],
  places: [{ name: "Famous Place #1", note: "Mukhtasar tafseel yahan" }],
  showrooms: [{ name: "Showroom #1", category: "Category" }],
  cuisine: [{ name: "Local Dish #1", note: "Barabanki ki mash'hoor khaas cheez" }],
  hotels: [{ name: "Hotel #1", note: "Tafseel yahan" }],
  jobs: [{ title: "Sample Job Opening", org: "Organisation", note: "" }],
};

// ============================================================
// loadSiteData() — merges admin-panel edits (localStorage) on
// top of the defaults above. Pages should use this, not the
// raw SITE_DATA_DEFAULT, so admin changes show up everywhere.
// ============================================================
function loadSiteData() {
  try {
    const saved = localStorage.getItem("bazm_site_data_overrides");
    if (!saved) return SITE_DATA_DEFAULT;
    const overrides = JSON.parse(saved);
    return deepMerge(SITE_DATA_DEFAULT, overrides);
  } catch {
    return SITE_DATA_DEFAULT;
  }
}

function deepMerge(base, override) {
  if (Array.isArray(base)) return Array.isArray(override) ? override : base;
  if (typeof base !== "object" || base === null) return override ?? base;
  const result = { ...base };
  for (const key in override) {
    result[key] = deepMerge(base[key], override[key]);
  }
  return result;
}

const SITE_DATA = loadSiteData();
