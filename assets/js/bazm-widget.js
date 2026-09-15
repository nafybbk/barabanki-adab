// ============================================================
// BAZM WIDGET — mountable comment/sher box, pure-per-language UI
// (real Urdu script when lang=ur, real Hindi when lang=hi, English
// when lang=en), mobile-first. Drop <div id="X"></div> anywhere and
// call mountBazmWidget("X", "some-page-id").
// ============================================================

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function bazmRelativeTime(iso, lang) {
  const diffSec = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const mins = Math.floor(diffSec / 60), hrs = Math.floor(mins / 60), days = Math.floor(hrs / 24);
  const units = {
    en: { now: "just now", m: (n) => `${n}m ago`, h: (n) => `${n}h ago`, d: (n) => `${n}d ago` },
    hi: { now: "अभी", m: (n) => `${n} मिनट पहले`, h: (n) => `${n} घंटे पहले`, d: (n) => `${n} दिन पहले` },
    ur: { now: "ابھی", m: (n) => `${n} منٹ پہلے`, h: (n) => `${n} گھنٹے پہلے`, d: (n) => `${n} دن پہلے` },
  };
  const u = units[lang] || units.en;
  if (mins < 1) return u.now;
  if (mins < 60) return u.m(mins);
  if (hrs < 24) return u.h(hrs);
  return u.d(days);
}

function mountBazmWidget(containerId, pageId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  async function render() {
    const lang = LangStore.get();
    const t = UI_STRINGS[lang] || UI_STRINGS.en;
    const dir = lang === "ur" ? "rtl" : "ltr";
    const session = BazmComments.getSession();

    container.setAttribute("dir", dir);
    container.className = "bazm-widget" + (lang === "ur" ? " lang-urdu" : lang === "hi" ? " lang-hindi" : "");
    container.innerHTML = `
      <div class="bazm-widget-title">${escapeHtml(t.bzTitle)}</div>
      <div class="bazm-auth-box"></div>
      <div class="bazm-postbox" style="display:none;"></div>
      <div class="bazm-error"></div>
      <div class="bazm-post-list"><div class="muted bazm-loading">${escapeHtml(t.bzLoading)}</div></div>
    `;
    const authBox = container.querySelector(".bazm-auth-box");
    const postBox = container.querySelector(".bazm-postbox");
    const errorBox = container.querySelector(".bazm-error");
    const listBox = container.querySelector(".bazm-post-list");

    function showError(err) {
      errorBox.textContent = BazmComments.errorText(err);
      errorBox.style.display = "block";
    }
    function clearError() {
      errorBox.style.display = "none";
    }

    function renderAuth() {
      authBox.innerHTML = `
        <div class="bazm-auth-form">
          <input type="text" class="bazm-input" placeholder="${escapeHtml(t.bzYourName)}" data-role="name">
          <input type="text" inputmode="numeric" class="bazm-input" placeholder="${escapeHtml(t.bzYourPin)}" maxlength="6" data-role="pin">
          <div class="bazm-auth-actions">
            <button type="button" class="btn btn-primary bazm-btn" data-action="login">${escapeHtml(t.bzLogin)}</button>
            <button type="button" class="btn btn-ghost bazm-btn" data-action="register">${escapeHtml(t.bzRegister)}</button>
          </div>
        </div>`;
      const nameInput = authBox.querySelector('[data-role="name"]');
      const pinInput = authBox.querySelector('[data-role="pin"]');
      authBox.querySelector('[data-action="login"]').addEventListener("click", async () => {
        clearError();
        try { await BazmComments.login(nameInput.value, pinInput.value); render(); }
        catch (e) { showError(e); }
      });
      authBox.querySelector('[data-action="register"]').addEventListener("click", async () => {
        clearError();
        try { await BazmComments.register(nameInput.value, pinInput.value); render(); }
        catch (e) { showError(e); }
      });
    }

    function renderPostbox() {
      postBox.style.display = "";
      postBox.innerHTML = `
        <div class="bazm-as">${escapeHtml(t.bzAs)}: <strong>${escapeHtml(session.name)}</strong>
          <button type="button" class="bazm-logout-link" data-action="logout">${escapeHtml(t.bzLogout)}</button>
        </div>
        <textarea class="bazm-textarea" placeholder="${escapeHtml(t.bzPlaceholder)}" data-role="content"></textarea>
        <button type="button" class="btn btn-gold bazm-btn bazm-send-btn" data-action="send">${escapeHtml(t.bzSend)}</button>
      `;
      postBox.querySelector('[data-action="logout"]').addEventListener("click", () => {
        BazmComments.logout();
        render();
      });
      postBox.querySelector('[data-action="send"]').addEventListener("click", async (e) => {
        clearError();
        const btn = e.currentTarget;
        const textarea = postBox.querySelector('[data-role="content"]');
        const content = textarea.value;
        btn.disabled = true;
        try {
          await BazmComments.addPost(pageId, content);
          textarea.value = "";
          await loadPosts();
        } catch (err) {
          showError(err);
        } finally {
          btn.disabled = false;
        }
      });
    }

    async function loadPosts() {
      const posts = await BazmComments.getPosts(pageId);
      if (!posts.length) {
        listBox.innerHTML = `<div class="muted bazm-empty">${escapeHtml(t.bzEmpty)}</div>`;
        return;
      }
      listBox.innerHTML = posts.map((p) => `
        <div class="bazm-post">
          <div class="bazm-post-head">
            <span class="bazm-post-name">${escapeHtml(p.user_name)}</span>
            <span class="bazm-post-time">${escapeHtml(bazmRelativeTime(p.created_at, lang))}</span>
          </div>
          <div class="bazm-post-content">${escapeHtml(p.content).replace(/\n/g, "<br>")}</div>
        </div>`).join("");
    }

    if (session) renderPostbox(); else renderAuth();
    await loadPosts();
  }

  const prevRender = window.renderPageContent;
  window.renderPageContent = function (lang) {
    if (typeof prevRender === "function") prevRender(lang);
    render();
  };
  render();
}
