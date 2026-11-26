/**
 * ─── SETUP CHECK ─────────────────────────────────────────────────────
 * Finds out which training tables the server lets us read and write.
 * Used by the "Check setup" button in the error banner.
 * ─────────────────────────────────────────────────────────────────────
 */

import rest from "./restClient";
import { API_URLS } from "./apiConfig";
import { makeId, nowText } from "./trainingService";

export const TRAINING_TABLES = [
  "trainingModule", "trainingVideoSop", "trainingDataset", "trainingTrainee", "trainingLessonSeen",
  "trainingAttempt", "trainingPassport", "trainingCertificate", "trainingStaff", "trainingContentLog",
];

const tableName = (key) => String(API_URLS[key] || key).split("/").pop();

// Tries to read every table. Returns [{ key, table, ok, note }]
export async function checkReading() {
  const results = [];
  for (const key of TRAINING_TABLES) {
    try {
      const rows = await rest.list(key);
      results.push({ key, table: tableName(key), ok: true, note: `readable, ${rows.length} rows` });
    } catch (e) {
      results.push({ key, table: tableName(key), ok: false, note: e.message });
    }
  }
  return results;
}

// Writes one harmless row into the change log table to see whether saving is allowed
export async function checkWriting() {
  try {
    await rest.create("trainingContentLog", {
      log_id: makeId(), changed_at: nowText(), changed_by: "setup", item_kind: "setup",
      item_key: "check", action: "test", summary: "Setup check: saving works",
    });
    return { ok: true, note: "Saving works (one test row was added to finishing_training_content_log)." };
  } catch (e) {
    return { ok: false, note: e.message };
  }
}