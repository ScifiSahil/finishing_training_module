/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  apiConfig.js — SINGLE SOURCE OF TRUTH for all API config        ║
 * ║                                                                  ║
 * ║  Environment auto-detect (hostname se):                          ║
 * ║    localhost / 127.0.0.1  → LOCAL  (no auth, no CSRF)            ║
 * ║    ktfrancesrv1 / srv2    → TEST   (caddok / Concali4raj2024$)   ║
 * ║    ktflkhedcesrv          → KHED   (caddok / Concali4khed2023$)  ║
 * ║    ktflceprd              → PROD   (kalyaniadmin / @7001)        ║
 * ║                                                                  ║
 * ║  BASE — always window.location.origin (automatic, no hardcode)   ║
 * ║  Sare API URLs yahan se lo — kahi bhi hardcode mat karo          ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ── 1. Environment Detection ──────────────────────────────────────────────────
const hostname = typeof window !== "undefined"
  ? window.location.hostname
  : "localhost";

const ENV =
  hostname.includes("vm1pap045")          ? "mundhwa"    :   // ← NEW
  hostname.includes("ktflkhedcesrv")      ? "khed"       :   // Khed plant server
  hostname.includes("ktflceprd")          ? "production" :
  hostname === "ktfrancesrv.kalyanicorp.com" ? "staging" :  // exact match — srv without 1
  hostname.includes("ktfrancesrv")        ? "test"       :  // srv1, srv2 etc.
                                            "local";

// ── 2. BASE — dynamic from browser URL (no hardcoding needed) ────────────────
export const BASE     = typeof window !== "undefined" ? window.location.origin : "";
export const BASE_URL = BASE;   // alias — dono naam kaam karenge

// ── 3. Credentials per environment ───────────────────────────────────────────
const CREDENTIALS = {
  mundhwa:    { username: "caddok", password: "caddok" },  // ← NEW (apna real daalo)
  khed:       { username: "caddok",             password: "Concali4khed2023$"     },
  production: { username: "kalyaniadmin",       password: "kalyaniadmin@7001"    },
  staging:    { username: "scifikttplrajadmin", password: "scifikttplrajadmin01@" },
  test:       { username: "caddok",             password: "Concali4raj2024$"      },
  local:      { username: "",                   password: ""                      },
};

export const IS_LOCAL      = ENV === "local";
export const REQUIRES_AUTH = !IS_LOCAL;

const { username: API_USERNAME, password: API_PASSWORD } = CREDENTIALS[ENV];
export { API_USERNAME, API_PASSWORD };

// ── 4. AUTH header (Base64 encoded) ──────────────────────────────────────────
export const AUTH = REQUIRES_AUTH
  ? "Basic " + btoa(`${API_USERNAME}:${API_PASSWORD}`)
  : "";

// ── 5. Common request headers ─────────────────────────────────────────────────
export const JSON_HEADERS = {
  "Content-Type": "application/json",
  Accept:         "application/json",
  ...(AUTH ? { Authorization: AUTH } : {}),
};

// ── 6. Endpoint paths (relative) ─────────────────────────────────────────────
export const ENDPOINTS = {
  graphql:            "/internal/prod_views/graphql",
  machineCapacity:    "/api/v1/collection/kln_ppc_machine_capacity",
  dieSelection:       "/internal/die_selection",
  strokeSelection:    "/internal/stroke_selection",
  strokeCounter:      "/internal/forge_stroke_counter",
  forgeLines:         "/internal/forge_liness",
  cummQty:            "/internal/prodd_qty_cumm",
  downtimeLive:       "/internal/downtime_live",
  downtimeEvents:     "/internal/downtime_events",
  lossAnalysis:       "/internal/loss_analysis",
  hourlyCounter:      "/internal/hourly_good_counter",
  healthMonitor:      "/api/v1/collection/prodd_health_monitor",
  paramThreshold:     "/api/v1/collection/prodd_param_threshold",
  scrapReason:        "/api/v1/collection/csprx_shift_scrap_reason",
  dieSelectionApi:    "/api/v1/collection/kln_die_selection",

  // ── Finishing training (CONTACT collection API, one line per table) ──
  trainingModule:      "/api/v1/collection/finishing_training_module",
  trainingVideoSop:    "/api/v1/collection/finishing_training_video_sop",
  trainingDataset:     "/api/v1/collection/finishing_training_dataset",
  trainingTrainee:     "/api/v1/collection/finishing_training_trainee",
  trainingLessonSeen:  "/api/v1/collection/finishing_training_lesson_seen",
  trainingAttempt:     "/api/v1/collection/finishing_training_attempt",
  trainingPassport:    "/api/v1/collection/finishing_training_passport",
  trainingCertificate: "/api/v1/collection/finishing_training_certificate",
  trainingStaff:       "/api/v1/collection/finishing_training_staff",
  trainingContentLog:  "/api/v1/collection/finishing_training_content_log",
};

// ── 7. Full URLs (convenience — BASE + path) ──────────────────────────────────
export const API_URLS = Object.fromEntries(
  Object.entries(ENDPOINTS).map(([key, path]) => [key, `${BASE}${path}`])
);

// ── 8. Debug log ──────────────────────────────────────────────────────────────
// [REMOVED] Debug log removed — was exposing username in production console