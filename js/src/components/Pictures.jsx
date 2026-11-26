// Pictures and icons: Figure (picture with caption), ZoomImage, the full screen viewer, Icon.
import { useEffect, useRef } from "react";
import { getImage, isCutImage } from "../utils/trainingUtils";
import { useTraining } from "../utils/TrainingContext";
import { Button } from "./Ui";

// ---------- Figure: picture with optional caption. Click opens the full screen viewer ----------
export function Figure({ k, cap = "", small = false }) {
  const { actions } = useTraining();
  const img = getImage(k);
  if (!img) return null;
  const cut = isCutImage(k);
  return (
    <figure className={`m-0 ${small ? "max-w-[340px]" : ""}`}>
      <button
        type="button"
        aria-label={`Enlarge picture${cap ? `: ${cap}` : ""}`}
        onClick={() => actions.openLightbox(k, cap)}
        className={`block w-full cursor-zoom-in overflow-hidden rounded-lg border border-line bg-chip ${cut ? "!bg-white p-2.5" : "p-0"}`}
      >
        <img
          src={img.src}
          alt={cap}
          width={img.w}
          height={img.h}
          loading="lazy"
          className="mx-auto h-auto max-h-[520px] w-auto max-w-full object-contain"
        />
      </button>
      {cap && (
        <figcaption className="mt-1.5 text-[.88rem] leading-[1.35] text-muted">{cap}</figcaption>
      )}
    </figure>
  );
}

// ---------- ZoomImage: plain picture in a button that opens the viewer (do/don't cards) ----------
export function ZoomImage({ k, cap = "", alt = "", className = "", imgClass = "" }) {
  const { actions } = useTraining();
  const img = getImage(k);
  if (!img) return null;
  return (
    <button
      type="button"
      aria-label="Enlarge picture"
      onClick={() => actions.openLightbox(k, cap)}
      className={`block w-full cursor-zoom-in border-0 p-0 ${className}`}
    >
      <img src={img.src} alt={alt} width={img.w} height={img.h} loading="lazy" className={imgClass} />
    </button>
  );
}

// ---------- Lightbox: closes with Escape, the Close button or a click outside the picture ----------
export function Lightbox() {
  const { t, actions } = useTraining();
  const box = t.lightbox;
  const closeRef = useRef(null);

  useEffect(() => {
    if (!box) return undefined;
    const opener = document.activeElement;
    const onKey = (e) => {
      if (e.key === "Escape") actions.closeLightbox();
    };
    document.addEventListener("keydown", onKey);
    if (closeRef.current) closeRef.current.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      if (opener && opener.focus) opener.focus();
    };
  }, [box, actions]);

  const img = box && getImage(box.key);
  if (!img) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={box.cap || "Picture"}
      onClick={(e) => e.target === e.currentTarget && actions.closeLightbox()}
      className="fixed inset-0 z-[100] grid place-items-center bg-[rgba(8,10,12,.92)] p-5"
    >
      <figure className="m-0 text-center text-white">
        <img src={img.src} alt={box.cap || ""} className="max-h-[88vh] max-w-[96vw] rounded-md bg-white" />
        {box.cap && <figcaption className="mt-2">{box.cap}</figcaption>}
      </figure>
      <Button
        ref={closeRef}
        aria-label="Close picture"
        onClick={actions.closeLightbox}
        className="!fixed right-3.5 top-3 !border-black !bg-yellow !text-black"
      >
        Close
      </Button>
    </div>
  );
}

// ---------- Icon ----------
const BIG = {
  mask: (
    <>
      <path d="M10 22c10-6 34-6 44 0v10c0 10-8 18-22 18S10 42 10 32z" fill="#DDE2E6" />
      <path d="M10 26H3M54 26h7M10 34H3M54 34h7" />
      <path d="M20 30h24M20 36h24M22 42h20" strokeWidth="2.4" />
    </>
  ),
  hand: (
    <path
      d="M8 38h10l10 6h14c3 0 4 5 0 5H30M18 38v12h-8V38M28 44l16-8 8-8c2-2 5 0 3 3l-9 12"
      fill="#F5B800"
    />
  ),
  clock: (
    <>
      <circle cx="32" cy="32" r="22" fill="#F5B800" />
      <path d="M32 18v14l10 6" />
    </>
  ),
  swap: (
    <>
      <circle cx="20" cy="20" r="8" fill="#F5B800" />
      <circle cx="44" cy="44" r="8" fill="#DDE2E6" />
      <path d="M34 16h14v10M48 16L36 28M30 48H16V38M16 48l12-12" />
    </>
  ),
  warn: (
    <>
      <path d="M32 8L58 54H6z" fill="#F5B800" />
      <path d="M32 24v14M32 44v2" />
    </>
  ),
  grind: (
    <>
      <circle cx="30" cy="34" r="14" fill="#DDE2E6" />
      <circle cx="30" cy="34" r="4" fill="#1B2127" />
      <path d="M46 14l-6 6M52 22l-7 3M42 8l-3 7" stroke="#C99400" />
    </>
  ),
};

const SMALL = {
  check: <path d="M4 12.5l5 5L20 6.5" />,
  x: <path d="M5 5l14 14M19 5L5 19" />,
  print: <path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z" />,
};

export function Icon({ name, size }) {
  if (BIG[name]) {
    return (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#1B2127" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
        {BIG[name]}
      </svg>
    );
  }
  const px = size || 18;
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={name === "print" ? 2.4 : 3.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {SMALL[name]}
    </svg>
  );
}
