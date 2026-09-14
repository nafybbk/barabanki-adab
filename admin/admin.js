// ============================================================
// ADMIN PANEL — full control unit.
// Reads/writes SITE_DATA overrides into localStorage (key:
// bazm_site_data_overrides), which data.js merges on top of
// the defaults on every page load.
// ============================================================

const OVERRIDES_KEY = "bazm_site_data_overrides";

function getOverrides() {
  try { return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || "{}"); }
  catch { return {}; }
}
function saveOverrides(overrides) {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
}
function setPath(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    cur[parts[i]] = cur[parts[i]] || {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}
function readPath(obj, path) {
  return path.split(".").reduce((cur, key) => (cur ? cur[key] : undefined), obj);
}
function getMergedData() {
  return deepMerge(SITE_DATA_DEFAULT, getOverrides());
}

// ---- LOGIN GATE ----
function tryLogin() {
  const pw = document.getElementById("admin-password").value;
  if (AdminAuth.login(pw)) showAdminShell();
  else document.getElementById("login-error").textContent = "Password ghalat hai.";
}
function adminLogout() {
  AdminAuth.logout();
  document.getElementById("admin-shell").style.display = "none";
  document.getElementById("login-gate").style.display = "flex";
}
function showAdminShell() {
  document.getElementById("login-gate").style.display = "none";
  document.getElementById("admin-shell").style.display = "block";
  initAdminPanel();
}

// ---- TABS ----
function initTabs() {
  document.querySelectorAll(".admin-nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".admin-nav-item").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".admin-tab").forEach((t) => (t.style.display = "none"));
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).style.display = "block";
    });
  });
}

// ---- DASHBOARD ----
function renderDashboard() {
  const data = getMergedData();
  const posts = JSON.parse(localStorage.getItem("bazm_shagird_posts") || "[]");
  const users = JSON.parse(localStorage.getItem("bazm_shagird_users") || "[]");
  const booksWithPdf = data.books.filter((b) => pdfExists(b.id)).length;

  document.getElementById("dashboard-stats").innerHTML = `
    <div class="admin-stat"><div class="num">${data.books.length}</div><div class="label">Kitabein</div></div>
    <div class="admin-stat"><div class="num">${booksWithPdf}</div><div class="label">PDF Uploaded</div></div>
    <div class="admin-stat"><div class="num">${data.poems.length}</div><div class="label">Sher/Ghazal</div></div>
    <div class="admin-stat"><div class="num">${users.length}</div><div class="label">Shagird</div></div>
    <div class="admin-stat"><div class="num">${posts.length}</div><div class="label">Posts</div></div>
  `;

  const todos = [
    { done: !!data.poet.years, label: "Naseer Sahab ke saal (birth year) darj karein" },
    { done: hasCustomPhoto("poet"), label: "Naseer Sahab ki tasveer upload karein" },
    { done: hasCustomPhoto("ustad"), label: "Ustad Azeez Sahab ki tasveer upload karein" },
    { done: !!data.bazm.founded, label: "Bazm-e-Aziz ka qayam saal darj karein" },
    { done: booksWithPdf >= 5, label: "Sab 5 kitabon ki PDFs upload karein" },
    { done: data.poems.length > 5, label: "Kam az kam kuch shayeri archive mein add karein" },
    { done: data.emergency.some((e) => e.number && e.number.length > 5), label: "Emergency numbers mukammal karein" },
  ];
  document.getElementById("todo-list").innerHTML = todos.map((t) => `<li class="${t.done ? "done" : ""}">${t.label}</li>`).join("");
}
function hasCustomPhoto(who) { return !!localStorage.getItem(`bazm_photo_${who}`); }
function pdfExists(bookId) { return !!localStorage.getItem(`bazm_pdf_${bookId}`); }

// ---- IDENTITY TAB ----
function fillIdentityForm() {
  const data = getMergedData();
  document.querySelectorAll("#tab-identity [data-path]").forEach((el) => {
    const val = readPath(data, el.dataset.path);
    if (val !== undefined) el.value = val;
  });
  const poetPhoto = localStorage.getItem("bazm_photo_poet");
  if (poetPhoto) document.getElementById("poet-photo-preview").innerHTML = `<img src="${poetPhoto}">`;
  const ustadPhoto = localStorage.getItem("bazm_photo_ustad");
  if (ustadPhoto) document.getElementById("ustad-photo-preview").innerHTML = `<img src="${ustadPhoto}">`;
}
function saveIdentityTab() {
  const overrides = getOverrides();
  document.querySelectorAll("#tab-identity [data-path]").forEach((el) => setPath(overrides, el.dataset.path, el.value));
  saveOverrides(overrides);
  flashSaved("identity-saved-msg");
  renderDashboard();
}
function setupPhotoUpload(inputId, previewId, storageKey) {
  document.getElementById(inputId).addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem(storageKey, reader.result);
      document.getElementById(previewId).innerHTML = `<img src="${reader.result}">`;
      flashSaved("identity-saved-msg");
    };
    reader.readAsDataURL(file);
  });
}

// ---- BOOKS TAB ----
function renderBooksTab() {
  const data = getMergedData();
  document.getElementById("books-list").innerHTML = data.books.map((book) => {
    const pdfData = localStorage.getItem(`bazm_pdf_${book.id}`);
    const coverData = localStorage.getItem(`bazm_cover_${book.id}`);
    return `
      <div class="book-editor">
        <div>
          <div class="book-editor-cover" id="cover-preview-${book.id}">${coverData ? `<img src="${coverData}">` : ""}</div>
          <input type="file" accept="image/*" style="margin-top:8px; font-size:12px;" onchange="uploadCover('${book.id}', this)">
        </div>
        <div>
          <div class="admin-form-grid">
            <div class="field"><label>Title (English)</label><input value="${escapeAttr(book.title)}" onchange="updateBookField('${book.id}','title',this.value)"></div>
            <div class="field"><label>عنوان (Urdu)</label><input class="urdu" value="${escapeAttr(book.titleUrdu)}" onchange="updateBookField('${book.id}','titleUrdu',this.value)"></div>
            <div class="field"><label>शीर्षक (Hindi)</label><input value="${escapeAttr(book.titleHindi || "")}" onchange="updateBookField('${book.id}','titleHindi',this.value)"></div>
            <div class="field"><label>Saal</label><input value="${escapeAttr(book.year)}" onchange="updateBookField('${book.id}','year',this.value)"></div>
          </div>
          <div class="field"><label>Taaruf</label><textarea rows="2" onchange="updateBookField('${book.id}','description',this.value)">${escapeAttr(book.description)}</textarea></div>
          <div>
            <label style="font-size:13px; font-weight:600; color:var(--ink-soft); display:block; margin-bottom:6px;">PDF Upload</label>
            <input type="file" accept="application/pdf" onchange="uploadPdf('${book.id}', this)">
            <div class="pdf-status ${pdfData ? "uploaded" : "missing"}">${pdfData ? "✓ PDF upload ho chuki hai" : "PDF abhi upload nahi hui"}</div>
          </div>
        </div>
      </div>`;
  }).join("");
}
function updateBookField(bookId, field, value) {
  const overrides = getOverrides();
  const data = getMergedData();
  const books = overrides.books && overrides.books.length ? overrides.books : JSON.parse(JSON.stringify(data.books));
  const book = books.find((b) => b.id === bookId);
  if (book) book[field] = value;
  overrides.books = books;
  saveOverrides(overrides);
  renderDashboard();
}
function uploadPdf(bookId, input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 15 * 1024 * 1024) { alert("Ye file bohot badi hai is demo storage ke liye (15MB se zyada). Home server par ye limit nahi hogi."); return; }
  const reader = new FileReader();
  reader.onload = () => { localStorage.setItem(`bazm_pdf_${bookId}`, reader.result); renderBooksTab(); renderDashboard(); };
  reader.readAsDataURL(file);
}
function uploadCover(bookId, input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { localStorage.setItem(`bazm_cover_${bookId}`, reader.result); document.getElementById(`cover-preview-${bookId}`).innerHTML = `<img src="${reader.result}">`; };
  reader.readAsDataURL(file);
}

// ---- POETRY TAB ----
function renderPoemsTab() {
  const data = getMergedData();
  document.getElementById("poems-list").innerHTML = data.poems.map((poem, i) => `
    <div class="poem-editor">
      <div class="poem-editor-head"><strong>#${i + 1} — ${escapeAttr(poem.title)}</strong><button class="btn btn-danger btn-sm" onclick="deletePoem(${i})">Delete</button></div>
      <div class="admin-form-grid">
        <div class="field"><label>Title</label><input value="${escapeAttr(poem.title)}" onchange="updatePoemField(${i},'title',this.value)"></div>
        <div class="field"><label>Kitab ka naam</label><input value="${escapeAttr(poem.book)}" onchange="updatePoemField(${i},'book',this.value)"></div>
      </div>
      <div class="field"><label>Urdu matn</label><textarea class="urdu" rows="3" onchange="updatePoemField(${i},'textUrdu',this.value)">${escapeAttr(poem.textUrdu)}</textarea></div>
      <div class="field"><label>Roman/Hindi transliteration</label><textarea rows="3" onchange="updatePoemField(${i},'text',this.value)">${escapeAttr(poem.text)}</textarea></div>
    </div>`).join("");
}
function addNewPoem() {
  const overrides = getOverrides();
  const data = getMergedData();
  const poems = overrides.poems && overrides.poems.length ? overrides.poems : JSON.parse(JSON.stringify(data.poems));
  poems.push({ id: "p_" + Date.now(), book: "", title: "Naya Sher", text: "", textUrdu: "", tags: [] });
  overrides.poems = poems;
  saveOverrides(overrides);
  renderPoemsTab();
  renderDashboard();
}
function updatePoemField(index, field, value) {
  const overrides = getOverrides();
  const data = getMergedData();
  const poems = overrides.poems && overrides.poems.length ? overrides.poems : JSON.parse(JSON.stringify(data.poems));
  poems[index][field] = value;
  overrides.poems = poems;
  saveOverrides(overrides);
}
function deletePoem(index) {
  if (!confirm("Ye sher/ghazal delete karna hai?")) return;
  const overrides = getOverrides();
  const data = getMergedData();
  const poems = overrides.poems && overrides.poems.length ? overrides.poems : JSON.parse(JSON.stringify(data.poems));
  poems.splice(index, 1);
  overrides.poems = poems;
  saveOverrides(overrides);
  renderPoemsTab();
  renderDashboard();
}

// ---- SHAGIRD TAB ----
function renderShagirdTab() {
  const users = JSON.parse(localStorage.getItem("bazm_shagird_users") || "[]");
  const posts = JSON.parse(localStorage.getItem("bazm_shagird_posts") || "[]");
  document.getElementById("shagird-users-list").innerHTML = users.length
    ? users.map((u) => `<div class="shagird-user-row"><span>${escapeAttr(u.name)}</span><span class="muted">${new Date(u.joined).toLocaleDateString("en-IN")}</span></div>`).join("")
    : `<p class="muted">Abhi tak koi shagird register nahi hua.</p>`;
  document.getElementById("shagird-posts-list").innerHTML = posts.length
    ? posts.map((p) => `<div class="shagird-post-row"><span class="post-preview"><strong>${escapeAttr(p.name)}</strong> — ${escapeAttr(p.content).slice(0, 60)}</span><button class="btn btn-danger btn-sm" onclick="deletePost('${p.id}')">Delete</button></div>`).join("")
    : `<p class="muted">Abhi tak koi post nahi hui.</p>`;
}
function deletePost(postId) {
  if (!confirm("Ye post delete karni hai?")) return;
  const posts = JSON.parse(localStorage.getItem("bazm_shagird_posts") || "[]");
  localStorage.setItem("bazm_shagird_posts", JSON.stringify(posts.filter((p) => p.id !== postId)));
  renderShagirdTab();
  renderDashboard();
}

// ---- GALLERY & MEDIA TAB ----
function fillGalleryTab() {
  const data = getMergedData();
  const c = data.cloudinary || {};
  document.getElementById("cld-cloud-name").value = c.cloudName || "";
  document.getElementById("cld-preset").value = c.uploadPreset || "";
  renderMediaEditor();
}
function saveCloudinaryConfig() {
  const overrides = getOverrides();
  const cloudName = document.getElementById("cld-cloud-name").value.trim();
  const uploadPreset = document.getElementById("cld-preset").value.trim();
  setPath(overrides, "cloudinary.cloudName", cloudName);
  setPath(overrides, "cloudinary.uploadPreset", uploadPreset);
  saveOverrides(overrides);
  // In-memory SITE_DATA bhi update karo taake MediaHub bina reload ke chale.
  SITE_DATA.cloudinary = { cloudName, uploadPreset };
  flashSaved("gallery-saved-msg");
}
async function testCloudinaryConfig() {
  const el = document.getElementById("cld-test-result");
  saveCloudinaryConfig();
  if (!MediaHub.isConfigured()) {
    el.innerHTML = `<span style="color:#a33;">Cloud name aur preset dono bharein.</span>`;
    return;
  }
  el.textContent = "Test ho raha hai…";
  try {
    const items = await MediaHub.listGallery("image");
    el.innerHTML = `<span style="color:#2a7;">✓ Connection theek hai — gallery mein ${items.length} tasveer(ein) mili.</span>`;
  } catch {
    el.innerHTML = `<span style="color:#a33;">✗ List nahi mili. Cloud name check karein, aur Cloudinary Settings → Security
      mein "Resource list" allowed karein. (Agar abhi ek bhi tasveer upload nahi hui to bhi ye aa sakta hai —
      pehle ek tasveer upload kar ke dobara test karein.)</span>`;
  }
}
// App ke device-pings (adab-pings folder): har phone roz ek chhota JSON
// file dalta hai `deviceId-YYYY-MM-DD` naam se. Yahan unko device ke
// hisaab se jama kar ke naam/model/aakhri-din dikhate hain.
async function loadAppPings() {
  const el = document.getElementById("ping-result");
  const { cloudName } = MediaHub.config();
  if (!cloudName) { el.textContent = "Pehle Cloudinary set karein."; return; }
  el.textContent = "Dekh rahe hain…";
  try {
    const res = await fetch(`https://res.cloudinary.com/${cloudName}/raw/list/adab-ping.json?t=${Math.floor(Date.now() / 60000)}`);
    if (!res.ok) throw new Error();
    const list = (await res.json()).resources || [];
    if (!list.length) { el.textContent = "Abhi kisi phone se ping nahi aayi."; return; }

    // public_id: adab-pings/{deviceId}-{YYYY-MM-DD} — har device ki aakhri entry
    const byDevice = {};
    for (const r of list) {
      const m = r.public_id.match(/^adab-pings\/(.+)-(\d{4}-\d{2}-\d{2})$/);
      if (!m) continue;
      const [, deviceId, day] = m;
      if (!byDevice[deviceId] || byDevice[deviceId].day < day) byDevice[deviceId] = { day, publicId: r.public_id, version: r.version };
    }
    const devices = Object.entries(byDevice);
    const today = new Date().toISOString().slice(0, 10);
    const liveToday = devices.filter(([, v]) => v.day === today).length;

    // Har device ki aakhri ping-file utha kar naam/model nikaalo (chhoti files hain)
    const details = await Promise.all(devices.slice(0, 50).map(async ([deviceId, v]) => {
      try {
        const d = await (await fetch(`https://res.cloudinary.com/${cloudName}/raw/upload/v${v.version}/${v.publicId}`)).json();
        return { deviceId, day: v.day, name: d.name || "—", role: d.role || "", model: [d.brand, d.model].filter(Boolean).join(" ") || "—" };
      } catch {
        return { deviceId, day: v.day, name: "—", role: "", model: "—" };
      }
    }));

    el.innerHTML = `
      <div style="margin-bottom:8px;"><strong>${devices.length}</strong> phone par app hai · aaj live: <strong>${liveToday}</strong></div>
      ${details.map((d) => `
        <div style="display:flex; justify-content:space-between; gap:10px; border-top:1px solid rgba(0,0,0,0.08); padding:6px 0;">
          <span>${escapeAttr(d.name)}${d.role ? ` <span style="opacity:0.6;">(${d.role})</span>` : ""} — ${escapeAttr(d.model)}</span>
          <span style="opacity:0.7; white-space:nowrap;">aakhri: ${d.day}</span>
        </div>`).join("")}
    `;
  } catch {
    el.textContent = "Ping list nahi mili — Cloudinary Resource list allowed hai na?";
  }
}

function getMediaList() {
  const overrides = getOverrides();
  const data = getMergedData();
  return overrides.media && overrides.media.length ? overrides.media : JSON.parse(JSON.stringify(data.media || []));
}
function renderMediaEditor() {
  const media = getMergedData().media || [];
  document.getElementById("media-editor").innerHTML = media.length ? media.map((m, i) => {
    const p = MediaHub.parseSocialLink(m.url);
    const badge = p ? p.label : "—";
    return `
    <div class="list-editor-row">
      <input placeholder="Link (YouTube / Instagram / Facebook)" value="${escapeAttr(m.url || "")}" onchange="updateMediaLink(${i},'url',this.value)" style="flex:2;">
      <input placeholder="Title (jaise: Mushaira 2025)" value="${escapeAttr(m.title || "")}" onchange="updateMediaLink(${i},'title',this.value)">
      <span style="font-size:12px; font-family:var(--font-ui); opacity:0.7; white-space:nowrap;">${badge}</span>
      <button class="btn btn-danger btn-sm" onclick="removeMediaLink(${i})">×</button>
    </div>`;
  }).join("") : `<p class="muted" style="font-size:13px;">Abhi koi link nahi. YouTube/Insta/FB ka link add karein.</p>`;
}
function addMediaLink() {
  const overrides = getOverrides();
  const media = getMediaList();
  media.push({ url: "", title: "" });
  overrides.media = media;
  saveOverrides(overrides);
  renderMediaEditor();
}
function updateMediaLink(index, field, value) {
  const overrides = getOverrides();
  const media = getMediaList();
  media[index][field] = value;
  overrides.media = media;
  saveOverrides(overrides);
  renderMediaEditor();
}
function removeMediaLink(index) {
  const overrides = getOverrides();
  const media = getMediaList();
  media.splice(index, 1);
  overrides.media = media;
  saveOverrides(overrides);
  renderMediaEditor();
}

// ---- CITY TAB ----
function fillCityForm() {
  const data = getMergedData();
  document.querySelectorAll("#tab-city [data-path]").forEach((el) => {
    const val = readPath(data, el.dataset.path);
    if (val !== undefined) el.value = val;
  });
  renderListEditor("emergency", data.emergency, ["label", "number"]);
  renderListEditor("dargah", data.dargah, ["name", "distance", "note"]);
}
function renderListEditor(key, items, fields) {
  document.getElementById(`${key}-editor`).innerHTML = items.map((item, i) => `
    <div class="list-editor-row">
      ${fields.map((f) => `<input placeholder="${f}" value="${escapeAttr(item[f] || "")}" onchange="updateListItem('${key}',${i},'${f}',this.value)">`).join("")}
      <button class="btn btn-danger btn-sm" onclick="removeListItem('${key}',${i})">×</button>
    </div>`).join("");
}
function updateListItem(key, index, field, value) {
  const overrides = getOverrides();
  const data = getMergedData();
  const list = overrides[key] && overrides[key].length ? overrides[key] : JSON.parse(JSON.stringify(data[key]));
  list[index][field] = value;
  overrides[key] = list;
  saveOverrides(overrides);
}
function addListItem(key, template) {
  const overrides = getOverrides();
  const data = getMergedData();
  const list = overrides[key] && overrides[key].length ? overrides[key] : JSON.parse(JSON.stringify(data[key]));
  list.push(template);
  overrides[key] = list;
  saveOverrides(overrides);
  fillCityForm();
}
function removeListItem(key, index) {
  const overrides = getOverrides();
  const data = getMergedData();
  const list = overrides[key] && overrides[key].length ? overrides[key] : JSON.parse(JSON.stringify(data[key]));
  list.splice(index, 1);
  overrides[key] = list;
  saveOverrides(overrides);
  fillCityForm();
}
function saveCityTab() {
  const overrides = getOverrides();
  document.querySelectorAll("#tab-city [data-path]").forEach((el) => setPath(overrides, el.dataset.path, el.value));
  saveOverrides(overrides);
  flashSaved("city-saved-msg");
}

// ---- SETTINGS TAB ----
function changePassword() {
  const pw = document.getElementById("new-password").value;
  if (!pw || pw.length < 4) { alert("Password kam az kam 4 characters ka hona chahiye."); return; }
  AdminAuth.setPassword(pw);
  document.getElementById("new-password").value = "";
  flashSaved("password-saved-msg");
}
function exportData() {
  const overrides = getOverrides();
  const posts = JSON.parse(localStorage.getItem("bazm_shagird_posts") || "[]");
  const users = JSON.parse(localStorage.getItem("bazm_shagird_users") || "[]");
  const pdfKeys = Object.keys(localStorage).filter((k) => k.startsWith("bazm_pdf_") || k.startsWith("bazm_cover_") || k.startsWith("bazm_photo_"));
  const media = {};
  pdfKeys.forEach((k) => (media[k] = localStorage.getItem(k)));
  const exportObj = { overrides, posts, users, media, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bazm-e-aziz-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
function setupImport() {
  document.getElementById("import-file").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (parsed.overrides) saveOverrides(parsed.overrides);
        if (parsed.posts) localStorage.setItem("bazm_shagird_posts", JSON.stringify(parsed.posts));
        if (parsed.users) localStorage.setItem("bazm_shagird_users", JSON.stringify(parsed.users));
        if (parsed.media) Object.entries(parsed.media).forEach(([k, v]) => localStorage.setItem(k, v));
        alert("Data import ho gaya! Panel refresh ho raha hai.");
        location.reload();
      } catch { alert("Ye file sahi format mein nahi hai."); }
    };
    reader.readAsText(file);
  });
}

// ---- HELPERS ----
function escapeAttr(str) { return (str || "").toString().replace(/"/g, "&quot;").replace(/</g, "&lt;"); }
function flashSaved(elId) {
  const el = document.getElementById(elId);
  el.textContent = "✓ Save ho gaya";
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}

// ---- INIT ----
function initAdminPanel() {
  initTabs();
  renderDashboard();
  fillIdentityForm();
  setupPhotoUpload("poet-photo-upload", "poet-photo-preview", "bazm_photo_poet");
  setupPhotoUpload("ustad-photo-upload", "ustad-photo-preview", "bazm_photo_ustad");
  renderBooksTab();
  renderPoemsTab();
  renderShagirdTab();
  fillGalleryTab();
  fillCityForm();
  setupImport();
}

document.addEventListener("DOMContentLoaded", () => {
  if (AdminAuth.isLoggedIn()) showAdminShell();
  document.getElementById("admin-password").addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryLogin();
  });
});
