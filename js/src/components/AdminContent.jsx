// Admin: edit modules (lessons and quiz), video SOPs and shared data sets.
import { useState } from "react";
import { useTraining } from "../utils/TrainingContext";
import { useAsync } from "../utils/useAsync";
import { Button, Callout } from "./Ui";
import QuizEditor from "./QuizEditor";
import JsonEditor, { ErrorList } from "./JsonEditor";
import * as admin from "../services/trainingAdminService";
import { DATASET_KEYS } from "../utils/contentValidators";

const INPUT = "w-full rounded-md border border-line bg-surface2 px-2.5 py-2 text-base text-ink";
const LABEL = "mb-3 flex flex-col text-[.85rem] text-muted";
const TD = "border-t border-line px-3 py-2.5 align-top";
const NEW_LESSON = (n) => ({ id: `lesson${n}`, title: "", blocksText: '[\n  { "t": "p", "text": "Write the lesson text here." }\n]' });

// ---------- Modules ----------
function ModuleEditor({ start, onClose }) {
  const { t, actions } = useTraining();
  const [d, setD] = useState(start);
  const [lesson, setLesson] = useState(0);
  const [problem, setProblem] = useState({ message: "", errors: {} });
  const [busy, setBusy] = useState(false);
  const setLessonField = (patch) => setD({ ...d, lessons: d.lessons.map((l, i) => (i === lesson ? { ...l, ...patch } : l)) });
  const cur = d.lessons[lesson];

  const save = async () => {
    const errors = {};
    const lessons = d.lessons.map((l, i) => {
      try {
        return { id: l.id, title: l.title, blocks: JSON.parse(l.blocksText) };
      } catch (e) {
        errors[`lessons[${i}].blocks`] = `invalid JSON (${e.message})`;
        return null;
      }
    });
    if (Object.keys(errors).length) return setProblem({ message: "A lesson has invalid JSON.", errors });
    setBusy(true);
    try {
      await admin.saveModule(d.id, { title: d.title, short: d.short, hero: d.hero, lessons, quiz: d.quiz }, t.login);
      await actions.reloadCourse();
      actions.showToast("Module saved");
      onClose(true);
    } catch (e) {
      setProblem({ message: e.message, errors: e.errors || {} });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <Button size="sm" onClick={() => onClose(false)}>Back to modules</Button>
      <h3 className="my-3 font-head text-[1.7rem] font-bold">{d.isNew ? "New module" : `Edit: ${d.title}`}</h3>
      <label className={LABEL}>Module id (small letters, digits, underscore. Cannot change later)
        <input className={INPUT} value={d.id} disabled={!d.isNew} onChange={(e) => setD({ ...d, id: e.target.value })} />
      </label>
      <label className={LABEL}>Title<input className={INPUT} value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} /></label>
      <label className={LABEL}>Short line<input className={INPUT} value={d.short} onChange={(e) => setD({ ...d, short: e.target.value })} /></label>
      <label className={LABEL}>Home picture (picture key, for example furnace)<input className={INPUT} value={d.hero} onChange={(e) => setD({ ...d, hero: e.target.value })} /></label>

      <h4 className="mb-2 mt-4 font-head text-[1.3rem] font-bold">Lessons</h4>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {d.lessons.map((l, i) => (
          <Button key={i} size="sm" variant={i === lesson ? "primary" : "default"} onClick={() => setLesson(i)}>{i + 1}. {l.title || "(no title)"}</Button>
        ))}
        <Button size="sm" onClick={() => { setD({ ...d, lessons: [...d.lessons, NEW_LESSON(d.lessons.length + 1)] }); setLesson(d.lessons.length); }}>Add lesson</Button>
      </div>
      <div className="rounded-lg border border-line bg-surface p-3">
        <label className={LABEL}>Lesson id<input className={INPUT} value={cur.id} onChange={(e) => setLessonField({ id: e.target.value })} /></label>
        <label className={LABEL}>Lesson title<input className={INPUT} value={cur.title} onChange={(e) => setLessonField({ title: e.target.value })} /></label>
        <label className={LABEL}>Lesson blocks (JSON)
          <textarea rows={14} spellCheck={false} value={cur.blocksText} onChange={(e) => setLessonField({ blocksText: e.target.value })} className="w-full rounded-md border border-line bg-surface2 p-2.5 font-mono text-[.85rem] text-ink" />
        </label>
        <Button size="sm" disabled={d.lessons.length <= 1} onClick={() => { setD({ ...d, lessons: d.lessons.filter((_, i) => i !== lesson) }); setLesson(0); }}>Delete this lesson</Button>
      </div>

      <h4 className="mb-2 mt-4 font-head text-[1.3rem] font-bold">Knowledge check</h4>
      <QuizEditor quiz={d.quiz} onChange={(quiz) => setD({ ...d, quiz })} />
      <ErrorList message={problem.message} errors={problem.errors} />
      <div className="mt-4"><Button variant="primary" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save module"}</Button></div>
    </div>
  );
}

export function AdminModules() {
  const { t, actions } = useTraining();
  const { data, loading, error, reload } = useAsync(admin.listModules, []);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");

  const toDraft = (m) => ({ id: m.id, title: m.title, short: m.short, hero: m.hero, quiz: m.quiz,
    lessons: m.lessons.map((l) => ({ id: l.id, title: l.title, blocksText: JSON.stringify(l.blocks, null, 2) })) });

  if (editing) return <ModuleEditor start={editing} onClose={(saved) => { setEditing(null); if (saved) reload(); }} />;

  const remove = async (m) => {
    if (!window.confirm(`Remove "${m.title}"? Trainees will no longer see it. Their results stay saved.`)) return;
    try { await admin.deleteModule(m.id, t.login); await actions.reloadCourse(); reload(); } catch (e) { setMessage(e.message); }
  };
  const importAll = async () => {
    try {
      const r = await admin.importBundled(t.login, false);
      await actions.reloadCourse(); setMessage(`Imported ${r.modules} modules, ${r.videoSops} video SOPs, ${r.dataSets} data sets.`); reload();
    } catch (e) { setMessage(e.message); }
  };

  return (
    <div>
      {message && <Callout kind="info" className="mb-3" text={message} />}
      {error && <p className="text-red">{error}</p>}
      {!loading && data && data.length === 0 && (
        <Callout kind="warn" className="mb-3" title="No content in the database yet" text="Import the bundled course once. After that you can edit everything here." />
      )}
      <div className="mb-3 flex flex-wrap gap-2">
        <Button variant="primary" onClick={() => setEditing({ id: "", isNew: true, title: "", short: "", hero: "", lessons: [NEW_LESSON(1)], quiz: [{ q: "", o: ["", ""], a: 0, why: "" }] })}>New module</Button>
        {!loading && data && data.length === 0 && <Button onClick={importAll}>Import bundled content</Button>}
      </div>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full border-collapse text-[.95rem]">
          <tbody>
            {(data || []).map((m) => (
              <tr key={m.id}>
                <td className={TD}><b>{m.title}</b><br /><span className="text-muted">{m.id}</span></td>
                <td className={TD}>{m.lessons.length} lessons, {m.quiz.length} questions</td>
                <td className={TD}>{m.updatedAt}<br /><span className="text-muted">{m.updatedBy}</span></td>
                <td className={`${TD} whitespace-nowrap`}>
                  <Button size="sm" onClick={() => setEditing(toDraft(m))}>Edit</Button>{" "}
                  <Button size="sm" onClick={() => remove(m)}>Remove</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Video SOPs ----------
export function AdminVideos() {
  const { t, actions } = useTraining();
  const { data, loading, error, reload } = useAsync(admin.listVideoSops, []);
  const [editing, setEditing] = useState(null);   // { id, isNew, text }

  if (editing) {
    return (
      <div>
        <Button size="sm" onClick={() => setEditing(null)}>Back to video SOPs</Button>
        <label className={`${LABEL} mt-3`}>SOP id (small letters, digits, underscore)
          <input className={INPUT} value={editing.id} disabled={!editing.isNew} onChange={(e) => setEditing({ ...editing, id: e.target.value })} />
        </label>
        <p className="mb-2 text-muted">Edit the JSON: name <code>n</code>, line <code>d</code> and the list of <code>scenes</code> (each with <code>k</code>, <code>cap</code>, <code>vo</code> narration).</p>
        <JsonEditor
          initial={editing.text}
          saveLabel="Save video SOP"
          onSave={async (parsed) => { await admin.saveVideoSop(editing.id, parsed, t.login); await actions.reloadCourse(); actions.showToast("Video SOP saved"); setEditing(null); reload(); }}
        />
      </div>
    );
  }
  const blank = JSON.stringify({ n: "", d: "", scenes: [{ k: "photo", img: "furnace", cap: "Caption", vo: "Narration text." }] }, null, 2);
  const remove = async (v) => {
    if (!window.confirm(`Remove video SOP "${v.n}"?`)) return;
    await admin.deleteVideoSop(v.id, t.login); await actions.reloadCourse(); reload();
  };
  return (
    <div>
      {error && <p className="text-red">{error}</p>}
      <div className="mb-3"><Button variant="primary" onClick={() => setEditing({ id: "", isNew: true, text: blank })}>New video SOP</Button></div>
      {loading && <p className="text-muted">Loading…</p>}
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full border-collapse text-[.95rem]"><tbody>
          {(data || []).map((v) => (
            <tr key={v.id}>
              <td className={TD}><b>{v.n}</b><br /><span className="text-muted">{v.id}</span></td>
              <td className={TD}>{v.scenes.length} scenes</td>
              <td className={`${TD} whitespace-nowrap`}>
                <Button size="sm" onClick={() => setEditing({ id: v.id, isNew: false, text: JSON.stringify({ n: v.n, d: v.d, scenes: v.scenes }, null, 2) })}>Edit</Button>{" "}
                <Button size="sm" onClick={() => remove(v)}>Remove</Button>
              </td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}

// ---------- Shared data sets ----------
export function AdminDatasets() {
  const { t, actions } = useTraining();
  const { data, loading, error, reload } = useAsync(admin.listDatasets, []);
  const [key, setKey] = useState(DATASET_KEYS[0]);
  if (loading && !data) return <p className="text-muted">Loading…</p>;
  const value = data && data[key] !== undefined ? data[key] : null;
  return (
    <div>
      {error && <p className="text-red">{error}</p>}
      <label className={LABEL}>Data set
        <select className={INPUT} value={key} onChange={(e) => setKey(e.target.value)}>{DATASET_KEYS.map((k) => <option key={k} value={k}>{k}</option>)}</select>
      </label>
      {value === null && <Callout kind="warn" className="mb-3" text="This data set is not in the database yet. Import the bundled content in the Modules tab first." />}
      <JsonEditor
        key={key + (value === null ? "-empty" : "")}
        initial={JSON.stringify(value === null ? {} : value, null, 2)}
        saveLabel="Save data set"
        onSave={async (parsed) => { await admin.saveDataset(key, parsed, t.login); await actions.reloadCourse(); actions.showToast("Data set saved"); reload(); }}
      />
    </div>
  );
}
