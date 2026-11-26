// Final assessment: 20 random questions from every module, plus the daily reminders.
import { useState } from "react";
import { MODULES, PASS_MARK } from "../data";
import { buildFinalPool } from "../utils/trainingUtils";
import { moduleDone } from "../utils/progress";
import { useTraining } from "../utils/TrainingContext";
import { Button, Callout, Lesson, PageTitle } from "../components/Ui";
import { QuizRunner } from "../components/Quiz";
import { ChainBlock } from "../components/blocks/BasicBlocks";

const REMINDERS = [
  ["Work safely", "Follow all safety rules, wear the required PPE, and never take shortcuts. If something looks or feels unsafe, stop and ask for help."],
  ["Protect quality", "Handle every part carefully and follow the correct process. Never knowingly pass a defective or questionable part to the next operation."],
  ["Follow the standard", "Standards exist for a reason. Follow the defined process, loading pattern, inspection criteria and work instructions every time."],
  ["Recognize abnormal conditions", "Watch for unusual sounds, machine conditions, part appearance, process changes, alarms, leaks, damage, or anything different from normal."],
];

const STOP_ASK = [
  { b: "Stop", s: "Stop the work" },
  { b: "Ask", s: "Ask your team lead or supervisor" },
  { b: "Confirm", s: "Confirm the correct action" },
  { b: "Continue", s: "Continue safely" },
];

export default function FinalPage() {
  const { t, actions } = useTraining();
  const [pool, setPool] = useState(null);
  const left = MODULES.filter((m) => !moduleDone(t, m));

  return (
    <>
      <PageTitle
        title="Final assessment"
        intro={`Twenty questions drawn at random from every module. Pass with ${PASS_MARK}% or more. With every module check passed, this earns your certificate and completes Phase 1 in your Training Passport.`}
      />
      <Lesson>
        {left.length > 0 && (
          <Callout
            kind="warn"
            title={`${left.length} module${left.length > 1 ? "s" : ""} not finished yet`}
            text={`You can still take the assessment, but finish these first for the best result: ${left.map((m) => m.title).join(", ")}.`}
          />
        )}
        {pool ? (
          <div className="mt-3.5">
            <QuizRunner
              questions={pool}
              passMsg="Your certificate is ready."
              next={{ route: { name: "certificate" }, label: "View certificate" }}
              onFinish={(result) => actions.recordFinal(result)}
            />
          </div>
        ) : (
          <div className="mt-3.5 flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={() => setPool(buildFinalPool())}>
              Start the assessment
            </Button>
            {t.final && <span className="text-muted">Best score so far: {t.final.best}%</span>}
          </div>
        )}

        <hr className="my-[26px] border-0 border-t border-line" />
        <h3 className="mb-2.5 text-[1.6rem]">Before you go: remember every day</h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3.5">
          {REMINDERS.map(([h, text]) => (
            <div key={h} className="rounded-lg border border-line bg-surface p-4 shadow-card">
              <b className="font-head text-[1.35rem]">{h}</b>
              <p className="mb-0 mt-[.3em]">{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-3.5">
          <ChainBlock block={{ red: true, items: STOP_ASK }} />
        </div>
        <p className="mt-[18px] font-head text-[1.5rem]">
          Our goal: Safe people. Good quality. Reliable production. Continuous improvement.
        </p>
      </Lesson>
    </>
  );
}