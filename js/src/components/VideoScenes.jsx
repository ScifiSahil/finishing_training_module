// The five scene types of a video SOP (photo, list, do/don't, gallery, curve).
// Each draws itself from `t` (seconds into the scene). Sizes use cqw: 1% of the video width.
import { getImage } from "../utils/trainingUtils";
import { easeOut, kenBurnsStyle, lerp, revealStyle, seg } from "../utils/useVideoPlayer";

const PHOTO_BOX =
  "absolute overflow-hidden bg-[#2A3238] shadow-[0_1.2cqw_3cqw_rgba(0,0,0,.4)]";
const RIGHT = "left-[49cqw] top-[8cqw] h-[34cqw] w-[47.5cqw]";
const CAP = "absolute left-[3.5cqw] font-head font-bold leading-[1.03]";
const CAP_TOP = "absolute left-[3.5cqw] top-[7.5cqw] w-[93cqw] font-head text-[4.2cqw] font-bold leading-[1.03]";
const CAPTION =
  "absolute inset-x-0 bottom-0 bg-[rgba(31,37,42,.9)] px-[1.4cqw] py-[.8cqw] text-[1.9cqw] font-semibold leading-[1.2]";

const Pic = ({ k, fit, style, className = "" }) => {
  const img = getImage(k);
  if (!img) return null;
  return (
    <img
      src={img.src}
      alt=""
      style={style}
      className={`absolute inset-0 h-full w-full origin-center ${fit ? "bg-white object-contain" : "object-cover"} ${className}`}
    />
  );
};

export function PhotoScene({ sc, t, d }) {
  return (
    <div className="absolute inset-0">
      <div className={`${CAP} top-[9cqw] w-[41cqw] text-[5.2cqw]`} style={revealStyle(t, 0.05, -3, 0)}>
        {sc.cap}
      </div>
      <div className={`${PHOTO_BOX} ${RIGHT}`} style={{ opacity: easeOut(seg(t, 0, 0.5)) }}>
        <Pic k={sc.img} fit={sc.fit} style={kenBurnsStyle(t, d)} />
      </div>
    </div>
  );
}

export function ListScene({ sc, t, d }) {
  const gap = Math.min(1.5, (d - 2.2) / sc.items.length);
  return (
    <div className="absolute inset-0">
      <div className={`${CAP} top-[9cqw] w-[41cqw] text-[4.4cqw]`} style={revealStyle(t, 0.05, -3, 0)}>
        {sc.cap}
      </div>
      <ul className={`absolute left-[3.5cqw] m-0 grid w-[43cqw] list-none gap-[.9cqw] p-0 ${sc.items.length < 5 ? "top-[21cqw]" : "top-[18cqw]"}`}>
        {sc.items.map((text, i) => (
          <li
            key={text}
            style={revealStyle(t, 0.9 + i * gap, -4, 0)}
            className="flex items-center gap-[1.2cqw] border-[.2cqw] border-[#3B454D] bg-[#2A3238] px-[1.4cqw] py-[.9cqw] text-[2.3cqw] font-semibold leading-[1.15]"
          >
            <i className="grid h-[3cqw] w-[3cqw] flex-none place-items-center rounded-full bg-[#2FA66A] text-[2cqw] not-italic text-white">✓</i>
            <span>{text}</span>
          </li>
        ))}
      </ul>
      <div className={`${PHOTO_BOX} ${RIGHT}`} style={{ opacity: easeOut(seg(t, 0, 0.5)) }}>
        <Pic k={sc.img} fit={sc.fit} style={kenBurnsStyle(t, d)} />
      </div>
    </div>
  );
}

function Column({ kind, item, t, d, from, to }) {
  const p = easeOut(seg(t, from, to));
  const isDo = kind === "do";
  return (
    <div
      style={{ opacity: p, transform: `translateY(${lerp(2, 0, p)}cqw)` }}
      className={`absolute top-[14.5cqw] h-[27cqw] w-[44.5cqw] border-[.5cqw] bg-[#2A3238] ${isDo ? "left-[3.5cqw] border-[#2FA66A]" : "left-[52cqw] border-[#D9534F]"}`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <Pic k={item.img} style={kenBurnsStyle(t, d, 1.02, 1.08)} />
      </div>
      <div className={`absolute left-0 top-0 z-[2] px-[1.4cqw] pt-[.2cqw] font-head text-[2.8cqw] font-bold text-white ${isDo ? "bg-[#2FA66A]" : "bg-[#D9534F]"}`}>
        {isDo ? "Do" : "Don’t"}
      </div>
      <div className={CAPTION}>{item.cap}</div>
    </div>
  );
}

export function DoDontScene({ sc, t, d }) {
  return (
    <div className="absolute inset-0">
      <div className={CAP_TOP} style={revealStyle(t, 0.05, 0, -6)}>{sc.cap}</div>
      <Column kind="dont" item={sc.dont} t={t} d={d} from={0.4} to={0.9} />
      <Column kind="do" item={sc.do} t={t} d={d} from={1.6} to={2.1} />
    </div>
  );
}

export function GalleryScene({ sc, t }) {
  return (
    <div className="absolute inset-0">
      <div className={CAP_TOP} style={revealStyle(t, 0.05, 0, -6)}>{sc.cap}</div>
      <div
        className="absolute inset-x-[3.5cqw] bottom-[14cqw] top-[14.5cqw] grid gap-[1.4cqw]"
        style={{ gridTemplateColumns: `repeat(${sc.items.length},1fr)` }}
      >
        {sc.items.map((o, i) => {
          const p = easeOut(seg(t, 0.4 + i * 0.55, 0.9 + i * 0.55));
          return (
            <div
              key={o.img}
              style={{ opacity: p, transform: `translateY(${lerp(2, 0, p)}cqw)` }}
              className="relative overflow-hidden border-[.3cqw] border-[#3B454D] bg-white"
            >
              <Pic k={o.img} fit />
              <div className="absolute inset-x-0 bottom-0 bg-[rgba(31,37,42,.92)] px-[1cqw] py-[.6cqw] text-[1.8cqw] font-semibold leading-[1.15] text-[#F1F3F4]">
                {o.cap}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Curve scene: aging temperature curve ----------
const temp = (u) => {
  if (u < 0.3) return 22 + 167 * (1 - Math.pow(1 - u / 0.3, 2));
  if (u < 0.75) return 189;
  return 189 - 120 * (1 - Math.pow(1 - (u - 0.75) / 0.25, 2));
};
const X = (u) => 40 + u * 850;
const Y = (v) => 640 - (v / 200) * 600;

export function CurveScene({ sc, t, d }) {
  const u = seg(t, 0.5, d - 0.8);
  let points = "";
  for (let k = 0; k <= u * 100; k++) {
    points += `${X(k / 100).toFixed(1)},${Y(temp(k / 100)).toFixed(1)} `;
  }
  points += `${X(u).toFixed(1)},${Y(temp(u)).toFixed(1)}`;

  let status = "Door opens by itself. Parts cool in air.";
  if (u < 0.3) status = "Heating";
  else if (u < 0.75) {
    const m = Math.round(((u - 0.3) / 0.45) * 120);
    status = `Holding time ${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
  }

  return (
    <div className="absolute inset-0">
      <div
        className="absolute left-[3.5cqw] top-[7.5cqw] w-[93cqw] font-head text-[4.2cqw] font-bold leading-[1.03]"
        style={revealStyle(t, 0.05, 0, -6)}
      >
        {sc.cap}
      </div>
      <div className="absolute inset-x-[3.5cqw] bottom-[14cqw] top-[16cqw]">
        <div className="absolute left-0 top-0 w-[38%]">
          <div className="font-head text-[10cqw] font-bold leading-none tabular-nums">
            {Math.round(Math.min(temp(u), 189))} °C
          </div>
          <div className="text-[2.6cqw] text-[#c5ccd2]">372 °F, gas burners</div>
          <div className="mt-[2cqw] border-[.2cqw] border-[#3B454D] bg-[#2A3238] px-[1.4cqw] py-[1cqw] text-[2.4cqw] font-semibold">
            {status}
          </div>
        </div>
        <svg viewBox="0 0 910 680" className="absolute right-0 top-0 h-full w-[60%]">
          <line x1="40" y1="40" x2="40" y2="640" stroke="#8a9196" strokeWidth="4" />
          <line x1="40" y1="640" x2="890" y2="640" stroke="#8a9196" strokeWidth="4" />
          <line x1="40" y1={Y(189)} x2="890" y2={Y(189)} stroke="#F5B800" strokeWidth="4" strokeDasharray="16 14" />
          <polyline fill="none" stroke="#F1F3F4" strokeWidth="12" strokeLinejoin="round" strokeLinecap="round" points={points} />
          <circle r="20" cx={X(u)} cy={Y(temp(u))} fill="#F5B800" stroke="#1F252A" strokeWidth="6" />
        </svg>
      </div>
    </div>
  );
}
