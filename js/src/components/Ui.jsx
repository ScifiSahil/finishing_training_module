// Small shared pieces: Button, Tape, RichText, Callout, Chips, Lesson panel, page titles, NameField.
import { forwardRef, useEffect } from "react";
import { parseRich } from "../utils/trainingUtils";
import { useTraining } from "../utils/TrainingContext";

// ---------- Button ----------
const BASE =
  "inline-flex items-center justify-center gap-2 min-h-[44px] px-[18px] rounded-md border-2 font-semibold no-underline transition-transform active:translate-y-px disabled:opacity-45 disabled:cursor-not-allowed";

const VARIANTS = {
  default: "border-ink bg-transparent text-ink hover:bg-surface2",
  primary:
    "border-black bg-yellow text-black font-head text-[1.15rem] tracking-[.02em] hover:bg-[#FFC91F]",
  ghost: "border-line bg-transparent text-ink hover:bg-surface2",
  rail: "border-railMute bg-transparent text-railInk hover:bg-rail2",
};

const SIZES = {
  md: "",
  sm: "!min-h-[36px] !px-3 !text-[.9rem]",
  icon: "!w-11 !px-0",
};

export const Button = forwardRef(function Button(
  { variant = "default", size = "md", className = "", children, ...rest },
  ref
) {
  const cls = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
  return (
    <button ref={ref} type="button" className={cls} {...rest}>
      {children}
    </button>
  );
});

// ---------- Tape (yellow and black strip) ----------
export const Tape = ({ height = "h-[10px]", className = "" }) => (
  <div className={`bg-tape ${height} ${className}`} aria-hidden="true" />
);

// ---------- RichText (paragraphs, **bold**, "- " lists) ----------
export const Inline = ({ parts }) =>
  parts.map((p, i) =>
    p.bold ? <strong key={i}>{p.text}</strong> : <span key={i}>{p.text}</span>
  );

export function RichText({ text, className = "" }) {
  return (
    <div className={className}>
      {parseRich(text).map((b, i) =>
        b.type === "ul" ? (
          <ul key={i} className="mb-[.8em] max-w-[68ch] list-disc pl-[1.3em]">
            {b.items.map((parts, j) => (
              <li key={j} className="my-[.3em]">
                <Inline parts={parts} />
              </li>
            ))}
          </ul>
        ) : (
          <p key={i} className="mb-[.8em] max-w-[68ch]">
            <Inline parts={b.parts} />
          </p>
        )
      )}
    </div>
  );
}

// ---------- Callout: info (blue), warn (yellow), stop (red), key (green) ----------
const CALLOUTS = {
  info: "border-blue bg-blueBg",
  warn: "border-yellow bg-[color-mix(in_srgb,var(--yellow)_16%,var(--surface))]",
  stop: "border-red bg-redBg",
  key: "border-green bg-greenBg",
};

export function Callout({ kind = "info", title, text, className = "" }) {
  return (
    <div className={`rounded-r-lg border-l-8 px-4 py-3.5 ${CALLOUTS[kind] || CALLOUTS.info} ${className}`}>
      {title && <h4 className="mb-1 font-head text-[1.25rem] font-bold leading-[1.1]">{title}</h4>}
      <RichText text={text} className="[&_p:last-child]:mb-0" />
    </div>
  );
}

// ---------- Chips: row of pill buttons (mode "toggle" or "tab") ----------
const CHIP =
  "min-h-[40px] rounded-full border-2 border-line bg-surface px-3.5 font-semibold text-ink " +
  "aria-pressed:border-chipOn aria-pressed:bg-chipOn aria-pressed:text-chipOnInk " +
  "aria-selected:border-chipOn aria-selected:bg-chipOn aria-selected:text-chipOnInk";

export function Chips({ labels, value, onChange, mode = "toggle", className = "mb-2.5" }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`} role={mode === "tab" ? "tablist" : undefined}>
      {labels.map((label, i) => {
        const active = value === i;
        const state = mode === "tab" ? { "aria-selected": active } : { "aria-pressed": active };
        return (
          <button
            key={label}
            type="button"
            role={mode === "tab" ? "tab" : undefined}
            className={CHIP}
            onClick={() => onChange(i)}
            {...state}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ---------- Lesson: white panel with tape on top ----------
export const Lesson = ({ children }) => (
  <article className="overflow-hidden rounded-[10px] border border-line bg-surface shadow-card">
    <Tape height="h-2" />
    <div className="p-[clamp(16px,3vw,32px)]">{children}</div>
  </article>
);

// ---------- Page titles ----------
// Sets the browser tab title only (the page draws its own heading)
export function PageTitleOnly({ title }) {
  useEffect(() => {
    document.title = `${title} · Finishing training`;
  }, [title]);
  return null;
}

export function PageTitle({ title, intro }) {
  return (
    <>
      <PageTitleOnly title={title} />
      <h1 className="mb-1.5 font-head text-[clamp(2rem,4.4vw,3rem)] font-bold leading-[1.1]">{title}</h1>
      {intro && <p className="mb-[.8em] max-w-[68ch] text-muted">{intro}</p>}
    </>
  );
}

// ---------- NameField: trainee name input (Training Passport and Certificate) ----------
export function NameField({ label, placeholder = "" }) {
  const { t, actions } = useTraining();
  return (
    <label className="flex flex-col text-[.85rem] text-muted">
      {label}
      <input
        type="text"
        value={t.name}
        placeholder={placeholder}
        onChange={(e) => actions.setName(e.target.value)}
        className="h-11 min-w-[260px] rounded-md border border-line bg-surface2 px-2.5 text-base text-ink"
      />
    </label>
  );
}
