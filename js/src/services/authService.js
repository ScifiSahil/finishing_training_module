/**
 * ─── AUTH SERVICE ────────────────────────────────────────────────────
 * Credentials apiConfig.js se aate hain — yahan hardcode mat karo
 * ─────────────────────────────────────────────────────────────────────
 */

import { API_USERNAME, API_PASSWORD, REQUIRES_AUTH } from "./apiConfig";

class AuthService {
  constructor() {
    this.username = API_USERNAME;
    this.password = API_PASSWORD;
  }

  // Returns { Authorization: "Basic xxxx" } header
  // Local env mein empty object return karta hai
  getAuthHeaders() {
    if (!REQUIRES_AUTH) return {};
    if (!this.username || !this.password) {
      console.error("❌ Auth: credentials not configured!");
      throw new Error("Authentication credentials not configured");
    }
    const encoded = btoa(`${this.username}:${this.password}`);
    return { Authorization: `Basic ${encoded}` };
  }

  getCredentials() {
    return { username: this.username, password: this.password };
  }
}

export default new AuthService();

// /**
//  * ─── AUTH SERVICE ────────────────────────────────────────────────────
//  * Production Dashboard ke liye Basic Auth credentials
//  *
//  * Credentials change karne ho to sirf yahan karo:
//  *   AUTH_CONFIG.username / AUTH_CONFIG.password
//  * ─────────────────────────────────────────────────────────────────────
//  */

// const AUTH_CONFIG = {
//   username: "caddok",
//   password: "Concali4raj2024$",
// };

// class AuthService {
//   constructor() {
//     this.username = AUTH_CONFIG.username;
//     this.password = AUTH_CONFIG.password;
//   }

//   // Runtime pe credentials update karne ke liye (optional)
//   setCredentials(username, password) {
//     this.username = username;
//     this.password = password;
//     console.log("✅ Auth credentials updated for:", username);
//   }

//   // Returns { Authorization: "Basic xxxx" } header
//   getAuthHeaders() {
//     if (!this.username || !this.password) {
//       console.error("❌ Auth: username ya password set nahi hai!");
//       throw new Error("Authentication credentials not configured");
//     }
//     const encoded = btoa(`${this.username}:${this.password}`);
//     return {
//       Authorization: `Basic ${encoded}`,
//     };
//   }

//   getCredentials() {
//     return { username: this.username, password: this.password };
//   }
// }

// export default new AuthService();
