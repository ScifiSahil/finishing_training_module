// First screen for a trainee who is not known in this browser yet: Employee ID and name.
import { useState } from "react";
import { useTraining } from "../utils/TrainingContext";
import { Button, Tape } from "./Ui";

export default function LoginGate() {
  const { actions } = useTraining();
  const [login, setLogin] = useState("");
  const [name, setName] = useState("");
  const ready = login.trim().length >= 2;

  return (
    <div className="grid min-h-screen place-items-center bg-bg p-4 font-body text-base text-ink">
      <div className="w-full max-w-[440px] overflow-hidden rounded-[10px] border border-line bg-surface shadow-card">
        <Tape height="h-3" />
        <div className="p-6">
          <h1 className="font-head text-[2rem] font-bold leading-[1.1]">Finishing training</h1>
          <p className="mb-4 mt-1 text-muted">Enter your Employee ID so your progress, scores and certificate are saved under your name.</p>
          <label className="mb-3 flex flex-col text-[.9rem] text-muted">
            Employee ID (login)
            <input
              type="text"
              value={login}
              autoFocus
              onChange={(e) => setLogin(e.target.value)}
              className="h-11 rounded-md border border-line bg-surface2 px-2.5 text-base text-ink"
            />
          </label>
          <label className="mb-4 flex flex-col text-[.9rem] text-muted">
            Your name (shown on the certificate)
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-md border border-line bg-surface2 px-2.5 text-base text-ink"
            />
          </label>
          <Button variant="primary" className="w-full" disabled={!ready} onClick={() => actions.startSession(login, name)}>
            Start
          </Button>
        </div>
      </div>
    </div>
  );
}
