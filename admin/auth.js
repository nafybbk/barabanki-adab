// ============================================================
// ADMIN AUTH — simple password gate for the admin panel.
// This protects against casual browsing, not determined attackers.
// Since this site currently runs client-side only (no server),
// true security requires a backend — flagged clearly in the panel.
// ============================================================

const AdminAuth = {
  KEY: "bazm_admin_session",
  PASS_KEY: "bazm_admin_password",

  getPassword() {
    return localStorage.getItem(this.PASS_KEY) || "12345678"; // default — change on first login
  },
  setPassword(pw) {
    localStorage.setItem(this.PASS_KEY, pw);
  },

  isLoggedIn() {
    return sessionStorage.getItem(this.KEY) === "1";
  },
  login(pw) {
    if (pw === this.getPassword()) {
      sessionStorage.setItem(this.KEY, "1");
      return true;
    }
    return false;
  },
  logout() {
    sessionStorage.removeItem(this.KEY);
  },
};
