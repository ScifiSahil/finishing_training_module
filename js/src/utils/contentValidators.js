// Checks what an admin edits before it is saved. Each function returns { field: message };
// an empty object means the data is fine.

export const BLOCK_TYPES = [
  "p", "h", "list", "callout", "table", "chain", "img", "gallery", "split", "accordion",
  "cards", "dd", "tabs", "steps", "checklist", "checkrules", "ppecheck", "products",
  "processmap", "selector", "loadsel", "toteselect", "idpart", "defect", "tpm", "spot",
  "decider", "furnace", "vsop",
];
export const SCENE_TYPES = ["photo", "list", "dd", "gal", "curve"];
export const DATASET_KEYS = [
  "settings", "products", "stations", "defects", "tpm", "spots",
  "final_extra", "selectors", "decider", "passport",
];

const ID_PATTERN = /^[a-z0-9_]{2,40}$/;
const isText = (v) => typeof v === "string" && v.trim() !== "";

export function validateQuestion(q, where) {
  const errors = {};
  if (!q || typeof q !== "object") return { [where]: "must be an object" };
  if (!isText(q.q)) errors[`${where}.q`] = "question text is required";
  if (!Array.isArray(q.o) || q.o.length < 2 || q.o.length > 6 || !q.o.every(isText)) {
    errors[`${where}.o`] = "2 to 6 answers, none empty";
  } else if (!Number.isInteger(q.a) || q.a < 0 || q.a >= q.o.length) {
    errors[`${where}.a`] = "the right answer must be the number of one of the answers (first = 0)";
  }
  if (!isText(q.why)) errors[`${where}.why`] = "explanation is required";
  return errors;
}

function validateBlocks(blocks, where) {
  if (!Array.isArray(blocks)) return { [where]: "must be a list" };
  let errors = {};
  blocks.forEach((b, i) => {
    const w = `${where}[${i}]`;
    if (!b || typeof b !== "object" || BLOCK_TYPES.indexOf(b.t) < 0) {
      errors[w] = `block type must be one of: ${BLOCK_TYPES.join(", ")}`;
      return;
    }
    if (b.t === "split") {
      errors = { ...errors, ...validateBlocks(b.left || [], `${w}.left`), ...validateBlocks(b.right || [], `${w}.right`) };
    }
    if (b.t === "tabs") {
      (b.tabs || []).forEach((tab, j) => {
        errors = { ...errors, ...validateBlocks(tab.blocks || [], `${w}.tabs[${j}].blocks`) };
      });
    }
  });
  return errors;
}

export function validateModule(data, moduleId) {
  let errors = {};
  if (!ID_PATTERN.test(moduleId || "")) errors.id = "use 2 to 40 characters: small letters, digits, underscore";
  if (!data || typeof data !== "object") return { data: "must be an object" };
  if (!isText(data.title)) errors.title = "title is required";
  if (!Array.isArray(data.lessons) || data.lessons.length === 0) {
    errors.lessons = "at least one lesson is required";
  } else {
    const ids = {};
    data.lessons.forEach((l, i) => {
      const w = `lessons[${i}]`;
      if (!l || !isText(l.title) || !isText(l.id)) {
        errors[w] = "each lesson needs an id and a title";
        return;
      }
      if (ids[l.id]) errors[`${w}.id`] = "lesson id is used twice";
      ids[l.id] = true;
      errors = { ...errors, ...validateBlocks(l.blocks, `${w}.blocks`) };
    });
  }
  if (!Array.isArray(data.quiz) || data.quiz.length === 0) {
    errors.quiz = "at least one quiz question is required";
  } else {
    data.quiz.forEach((q, i) => {
      errors = { ...errors, ...validateQuestion(q, `quiz[${i}]`) };
    });
  }
  return errors;
}

export function validateVideoSop(data, sopId) {
  const errors = {};
  if (!ID_PATTERN.test(sopId || "")) errors.id = "use 2 to 40 characters: small letters, digits, underscore";
  if (!data || typeof data !== "object") return { data: "must be an object" };
  if (!isText(data.n)) errors.n = "name is required";
  if (!Array.isArray(data.scenes) || data.scenes.length === 0) {
    errors.scenes = "at least one scene is required";
  } else {
    data.scenes.forEach((sc, i) => {
      const w = `scenes[${i}]`;
      if (!sc || SCENE_TYPES.indexOf(sc.k) < 0) {
        errors[w] = `scene type must be one of: ${SCENE_TYPES.join(", ")}`;
        return;
      }
      if (!isText(sc.cap)) errors[`${w}.cap`] = "caption is required";
      if (!isText(sc.vo)) errors[`${w}.vo`] = "narration text is required";
    });
  }
  return errors;
}

export function validateDataset(key, data) {
  const errors = {};
  if (DATASET_KEYS.indexOf(key) < 0) return { key: "unknown data set" };
  if (key === "settings") {
    if (!data || !Number.isInteger(data.passMark) || data.passMark < 1 || data.passMark > 100) {
      errors.passMark = "pass mark must be a whole number from 1 to 100";
    }
  } else if (["products", "stations", "tpm", "spots", "final_extra", "passport"].indexOf(key) >= 0) {
    if (!Array.isArray(data) || data.length === 0) errors[key] = "must be a non-empty list";
    else if (key === "final_extra") data.forEach((q, i) => Object.assign(errors, validateQuestion(q, `final_extra[${i}]`)));
    else if (key === "tpm") data.forEach((r, i) => { if (!Array.isArray(r) || r.length !== 5) errors[`tpm[${i}]`] = "each loss needs 5 values"; });
    else if (key === "passport") data.forEach((r, i) => { if (!Array.isArray(r) || r.length !== 4) errors[`passport[${i}]`] = "each phase needs 4 values"; });
  } else if (!data || typeof data !== "object" || Array.isArray(data) || Object.keys(data).length === 0) {
    errors[key] = "must be a non-empty object";
  }
  return errors;
}
