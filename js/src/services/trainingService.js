/**
 * ─── TRAINING SERVICE ────────────────────────────────────────────────
 * Everything the trainee side needs from the CONTACT collection API:
 * course content, progress, lessons seen, quiz and final attempts, passport, certificate, role.
 * Table names come from apiConfig.js ENDPOINTS (training*).
 * ─────────────────────────────────────────────────────────────────────
 */

import rest from "./restClient";

// Logins that are always admins in the screens (real protection = CONTACT access rights)
export const BOOTSTRAP_ADMINS = ["caddok"];

export const nowText = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

export const makeId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID().replace(/-/g, "");
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
};

export const parseJson = (text, fallback) => {
  try {
    return text ? JSON.parse(text) : fallback;
  } catch (e) {
    return fallback;
  }
};

const isActive = (r) => r.is_active === "1";

// ---------- course content ----------
// Rows -> the same shape as courseData.json. Returns null when no module is stored yet.
export function courseFromRows(modules, sops, datasets) {
  const activeModules = modules.filter(isActive).sort((a, b) => a.sort_no - b.sort_no);
  if (activeModules.length === 0) return null;
  const ds = {};
  datasets.forEach((r) => { ds[r.dataset_key] = parseJson(r.data_json); });
  const settings = ds.settings || {};
  return {
    passMark: Number.isInteger(settings.passMark) ? settings.passMark : undefined,
    modules: activeModules.map((r) => ({
      id: r.module_id, title: r.title, short: r.short_title || "", hero: r.hero_image || "",
      lessons: parseJson(r.lessons_json, []), quiz: parseJson(r.quiz_json, []),
    })),
    videoSops: sops.filter(isActive).sort((a, b) => a.sort_no - b.sort_no).map((r) => ({
      id: r.sop_id, n: r.title, d: r.subtitle || "", scenes: parseJson(r.scenes_json, []),
    })),
    products: ds.products, stations: ds.stations, defects: ds.defects, tpm: ds.tpm, spots: ds.spots,
    finalExtra: ds.final_extra, selectors: ds.selectors, decider: ds.decider, passport: ds.passport,
  };
}

export async function loadCourse() {
  const [modules, sops, datasets] = await Promise.all([
    rest.list("trainingModule"), rest.list("trainingVideoSop"), rest.list("trainingDataset"),
  ]);
  return courseFromRows(modules, sops, datasets);
}

// ---------- progress ----------
// Rows of one trainee -> the progress object the app keeps in its state
export function progressFromRows({ trainee, seen, attempts, passport, certificate }) {
  const seenMap = {};
  seen.forEach((r) => {
    (seenMap[r.module_id] = seenMap[r.module_id] || []).push(Number(r.lesson_no));
  });
  Object.keys(seenMap).forEach((k) => seenMap[k].sort((a, b) => a - b));

  const quiz = {};
  let final = null;
  attempts.slice().sort((a, b) => (a.taken_at < b.taken_at ? -1 : 1)).forEach((a) => {
    const score = Number(a.score_pct);
    if (a.attempt_kind === "module") {
      const q = quiz[a.module_id] || (quiz[a.module_id] = { best: 0, attempts: 0, last: 0 });
      q.best = Math.max(q.best, score);
      q.attempts += 1;
      q.last = score;
    } else {
      if (!final) final = { best: 0, attempts: 0, date: null };
      final.best = Math.max(final.best, score);
      final.attempts += 1;
      if (a.is_passed === "1") final.date = a.taken_at;
    }
  });

  const pass = {};
  const refresh = {};
  passport.forEach((r) => {
    if (r.phase_id.indexOf("refresh_") === 0) refresh[r.phase_id.slice(8)] = r.is_done === "1";
    else pass[r.phase_id] = { done: r.is_done === "1", trainer: r.trainer || "", supervisor: r.supervisor || "", date: r.signed_date || "" };
  });
  if (Object.keys(refresh).length) pass.refresh = refresh;

  return {
    name: (trainee && trainee.trainee_name) || "",
    seen: seenMap, quiz, final, passport: pass,
    certificate: certificate
      ? { certNo: certificate.cert_no, name: certificate.trainee_name || "", score: Number(certificate.score_pct), issuedAt: certificate.issued_at }
      : null,
  };
}

export async function loadProgress(login) {
  const filter = { login };
  const [trainee, seen, attempts, passport, certificate] = await Promise.all([
    rest.first("trainingTrainee", filter), rest.list("trainingLessonSeen", filter),
    rest.list("trainingAttempt", filter), rest.list("trainingPassport", filter),
    rest.first("trainingCertificate", filter),
  ]);
  return progressFromRows({ trainee, seen, attempts, passport, certificate });
}

// Creates the trainee on the first visit, and records the last visit. Name is optional.
export async function ensureTrainee(login, name) {
  const stamp = nowText();
  const row = await rest.first("trainingTrainee", { login });
  if (!row) {
    return rest.create("trainingTrainee", { login, trainee_name: name || "", first_seen_at: stamp, last_seen_at: stamp });
  }
  const patch = { last_seen_at: stamp };
  if (name && name.trim()) patch.trainee_name = name.trim();
  return rest.update(row, patch);
}

export const saveName = (login, name) => ensureTrainee(login, name);

export async function markLessonSeen(login, moduleId, lessonNo) {
  const keys = { login, module_id: moduleId, lesson_no: lessonNo };
  const existing = await rest.first("trainingLessonSeen", keys);
  if (existing) return existing;
  return rest.create("trainingLessonSeen", { ...keys, first_seen_at: nowText() });
}

// result = { pct, pass, correct, total, missed: [{ q, right }] }
export function saveAttempt(login, kind, moduleId, result) {
  return rest.create("trainingAttempt", {
    attempt_id: makeId(), login, attempt_kind: kind, module_id: moduleId || "",
    score_pct: result.pct, correct_cnt: result.correct, total_cnt: result.total,
    is_passed: result.pass ? "1" : "0", missed_json: JSON.stringify(result.missed || []), taken_at: nowText(),
  });
}

// ---------- passport and certificate ----------
// patch = { done, trainer, supervisor, date }. phaseId: p1..p5 or refresh_30 / refresh_60 / refresh_90
export async function savePassport(login, phaseId, patch, by) {
  const existing = await rest.first("trainingPassport", { login, phase_id: phaseId });
  const values = { updated_at: nowText(), updated_by: by || "" };
  values.is_done = patch.done !== undefined ? (patch.done ? "1" : "0") : existing ? existing.is_done : "0";
  if (patch.trainer !== undefined) values.trainer = patch.trainer;
  if (patch.supervisor !== undefined) values.supervisor = patch.supervisor;
  if (patch.date !== undefined) values.signed_date = patch.date;
  if (existing) return rest.update(existing, values);
  return rest.create("trainingPassport", { login, phase_id: phaseId, ...values });
}

export async function issueCertificate(login, name, score, certNo) {
  const existing = await rest.first("trainingCertificate", { login });
  if (existing) {
    if (score > Number(existing.score_pct)) return rest.update(existing, { score_pct: score, trainee_name: name || existing.trainee_name });
    return existing;
  }
  return rest.create("trainingCertificate", { login, cert_no: certNo, trainee_name: name || "", score_pct: score, issued_at: nowText() });
}

// ---------- role ----------
// 'admin', 'trainer' or '' (a normal trainee)
export async function getRole(login) {
  if (BOOTSTRAP_ADMINS.indexOf(login) >= 0) return "admin";
  const row = await rest.first("trainingStaff", { login });
  return row && row.is_active === "1" && (row.staff_role === "admin" || row.staff_role === "trainer") ? row.staff_role : "";
}
