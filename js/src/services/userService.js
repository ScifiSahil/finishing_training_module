/**
 * ─── USER SERVICE ────────────────────────────────────────────────────
 * Who is using the app.
 *
 * settings.askEmployeeId
 *   false (now): no Employee ID screen. The app opens directly and everything is saved under
 *                settings.defaultLogin.
 *   true:        the trainee types an Employee ID once; it is kept in this browser.
 *
 * To see the Admin menu while testing, set defaultLogin to "caddok" (built-in admin).
 * Do NOT leave "caddok" there when trainees use the app: all of them would become admins.
 * ─────────────────────────────────────────────────────────────────────
 */

export const settings = {
  askEmployeeId: false,
  defaultLogin: "guest",
};

const KEY = "finishing-training-login";

class UserService {
  getLogin() {
    let stored = "";
    try {
      stored = localStorage.getItem(KEY) || "";
    } catch (e) {
      stored = "";
    }
    if (stored) return stored;
    return settings.askEmployeeId ? "" : settings.defaultLogin;
  }

  setLogin(login) {
    const clean = String(login || "").trim().toLowerCase();
    try {
      if (clean) localStorage.setItem(KEY, clean);
      else localStorage.removeItem(KEY);
    } catch (e) {
      // storage blocked: the login is asked again next time
    }
    return clean;
  }

  clear() {
    this.setLogin("");
  }
}

export default new UserService();