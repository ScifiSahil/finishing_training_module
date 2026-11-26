// Left menu: logo, progress bar, the list of modules, Admin (staff only) and "Switch user".
import { MODULES } from "../data";
import { getImage } from "../utils/trainingUtils";
import { useTraining } from "../utils/TrainingContext";
import { settings } from "../services/userService";
import { certificateUnlocked, finalPassed, moduleDone, overallPercent, seenCount } from "../utils/progress";

const TAPE = "bg-tape";

const NODE = {
  done: "border-yellow bg-yellow text-black",
  part: "border-yellow bg-rail text-railInk",
  none: "border-railMute bg-rail text-railInk",
};

// One row of the left menu: round marker and title
function RailItem({ marker, title, sub, state = "none", current, onClick }) {
  return (
    <li className="relative">
      <button
        type="button"
        onClick={onClick}
        className={`flex min-h-[44px] w-full items-center gap-3 rounded-md py-[7px] pl-0 pr-2 text-left text-railInk hover:bg-rail2 ${current ? "bg-rail2" : ""}`}
      >
        <span
          className={`relative z-[1] grid h-8 w-8 flex-none place-items-center rounded-full border-[3px] font-head text-[.95rem] font-bold ${NODE[state]} ${current ? "shadow-[0_0_0_4px_rgba(245,184,0,.35)]" : ""}`}
        >
          {marker}
        </span>
        <span className="text-[1.05rem] font-medium leading-[1.2]">
          {title}
          {sub && <small className="block text-[.88rem] font-normal text-railMute">{sub}</small>}
        </span>
      </button>
    </li>
  );
}

function Sidebar() {
  const { t, actions } = useTraining();
  const { route } = t;
  const logo = getImage("logo");
  const percent = overallPercent(t);
  const open = t.railOpen;
  const close = () => actions.setRail(false);
  const state = (m) => (moduleDone(t, m) ? "done" : seenCount(t, m) > 0 || t.quiz[m.id] ? "part" : "none");
  const finalOk = finalPassed(t);
  const certOk = certificateUnlocked(t);

  return (
    <>
      {open && <div className="fixed inset-0 z-[55] bg-black/55 desk:hidden" onClick={close} />}
      <aside
        className={`fixed inset-y-0 left-0 z-[60] flex w-[min(86vw,320px)] flex-col bg-rail text-railInk transition-transform desk:sticky desk:top-0 desk:z-auto desk:h-screen desk:w-auto desk:translate-x-0 desk:self-start ${open ? "translate-x-0" : "-translate-x-[102%]"}`}
      >
        <div className="shrink-0 px-[18px] pb-3.5 pt-[18px]">
          <div className="flex items-center gap-3">
            {logo && <img src={logo.src} alt="Kalyani" className="w-[62px] flex-none rounded-md bg-white px-2 py-1" />}
            <span>
              <b className="block font-head text-[1.45rem] leading-[1.05]">Finishing training</b>
              <small className="text-[.88rem] text-railMute">Bharat Forge Aluminum USA</small>
            </span>
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-[.92rem] text-railMute">
              <span>Your progress</span>
              <span>{percent}%</span>
            </div>
            <div className="relative h-3 overflow-hidden rounded-sm bg-rail2">
              <i className={`absolute inset-y-0 left-0 transition-[width] duration-500 ${TAPE}`} style={{ width: `${percent}%` }} />
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <ol className="relative list-none py-1.5 pb-6 pl-[18px] pr-2.5 before:absolute before:bottom-9 before:left-[34px] before:top-[18px] before:w-1 before:bg-rail2 before:content-['']">
            <RailItem marker="⌂" title="Home" current={route.name === "home"} onClick={() => actions.go("home")} />
            {MODULES.map((m, i) => (
              <RailItem
                key={m.id}
                marker={moduleDone(t, m) ? "✓" : i + 1}
                title={m.title}
                sub={m.short}
                state={state(m)}
                current={route.name === "module" && route.id === m.id}
                onClick={() => actions.go("module", { id: m.id, lesson: 0 })}
              />
            ))}
            <li className="my-2 ml-11 h-px bg-rail2" aria-hidden="true" />
            <RailItem marker="▶" title="Video SOPs" sub="All seven stations" current={route.name === "videos"} onClick={() => actions.go("videos")} />
            <RailItem marker={finalOk ? "✓" : "★"} title="Final assessment" state={finalOk ? "done" : "none"} current={route.name === "final"} onClick={() => actions.go("final")} />
            <RailItem marker="P" title="Training Passport" current={route.name === "passport"} onClick={() => actions.go("passport")} />
            <RailItem
              marker={certOk ? "✓" : "C"}
              title="Certificate"
              sub={certOk ? null : "Unlocks after all modules and the final"}
              state={certOk ? "done" : "none"}
              current={route.name === "certificate"}
              onClick={() => actions.go("certificate")}
            />
            {t.role && (
              <RailItem marker="A" title="Admin" sub={t.role === "admin" ? "Content, reports, staff" : "Reports and passport"} current={route.name === "admin"} onClick={() => actions.go("admin")} />
            )}
          </ol>
        </div>

        <div className="shrink-0 border-t border-rail2 px-[18px] pb-[18px] pt-3">
          <div className="mb-2 truncate text-[.92rem] text-railMute">Saved as {t.login}{t.role ? ` (${t.role})` : ""}</div>
          {settings.askEmployeeId && (
            <button type="button" onClick={actions.switchUser} className="min-h-[36px] rounded-md border-2 border-railMute px-3 text-[1rem] font-semibold text-railInk hover:bg-rail2">
              Switch user
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

export default Sidebar;