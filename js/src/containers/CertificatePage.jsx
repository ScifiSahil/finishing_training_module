// Certificate of completion. It unlocks after every module check and the final assessment are
// passed. Before that, "Preview certificate" shows a sample so trainees can see what they earn.
import { useState } from "react";
import { MODULES, PASS_MARK } from "../data";
import { certificateUnlocked, moduleDone, nextTarget } from "../utils/progress";
import { useTraining } from "../utils/TrainingContext";
import { Button, Callout, NameField, PageTitle, Tape } from "../components/Ui";
import { Icon } from "../components/Pictures";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });

// The certificate sheet itself (what gets printed)
function Certificate({ name, score, date, certNo }) {
  return (
    <div className="mx-auto max-w-[820px] border-[10px] border-[#161A1E] bg-white px-[30px] py-[46px] text-center text-[#1B2127] outline outline-[6px] -outline-offset-[22px] outline-[#F5B800]">
      <Tape className="mb-[22px]" />
      <p className="m-0 mx-auto font-head text-[1.3rem]">Bharat Forge Aluminum USA</p>
      <h1 className="font-head text-[3rem] font-bold leading-[1.1]">Certificate of completion</h1>
      <p className="mx-auto my-[.5em]">This certifies that</p>
      <div className="my-3 inline-block border-b-[3px] border-[#161A1E] px-6 font-head text-[3rem]">
        {name || "Your name"}
      </div>
      <p className="mx-auto my-[.5em] max-w-[56ch] text-[1.1rem]">
        has completed the Finishing Department training (Phase 1) and passed the final assessment with a score of
      </p>
      <div className="font-head text-[3rem]">{score}%</div>
      <p className="mx-auto my-[.5em]">
        All {MODULES.length} module knowledge checks passed. {date}.
      </p>
      <p className="mx-auto mt-[18px] font-head text-[1.3rem]">
        Safe people. Good quality. Reliable production. Continuous improvement.
      </p>
      {certNo && <p className="mx-auto mt-3 text-[.9rem] text-[#56616B]">Certificate no. {certNo}</p>}
      <Tape className="mt-[22px]" />
    </div>
  );
}

export default function CertificatePage() {
  const { t, actions } = useTraining();
  const [preview, setPreview] = useState(false);
  const unlocked = certificateUnlocked(t);

  const print = () => {
    try {
      window.print();
    } catch (e) {
      actions.showToast("Printing is not available here. Use your browser’s print command.");
    }
  };

  // Locked: show what is still open, plus the sample preview
  if (!unlocked) {
    const left = MODULES.filter((m) => !moduleDone(t, m));
    const finalOk = t.final && t.final.best >= PASS_MARK;
    return (
      <>
        <PageTitle title="Certificate" />
        {preview ? (
          <>
            <Callout
              kind="info"
              className="my-3.5"
              title="Preview only"
              text="This is a sample. Your own certificate unlocks after you pass every module check and the final assessment."
            />
            <div className="mb-3.5 flex flex-wrap items-center gap-3">
              <NameField label="Try your name" placeholder="Type your name" />
              <Button className="self-end" onClick={() => setPreview(false)}>Close preview</Button>
            </div>
            <Certificate name={t.name} score={95} date={formatDate(Date.now())} />
          </>
        ) : (
          <>
            <Callout
              kind="warn"
              className="mt-3.5"
              title="Not unlocked yet"
              text={`To earn your certificate: pass every module knowledge check (view all lessons, score ${PASS_MARK}% or more) and pass the final assessment.${left.length ? ` Still open: ${left.map((m) => m.title).join(", ")}.` : ""}${finalOk ? "" : " The final assessment is not passed yet."}`}
            />
            <div className="mt-3.5 flex flex-wrap gap-3">
              <Button variant="primary" onClick={() => actions.goRoute(nextTarget(t))}>Continue training</Button>
              <Button onClick={() => setPreview(true)}>Preview certificate</Button>
            </div>
          </>
        )}
      </>
    );
  }

  // Unlocked: the real certificate
  return (
    <>
      <PageTitle title="Certificate" />
      <div className="my-3.5 flex flex-wrap items-center gap-3 print:hidden">
        <NameField label="Name on certificate" placeholder="Type your name" />
        <Button variant="primary" className="self-end" onClick={print}>
          <Icon name="print" size={20} /> Print certificate
        </Button>
      </div>
      <Certificate
        name={t.name}
        score={t.final.best}
        date={formatDate(t.final.date || Date.now())}
        certNo={t.certificate ? t.certificate.certNo : ""}
      />
    </>
  );
}