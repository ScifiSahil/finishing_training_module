// Product picker and the clickable Finishing route (process map).
import { useState } from "react";
import { PRODUCTS, STATIONS, getModule } from "../../data";
import { moduleDone } from "../../utils/progress";
import { useTraining } from "../../utils/TrainingContext";
import { getImage } from "../../utils/trainingUtils";
import { Chips, RichText } from "../Ui";
import { Figure } from "../Pictures";

export function ProductsBlock() {
  const [ix, setIx] = useState(0);
  const p = PRODUCTS[ix];
  return (
    <div>
      <Chips mode="tab" labels={PRODUCTS.map((x) => x.name)} value={ix} onChange={setIx} />
      <div className="grid grid-cols-1 items-start gap-[22px] desk:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div>
          <h3 className="mb-2.5 text-[1.45rem]">{p.name}</h3>
          <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-1">
            <dt className="text-muted">Customer</dt>
            <dd className="m-0 font-semibold">{p.customer}</dd>
            <dt className="text-muted">Vehicle</dt>
            <dd className="m-0 font-semibold">{p.vehicle}</dd>
            <dt className="text-muted">Type</dt>
            <dd className="m-0 font-semibold">{p.kind}</dd>
          </dl>
          <RichText text={p.what} className="mt-3" />
          <Figure k={p.car} cap={p.vehicle} small />
        </div>
        <div>
          <Figure k={p.part} cap={p.name} />
        </div>
      </div>
    </div>
  );
}

function Station({ station, index }) {
  const { t, actions } = useTraining();
  const done = moduleDone(t, getModule(station.id));
  const img = getImage(station.img);
  return (
    <button
      type="button"
      onClick={() => actions.go("module", { id: station.id, lesson: 0 })}
      className="relative z-[1] flex min-w-[120px] snap-start flex-col items-stretch justify-start self-start px-2 text-left text-ink no-underline"
    >
      <div className="mb-3 h-[104px] overflow-hidden rounded-md border-2 border-line bg-surface hover:border-yellowDeep">
        {img && <img src={img.src} alt="" loading="lazy" className="h-full w-full object-cover" />}
      </div>
      <div className="relative mb-3 flex h-7 items-center">
        <div className="absolute -inset-x-2 h-2.5 bg-tape" />
        <span
          aria-hidden="true"
          className={`relative grid h-7 w-7 place-items-center rounded-full border-4 border-black font-head text-[.8rem] font-bold leading-none ${done ? "bg-yellow" : "bg-surface"}`}
        >
          {done ? "✓" : index + 1}
        </span>
      </div>
      <b className="block font-head text-[1.15rem] leading-[1.1]">{station.n}</b>
      <small className="mt-0.5 block leading-[1.3] text-muted">{station.d}</small>
      {station.branch && (
        <span className="mt-1 inline-block self-start rounded-[3px] bg-black px-1.5 py-px text-[.82rem] font-semibold text-yellow">
          {station.branch}
        </span>
      )}
    </button>
  );
}

export function ProcessMapBlock() {
  return (
    <div className="relative grid snap-x snap-proximity grid-cols-[repeat(7,minmax(130px,1fr))] overflow-x-auto px-0.5 pb-2.5 pt-3.5">
      {STATIONS.map((s, i) => (
        <Station key={s.id} station={s} index={i} />
      ))}
    </div>
  );
}