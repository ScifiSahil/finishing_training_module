// Top bar: menu button (phones), search, text size, theme menu and Logout.
import { useEffect, useRef, useState } from "react";
import { searchLessons } from "../utils/trainingUtils";
import { useTraining } from "../utils/TrainingContext";
import { THEME_LIST, themeLabel } from "../utils/themes";

// Opening this address ends the CONTACT session (logout)
const LOGOUT_URL = "https://ktfrancesrv1.kalyanicorp.com/server/__quit__";

const ICON_BTN =
  "inline-flex h-11 w-11 items-center justify-center rounded-md border-2 border-line bg-transparent text-ink hover:bg-surface2";

// Search snippet with the matching words highlighted
const escapeRe = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function Snippet({ text, tokens, lead }) {
  const parts = text.split(new RegExp("(" + tokens.map(escapeRe).join("|") + ")", "ig"));
  return (
    <small className="block text-muted">
      {lead && "…"}
      {parts.map((p, i) =>
        i % 2 === 1 ? <mark key={i} className="bg-yellow text-black">{p}</mark> : <span key={i}>{p}</span>
      )}
      …
    </small>
  );
}

// Search box with a list of matching lessons
function SearchBox({ onPick }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  const hits = searchLessons(query);

  useEffect(() => {
    const close = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <div ref={box} className="relative max-w-[560px] flex-1">
      <svg className="absolute left-[11px] top-3 text-muted" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4-4" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        placeholder="Search the training, e.g. tote, PPE, trolley"
        aria-label="Search the training"
        autoComplete="off"
        className="h-11 w-full rounded-md border border-line bg-surface2 pl-[38px] pr-3 text-base text-ink"
      />
      {open && query.trim().length >= 2 && (
        <div className="absolute inset-x-0 top-[50px] z-30 max-h-[60vh] overflow-auto rounded-lg border border-line bg-surface shadow-card">
          {hits.length === 0 && <div className="px-3.5 py-3">No lessons match “{query.trim()}”.</div>}
          {hits.map((h) => (
            <button
              key={`${h.module.id}-${h.index}`}
              type="button"
              onClick={() => { onPick(h.module.id, h.index); setOpen(false); setQuery(""); }}
              className="block w-full border-b border-line px-3.5 py-2.5 text-left text-ink hover:bg-surface2"
            >
              <strong>{h.module.title}: {h.lesson.title}</strong>
              <Snippet text={h.snippet} tokens={h.tokens} lead={h.hasLead} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Button that opens a list of colour themes with small colour previews
function ThemeMenu({ current, onPick }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onClick = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        title="Theme"
        aria-label={`Choose a colour theme. Now: ${themeLabel(current)}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={ICON_BTN}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4a8 8 0 010 16z" fill="currentColor" />
        </svg>
      </button>
      {open && (
        <div role="menu" aria-label="Colour themes" className="absolute right-0 top-[50px] z-40 w-[min(300px,92vw)] overflow-hidden rounded-lg border border-line bg-surface p-1.5 shadow-card">
          {THEME_LIST.map((th) => (
            <button
              key={th.id}
              type="button"
              role="menuitemradio"
              aria-checked={th.id === current}
              onClick={() => { onPick(th.id); setOpen(false); }}
              className={`flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-ink hover:bg-surface2 ${th.id === current ? "bg-surface2" : ""}`}
            >
              <span className="flex flex-none overflow-hidden rounded border border-line" aria-hidden="true">
                {th.swatch.map((c) => <i key={c} className="block h-7 w-5" style={{ background: c }} />)}
              </span>
              <span className="min-w-0 flex-1 leading-tight">
                <b className="block">{th.label}</b>
                <small className="text-muted">{th.note}</small>
              </span>
              {th.id === current && <span className="font-bold text-green" aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TopBar() {
  const { t, actions } = useTraining();
  const onMenu = () => actions.setRail(true);
  const onPick = (id, lesson) => actions.go("module", { id, lesson });
  const onTheme = (id) => {
    actions.setTheme(id);
    actions.showToast("Theme: " + themeLabel(id));
  };
  const onSize = () => {
    const order = ["m", "l", "xl"];
    const names = { m: "Normal", l: "Large", xl: "Extra large" };
    actions.cycleSize();
    actions.showToast("Text size: " + names[order[(order.indexOf(t.size) + 1) % 3]]);
  };
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2.5 border-b border-line bg-surface px-[18px] py-2 phone:px-2.5">
      <button type="button" aria-label="Open course menu" onClick={onMenu} className={`${ICON_BTN} desk:hidden`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>
      <SearchBox onPick={onPick} />
      <div className="ml-auto flex gap-1.5">
        <button type="button" aria-label="Change text size" title="Text size" onClick={onSize} className={ICON_BTN}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3 19l5-13h2l5 13h-2.2l-1.2-3.4H6.4L5.2 19zm4-5.2h4.2L9.1 8z" />
            <path d="M17 11h2v2h2v2h-2v2h-2v-2h-2v-2h2z" />
          </svg>
        </button>
        <ThemeMenu current={t.theme} onPick={onTheme} />
        <button
          type="button"
          title="Logout"
          onClick={() => { window.location.href = LOGOUT_URL; }}
          className="inline-flex h-11 items-center gap-2 rounded-md border-2 border-red bg-transparent px-3.5 font-semibold text-red hover:bg-redBg"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          <span className="phone:hidden">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default TopBar;