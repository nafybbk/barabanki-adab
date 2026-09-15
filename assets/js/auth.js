// ============================================================
// AUTH — Google Sign-In + Supabase Auth, raw REST (no SDK), same
// lightweight pattern as bazm-comments.js. Session (access/refresh
// token) lives in localStorage; the access_token is sent as Bearer
// on every RPC call so Postgres RPCs can trust auth.uid() from a
// real signed-in session instead of a client-supplied id (the old
// bazm_* PIN scheme's weaker trust model).
// ============================================================

function escapeHtmlAD(str) {
  return String(str || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function bazmDirErrorText(code, t) {
  return t[`bazmErr_${code}`] || t.bazmErr_default;
}

function bazmGetIdentity() {
  if (AdabAuth.isLoggedIn()) {
    const u = AdabAuth.currentUser();
    return { mode: "google", userId: u.id, email: u.email };
  }
  const pinSession = AdabPinAuth.getSession();
  if (pinSession) {
    return { mode: "pin", userId: pinSession.user_id, email: pinSession.email, name: pinSession.name };
  }
  return null;
}

const ADAB_SUPABASE_URL = "https://qdghsvkdvazrihurayoy.supabase.co";
const ADAB_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkZ2hzdmtkdmF6cmlodXJheW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MzAyNjMsImV4cCI6MjEwNDAwNjI2M30.4I9-x4vh-OWMegooC0A1UQbZ4r84_d0ljCrfA8lW8do";
const ADAB_GOOGLE_CLIENT_ID = "669308173642-0nes8rlr123stbts1gnbhsk9lac8gmja.apps.googleusercontent.com";

const AdabAuth = {
  SESSION_KEY: "adab_auth_session",
  DEVICE_KEY: "adab_device_id",

  getSession() {
    try { return JSON.parse(localStorage.getItem(this.SESSION_KEY) || "null"); } catch { return null; }
  },
  setSession(session) { localStorage.setItem(this.SESSION_KEY, JSON.stringify(session)); },
  clearSession() { localStorage.removeItem(this.SESSION_KEY); },

  getDeviceId() {
    let id = localStorage.getItem(this.DEVICE_KEY);
    if (!id) {
      id = window.crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(this.DEVICE_KEY, id);
    }
    return id;
  },

  isLoggedIn() {
    const s = this.getSession();
    return !!(s && s.access_token);
  },

  currentUser() {
    const s = this.getSession();
    return s ? s.user : null;
  },

  async signInWithGoogleIdToken(idToken) {
    const res = await fetch(`${ADAB_SUPABASE_URL}/auth/v1/token?grant_type=id_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ADAB_ANON_KEY },
      body: JSON.stringify({ provider: "google", id_token: idToken }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error((data && (data.error_description || data.msg)) || "LOGIN_FAILED");
    this.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in - 30) * 1000,
      user: data.user,
    });
    return data.user;
  },

  async refreshIfNeeded() {
    const s = this.getSession();
    if (!s) return null;
    if (s.expires_at > Date.now()) return s;
    try {
      const res = await fetch(`${ADAB_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: ADAB_ANON_KEY },
        body: JSON.stringify({ refresh_token: s.refresh_token }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) { this.clearSession(); return null; }
      const updated = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + (data.expires_in - 30) * 1000,
        user: data.user || s.user,
      };
      this.setSession(updated);
      return updated;
    } catch {
      return null;
    }
  },

  logout() { this.clearSession(); },

  // Anon-key RPC — for RPCs designed to be called by anyone (they check
  // identity via their own params, e.g. the PIN-login family below).
  async _rpcAnon(fn, body) {
    const res = await fetch(`${ADAB_SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ADAB_ANON_KEY, Authorization: `Bearer ${ADAB_ANON_KEY}` },
      body: JSON.stringify(body || {}),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error((data && data.message) || "REQUEST_FAILED");
    return data;
  },

  // Authenticated RPC — Bearer = the user's own session token.
  async rpc(fn, body) {
    const s = await this.refreshIfNeeded();
    if (!s) throw new Error("NOT_LOGGED_IN");
    const res = await fetch(`${ADAB_SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: ADAB_ANON_KEY, Authorization: `Bearer ${s.access_token}` },
      body: JSON.stringify(body || {}),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error((data && data.message) || "REQUEST_FAILED");
    return data;
  },

  // Authenticated read (RLS "own row" tables) — Bearer = the user's session.
  async authRead(path) {
    const s = await this.refreshIfNeeded();
    if (!s) throw new Error("NOT_LOGGED_IN");
    const res = await fetch(`${ADAB_SUPABASE_URL}/rest/v1/${path}`, {
      headers: { apikey: ADAB_ANON_KEY, Authorization: `Bearer ${s.access_token}` },
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error((data && data.message) || "REQUEST_FAILED");
    return data;
  },

  // Public read (RLS public-select tables) — anon key is enough.
  async publicRead(path) {
    const res = await fetch(`${ADAB_SUPABASE_URL}/rest/v1/${path}`, {
      headers: { apikey: ADAB_ANON_KEY, Authorization: `Bearer ${ADAB_ANON_KEY}` },
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error((data && data.message) || "REQUEST_FAILED");
    return data;
  },
};

// PIN LOGIN — a deliberately weaker, OPT-IN convenience login for using
// your already-Google-verified account on a device that isn't yours
// (e.g. showing your Bazm posts on a friend's phone). Google Sign-In is
// still what proves you're a real person and is required once to set a
// PIN in the first place; every PIN-mode write below re-checks
// email+pin server-side on every call (client never proves anything by
// itself), same trust pattern as the site's older name+PIN system.
const AdabPinAuth = {
  KEY: "adab_pin_session",

  getSession() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || "null"); } catch { return null; }
  },
  setSession(s) { localStorage.setItem(this.KEY, JSON.stringify(s)); },
  logout() { localStorage.removeItem(this.KEY); },
  isLoggedIn() { return !!this.getSession(); },

  async login(email, pin) {
    const rows = await AdabAuth._rpcAnon("adab_pin_login", { p_email: email, p_pin: pin });
    const row = rows[0];
    const session = { email, pin, user_id: row.user_id, name: row.name };
    this.setSession(session);
    return session;
  },

  // Calls a `_pin` RPC variant, auto-injecting the stored email/pin.
  async rpc(fn, extraParams) {
    const s = this.getSession();
    if (!s) throw new Error("NOT_LOGGED_IN");
    return AdabAuth._rpcAnon(fn, { p_email: s.email, p_pin: s.pin, ...extraParams });
  },
};

// Renders Google's own Sign-In button into `containerId`. Note: Google's
// button text/branding cannot be forced into Urdu (their branding rules) —
// put our own Urdu label text next to it, the button itself stays as
// Google renders it.
let _adabGsiInitialized = false;

function initGoogleSignIn(containerId, onSuccess, onError) {
  function render() {
    if (!window.google || !google.accounts || !google.accounts.id) { setTimeout(render, 200); return; }
    if (!_adabGsiInitialized) {
      google.accounts.id.initialize({
        client_id: ADAB_GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const user = await AdabAuth.signInWithGoogleIdToken(response.credential);
            onSuccess(user);
          } catch (err) {
            onError(err);
          }
        },
      });
      _adabGsiInitialized = true;
    }
    const el = document.getElementById(containerId);
    if (el) google.accounts.id.renderButton(el, { theme: "outline", size: "large", text: "continue_with" });
  }
  if (!document.getElementById("google-gsi-script")) {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.id = "google-gsi-script";
    s.async = true;
    s.defer = true;
    s.onload = render;
    document.head.appendChild(s);
  } else {
    render();
  }
}
