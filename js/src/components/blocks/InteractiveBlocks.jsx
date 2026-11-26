// Interactive lesson blocks: do and don't, tabs, step selector and tick-box checklists.
import { useState } from "react";
import { Button, Chips, RichText, Inline } from "../Ui";
import { Figure, Icon, ZoomImage } from "../Pictures";
import { parseInline } from "../../utils/trainingUtils";
import { BlockList } from "./BlockList";

const TONES = {
  do: { border: "border-green", head: "bg-green", label: "Do", icon: "check" },
  dont: { border: "border-red", head: "bg-red", label: "Don’t", icon: "x" },
};

function Side({ kind, side }) {
  const tone = TONES[kind];
  return (
    <div className={`flex flex-col overflow-hidden rounded-lg border-2 bg-surface ${tone.border}`}>
      <div className={`flex items-center gap-2 px-3 py-1.5 font-head text-[1.3rem] font-bold text-onStatus ${tone.head}`}>
        <Icon name={tone.icon} /> {tone.label}
      </div>
      {side.k && (
        <ZoomImage
          k={side.k}
          cap={side.zoomCap}
          alt={side.alt || ""}
          className="bg-chip"
          imgClass="mx-auto max-h-[300px] w-full object-contain"
        />
      )}
      <p className="m-0 max-w-none px-3 py-2.5">
        <Inline parts={parseInline(side.text)} />
      </p>
    </div>
  );
}

export function DoDontPair({ doSide, dontSide, className = "" }) {
  return (
    <div className={`grid grid-cols-2 gap-3.5 phone:grid-cols-1 ${className}`}>
      <Side kind="do" side={doSide} />
      <Side kind="dont" side={dontSide} />
    </div>
  );
}

export function DoDontBlock({ block }) {
  return (
    <div>
      {block.items.map((item, i) => {
        // Pictures sit inside the cards only when both a Do and a Don't picture exist
        const inCards = !!item.kdont;
        return (
          <div key={i} className="mb-[22px] last:mb-0">
            {item.title && <h4 className="mb-2 text-[1.4rem]">{item.title}</h4>}
            {item.kdo && !item.kdont && (
              <div className="mb-3 max-w-[520px]">
                <Figure k={item.kdo} />
              </div>
            )}
            <DoDontPair
              doSide={{ text: item.do, k: inCards ? item.kdo : null, zoomCap: `Do: ${item.do}` }}
              dontSide={{ text: item.dont, k: inCards ? item.kdont : null, zoomCap: `Don’t: ${item.dont}` }}
            />
          </div>
        );
      })}
    </div>
  );
}

export function TabsBlock({ block }) {
  const [ix, setIx] = useState(0);
  return (
    <div>
      <Chips mode="tab" labels={block.tabs.map((t) => t.label)} value={ix} onChange={setIx} />
      <div role="tabpanel">
        <BlockList blocks={block.tabs[ix].blocks} />
      </div>
    </div>
  );
}

const stripNumber = (title) => title.replace(/^\d\s/, "");

export function StepsBlock({ block }) {
  const [ix, setIx] = useState(0);
  const chips = block.mode === "chips";
  const item = block.items[ix];

  const boxCls = chips
    ? "grid grid-cols-1"
    : "grid grid-cols-1 gap-5 desk:grid-cols-[minmax(200px,280px)_minmax(0,1fr)]";
  const listCls = chips
    ? "m-0 flex list-none overflow-x-auto border-b border-line bg-surface2 p-0"
    : "m-0 flex list-none overflow-x-auto border-b border-line bg-surface2 p-0 desk:block desk:overflow-visible desk:border-b-0 desk:border-r";
  const btnCls = chips
    ? "flex min-h-[52px] w-full items-center gap-2.5 whitespace-nowrap border-0 border-r border-line bg-transparent px-3.5 py-3 text-left font-semibold aria-selected:bg-yellow aria-selected:text-black"
    : "group flex min-h-[52px] w-full items-center gap-2.5 whitespace-nowrap border-0 border-r border-line bg-transparent px-3.5 py-3 text-left font-semibold aria-selected:bg-yellow aria-selected:text-black desk:whitespace-normal desk:border-b desk:border-r-0";
  const bodyCls = chips ? "p-4" : "px-4 pb-4 desk:py-4 desk:pl-0 desk:pr-4";

  return (
    <div>
      {block.title && <p className="text-muted">{block.title}</p>}
      <div className={`overflow-hidden rounded-lg border border-line ${boxCls}`}>
        <ul className={listCls} role="tablist">
          {block.items.map((it, i) => (
            <li key={it.title} className="flex-none desk:flex-auto">
              <button
                type="button"
                role="tab"
                aria-selected={i === ix}
                className={btnCls}
                onClick={() => setIx(i)}
              >
                {!chips && (
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-full border-2 border-ink bg-surface font-head group-aria-selected:border-black group-aria-selected:bg-black group-aria-selected:text-yellow">
                    {i + 1}
                  </span>
                )}
                {stripNumber(it.title)}
              </button>
            </li>
          ))}
        </ul>
        <div role="tabpanel" className={bodyCls}>
          <h4 className="mb-2 text-[1.5rem]">{stripNumber(item.title)}</h4>
          <RichText text={item.text} />
          {item.k ? (
            <Figure k={item.k} />
          ) : (
            block.k && chips && (
              <Figure k={block.k} cap="Escalation matrix for a machine fault or breakdown" />
            )
          )}
          <div className="mt-3.5 flex gap-2">
            <Button size="sm" disabled={ix === 0} onClick={() => setIx(ix - 1)}>
              Previous
            </Button>
            <Button size="sm" disabled={ix === block.items.length - 1} onClick={() => setIx(ix + 1)}>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Checklist({ title, items, action, done, reset = "Reset" }) {
  const [checked, setChecked] = useState(() => items.map(() => false));
  const [message, setMessage] = useState("");
  const all = checked.every(Boolean);

  const toggle = (i) => {
    setChecked(checked.map((c, j) => (j === i ? !c : c)));
    setMessage("");
  };
  const clear = () => {
    setChecked(items.map(() => false));
    setMessage("");
  };

  return (
    <div className="overflow-hidden rounded-lg border-2 border-black">
      <div className="bg-black px-3.5 py-2 font-head text-[1.3rem] text-yellow">{title}</div>
      {items.map((text, i) => (
        <label
          key={text}
          className="flex min-h-[52px] cursor-pointer items-center gap-3 border-t border-line bg-surface px-3.5 py-3 first-of-type:border-t-0"
        >
          <input
            type="checkbox"
            checked={checked[i]}
            onChange={() => toggle(i)}
            className="h-6 w-6 flex-none accent-green"
          />
          <span>{text}</span>
        </label>
      ))}
      <div className="flex flex-wrap items-center gap-3 bg-surface2 px-3.5 py-3">
        <Button variant="primary" disabled={!all} onClick={() => setMessage(done)}>
          {action}
        </Button>
        <Button variant="ghost" size="sm" onClick={clear}>
          {reset}
        </Button>
        {message && <span className="font-bold text-green">{message}</span>}
      </div>
    </div>
  );
}

export const ChecklistBlock = ({ block }) => (
  <Checklist
    title={block.title}
    items={block.items}
    action={block.action}
    done={block.done}
    reset={block.reset}
  />
);

export const CheckRulesBlock = ({ block }) => (
  <Checklist
    title="Critical packing requirements. Tick each one as you learn it."
    items={block.items}
    action="I understand all of these"
    done="Good. Keep these in mind at every tote."
    reset="Clear"
  />
);

export const PpeCheckBlock = () => (
  <Checklist
    title="Before you step on the floor"
    items={[
      "Ear plugs in",
      "Safety glasses on",
      "Steel-toe shoes on",
      "Cotton clothing on",
      "For the task: cut-resistant gloves, face mask, face shield and arm sleeves as required",
    ]}
    action="I’m dressed for the floor"
    done="PPE check complete. Never step on the floor without it."
    reset="Clear"
  />
);
