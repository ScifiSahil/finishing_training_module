/**
 * ─── CSRF SERVICE ────────────────────────────────────────────────────
 * Endpoint apiConfig.js se aata hai — hardcode nahi
 * ─────────────────────────────────────────────────────────────────────
 */

import { API_URLS, REQUIRES_AUTH } from "./apiConfig";
import authService from "./authService";

class CsrfService {
  constructor() {
    this.csrfToken  = null;
    this.sessionKey = null;
  }

  _getCsrfFromCookie() {
    try {
      const c = document.cookie.split("; ").find(r => r.startsWith("CSRFToken="));
      return c ? decodeURIComponent(c.split("=")[1]) : null;
    } catch { return null; }
  }

  _getSessionFromCookie() {
    try {
      const c = document.cookie.split("; ").find(r => r.startsWith("contact.sessionkey="));
      return c ? c.split("=")[1] : null;
    } catch { return null; }
  }

  async getCsrfToken() {
    // Local env mein CSRF ki zaroorat nahi
    if (!REQUIRES_AUTH) return null;

    if (this.csrfToken) return this.csrfToken;

    const fromCookie = this._getCsrfFromCookie();
    if (fromCookie) {
      this.csrfToken = fromCookie;
      return this.csrfToken;
    }

    try {
      await fetch(API_URLS.graphql, {
        method:      "GET",
        headers:     { ...authService.getAuthHeaders(), Accept: "application/json" },
        credentials: "include",
      });
      const afterGet = this._getCsrfFromCookie();
      this.csrfToken = afterGet || "";
    } catch (err) {
      console.warn("⚠️ CSRF GET failed:", err.message);
      this.csrfToken = "";
    }

    return this.csrfToken;
  }

  getSessionKey() {
    if (!this.sessionKey) this.sessionKey = this._getSessionFromCookie();
    return this.sessionKey;
  }

  reset() {
    this.csrfToken  = null;
    this.sessionKey = null;
  }
}

export default new CsrfService();

// /**
//  * ─── CSRF SERVICE ────────────────────────────────────────────────────
//  * Endpoint: https://ktfrancesrv1.kalyanicorp.com/internal/prod_views/graphql
//  * ─────────────────────────────────────────────────────────────────────
//  */

// import authService from "./authService";

// const GRAPHQL_ENDPOINT =
//   "https://ktfrancesrv1.kalyanicorp.com/internal/prod_views/graphql";

// class CsrfService {
//   constructor() {
//     this.csrfToken  = null;
//     this.sessionKey = null;
//   }

//   _getCsrfFromCookie() {
//     try {
//       const c = document.cookie.split("; ").find(r => r.startsWith("CSRFToken="));
//       return c ? decodeURIComponent(c.split("=")[1]) : null;
//     } catch { return null; }
//   }

//   _getSessionFromCookie() {
//     try {
//       const c = document.cookie.split("; ").find(r => r.startsWith("contact.sessionkey="));
//       return c ? c.split("=")[1] : null;
//     } catch { return null; }
//   }

//   async getCsrfToken() {
//     if (this.csrfToken) return this.csrfToken;

//     const fromCookie = this._getCsrfFromCookie();
//     if (fromCookie) {
//       console.log("🍪 CSRF from cookie");
//       this.csrfToken = fromCookie;
//       return this.csrfToken;
//     }

//     try {
//       console.log("🔑 Fetching CSRF via GET...");
//       await fetch(GRAPHQL_ENDPOINT, {
//         method:      "GET",
//         headers:     { ...authService.getAuthHeaders(), Accept: "application/json" },
//         credentials: "include",
//       });
//       const afterGet = this._getCsrfFromCookie();
//       this.csrfToken = afterGet || "";
//       if (afterGet) console.log("✅ CSRF obtained");
//       else          console.warn("⚠️ CSRF not found — proceeding without");
//     } catch (err) {
//       console.warn("⚠️ CSRF GET failed:", err.message);
//       this.csrfToken = "";
//     }

//     return this.csrfToken;
//   }

//   getSessionKey() {
//     if (!this.sessionKey) this.sessionKey = this._getSessionFromCookie();
//     return this.sessionKey;
//   }

//   reset() {
//     this.csrfToken  = null;
//     this.sessionKey = null;
//     console.log("🔄 CSRF reset");
//   }
// }

// export default new CsrfService();