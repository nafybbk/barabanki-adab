// ============================================================
// SITE-WIDE AUTH WIDGET — mounted once in the header (chrome.js),
// visible on every page. Not signed in: shows "Sign in" -> Google
// button + optional email/PIN. Signed in: shows your name/email ->
// dropdown with profile (name/phone/PIN) + logout. This is the ONE
// place login/signup/profile/logout live — feature pages (Bazm
// directory etc.) just read the identity via bazmGetIdentity().
// ============================================================

function mountAuthWidget(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  async function render() {
    const t = UI_STRINGS[LangStore.get()] || UI_STRINGS.en;
    const identity = bazmGetIdentity();

    if (!identity) {
      el.innerHTML = `
        <div class="auth-widget-wrap">
          <button class="btn btn-ghost auth-trigger" id="aw-trigger" style="padding:8px 16px; font-size:13px;">${t.awSignIn}</button>
          <div class="auth-dropdown" id="aw-panel" hidden>
            <div id="aw-google-btn"></div>
            <p class="muted" style="margin:12px 0 6px; font-size:12px;"><a href="#" id="aw-pin-toggle">${t.bazmOrPinLogin}</a></p>
            <div class="bazm-auth-form" id="aw-pin-form" hidden>
              <input class="bazm-input" id="aw-pin-email" placeholder="${t.bazmEmailPh}" type="email">
              <input class="bazm-input" id="aw-pin-pin" placeholder="${t.bazmPinPh}" type="tel" maxlength="6">
              <button class="btn btn-ghost bazm-btn" id="aw-pin-login-btn">${t.bazmPinLoginBtn}</button>
            </div>
            <div id="aw-pin-error"></div>
          </div>
        </div>`;
      document.getElementById("aw-trigger").onclick = () => {
        const panel = document.getElementById("aw-panel");
        const willOpen = panel.hidden;
        panel.hidden = !willOpen;
        if (willOpen) {
          initGoogleSignIn("aw-google-btn", () => render(), () => {});
        }
      };
      document.getElementById("aw-pin-toggle").onclick = (e) => {
        e.preventDefault();
        document.getElementById("aw-pin-form").hidden = false;
      };
      document.getElementById("aw-pin-login-btn").onclick = async () => {
        const email = document.getElementById("aw-pin-email").value.trim();
        const pin = document.getElementById("aw-pin-pin").value.trim();
        const errEl = document.getElementById("aw-pin-error");
        errEl.innerHTML = "";
        try {
          await AdabPinAuth.login(email, pin);
          render();
        } catch (e) {
          errEl.innerHTML = `<div class="bazm-error">${bazmDirErrorText(e.message, t)}</div>`;
        }
      };
      return;
    }

    // Signed in: fetch profile (Google mode) or use PIN session's name.
    let profile = identity.mode === "pin" ? { name: identity.name, phone: "" } : null;
    if (identity.mode === "google") {
      try {
        const rows = await AdabAuth.authRead(`adab_user_profiles?user_id=eq.${identity.userId}&select=name,phone`);
        profile = rows[0] || null;
      } catch {}
    }
    const label = (profile && profile.name) || identity.email;
    const pinNote = identity.mode === "pin" ? ` ${t.bazmPinModeNote}` : "";
    const googleName = (AdabAuth.currentUser() && AdabAuth.currentUser().user_metadata && (AdabAuth.currentUser().user_metadata.full_name || AdabAuth.currentUser().user_metadata.name)) || "";

    const profileFieldsHtml = identity.mode === "google"
      ? `<div class="bazm-auth-form" style="margin-top:10px;">
           <input class="bazm-input" id="aw-profile-name" placeholder="${t.bazmNamePh}" value="${escapeHtmlAD((profile && profile.name) || googleName)}">
           <input class="bazm-input" id="aw-profile-phone" placeholder="${t.bazmPhonePh}" type="tel" value="${escapeHtmlAD((profile && profile.phone) || "")}">
           <button class="btn btn-primary bazm-btn" id="aw-profile-save">${t.bazmSaveBtn}</button>
         </div>
         <div id="aw-profile-error"></div>
         <div style="margin-top:16px; padding-top:14px; border-top:1px dashed var(--paper-line);">
           <div style="font-size:13px; font-weight:600; margin-bottom:6px;">${t.bazmSetPinHeading}</div>
           <p class="muted" style="font-size:12px;">${t.bazmSetPinNote}</p>
           <div class="bazm-auth-form">
             <input class="bazm-input" id="aw-set-pin" placeholder="${t.bazmPinPh}" type="tel" maxlength="6">
             <button class="btn btn-ghost bazm-btn" id="aw-set-pin-btn">${t.bazmSetPinBtn}</button>
           </div>
           <div id="aw-set-pin-error"></div>
         </div>`
      : "";

    el.innerHTML = `
      <div class="auth-widget-wrap">
        <button class="btn btn-ghost auth-trigger" id="aw-trigger" style="padding:8px 16px; font-size:13px;">${escapeHtmlAD(label)}</button>
        <div class="auth-dropdown" id="aw-panel" hidden>
          <div class="muted" style="font-size:12px; margin-bottom:10px;">${escapeHtmlAD(identity.email)}${pinNote}</div>
          ${profileFieldsHtml}
          <button class="btn btn-ghost bazm-btn" id="aw-logout" style="margin-top:${identity.mode === "google" ? "14px" : "0"};">${t.bazmLogoutBtn}</button>
        </div>
      </div>`;

    document.getElementById("aw-trigger").onclick = () => {
      const panel = document.getElementById("aw-panel");
      panel.hidden = !panel.hidden;
    };
    document.getElementById("aw-logout").onclick = () => {
      if (identity.mode === "google") AdabAuth.logout(); else AdabPinAuth.logout();
      render();
    };
    if (identity.mode === "google") {
      document.getElementById("aw-profile-save").onclick = async () => {
        const name = document.getElementById("aw-profile-name").value.trim();
        const phone = document.getElementById("aw-profile-phone").value.trim();
        const errEl = document.getElementById("aw-profile-error");
        errEl.innerHTML = "";
        try {
          await AdabAuth.rpc("adab_upsert_profile", { p_name: name, p_phone: phone, p_device_id: AdabAuth.getDeviceId() });
          render();
        } catch (e) {
          errEl.innerHTML = `<div class="bazm-error">${bazmDirErrorText(e.message, t)}</div>`;
        }
      };
      document.getElementById("aw-set-pin-btn").onclick = async () => {
        const pin = document.getElementById("aw-set-pin").value.trim();
        const errEl = document.getElementById("aw-set-pin-error");
        errEl.innerHTML = "";
        try {
          await AdabAuth.rpc("adab_set_pin", { p_pin: pin });
          errEl.innerHTML = `<div class="muted" style="font-size:12px;">✓</div>`;
        } catch (e) {
          errEl.innerHTML = `<div class="bazm-error">${bazmDirErrorText(e.message, t)}</div>`;
        }
      };
    }
  }

  const prevRender = window.renderPageContent;
  window.renderPageContent = function (lang) {
    if (typeof prevRender === "function") prevRender(lang);
    render();
  };
  render();
}
