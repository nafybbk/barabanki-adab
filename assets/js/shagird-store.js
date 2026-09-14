// ============================================================
// SHAGIRD AUTH + POSTS — client-side store for now.
// Structured so it can be swapped for a real backend (e.g. a
// small API) later without changing the calling pages much.
// ============================================================

const ShagirdStore = {
  KEYS: { users: "bazm_shagird_users", session: "bazm_shagird_session", posts: "bazm_shagird_posts" },

  getUsers() {
    return JSON.parse(localStorage.getItem(this.KEYS.users) || "[]");
  },
  saveUsers(users) {
    localStorage.setItem(this.KEYS.users, JSON.stringify(users));
  },

  register(name, pin) {
    if (!name.trim()) return { ok: false, error: "Naam likhiye." };
    if (!/^\d{4,6}$/.test(pin)) return { ok: false, error: "PIN 4 se 6 ank ka hona chahiye." };
    const users = this.getUsers();
    if (users.some((u) => u.name.toLowerCase() === name.trim().toLowerCase())) {
      return { ok: false, error: "Ye naam pehle se registered hai. Login karein." };
    }
    const user = { id: "u_" + Date.now(), name: name.trim(), pin, joined: Date.now() };
    users.push(user);
    this.saveUsers(users);
    this.setSession(user);
    return { ok: true, user };
  },

  login(name, pin) {
    const users = this.getUsers();
    const user = users.find(
      (u) => u.name.toLowerCase() === name.trim().toLowerCase() && u.pin === pin
    );
    if (!user) return { ok: false, error: "Naam ya PIN ghalat hai." };
    this.setSession(user);
    return { ok: true, user };
  },

  setSession(user) {
    localStorage.setItem(this.KEYS.session, JSON.stringify({ id: user.id, name: user.name }));
  },
  getSession() {
    const raw = localStorage.getItem(this.KEYS.session);
    return raw ? JSON.parse(raw) : null;
  },
  logout() {
    localStorage.removeItem(this.KEYS.session);
  },

  getPosts() {
    return JSON.parse(localStorage.getItem(this.KEYS.posts) || "[]").sort((a, b) => b.time - a.time);
  },
  addPost({ type, content }) {
    const session = this.getSession();
    if (!session) return { ok: false, error: "Pehle login karein." };
    if (!content || !content.trim()) return { ok: false, error: "Kuch likhiye ya link dalein." };
    const posts = this.getPosts();
    posts.unshift({
      id: "post_" + Date.now(),
      name: session.name,
      userId: session.id,
      type,
      content: content.trim(),
      time: Date.now(),
    });
    localStorage.setItem(this.KEYS.posts, JSON.stringify(posts));
    return { ok: true };
  },
};
