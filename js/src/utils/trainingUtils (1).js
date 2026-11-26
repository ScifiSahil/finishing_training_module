// Helper functions used by many screens: shuffle, lesson text, pictures, aging curve,
// TPM losses, search and the final assessment questions.
import IMAGES from "../images.json";
import { MODULES, DEFECTS, TPM, PRODUCTS, VIDEO_SOPS, FINAL_EXTRA, COURSE_VERSION } from "../data";

// ---------- shuffle ----------
export function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- pictures ----------
// Returns { src, w, h } or null when the key is unknown
export function getImage(key) {
  const img = IMAGES[key];
  return img ? { src: img.src, w: img.w, h: img.h } : null;
}

// Cut-out images (transparent background) get a white padded frame
const CUT = new Set([
  "carrier_part", "knuckle_part", "audi_part", "redback_part", "bronco_part",
  "earplugs", "glasses", "boots", "pants", "polo", "gloves", "faceshield",
  "sleeve", "ext_d", "ext_red", "logo", "loto_lock", "loto_hand",
]);
export const isCutImage = (key) => CUT.has(key);

// ---------- lesson text (**bold** and "- " lists) ----------
// Supports **bold** and lines starting with "- " as bullet lists.

// "a **b** c" -> [{text:"a ", bold:false},{text:"b", bold:true},{text:" c", bold:false}]
export function parseInline(text) {
  return String(text)
    .split(/\*\*(.+?)\*\*/g)
    .map((part, i) => ({ text: part, bold: i % 2 === 1 }))
    .filter((p) => p.text !== "");
}

// Returns [{type:"p", parts}, {type:"ul", items:[parts, ...]}]
export function parseRich(text) {
  const out = [];
  let list = null;
  for (const line of String(text).split("\n")) {
    if (line.startsWith("- ")) {
      if (!list) {
        list = { type: "ul", items: [] };
        out.push(list);
      }
      list.items.push(parseInline(line.slice(2)));
    } else {
      list = null;
      if (line.trim()) out.push({ type: "p", parts: parseInline(line) });
    }
  }
  return out;
}

// Plain text version, used for the search index
export const stripBold = (text) => String(text).replace(/\*\*/g, "");

// ---------- aging furnace curve ----------
// Part temperature in Celsius at position p (0-100) of the cycle
export const furnaceTemp = (p) => {
  if (p <= 12) return 22;
  if (p <= 40) return 22 + 167 * (1 - Math.pow(1 - (p - 12) / 28, 2));
  if (p <= 70) return 189;
  return 189 - 149 * (1 - Math.pow(1 - (p - 70) / 30, 2));
};

// [from, to, title, text, door state]
export const FURNACE_PHASES = [
  [0, 12, "Loading", "Verify batch number and quantity. Baskets of one batch on the platform, reference part with thermocouple in place, platform in, door closed, batch info entered. Then start the cycle.", "Closed (after loading)"],
  [12, 40, "Heating", "Gas burners heat the parts up to 189 °C (372 °F).", "Closed"],
  [40, 70, "Holding: 2 hours", "189 °C is held for two hours. Temperature and holding time are the MSCCs: control and watch them.", "Closed"],
  [70, 95, "Door opens, natural cooling", "The furnace door opens automatically. Parts cool naturally in air.", "Open"],
  [95, 101, "Unloading", "When parts reach a safe handling temperature: remove the reference part with PPE, attach the correct paperwork to each basket, move baskets to the WIP area.", "Open"],
];

export const phaseAt = (p) =>
  FURNACE_PHASES.find((x) => p >= x[0] && p < x[1]) || FURNACE_PHASES[4];

// Minutes held at 189 °C so far (0 to 120)
export const holdMinutes = (p) => {
  if (p < 40) return 0;
  if (p >= 70) return 120;
  return Math.round(((p - 40) / 30) * 120);
};

export const toFahrenheit = (c) => Math.round((c * 9) / 5 + 32);

// ---------- TPM losses ----------
export const LOSS_GROUPS = ["All", "Availability", "Performance", "Quality", "Resources"];

// Losses in the chosen group whose name, meaning or example contain the search text
export function filterLosses(group, query) {
  const q = query.trim().toLowerCase();
  return TPM.filter(
    (r) =>
      (group === "All" || r[2] === group) &&
      (!q || (r[1] + r[3] + r[4]).toLowerCase().includes(q))
  );
}

export const lossByNumber = (n) => TPM.find((r) => r[0] === n);

// The right loss number plus three random wrong ones, shuffled
export function spotOptions(correct) {
  const wrong = shuffle(TPM.map((r) => r[0]).filter((n) => n !== correct)).slice(0, 3);
  return shuffle([correct, ...wrong]);
}

// ---------- search ----------
// Keys that hold ids, flags or layout hints, not readable text
const SKIP = new Set([
  "t", "k", "kdo", "kdont", "kind", "icon", "mode", "cols", "open",
  "small", "wide", "cut", "a", "id", "img", "d", "fur",
]);

function collect(node, out) {
  if (typeof node === "string") {
    out.push(node);
  } else if (Array.isArray(node)) {
    node.forEach((x) => collect(x, out));
  } else if (node && typeof node === "object") {
    if (node.t === "defect") {
      const d = DEFECTS[node.d];
      out.push(d.name, d.text, ...d.causes);
      return;
    }
    if (node.t === "vsop") {
      const vs = VIDEO_SOPS.find((v) => v.id === node.sop);
      if (vs) vs.scenes.forEach((sc) => out.push(sc.cap, sc.vo));
      return;
    }
    if (node.t === "tpm") {
      TPM.forEach((r) => out.push(r[1], r[3], r[4]));
      return;
    }
    if (node.t === "products") {
      PRODUCTS.forEach((p) => out.push(p.name, p.vehicle, p.what));
      return;
    }
    Object.entries(node).forEach(([k, v]) => {
      if (!SKIP.has(k)) collect(v, out);
    });
  }
}

// The text index is rebuilt when the course content changes (COURSE_VERSION)
let INDEX = [];
let INDEX_VERSION = -1;

function getIndex() {
  if (INDEX_VERSION !== COURSE_VERSION) {
    INDEX = MODULES.flatMap((m) =>
      m.lessons.map((l, j) => {
        const out = [l.title];
        collect(l.blocks, out);
        return { module: m, lesson: l, index: j, text: stripBold(out.join(" ")) };
      })
    );
    INDEX_VERSION = COURSE_VERSION;
  }
  return INDEX;
}

// Returns up to 8 lessons that contain every word of the query, each with a text snippet
export function searchLessons(query) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const tokens = q.split(/\s+/);
  return getIndex().filter((x) =>
    tokens.every((t) => x.text.toLowerCase().includes(t))
  )
    .slice(0, 8)
    .map((x) => {
      const start = Math.max(0, x.text.toLowerCase().indexOf(tokens[0]) - 40);
      return { ...x, snippet: x.text.slice(start, start + 120), hasLead: start > 0, tokens };
    });
}

// ---------- final assessment ----------
// 20 random questions from every module quiz plus a few general ones
export const buildFinalPool = () => {
  const all = [...MODULES.flatMap((m) => m.quiz), ...FINAL_EXTRA];
  return shuffle(all).slice(0, 20);
};
