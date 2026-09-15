// ============================================================
// BAZM APPROVALS tab — approve/reject user-created Bazms. Needs
// the admin's OWN Google sign-in (checked server-side against the
// adab_admins table) — separate from the plain-password AdminAuth
// gate that protects the rest of this panel.
// ============================================================

function escapeHtmlBA(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function renderBazmApprovals() {
  const loginEl = document.getElementById("bazm-approval-login");
  const listEl = document.getElementById("bazm-approval-list");
  if (!loginEl || !listEl) return;

  if (!AdabAuth.isLoggedIn()) {
    loginEl.innerHTML = `<p class="muted" style="margin-bottom:12px;">Approve karne ke liye Google se sign in karein:</p><div id="bazm-approval-google-btn"></div>`;
    listEl.innerHTML = "";
    initGoogleSignIn("bazm-approval-google-btn", () => renderBazmApprovals(), () => {
      loginEl.insertAdjacentHTML("beforeend", `<p style="color:#a33; font-size:13px;">Sign-in mein masla hua, dobara koshish karein.</p>`);
    });
    return;
  }

  loginEl.innerHTML = `<p class="muted" style="margin-bottom:12px;">Signed in as ${escapeHtmlBA(AdabAuth.currentUser().email)} · <a href="#" id="bazm-approval-logout">Logout</a></p>`;
  document.getElementById("bazm-approval-logout").onclick = (e) => { e.preventDefault(); AdabAuth.logout(); renderBazmApprovals(); };

  listEl.innerHTML = `<p class="muted">Loading...</p>`;
  try {
    const pending = await AdabAuth.rpc("adab_list_pending_bazms", {});
    if (!pending.length) {
      listEl.innerHTML = `<p class="muted">Koi Bazm pending nahi hai.</p>`;
      return;
    }
    listEl.innerHTML = pending.map((b) => `
      <div class="admin-card" style="margin-top:12px;">
        <h3>${escapeHtmlBA(b.name)}</h3>
        <p class="muted" style="font-size:13px;">Banayi: ${escapeHtmlBA(b.creator_name)} · ${new Date(b.created_at).toLocaleDateString()}</p>
        ${b.description ? `<p style="font-size:14px; margin-top:8px;">${escapeHtmlBA(b.description)}</p>` : ""}
        <div style="margin-top:14px; display:flex; gap:10px;">
          <button class="btn btn-primary" data-action="approve" data-id="${b.id}">✓ Approve</button>
          <button class="btn btn-ghost" data-action="reject" data-id="${b.id}">✕ Reject</button>
        </div>
      </div>`).join("");

    listEl.querySelectorAll("button[data-action]").forEach((btn) => {
      btn.onclick = async () => {
        const id = btn.getAttribute("data-id");
        const action = btn.getAttribute("data-action");
        try {
          await AdabAuth.rpc(action === "approve" ? "adab_approve_bazm" : "adab_reject_bazm", { p_bazm_id: id });
          renderBazmApprovals();
        } catch (e) {
          alert(e.message === "NOT_ADMIN" ? "Yeh Google account admin list mein nahi hai." : "Kuch masla hua, dobara koshish karein.");
        }
      };
    });
  } catch (e) {
    listEl.innerHTML = `<p style="color:#a33;">${e.message === "NOT_ADMIN" ? "Yeh Google account admin list mein nahi hai." : "Kuch masla hua."}</p>`;
  }
}

document.addEventListener("DOMContentLoaded", renderBazmApprovals);
