// Aging furnace chart and the TPM losses table with the "spot the loss" mini quiz.
import { useMemo, useState } from "react";
import { Button, Chips } from "../Ui";
import { SPOTS } from "../../data";
import {
  LOSS_GROUPS, filterLosses, lossByNumber, spotOptions,
  furnaceTemp, holdMinutes, phaseAt, toFahrenheit,
} from "../../utils/trainingUtils";

const X = (v) => 60 + v * 5.4;
const Y = (t) => 220 - t * 0.95;

// SVG path of the whole curve, built once
const CURVE = Array.from({ length: 101 }, (_, v) =>
  `${v ? "L" : "M"}${X(v).toFixed(1)} ${Y(furnaceTemp(v)).toFixed(1)}`
).join("");

const AXIS_LABELS = [
  [60, "start", "Loading"],
  [X(26), "middle", "Heating"],
  [X(55), "middle", "Holding"],
  [X(85), "middle", "Cooling and unloading"],
];

const Readout = ({ value, label }) => (
  <div className="min-w-[130px] rounded-md border border-line bg-surface px-3 py-1.5">
    <b className="block font-head text-[1.8rem] leading-[1.1]">{value}</b>
    <span className="text-[.82rem] text-muted">{label}</span>
  </div>
);

export function FurnaceBlock() {
  const [p, setP] = useState(0);
  const [fahrenheit, setFahrenheit] = useState(false);
  const temp = furnaceTemp(p);
  const phase = phaseAt(p);
  const hold = holdMinutes(p);
  const shown = fahrenheit ? `${toFahrenheit(temp)} °F` : `${Math.round(temp)} °C`;

  return (
    <div className="rounded-lg border border-line bg-surface2 p-3.5">
      <svg
        viewBox="0 0 640 260"
        role="img"
        aria-label="Aging cycle: temperature rises to 189 degrees Celsius, holds for two hours, then cools"
        className="block h-auto w-full"
      >
        <rect x="60" y="20" width="540" height="200" fill="none" stroke="var(--line)" />
        <line x1="60" x2="600" y1={Y(189)} y2={Y(189)} stroke="var(--red)" strokeDasharray="6 5" />
        <text x="64" y={Y(189) - 6} fill="var(--red)" fontSize="13" fontWeight="700">
          189 °C (372 °F)
        </text>
        <rect x={X(40)} y={Y(189)} width={X(70) - X(40)} height={220 - Y(189)} fill="var(--yellow)" opacity=".22" />
        <text x={(X(40) + X(70)) / 2} y={Y(189) + 22} textAnchor="middle" fill="var(--ink)" fontSize="14" fontWeight="700">
          Hold 2 h
        </text>
        <path d={CURVE} fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" />
        {AXIS_LABELS.map(([x, anchor, text]) => (
          <text key={text} x={x} y="246" textAnchor={anchor} fill="var(--muted)" fontSize="12">
            {text}
          </text>
        ))}
        <text x="14" y="125" fill="var(--muted)" fontSize="12" transform="rotate(-90 14 125)" textAnchor="middle">
          Part temperature
        </text>
        <circle cx={X(p)} cy={Y(temp)} r="9" fill="var(--yellow)" stroke="var(--black)" strokeWidth="3" />
      </svg>

      <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
        <input
          type="range"
          min={0}
          max={100}
          value={p}
          onChange={(e) => setP(Number(e.target.value))}
          aria-label="Position in the aging cycle"
          className="h-11 min-w-[180px] flex-1 accent-yellowDeep"
        />
        <Button size="sm" onClick={() => setFahrenheit(!fahrenheit)}>
          {fahrenheit ? "Show °C" : "Show °F"}
        </Button>
      </div>

      <div className="my-2 flex flex-wrap gap-[18px]">
        <Readout value={shown} label="Part temperature" />
        <Readout
          value={`${Math.floor(hold / 60)}:${String(hold % 60).padStart(2, "0")}`}
          label="Hold time (h:mm)"
        />
        <Readout value={phase[4].split(" ")[0]} label="Furnace door" />
      </div>
      <h4 className="mb-1 mt-2 text-[1.4rem]">{phase[2]}</h4>
      <p className="m-0">{phase[3]}</p>
      <p className="mb-0 mt-1.5 text-[.85rem] text-muted">
        Illustration only. Heat-up and cooling times are not to scale.
      </p>
    </div>
  );
}

export function TpmBlock() {
  const [group, setGroup] = useState(0);
  const [query, setQuery] = useState("");
  const rows = filterLosses(LOSS_GROUPS[group], query);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <Chips labels={LOSS_GROUPS} value={group} onChange={setGroup} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the losses"
          aria-label="Search the losses"
          className="mb-2.5 h-10 min-w-[220px] rounded-md border border-line bg-surface2 px-2.5 text-ink"
        />
      </div>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full border-collapse text-[.95rem] [&_tr:nth-child(even)_td]:bg-surface2">
          <thead>
            <tr>
              {["#", "Loss", "Simple meaning", "Example in Finishing"].map((h) => (
                <th key={h} scope="col" className="sticky top-0 bg-rail px-3 py-2.5 text-left font-head text-[1.05rem] text-railInk">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="border-t border-line px-3 py-2.5">
                  No loss matches. Clear the search or choose All.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r[0]}>
                <td className="border-t border-line px-3 py-2.5 align-top">{r[0]}</td>
                <td className="border-t border-line px-3 py-2.5 align-top">
                  <strong>{r[1]}</strong>
                  <br />
                  <span className="mt-1 inline-block rounded-full bg-blueBg px-2 py-0.5 text-[.78rem] font-bold text-blue">
                    {r[2]}
                  </span>
                </td>
                <td className="border-t border-line px-3 py-2.5 align-top">{r[3]}</td>
                <td className="border-t border-line px-3 py-2.5 align-top">{r[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3.5 text-[.88rem] text-muted">
        The four groups (availability, performance, quality, resources and management) are a learning aid for sorting the 16 losses.
      </p>
    </div>
  );
}

const OPTION =
  "flex min-h-[56px] w-full items-center gap-3 rounded-lg border-2 border-line bg-surface px-3.5 py-3 text-left font-medium enabled:hover:border-ink disabled:cursor-default";
const KEY = "grid h-[30px] w-[30px] flex-none place-items-center rounded-full border-2 border-current font-head font-bold";

export function SpotBlock() {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [round, setRound] = useState(0);
  const spot = SPOTS[i];
  const options = useMemo(() => (spot ? spotOptions(spot.a) : []), [spot, round]);

  const restart = () => {
    setI(0);
    setScore(0);
    setPicked(null);
    setRound(round + 1);
  };
  const answer = (n) => {
    setPicked(n);
    if (n === spot.a) setScore(score + 1);
  };
  const next = () => {
    setI(i + 1);
    setPicked(null);
  };

  if (!spot) {
    const pass = score >= 6;
    return (
      <div className="mx-auto max-w-[760px] p-2.5 text-center">
        <div className={`font-head text-[5rem] leading-none ${pass ? "text-green" : "text-red"}`}>
          {score}/{SPOTS.length}
        </div>
        <p className="mx-auto">
          {pass ? "Sharp eye. You can recognize losses on the floor." : "Review the 16 losses and try again."}
        </p>
        <Button onClick={restart}>Try again</Button>
      </div>
    );
  }

  const right = lossByNumber(spot.a);
  return (
    <div className="mx-auto max-w-[760px]">
      <div className="mb-2 flex justify-between text-[.92rem] text-muted">
        <span>
          Situation {i + 1} of {SPOTS.length}
        </span>
        <span>Score {score}</span>
      </div>
      <div className="mb-3.5 font-head text-[clamp(1.5rem,3vw,2rem)] leading-[1.15]">{spot.s}</div>
      <div className="grid gap-2.5">
        {options.map((n) => {
          const state =
            picked === null ? "" : n === spot.a ? "!border-green !bg-greenBg" : n === picked ? "!border-red !bg-redBg" : "";
          return (
            <button key={n} type="button" disabled={picked !== null} onClick={() => answer(n)} className={`${OPTION} ${state}`}>
              <span className={KEY}>{n}</span>
              {lossByNumber(n)[1]}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className={`mt-3.5 rounded-lg border-l-8 px-3.5 py-3 ${picked === spot.a ? "border-green bg-greenBg" : "border-red bg-redBg"}`} aria-live="polite">
          <b className="block font-head text-[1.3rem]">{picked === spot.a ? "Correct" : "Not quite"}</b>
          <span>
            Loss #{spot.a}: {right[1]}. {right[3]}
          </span>
          <div className="mt-3.5">
            <Button variant="primary" size="sm" onClick={next}>
              {i + 1 >= SPOTS.length ? "See result" : "Next"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
