// ═══════════════════════════════════════════════════════════════════
//  src/services/shiftConfig.js
//  Ek hi jagah se shift timing — har component yahin se import kare.
//
//  Mundhwa (vm1pap045) : 07:00–15:00, 15:00–23:00, 23:00–07:00
//  Baaki sab servers   : 07:30–15:30, 15:30–23:30, 23:30–07:30 (pehle jaisa)
// ═══════════════════════════════════════════════════════════════════

const MUNDHWA_HOSTS = ["vm1pap045.kalyanicorp.com", "vm1pap045"];

export const IS_MUNDHWA =
  typeof window !== "undefined" &&
  MUNDHWA_HOSTS.includes((window.location.hostname || "").toLowerCase());

// Shift 1, 2, 3 ka start time [hour, minute]
export const SHIFT_STARTS = IS_MUNDHWA
  ? [[7, 0], [15, 0], [23, 0]]
  : [[7, 30], [15, 30], [23, 30]];

const toMin = ([h, m]) => h * 60 + m;
const pad = (n) => String(n).padStart(2, "0");
const hhmm = ([h, m]) => `${pad(h)}:${pad(m)}`;

// "07:00", "15:00", "23:00" (ya 07:30 ...) — strings chahiye ho to
export const SHIFT_START_STR = SHIFT_STARTS.map(hhmm);

// Labels, jaise "07:00 – 15:00"
export const SHIFT_LABELS = {
  1: `${hhmm(SHIFT_STARTS[0])} – ${hhmm(SHIFT_STARTS[1])}`,
  2: `${hhmm(SHIFT_STARTS[1])} – ${hhmm(SHIFT_STARTS[2])}`,
  3: `${hhmm(SHIFT_STARTS[2])} – ${hhmm(SHIFT_STARTS[0])}`,
};

// Kisi din (base) ki aadhi raat + minutes (+ din offset) → Date
function atMinute(base, minuteOfDay, dayOffset = 0) {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + dayOffset);
  d.setMinutes(minuteOfDay); // 450 → 07:30 (minutes > 59 apne aap hour mein jaate hain)
  return d;
}

// Abhi (ya diye gaye time par) kaunsi shift chal rahi hai
// Return: { no: "1"|"2"|"3", start: Date, end: Date }
export function getShiftWindow(now = new Date()) {
  const mins = now.getHours() * 60 + now.getMinutes();
  const [s1, s2, s3] = SHIFT_STARTS.map(toMin);

  if (mins >= s1 && mins < s2) return { no: "1", start: atMinute(now, s1), end: atMinute(now, s2) };
  if (mins >= s2 && mins < s3) return { no: "2", start: atMinute(now, s2), end: atMinute(now, s3) };
  if (mins >= s3)              return { no: "3", start: atMinute(now, s3), end: atMinute(now, s1, 1) };
  // aadhi raat ke baad, shift 1 shuru hone se pehle → kal raat wali shift 3
  return { no: "3", start: atMinute(now, s3, -1), end: atMinute(now, s1) };
}

// Kisi date + shift number ka window (reports ke liye)
// dateStr = "2026-11-05", shiftNo = 1 | 2 | 3
export function getShiftWindowFor(dateStr, shiftNo) {
  const base = new Date(`${dateStr}T00:00:00`);
  const [s1, s2, s3] = SHIFT_STARTS.map(toMin);
  const n = Number(shiftNo);
  if (n === 1) return { no: "1", start: atMinute(base, s1), end: atMinute(base, s2) };
  if (n === 2) return { no: "2", start: atMinute(base, s2), end: atMinute(base, s3) };
  return { no: "3", start: atMinute(base, s3), end: atMinute(base, s1, 1) };
}

// Ek shift ke 8 hourly slots: [{ label: "07:00-08:00", start: Date, end: Date }, ...]
export function getHourlySlots(shiftWindow) {
  const slots = [];
  for (let i = 0; i < 8; i++) {
    const start = new Date(shiftWindow.start.getTime() + i * 3600_000);
    const end = new Date(start.getTime() + 3600_000);
    slots.push({
      label: `${pad(start.getHours())}:${pad(start.getMinutes())}-${pad(end.getHours())}:${pad(end.getMinutes())}`,
      start,
      end,
    });
  }
  return slots;
}

// Production day ka start (shift 1 start). Iske pehle ka time = pichhla production day.
export function getProductionDate(now = new Date()) {
  const mins = now.getHours() * 60 + now.getMinutes();
  const d = new Date(now);
  if (mins < toMin(SHIFT_STARTS[0])) d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
