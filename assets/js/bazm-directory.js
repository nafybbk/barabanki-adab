// ============================================================
// BAZM DIRECTORY — list of approved Bazms with join/leave/post.
// Sign-in/signup/profile/PIN all live in the site header
// (auth-widget.js) — this file only reads the identity via
// bazmGetIdentity() (auth.js) and points to the header if signed out.
// ============================================================

const ADAB_WHATSAPP_NUMBER = "917905282816"; // country code 91 + number

async function mountBazmDirectory(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  async function writeRpc(identity, base, params) {
    if (identity.mode === "google") return AdabAuth.rpc(base, params);
    return AdabPinAuth.rpc(`${base}_pin`, params);
  }

  async function render() {
    const t = UI_STRINGS[LangStore.get()] || UI_STRINGS.en;
    const isUrdu = LangStore.get() === "ur";
    const identity = bazmGetIdentity();

    if (!identity) {
      el.innerHTML = `
        <div class="bazm-widget ${isUrdu ? "lang-urdu" : ""}">
          <div class="bazm-widget-title">${t.bazmDirTitle}</div>
          <p class="muted">${t.bazmLoginPrompt}</p>
        </div>`;
      return;
    }

    let profile = identity.mode === "pin" ? { name: identity.name } : null;
    if (identity.mode === "google") {
      try {
        const rows = await AdabAuth.authRead(`adab_user_profiles?user_id=eq.${identity.userId}&select=name,phone`);
        profile = rows[0] || null;
      } catch {}
    }

    let approved = [];
    let mine = [];
    let myMemberships = [];
    let memberCounts = {};
    try {
      approved = await AdabAuth.publicRead("bazms?approved=eq.true&select=id,name,name_urdu,name_hindi,description");
      if (identity.mode === "google") {
        mine = await AdabAuth.authRead(`bazms?created_by=eq.${identity.userId}&approved=eq.false&select=id,name,created_at`);
      }
      const memberRows = await AdabAuth.publicRead(`bazm_memberships?select=bazm_id`);
      myMemberships = await AdabAuth.publicRead(`bazm_memberships?user_id=eq.${identity.userId}&select=bazm_id`);
      memberRows.forEach((r) => { memberCounts[r.bazm_id] = (memberCounts[r.bazm_id] || 0) + 1; });
    } catch {}
    const myBazmIds = new Set(myMemberships.map((m) => m.bazm_id));

    const listHtml = approved.map((b) => {
      const nameField = isUrdu ? (b.name_urdu || b.name) : LangStore.get() === "hi" ? (b.name_hindi || b.name) : b.name;
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
      ? `<div class="bazm-widget-title">${t.bazmDirTitle}</div><p class="muted">${t.bazmDirIntro}</p>`
      : `<div class="bazm-widget-title">${t.bazmDirTitle}</div><p class="muted">${t.bazmCompleteProfileBanner}</p>`;

    el.innerHTML = `
      <div class="bazm-widget ${isUrdu ? "lang-urdu" : ""}">
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

    el.querySelectorAll(".bazm-join-btn").forEach((btn) => {
      btn.onclick = async () => {
        const id = btn.getAttribute("data-id");
        const joined = btn.getAttribute("data-joined") === "true";
        try {
          await writeRpc(identity, joined ? "adab_leave_bazm" : "adab_join_bazm", { p_bazm_id: id });
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
            await writeRpc(identity, "adab_add_bazm_post", { p_bazm_id: bazmId, p_content: textarea.value });
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
      if (identity.mode !== "google") {
        errEl.innerHTML = `<div class="bazm-error">${t.bazmErr_default}</div>`;
        return;
      }
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
