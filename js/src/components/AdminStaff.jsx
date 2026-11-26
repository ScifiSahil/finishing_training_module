// Admin: who can use the admin screens, and the list of recent content changes.
import { useState } from "react";
import { useTraining } from "../utils/TrainingContext";
import { useAsync } from "../utils/useAsync";
import { Button } from "./Ui";
import * as admin from "../services/trainingAdminService";

const INPUT = "h-11 rounded-md border border-line bg-surface2 px-2.5 text-base text-ink";
const TD = "border-t border-line px-3 py-2.5 align-top";

export function AdminStaff() {
  const { t } = useTraining();
  const { data, loading, error, reload } = useAsync(admin.listStaff, []);
  const [login, setLogin] = useState("");
  const [role, setRole] = useState("trainer");
  const [problem, setProblem] = useState("");

  const run = async (work) => {
    try { setProblem(""); await work(); setLogin(""); reload(); } catch (e) { setProblem(e.message); }
  };

  return (
    <div>
      <p className="text-muted">Admins can edit everything. Trainers can see reports and sign passports. The built-in admin (caddok) is always allowed.</p>
      <div className="mb-3 flex flex-wrap items-end gap-2">
        <label className="flex flex-col text-[.85rem] text-muted">Login<input className={INPUT} value={login} onChange={(e) => setLogin(e.target.value)} /></label>
        <label className="flex flex-col text-[.85rem] text-muted">Role
          <select className={INPUT} value={role} onChange={(e) => setRole(e.target.value)}><option value="trainer">trainer</option><option value="admin">admin</option></select>
        </label>
        <Button variant="primary" disabled={!login.trim()} onClick={() => run(() => admin.saveStaff(login, role, t.login))}>Add or change</Button>
      </div>
      {(problem || error) && <p className="text-red">{problem || error}</p>}
      {loading && <p className="text-muted">Loading…</p>}
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full border-collapse text-[.95rem]"><tbody>
          {(data || []).map((s) => (
            <tr key={s.login}>
              <td className={TD}><b>{s.login}</b></td>
              <td className={TD}>{s.role}</td>
              <td className={TD}><Button size="sm" onClick={() => run(() => admin.removeStaff(s.login, t.login))}>Remove</Button></td>
            </tr>
          ))}
          {!loading && (data || []).length === 0 && <tr><td className={TD}>No staff added yet.</td></tr>}
        </tbody></table>
      </div>
    </div>
  );
}

export function AdminLog() {
  const { data, loading, error } = useAsync(admin.listLog, []);
  return (
    <div>
      {error && <p className="text-red">{error}</p>}
      {loading && <p className="text-muted">Loading…</p>}
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full border-collapse text-[.95rem]"><tbody>
          {(data || []).map((r) => (
            <tr key={r.log_id}>
              <td className={TD}>{r.changed_at}</td><td className={TD}>{r.changed_by}</td>
              <td className={TD}>{r.item_kind} / {r.item_key}</td><td className={TD}>{r.action}</td><td className={TD}>{r.summary}</td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </div>
  );
}
