// "Pick one and see the rule" widgets, the forging defect card and the disposition helper.
import { useState } from "react";
import { Button, Chips, RichText, Inline } from "../Ui";
import { Figure, ZoomImage } from "../Pictures";
import { parseInline } from "../../utils/trainingUtils";
import { DEFECTS, DECIDER, SELECTORS } from "../../data";
import { DoDontPair } from "./InteractiveBlocks";

const PANEL = "rounded-lg border border-line bg-surface2 p-3.5";
const OUT = "mt-3.5 grid grid-cols-1 items-start gap-4 desk:grid-cols-2";
const RULE = "mb-1.5 font-head text-[1.7rem] leading-[1.1]";

export function SelectorBlock({ block }) {
  const [ix, setIx] = useState(0);
  const o = block.opts[ix];
  return (
    <div className={PANEL}>
      <p className="mb-2 font-semibold">{block.prompt || "Choose"}</p>
      <Chips labels={block.opts.map((x) => x.label)} value={ix} onChange={setIx} />
      <div className={OUT}>
        <div>
          <div className={RULE}>{o.rule}</div>
          <p>{o.detail}</p>
        </div>
        {o.k ? <Figure k={o.k} cap={o.rule} /> : <span />}
      </div>
    </div>
  );
}

export function LoadSelectBlock() {
  const names = Object.keys(SELECTORS.loadProducts);
  const [ix, setIx] = useState(0);
  const g = SELECTORS.loadPatterns[SELECTORS.loadProducts[names[ix]]];
  return (
    <div className={PANEL}>
      <p className="mb-2 font-semibold">Which product are you loading?</p>
      <Chips labels={names} value={ix} onChange={setIx} />
      <div className={RULE + " mt-3.5"}>{g.rule}</div>
      <RichText text={g.txt} />
      <DoDontPair
        className="mt-3.5"
        doSide={{ text: g.txt, k: g.good, zoomCap: g.rule, alt: `${g.rule} (correct)` }}
        dontSide={{ text: g.bad, k: g.badk, zoomCap: "Wrong pattern", alt: "Wrong pattern" }}
      />
    </div>
  );
}

export function ToteSelectBlock() {
  const names = Object.keys(SELECTORS.totes);
  const [ix, setIx] = useState(0);
  const [customer, tote, qty, img] = SELECTORS.totes[names[ix]];
  return (
    <div className={PANEL}>
      <Chips labels={names} value={ix} onChange={setIx} />
      <div className={OUT}>
        <div>
          <div className={RULE}>{tote}</div>
          <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-1">
            <dt className="text-muted">Customer</dt>
            <dd className="m-0 font-semibold">{customer}</dd>
            <dt className="text-muted">Full pallet quantity</dt>
            <dd className="m-0 font-semibold">{qty}</dd>
            <dt className="text-muted">Hand</dt>
            <dd className="m-0 font-semibold">One hand per container: LH or RH, never mixed</dd>
          </dl>
          <p className="mt-3.5 text-muted">
            Before moving: check part number, LH/RH, quantity and traveler.
          </p>
        </div>
        <Figure k={img} cap={tote} />
      </div>
    </div>
  );
}

export function IdPartBlock() {
  const names = Object.keys(SELECTORS.controlArms);
  const [ix, setIx] = useState(0);
  const name = names[ix];
  const d = SELECTORS.controlArms[name];
  return (
    <div className={PANEL}>
      <Chips labels={names} value={ix} onChange={setIx} />
      <div className={OUT}>
        <div>
          <div className={RULE}>{name} control arm</div>
          <RichText text={d.t} />
        </div>
        <Figure k={d.k} cap={`${name} control arm`} />
      </div>
    </div>
  );
}

const COMPARE_TONES = {
  ok: { border: "border-green", head: "bg-green", label: "OK" },
  no: { border: "border-red", head: "bg-red", label: "Not OK" },
};

function Compare({ tone, item }) {
  const t = COMPARE_TONES[tone];
  return (
    <div className={`overflow-hidden rounded-lg border-[3px] bg-surface ${t.border}`}>
      <div className={`px-3 py-1 font-head text-[1.3rem] text-onStatus ${t.head}`}>{t.label}</div>
      <ZoomImage
        k={item.k}
        cap={`${t.label}: ${item.cap}`}
        alt={item.cap}
        className="bg-[#222]"
        imgClass="h-[300px] w-full object-cover"
      />
      <p className="m-0 max-w-none px-3 py-2 text-[.9rem]">{item.cap}</p>
    </div>
  );
}

export function DefectBlock({ block }) {
  const d = DEFECTS[block.d];
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p>
        <Inline parts={parseInline(d.text)} />
      </p>
      {d.causes.length > 0 && (
        <div className="my-2.5 rounded-md bg-surface2 px-3.5 py-2.5">
          <strong>Causes</strong>
          <ul className="mt-[.4em] list-disc pl-[1.3em]">
            {d.causes.map((c) => (
              <li key={c} className="my-[.3em]">
                <Inline parts={parseInline(c)} />
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className={`mt-3.5 grid gap-3.5 phone:grid-cols-1 ${d.ok ? "grid-cols-2" : "grid-cols-[minmax(0,520px)]"}`}>
        {d.ok && <Compare tone="ok" item={d.ok} />}
        <Compare tone="no" item={d.bad} />
      </div>
    </div>
  );
}

const DECIDER_TONES = {
  ok: "border-green bg-greenBg",
  rw: "border-blue bg-blueBg",
  sc: "border-red bg-redBg",
  mr: "border-yellow bg-[color-mix(in_srgb,var(--yellow)_18%,var(--surface))]",
};

export function DeciderBlock() {
  const [node, setNode] = useState("start");
  const [trail, setTrail] = useState([]);
  const result = DECIDER.results[node];

  const choose = (label, next) => {
    setTrail([...trail, label]);
    setNode(next);
  };
  const restart = () => {
    setTrail([]);
    setNode("start");
  };

  return (
    <div className="overflow-hidden rounded-lg border-2 border-black bg-surface">
      <div className="bg-black px-3.5 py-2 font-head text-[1.3rem] text-yellow">Disposition helper</div>
      <div className="p-4">
        {trail.length > 0 && (
          <div className="mb-2.5 text-[.85rem] text-muted">{trail.join("  →  ")}</div>
        )}
        {result ? (
          <>
            <div className={`rounded-lg border-l-8 p-3.5 ${DECIDER_TONES[result.tone]}`}>
              <h4 className="mb-1 text-[1.5rem]">{result.h}</h4>
              <RichText text={result.t} className="[&_p:last-child]:mb-0" />
            </div>
            <div className="mt-3.5">
              <Button onClick={restart}>Start over</Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-3 font-head text-[1.6rem]">{DECIDER.nodes[node].q}</div>
            <div className="flex flex-wrap gap-2.5">
              {DECIDER.nodes[node].o.map(([label, next]) => (
                <Button key={label} onClick={() => choose(label, next)}>
                  {label}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
