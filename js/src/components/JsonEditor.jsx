// A box for editing JSON text with Save. Shows invalid JSON and field problems in plain words.
import { useState } from "react";
import { Button } from "./Ui";

export function ErrorList({ message, errors }) {
  if (!message) return null;
  return (
    <div className="my-3 rounded-lg border-l-8 border-red bg-redBg px-4 py-3">
      <b>{message}</b>
      {errors && Object.keys(errors).length > 0 && (
        <ul className="mb-0 mt-1 list-disc pl-5">
          {Object.keys(errors).map((k) => <li key={k}><code>{k}</code>: {errors[k]}</li>)}
        </ul>
      )}
    </div>
  );
}

export default function JsonEditor({ initial, rows = 18, saveLabel = "Save", onSave }) {
  const [text, setText] = useState(initial);
  const [problem, setProblem] = useState({ message: "", errors: {} });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      setProblem({ message: `This is not valid JSON: ${e.message}`, errors: {} });
      return;
    }
    setBusy(true);
    try {
      await onSave(parsed);
      setProblem({ message: "", errors: {} });
    } catch (e) {
      setProblem({ message: e.message, errors: e.errors || {} });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <textarea
        value={text}
        rows={rows}
        spellCheck={false}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded-md border border-line bg-surface2 p-2.5 font-mono text-[.85rem] text-ink"
      />
      <ErrorList message={problem.message} errors={problem.errors} />
      <div className="mt-2"><Button variant="primary" onClick={save} disabled={busy}>{busy ? "Saving…" : saveLabel}</Button></div>
    </div>
  );
}
