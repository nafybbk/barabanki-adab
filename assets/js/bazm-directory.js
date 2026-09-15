// ============================================================
// BAZM DIRECTORY — login gate (Google), one-time profile (naam+
// phone), list of approved Bazms with join/leave, "start a new
// Bazm" form (goes in pending until approved via WhatsApp).
// ============================================================

const ADAB_WHATSAPP_NUMBER = "917905282816"; // country code 91 + number

function escapeHtmlAD(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function bazmDirErrorText(code, t) {
  return t[`bazmErr_${code}`] || t.bazmErr_default;
}

async function mountBazmDirectory(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  async function render() {
    const t = UI_STRINGS[LangStore.get()] || UI_STRINGS.en;

    if (!AdabAuth.isLoggedIn()) {
      el.innerHTML = `
        <div class="bazm-widget ${LangStore.get() === "ur" ? "lang-urdu" : ""}">
          <div class="bazm-widget-title">${t.bazmDirTitle}</div>
          <p class="muted" style="margin-bottom:16px;">${t.bazmLoginPrompt}</p>
          <div id="bazm-google-btn"></div>
        </div>`;
      initGoogleSignIn(
        "bazm-google-btn",
        () => render(),
        () => { el.querySelector(".bazm-widget").insertAdjacentHTML("beforeend", `<div class="bazm-error">${t.bazmErr_default}</div>`); }
      );
      return;
    }

    let profile = null;
    try {
      const uid = AdabAuth.currentUser().id;
      const rows = await AdabAuth.authRead(`adab_user_profiles?user_id=eq.${uid}&select=name,phone`);
      profile = rows[0] || null;
    } catch {}

    function profileFormHtml() {
      const googleName = (AdabAuth.currentUser().user_metadata && (AdabAuth.currentUser().user_metadata.full_name || AdabAuth.currentUser().user_metadata.name)) || "";
      return `
        <div class="bazm-auth-form" style="margin-top:12px;">
          <input class="bazm-input" id="bd-profile-name" placeholder="${t.bazmNamePh}" value="${escapeHtmlAD((profile && profile.name) || googleName)}">
          <input class="bazm-input" id="bd-profile-phone" placeholder="${t.bazmPhonePh}" type="tel" value="${escapeHtmlAD((profile && profile.phone) || "")}">
          <button class="btn btn-primary bazm-btn" id="bd-profile-save">${t.bazmSaveBtn}</button>
        </div>
        <div id="bd-profile-error"></div>`;
    }

    function wireProfileForm(onSaved) {
      document.getElementById("bd-profile-save").onclick = async () => {
        const name = document.getElementById("bd-profile-name").value.trim();
        const phone = document.getElementById("bd-profile-phone").value.trim();
        const errEl = document.getElementById("bd-profile-error");
        errEl.innerHTML = "";
        try {
          await AdabAuth.rpc("adab_upsert_profile", { p_name: name, p_phone: phone, p_device_id: AdabAuth.getDeviceId() });
          onSaved();
        } catch (e) {
          const knownCodes = ["NAAM_KHALI", "BOHOT_ACCOUNTS", "NOT_LOGGED_IN"];
          if (!knownCodes.includes(e.message)) {
            // Session points at an identity the server no longer recognizes
            // (e.g. stale/orphaned login) — clear it and fall back to the
            // login screen instead of getting stuck on a silent failure.
            AdabAuth.logout();
            render();
            return;
          }
          errEl.innerHTML = `<div class="bazm-error">${bazmDirErrorText(e.message, t)}</div>`;
        }
      };
    }

    const userEmail = (AdabAuth.currentUser() && AdabAuth.currentUser().email) || "";

    // No profile yet: don't hard-block the whole page on it (a user may
    // want to just look around first) — show it as its own expanded card,
    // separate from the always-visible directory below.
    if (!profile) {
      el.innerHTML = `
        <div class="bazm-widget ${LangStore.get() === "ur" ? "lang-urdu" : ""}">
          <div class="bazm-widget-title">${t.bazmDirTitle}</div>
          <div class="bazm-as">${t.bazmSignedInAs} <strong>${escapeHtmlAD(userEmail)}</strong> · <a href="#" class="bazm-logout-link" id="bd-logout-top">${t.bazmLogoutBtn}</a></div>
        </div>
        <div class="bazm-widget ${LangStore.get() === "ur" ? "lang-urdu" : ""}" style="margin-top:14px;">
          <div class="bazm-widget-title" style="font-size:16px;">${t.bazmProfileHeading}</div>
          <p class="muted">${t.bazmProfileNote}</p>
          ${profileFormHtml()}
        </div>
        <div id="bd-rest"></div>`;
      document.getElementById("bd-logout-top").onclick = (e) => { e.preventDefault(); AdabAuth.logout(); render(); };
      wireProfileForm(() => render());
      // Directory still loads and is usable underneath (browse-only until
      // a join/post action prompts profile completion).
      await renderDirectoryInto(document.getElementById("bd-rest"), null);
      return;
    }

    await renderDirectoryInto(el, profile, userEmail);
  }

  async function renderDirectoryInto(el, profile, userEmail) {
    const t = UI_STRINGS[LangStore.get()] || UI_STRINGS.en;
    // Logged in: full directory (profile may still be null — browse-only).
    let approved = [];
    let mine = [];
    let myMemberships = [];
    try {
      approved = await AdabAuth.publicRead("bazms?approved=eq.true&select=id,name,name_urdu,name_hindi,description");
      const uid = AdabAuth.currentUser().id;
      mine = await AdabAuth.authRead(`bazms?created_by=eq.${uid}&approved=eq.false&select=id,name,created_at`);
      const memberRows = await AdabAuth.publicRead(`bazm_memberships?select=bazm_id`);
      myMemberships = await AdabAuth.authRead(`bazm_memberships?user_id=eq.${uid}&select=bazm_id`);
      var memberCounts = {};
      memberRows.forEach((r) => { memberCounts[r.bazm_id] = (memberCounts[r.bazm_id] || 0) + 1; });
    } catch {
      memberCounts = {};
    }
    const myBazmIds = new Set(myMemberships.map((m) => m.bazm_id));

    const listHtml = approved.map((b) => {
      const nameField = LangStore.get() === "ur" ? (b.name_urdu || b.name) : LangStore.get() === "hi" ? (b.name_hindi || b.name) : b.name;
      const joined = myBazmIds.has(b.id);
      const count = memberCounts[b.id] || 0;
      return `
        <div>
          <div class="bazm-dir-card">
            <div>
              <div class="bazm-dir-card-name">${escapeHtmlAD(nameField)}</div>
              <div class="bazm-dir-card-meta">${count} ${t.bazmMembers}</div>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap;">
              <button class="btn btn-ghost bazm-toggle-posts-btn" data-id="${b.id}">${t.bazmViewPosts}</button>
              <button class="btn ${joined ? "btn-ghost" : "btn-primary"} bazm-join-btn" data-id="${b.id}" data-joined="${joined}">
                ${joined ? t.bazmLeaveBtn : t.bazmJoinBtn}
              </button>
            </div>
          </div>
          <div class="bazm-post-list" id="bazm-posts-${b.id}" hidden data-joined="${joined}"></div>
        </div>`;
    }).join("") || `<div class="bazm-empty">—</div>`;

    const pendingHtml = mine.length
      ? `<div style="margin-top:22px;">
           <div class="bazm-widget-title" style="font-size:15px;">${t.bazmMyBazms}</div>
           ${mine.map((b) => `
             <div class="bazm-dir-card">
               <div>
                 <div class="bazm-dir-card-name">${escapeHtmlAD(b.name)}</div>
                 <span class="bazm-badge-pending">${t.bazmPendingBadge}</span>
               </div>
               <a class="bazm-whatsapp-btn" target="_blank" rel="noopener"
                  href="https://wa.me/${ADAB_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Assalamu Alaikum, maine "${b.name}" naam ki ek Bazm banayi hai Barabanki Adab par. Kripya approve karein.`)}">
                 ${t.bazmWhatsappApprove}
               </a>
             </div>`).join("")}
         </div>`
      : "";

    const headerHtml = profile
      ? `<div class="bazm-widget-title">${t.bazmDirTitle}</div>
         <p class="muted">${t.bazmDirIntro}</p>
         <div class="bazm-as">${t.bazmLoggedInAs} ${escapeHtmlAD(profile.name)} · <a href="#" class="bazm-logout-link" id="bd-logout">${t.bazmLogoutBtn}</a></div>`
      : `<p class="muted" style="margin-bottom:10px;">${t.bazmCompleteProfileBanner}</p>`;

    el.innerHTML = `
      <div class="bazm-widget ${LangStore.get() === "ur" ? "lang-urdu" : ""}">
        ${headerHtml}
        <div class="bazm-dir-list">${listHtml}</div>
        ${pendingHtml}
        <button class="btn btn-ghost" id="bd-create-toggle" style="margin-top:20px;">${t.bazmCreateToggle}</button>
        <div class="bazm-create-form" id="bd-create-form" hidden>
          <div class="bazm-auth-form">
            <input class="bazm-input" id="bd-create-name" placeholder="${t.bazmCreateNamePh}">
            <textarea class="bazm-textarea" id="bd-create-desc" placeholder="${t.bazmCreateDescPh}"></textarea>
            <button class="btn btn-primary bazm-btn" id="bd-create-submit">${t.bazmCreateSubmit}</button>
          </div>
          <div id="bd-create-error"></div>
        </div>
      </div>`;

    const logoutLink = document.getElementById("bd-logout");
    if (logoutLink) logoutLink.onclick = (e) => { e.preventDefault(); AdabAuth.logout(); render(); };

    el.querySelectorAll(".bazm-join-btn").forEach((btn) => {
      btn.onclick = async () => {
        const id = btn.getAttribute("data-id");
        const joined = btn.getAttribute("data-joined") === "true";
        try {
          await AdabAuth.rpc(joined ? "adab_leave_bazm" : "adab_join_bazm", { p_bazm_id: id });
          render();
        } catch (e) {
          alert(bazmDirErrorText(e.message, t));
        }
      };
    });

    async function renderPosts(bazmId) {
      const panel = document.getElementById(`bazm-posts-${bazmId}`);
      if (!panel) return;
      const joined = panel.getAttribute("data-joined") === "true";
      panel.innerHTML = `<div class="bazm-loading muted">${t.bzLoading}</div>`;
      let posts = [];
      try {
        posts = await AdabAuth.publicRead(`adab_bazm_posts?bazm_id=eq.${bazmId}&select=id,display_name,content,created_at&order=created_at.desc`);
      } catch {}
      const postsHtml = posts.length
        ? posts.map((p) => `
            <div class="bazm-post">
              <div class="bazm-post-head">
                <span class="bazm-post-name">${escapeHtmlAD(p.display_name)}</span>
                <span class="bazm-post-time">${escapeHtmlAD(bazmRelativeTime(p.created_at, LangStore.get()))}</span>
              </div>
              <div class="bazm-post-content">${escapeHtmlAD(p.content).replace(/\n/g, "<br>")}</div>
            </div>`).join("")
        : `<div class="bazm-empty muted">${t.bazmPostEmpty}</div>`;
      const composeHtml = joined
        ? `<div style="margin-top:14px;">
             <textarea class="bazm-textarea" id="bazm-new-post-${bazmId}" placeholder="${t.bazmPostPlaceholder}"></textarea>
             <button class="btn btn-gold bazm-btn bazm-send-btn" id="bazm-send-${bazmId}">${t.bazmPostBtn}</button>
             <div id="bazm-post-error-${bazmId}"></div>
           </div>`
        : "";
      panel.innerHTML = postsHtml + composeHtml;
      const sendBtn = document.getElementById(`bazm-send-${bazmId}`);
      if (sendBtn) {
        sendBtn.onclick = async () => {
          const textarea = document.getElementById(`bazm-new-post-${bazmId}`);
          const errEl = document.getElementById(`bazm-post-error-${bazmId}`);
          errEl.innerHTML = "";
          sendBtn.disabled = true;
          try {
            await AdabAuth.rpc("adab_add_bazm_post", { p_bazm_id: bazmId, p_content: textarea.value });
            textarea.value = "";
            await renderPosts(bazmId);
          } catch (e) {
            errEl.innerHTML = `<div class="bazm-error">${bazmDirErrorText(e.message, t)}</div>`;
          } finally {
            sendBtn.disabled = false;
          }
        };
      }
    }

    el.querySelectorAll(".bazm-toggle-posts-btn").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-id");
        const panel = document.getElementById(`bazm-posts-${id}`);
        if (!panel) return;
        panel.hidden = !panel.hidden;
        if (!panel.hidden) renderPosts(id);
      };
    });

    document.getElementById("bd-create-toggle").onclick = () => {
      document.getElementById("bd-create-form").hidden = false;
    };
    document.getElementById("bd-create-submit").onclick = async () => {
      const name = document.getElementById("bd-create-name").value.trim();
      const desc = document.getElementById("bd-create-desc").value.trim();
      const errEl = document.getElementById("bd-create-error");
      errEl.innerHTML = "";
      try {
        await AdabAuth.rpc("adab_create_bazm", { p_name: name, p_name_urdu: null, p_name_hindi: null, p_description: desc });
        render();
      } catch (e) {
        errEl.innerHTML = `<div class="bazm-error">${bazmDirErrorText(e.message, t)}</div>`;
      }
    };
  }

  const prevRender = window.renderPageContent;
  window.renderPageContent = function (lang) {
    if (typeof prevRender === "function") prevRender(lang);
    render();
  };
  render();
}
