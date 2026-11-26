// The five Training Passport phases with trainer / supervisor / date and the 30-60-90 day checks.
// readOnly = true shows the values without letting the user change them.
import { PASSPORT_PHASES } from "../data";

const FIELD = "h-10 min-w-[170px] rounded-md border border-line bg-surface2 px-2.5 text-base text-ink disabled:opacity-70";

function PhaseRow({ phase, data, refresh, readOnly, onChange, onRefresh }) {
  const [id, title, method, gate] = phase;
  const d = data || {};
  return (
    <div className={`grid grid-cols-[44px_minmax(0,1fr)] items-start gap-3.5 rounded-lg border bg-surface p-3.5 ${d.done ? "border-green" : "border-line"}`}>
      <input
        type="checkbox"
        checked={!!d.done}
        disabled={readOnly}
        onChange={(e) => onChange(id, { done: e.target.checked })}
        aria-label={`Phase complete: ${title}`}
        className="h-7 w-7 accent-green"
      />
      <div>
        <h3 className="font-head text-[1.4rem] font-bold leading-[1.1]">{title}</h3>
        <p className="my-[.2em] max-w-[68ch]">{method}</p>
        <p className="m-0 text-[.9rem] text-muted">Release gate: {gate}</p>
        <div className="mt-2 flex flex-wrap gap-2.5">
          {[["trainer", "Trainer"], ["supervisor", "Supervisor"]].map(([key, label]) => (
            <label key={key} className="flex flex-col gap-0.5 text-[.8rem] text-muted">
              {label}
              <input type="text" disabled={readOnly} value={d[key] || ""} onChange={(e) => onChange(id, { [key]: e.target.value })} className={FIELD} />
            </label>
          ))}
          <label className="flex flex-col gap-0.5 text-[.8rem] text-muted">
            Date
            <input type="date" disabled={readOnly} value={d.date || ""} onChange={(e) => onChange(id, { date: e.target.value })} className={FIELD} />
          </label>
        </div>
        {id === "p5" && (
          <div className="mt-3.5 flex flex-wrap items-center gap-3">
            {["30", "60", "90"].map((day) => (
              <label key={day} className="flex min-h-[44px] items-center gap-2">
                <input
                  type="checkbox"
                  disabled={readOnly}
                  checked={!!(refresh || {})[day]}
                  onChange={(e) => onRefresh(day, e.target.checked)}
                  className="h-6 w-6 accent-green"
                />
                {day}-day check
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PassportEditor({ passport, readOnly, onChange, onRefresh }) {
  return (
    <div className="grid gap-3">
      {PASSPORT_PHASES.map((phase) => (
        <PhaseRow
          key={phase[0]}
          phase={phase}
          data={passport[phase[0]]}
          refresh={passport.refresh}
          readOnly={readOnly}
          onChange={onChange}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}
