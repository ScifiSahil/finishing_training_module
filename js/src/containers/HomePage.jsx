// Home: hero, the Finishing route, progress numbers and every module.
import { MODULES, PASS_MARK } from "../data";
import { getImage } from "../utils/trainingUtils";
import { moduleDone, nextTarget, overallPercent } from "../utils/progress";
import { useTraining } from "../utils/TrainingContext";
import { Button, PageTitleOnly, Tape } from "../components/Ui";
import { ProcessMapBlock } from "../components/blocks/ProductBlocks";

// Module pictures that are drawings on a white background: shown whole, not cropped
const WHOLE_PICTURE = ["loto_lock", "escalation"];

const Stat = ({ value, label }) => (
  <div className="flex flex-col gap-0.5 rounded-lg border border-line bg-surface p-4 shadow-card">
    <b className="font-head text-[2.2rem] leading-none">{value}</b>
    <span className="text-[.9rem] text-muted">{label}</span>
  </div>
);

export default function HomePage() {
  const { t, actions } = useTraining();
  const done = MODULES.filter((m) => moduleDone(t, m)).length;
  const started = done > 0 || Object.keys(t.seen).length > 0;

  return (
    <>
      <PageTitleOnly title="Home" />
      <section className="mb-[22px] overflow-hidden rounded-[10px] bg-rail text-railInk">
        <Tape height="h-4" />
        <div className="p-[clamp(20px,4vw,40px)]">
          <h1 className="font-head text-[clamp(2.2rem,5.5vw,3.8rem)] font-bold leading-[1.1]">Finishing Department training</h1>
          <div className="my-[.35em] mb-[.7em] font-head text-[clamp(1.2rem,2.4vw,1.6rem)] text-yellow">
            We don’t cast, we don’t forge, but we finish!
          </div>
          <p className="mb-[.8em] max-w-[60ch] text-[#C5CCD2]">
            Bharat Forge Aluminum USA. Learn what we do in Finishing, why each step matters, and how to work safely and protect quality. Twelve short modules, a video SOP for each station, a knowledge check after each module, and a final assessment.
          </p>
          <div className="mt-[18px] flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={() => actions.goRoute(nextTarget(t))}>
              {started ? "Continue training" : "Start training"}
            </Button>
            <Button variant="rail" onClick={() => actions.go("videos")}>
              Watch video SOPs
            </Button>
          </div>
        </div>
      </section>

      <section className="mb-[26px] mt-1.5">
        <h2 className="mb-1 font-head text-[1.7rem] font-bold leading-[1.1]">The Finishing route</h2>
        <p className="mb-[.8em] text-muted">Every part follows this route. Select a station to learn it.</p>
        <ProcessMapBlock />
      </section>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3.5">
        <Stat value={`${overallPercent(t)}%`} label="of the course complete" />
        <Stat value={`${done} / ${MODULES.length}`} label="modules passed" />
        <Stat value={t.final ? `${t.final.best}%` : "Not taken"} label="final assessment best score" />
        <Stat value={`${PASS_MARK}%`} label="pass mark for every check" />
      </div>

      <h2 className="mb-2.5 mt-[26px] font-head text-[1.7rem] font-bold leading-[1.1]">All modules</h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-3.5">
        {MODULES.map((m, i) => {
          const hero = getImage(m.hero);
          const whole = WHOLE_PICTURE.indexOf(m.hero) >= 0;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => actions.go("module", { id: m.id, lesson: 0 })}
              className="overflow-hidden rounded-lg border border-line bg-surface text-left text-ink shadow-card"
            >
              <div className="h-[130px] overflow-hidden bg-white">
                {hero && <img src={hero.src} alt="" loading="lazy" className={`h-full w-full ${whole ? "object-contain p-2" : "object-cover"}`} />}
              </div>
              <div className="px-3.5 py-3">
                <div className="text-[.82rem] text-muted">
                  Module {i + 1}
                  {moduleDone(t, m) ? " · Passed" : ""}
                </div>
                <b className="block font-head text-[1.35rem] leading-[1.1]">{m.title}</b>
                <span className="text-[.9rem] text-muted">{m.short}</span>
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
