// The colour themes the trainee can choose. The colours themselves live in index.css
// (:root[data-theme="<id>"]). swatch = [page, menu, accent] for the little preview dots.
export const THEME_LIST = [
  { id: "auto", label: "Automatic", note: "Follows your device", swatch: ["#eceef0", "#1f252a", "#f5b800"] },
  { id: "light", label: "Light", note: "Classic yellow and black", swatch: ["#eceef0", "#1f252a", "#f5b800"] },
  { id: "dark", label: "Dark", note: "Easy on the eyes at night", swatch: ["#121619", "#0c0f11", "#f5b800"] },
  { id: "ocean", label: "Ocean", note: "Cool blue", swatch: ["#e6eef7", "#0e2c4f", "#46b0f7"] },
  { id: "forest", label: "Forest", note: "Calm green", swatch: ["#e9f1ea", "#12301f", "#6bcb77"] },
  { id: "sunset", label: "Sunset", note: "Warm orange", swatch: ["#f5ede6", "#3b2016", "#ff9f1c"] },
  { id: "sepia", label: "Sepia", note: "Paper for long reading", swatch: ["#efe6d4", "#3f3322", "#e0b040"] },
  { id: "midnight", label: "Midnight", note: "Dark blue", swatch: ["#0b1220", "#070c16", "#5bb8f5"] },
  { id: "contrast", label: "High contrast", note: "Black, white and yellow", swatch: ["#000000", "#000000", "#ffe600"] },
];

export const THEME_IDS = THEME_LIST.map((t) => t.id);
export const themeLabel = (id) => (THEME_LIST.find((t) => t.id === id) || THEME_LIST[0]).label;
