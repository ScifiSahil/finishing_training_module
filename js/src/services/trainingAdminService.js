/**
 * ─── TRAINING ADMIN SERVICE ──────────────────────────────────────────
 * Admin and trainer calls: content editing, reports, staff, first-time import.
 * Content is validated here before it is saved. Every change is written to the change log.
 * ─────────────────────────────────────────────────────────────────────
 */

import rest from "./restClient";
import { BUNDLED_COURSE, MODULES } from "../data";
import { validateDataset, validateModule, validateVideoSop } from "../utils/contentValidators";
import { finalPassed, moduleDone, overallPercent } from "../utils/progress";
import { makeId, nowText, parseJson, progressFromRows } from "./trainingService";

const isActive = (r) => r.is_active === "1";

export class ValidationError extends Error {
  constructor(message, errors) {
    super(message);
    this.errors = errors;
  }
}

function check(errors, what) {
  if (Object.keys(errors).length) throw new ValidationError(`The ${what} has problems. Fix them and save again.`, errors);
}

async function log(by, kind, key, action, summary) {
  await rest.create("trainingContentLog", {
    log_id: makeId(), changed_at: nowText(), changed_by: by, item_kind: kind, item_key: key,
    action, summary: (summary || "").slice(0, 400),
  });
}

const maxSort = (rows) => rows.reduce((m, r) => Math.max(m, Number(r.sort_no) || 0), 0);

// ---------- modules ----------
export async function listModules() {
  return (await rest.list("trainingModule")).filter(isActive).sort((a, b) => a.sort_no - b.sort_no).map((r) => ({
    id: r.module_id, sortNo: r.sort_no, title: r.title, short: r.short_title || "", hero: r.hero_image || "",
    lessons: parseJson(r.lessons_json, []), quiz: parseJson(r.quiz_json, []), updatedAt: r.updated_at, updatedBy: r.updated_by,
  }));
}

export async function saveModule(id, data, by) {
  check(validateModule(data, id), "module");
  const rows = await rest.list("trainingModule");
  const existing = rows.find((r) => r.module_id === id);
  const stamp = nowText();
  const values = {
    title: data.title.trim(), short_title: (data.short || "").trim(), hero_image: (data.hero || "").trim(),
    lessons_json: JSON.stringify(data.lessons), quiz_json: JSON.stringify(data.quiz),
    is_active: "1", deleted_at: "", updated_at: stamp, updated_by: by,
  };
  if (existing) await rest.update(existing, values);
  else await rest.create("trainingModule", { module_id: id, sort_no: maxSort(rows) + 1, created_at: stamp, ...values });
  await log(by, "module", id, existing ? "update" : "create", `${values.title} (${data.lessons.length} lessons, ${data.quiz.length} questions)`);
}

export async function deleteModule(id, by) {
  const row = await rest.first("trainingModule", { module_id: id });
  if (!row) throw new Error("Module not found");
  const stamp = nowText();
  await rest.update(row, { is_active: "0", deleted_at: stamp, updated_at: stamp, updated_by: by });
  await log(by, "module", id, "delete", row.title);
}

// ---------- video SOPs ----------
export async function listVideoSops() {
  return (await rest.list("trainingVideoSop")).filter(isActive).sort((a, b) => a.sort_no - b.sort_no).map((r) => ({
    id: r.sop_id, n: r.title, d: r.subtitle || "", scenes: parseJson(r.scenes_json, []), updatedAt: r.updated_at,
  }));
}

export async function saveVideoSop(id, data, by) {
  check(validateVideoSop(data, id), "video SOP");
  const rows = await rest.list("trainingVideoSop");
  const existing = rows.find((r) => r.sop_id === id);
  const stamp = nowText();
  const values = {
    title: data.n.trim(), subtitle: (data.d || "").trim(), scenes_json: JSON.stringify(data.scenes),
    is_active: "1", deleted_at: "", updated_at: stamp, updated_by: by,
  };
  if (existing) await rest.update(existing, values);
  else await rest.create("trainingVideoSop", { sop_id: id, sort_no: maxSort(rows) + 1, created_at: stamp, ...values });
  await log(by, "video", id, existing ? "update" : "create", `${values.title} (${data.scenes.length} scenes)`);
}

export async function deleteVideoSop(id, by) {
  const row = await rest.first("trainingVideoSop", { sop_id: id });
  if (!row) throw new Error("Video SOP not found");
  const stamp = nowText();
  await rest.update(row, { is_active: "0", deleted_at: stamp, updated_at: stamp, updated_by: by });
  await log(by, "video", id, "delete", row.title);
}

// ---------- shared data sets ----------
export async function listDatasets() {
  const rows = await rest.list("trainingDataset");
  const out = {};
  rows.forEach((r) => { out[r.dataset_key] = parseJson(r.data_json); });
  return out;
}

export async function saveDataset(key, data, by) {
  check(validateDataset(key, data), "data set");
  const existing = await rest.first("trainingDataset", { dataset_key: key });
  const values = { data_json: JSON.stringify(data), updated_at: nowText(), updated_by: by };
  if (existing) await rest.update(existing, values);
  else await rest.create("trainingDataset", { dataset_key: key, ...values });
  await log(by, "dataset", key, existing ? "update" : "create", "");
}

// First-time import of the bundled content (only fills what is missing unless overwrite is true)
export async function importBundled(by, overwrite) {
  const have = await rest.list("trainingModule");
  if (have.length > 0 && !overwrite) throw new Error("The content is already imported.");
  for (const m of BUNDLED_COURSE.modules) await saveModule(m.id, m, by);
  for (const v of BUNDLED_COURSE.videoSops) await saveVideoSop(v.id, v, by);
  const sets = { settings: { passMark: BUNDLED_COURSE.passMark } };
  [["products", "products"], ["stations", "stations"], ["defects", "defects"], ["tpm", "tpm"], ["spots", "spots"],
    ["final_extra", "finalExtra"], ["selectors", "selectors"], ["decider", "decider"], ["passport", "passport"]]
    .forEach(([key, src]) => { sets[key] = BUNDLED_COURSE[src]; });
  for (const key of Object.keys(sets)) await saveDataset(key, sets[key], by);
  return { modules: BUNDLED_COURSE.modules.length, videoSops: BUNDLED_COURSE.videoSops.length, dataSets: Object.keys(sets).length };
}

export async function listLog() {
  return (await rest.list("trainingContentLog")).sort((a, b) => (a.changed_at < b.changed_at ? 1 : -1)).slice(0, 100);
}

// ---------- staff ----------
export async function listStaff() {
  return (await rest.list("trainingStaff")).filter(isActive).map((r) => ({ login: r.login, role: r.staff_role }));
}

export async function saveStaff(login, role, by) {
  const clean = String(login || "").trim().toLowerCase();
  if (!clean) throw new Error("Login is required");
  if (role !== "admin" && role !== "trainer") throw new Error("Role must be admin or trainer");
  const existing = await rest.first("trainingStaff", { login: clean });
  const stamp = nowText();
  const values = { staff_role: role, is_active: "1", deleted_at: "", updated_at: stamp, updated_by: by };
  if (existing) await rest.update(existing, values);
  else await rest.create("trainingStaff", { login: clean, created_at: stamp, ...values });
}

export async function removeStaff(login, by) {
  const row = await rest.first("trainingStaff", { login });
  if (!row) throw new Error("Staff member not found");
  const stamp = nowText();
  await rest.update(row, { is_active: "0", deleted_at: stamp, updated_at: stamp, updated_by: by });
}

// ---------- reports ----------
// One line per trainee: progress numbers from all stored rows
export async function listTrainees() {
  const [trainees, seen, attempts, passport, certs] = await Promise.all([
    rest.list("trainingTrainee"), rest.list("trainingLessonSeen"), rest.list("trainingAttempt"),
    rest.list("trainingPassport"), rest.list("trainingCertificate"),
  ]);
  const by = (rows, login) => rows.filter((r) => r.login === login);
  return trainees.map((t) => {
    const p = progressFromRows({
      trainee: t, seen: by(seen, t.login), attempts: by(attempts, t.login),
      passport: by(passport, t.login), certificate: by(certs, t.login)[0] || null,
    });
    return {
      login: t.login, name: t.trainee_name || "", percent: overallPercent(p),
      modulesPassed: MODULES.filter((m) => moduleDone(p, m)).length,
      finalBest: p.final ? p.final.best : null, finalPassed: finalPassed(p),
      certificate: p.certificate ? p.certificate.certNo : "", lastSeenAt: t.last_seen_at, firstSeenAt: t.first_seen_at,
    };
  }).sort((a, b) => (a.lastSeenAt < b.lastSeenAt ? 1 : -1));
}

export async function traineeDetail(login) {
  const filter = { login };
  const [trainee, seen, attempts, passport, certificate] = await Promise.all([
    rest.first("trainingTrainee", filter), rest.list("trainingLessonSeen", filter), rest.list("trainingAttempt", filter),
    rest.list("trainingPassport", filter), rest.first("trainingCertificate", filter),
  ]);
  return {
    login, progress: progressFromRows({ trainee, seen, attempts, passport, certificate }),
    attempts: attempts.sort((a, b) => (a.taken_at < b.taken_at ? 1 : -1)).map((a) => ({
      id: a.attempt_id, kind: a.attempt_kind, moduleId: a.module_id, score: Number(a.score_pct), correct: Number(a.correct_cnt),
      total: Number(a.total_cnt), passed: a.is_passed === "1", missed: parseJson(a.missed_json, []), takenAt: a.taken_at,
    })),
  };
}

// CSV text of the trainee list (opened in Excel)
export function traineesToCsv(rows) {
  const cell = (v) => `"${String(v === null || v === undefined ? "" : v).replace(/"/g, '""')}"`;
  const head = ["login", "name", "progress_percent", "modules_passed", "final_best_percent", "certificate_no", "first_seen_at", "last_seen_at"];
  const body = rows.map((r) => [r.login, r.name, r.percent, r.modulesPassed, r.finalBest, r.certificate, r.firstSeenAt, r.lastSeenAt].map(cell).join(","));
  return [head.map(cell).join(",")].concat(body).join("\r\n");
}
