// Admin / trainer: all trainees with progress, one trainee's attempts, passport sign-off, CSV.
import { useState } from "react";
import { useTraining } from "../utils/TrainingContext";
import { useAsync } from "../utils/useAsync";
import { Button } from "./Ui";
import { PassportEditor } from "./PassportEditor";
import { MODULES } from "../data";
import * as admin from "../services/trainingAdminService";
import { savePassport } from "../services/trainingService";

const TH = "bg-rail px-3 py-2.5 text-left font-head text-[1.05rem] text-railInk";
const TD = "border-t border-line px-3 py-2.5 align-top";

function Detail({ login, onBack }) {
  const { t, actions } = useTraining();
  const { data, loading, error, reload } = useAsync(() => admin.traineeDetail(login), [login]);
  const [saveError, setSaveError] = useState("");

  const sign = async (phase, patch) => {
    try {
      setSaveError("");
      await savePassport(login, phase, patch, t.login);
      await reload();
    } catch (e) {
      setSaveError(e.message);
    }
  };
  const titleOf = (id) => (MODULES.find((m) => m.id === id) || { title: id }).title;

  if (loading && !data) return <p className="text-muted">Loading…</p>;
  if (error) return <p className="text-red">{error}</p>;
  const { progress, attempts } = data;

  return (
    <div>
      <Button size="sm" onClick={onBack}>Back to all trainees</Button>
      <h3 className="mb-1 mt-3 font-head text-[1.7rem] font-bold">{progress.name || login} <span className="text-[1rem] font-normal text-muted">({login})</span></h3>
      <p className="text-muted">
        Final assessment: {progress.final ? `${progress.final.best}% best, ${progress.final.attempts} attempt(s)` : "not taken"}.
        {progress.certificate ? ` Certificate ${progress.certificate.certNo}.` : " No certificate yet."}
      </p>
      <h4 className="mb-2 mt-4 font-head text-[1.3rem] font-bold">Attempts</h4>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full border-collapse text-[.95rem]">
          <thead><tr>{["When", "What", "Score", "Result", "Missed"].map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
          <tbody>
            {attempts.length === 0 && <tr><td colSpan={5} className={TD}>No attempts yet.</td></tr>}
            {attempts.map((a) => (
              <tr key={a.id}>
                <td className={TD}>{a.takenAt}</td>
                <td className={TD}>{a.kind === "final" ? "Final assessment" : titleOf(a.moduleId)}</td>
                <td className={TD}>{a.score}% ({a.correct}/{a.total})</td>
                <td className={`${TD} font-semibold ${a.passed ? "text-green" : "text-red"}`}>{a.passed ? "Passed" : "Not passed"}</td>
                <td className={TD}>{a.missed.map((m) => m.q).join(" | ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h4 className="mb-2 mt-4 font-head text-[1.3rem] font-bold">Training Passport</h4>
      {saveError && <p className="mb-2 text-red">{saveError}</p>}
      <PassportEditor
        passport={progress.passport}
        readOnly={false}
        onChange={sign}
        onRefresh={(day, value) => sign(`refresh_${day}`, { done: value })}
      />
    </div>
  );
}

export default function AdminTrainees() {
  const { actions } = useTraining();
  const { data, loading, error, reload } = useAsync(admin.listTrainees, []);
  const [open, setOpen] = useState("");
  const [query, setQuery] = useState("");

  if (open) return <Detail login={open} onBack={() => setOpen("")} />;
  const rows = (data || []).filter((r) => `${r.login} ${r.name}`.toLowerCase().includes(query.trim().toLowerCase()));

  const download = () => {
    const blob = new Blob(["\uFEFF" + admin.traineesToCsv(rows)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "finishing-training-trainees.csv";
    a.click();
    actions.showToast("CSV downloaded");
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <input
          type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by login or name"
          className="h-11 min-w-[240px] rounded-md border border-line bg-surface2 px-2.5 text-ink"
        />
        <Button size="sm" onClick={reload}>Refresh</Button>
        <Button size="sm" onClick={download} disabled={rows.length === 0}>Download CSV</Button>
      </div>
      {loading && <p className="text-muted">Loading…</p>}
      {error && <p className="text-red">{error}</p>}
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full border-collapse text-[.95rem]">
          <thead><tr>{["Login", "Name", "Progress", "Modules passed", "Final", "Certificate", "Last visit", ""].map((h) => <th key={h} className={TH}>{h}</th>)}</tr></thead>
          <tbody>
            {!loading && rows.length === 0 && <tr><td colSpan={8} className={TD}>No trainees yet.</td></tr>}
            {rows.map((r) => (
              <tr key={r.login}>
                <td className={TD}>{r.login}</td>
                <td className={TD}>{r.name}</td>
                <td className={TD}>{r.percent}%</td>
                <td className={TD}>{r.modulesPassed} / {MODULES.length}</td>
                <td className={TD}>{r.finalBest === null ? "-" : `${r.finalBest}%`}</td>
                <td className={TD}>{r.certificate || "-"}</td>
                <td className={TD}>{r.lastSeenAt}</td>
                <td className={TD}><Button size="sm" onClick={() => setOpen(r.login)}>Open</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
