// ============================================================
// BAZM COMMENTS — shared, cloud-backed (Supabase). Anon key only;
// all writes go through RPC functions that re-check the PIN
// server-side, so this key alone can never forge a post or read
// anyone's PIN. Session (user id + name + pin) is kept in this
// browser's localStorage only, same trust model as before.
// ============================================================

const BAZM_SUPABASE_URL = "https://qdghsvkdvazrihurayoy.supabase.co";
const BAZM_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkZ2hzdmtkdmF6cmlodXJheW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0MzAyNjMsImV4cCI6MjEwNDAwNjI2M30.4I9-x4vh-OWMegooC0A1UQbZ4r84_d0ljCrfA8lW8do";

const BazmComments = {
  KEY: "bazm_comments_session",

  async _rpc(fn, body) {
    const res = await fetch(`${BAZM_SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: BAZM_ANON_KEY,
        Authorization: `Bearer ${BAZM_ANON_KEY}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const code = (data && data.message) || "";
      throw new Error(code);
    }
    return data;
  },

  getSession() {
    try {
      const raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setSession(session) {
    localStorage.setItem(this.KEY, JSON.stringify(session));
  },
  logout() {
    localStorage.removeItem(this.KEY);
  },

  async register(name, pin) {
    const rows = await this._rpc("bazm_register", { p_name: name, p_pin: pin });
    const user = rows[0];
    const session = { id: user.id, name: user.name, pin };
    this.setSession(session);
    return session;
  },

  async login(name, pin) {
    const rows = await this._rpc("bazm_login", { p_name: name, p_pin: pin });
    const user = rows[0];
    const session = { id: user.id, name: user.name, pin };
    this.setSession(session);
    return session;
  },

  async addPost(pageId, content, type) {
    const session = this.getSession();
    if (!session) throw new Error("LOGIN_CHAHIYE");
    const rows = await this._rpc("bazm_add_post", {
      p_user_id: session.id,
      p_pin: session.pin,
      p_page_id: pageId,
      p_content: content,
      p_type: type || "comment",
    });
    return rows[0];
  },

  async getPosts(pageId) {
    const url = `${BAZM_SUPABASE_URL}/rest/v1/bazm_posts?page_id=eq.${encodeURIComponent(pageId)}&select=id,user_name,content,post_type,created_at&order=created_at.desc`;
    const res = await fetch(url, {
      headers: { apikey: BAZM_ANON_KEY, Authorization: `Bearer ${BAZM_ANON_KEY}` },
    });
    if (!res.ok) return [];
    return res.json();
  },

  ERROR_MESSAGES: {
    NAAM_KHALI: "Naam likhna zaroori hai۔",
    PIN_GHALAT: "PIN 4 se 6 ank ka hona chahiye۔",
    NAAM_MAUJOOD: "Yeh naam pehle se hai — Dakhil hon (login) karein۔",
    LOGIN_GHALAT: "Naam ya PIN theek nahi hai۔",
    KHALI_POST: "Kuch to likhein۔",
    LOGIN_CHAHIYE: "Pehle apna naam darj karein۔",
  },
  errorText(err) {
    const key = (err && err.message) || "";
    return this.ERROR_MESSAGES[key] || "Kuch masla hua, dobara koshish karein۔";
  },
};
