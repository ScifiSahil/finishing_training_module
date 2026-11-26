// "Check setup": shows which training tables can be read and whether saving is allowed.
import { useState } from "react";
import { Button } from "./Ui";
import { checkReading, checkWriting } from "../services/setupCheck";

export default function SetupCheck() {
  const [rows, setRows] = useState(null);
  const [write, setWrite] = useState(null);
  const [busy, setBusy] = useState(false);

  const run = async (work) => {
    setBusy(true);
    try {
      await work();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 w-full">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={busy} onClick={() => run(async () => setRows(await checkReading()))}>Check all tables</Button>
        <Button size="sm" disabled={busy} onClick={() => run(async () => setWrite(await checkWriting()))}>Test saving</Button>
      </div>
      {rows && (
        <ul className="mb-0 mt-2 list-none p-0 text-[.95rem]">
          {rows.map((r) => (
            <li key={r.key} className={r.ok ? "text-green" : "text-red"}>
              <b>{r.ok ? "✓" : "✗"}</b> {r.table}: {r.note}
            </li>
          ))}
        </ul>
      )}
      {write && <p className={`mb-0 mt-2 font-semibold ${write.ok ? "text-green" : "text-red"}`}>{write.ok ? "✓" : "✗"} {write.note}</p>}
    </div>
  );
}