// One module: lesson buttons, the lesson content, and the knowledge check.
import { useEffect } from "react";
import { MODULES, PASS_MARK, getModule } from "../data";
import { quizPassed } from "../utils/progress";
import { useTraining } from "../utils/TrainingContext";
import { BlockList } from "../components/blocks/BlockList";
import { Button, Callout, Lesson, PageTitleOnly } from "../components/Ui";
import { QuizRunner } from "../components/Quiz";

const PAGER =
  "inline-flex min-h-[44px] items-center gap-2 rounded-md border-2 border-line bg-surface px-3.5 text-[.92rem] font-semibold text-ink " +
  "aria-[current=step]:border-black aria-[current=step]:bg-yellow aria-[current=step]:text-black";

export default function ModulePage() {
  const { t, actions } = useTraining();
  const { id, lesson } = t.route;
  const mod = getModule(id);
  const n = mod ? mod.lessons.length : 0;
  const isQuiz = lesson === "quiz";
  const index = isQuiz ? n : Math.min(Math.max(parseInt(lesson, 10) || 0, 0), Math.max(n - 1, 0));

  // Opening a lesson counts it as seen
  useEffect(() => {
    if (mod && !isQuiz) actions.markSeen(mod.id, index);
  }, [id, isQuiz, index]);

  if (!mod) return null;

  const mi = MODULES.indexOf(mod);
  const prevMod = MODULES[mi - 1];
  const nextMod = MODULES[mi + 1];
  const seen = t.seen[mod.id] || [];
  const unread = mod.lessons.filter((_, j) => !seen.includes(j)).length;
  const openLesson = (j) => actions.go("module", { id: mod.id, lesson: j });

  const back = index > 0
    ? { label: "Previous lesson", go: () => openLesson(index - 1) }
    : prevMod && { label: "Previous module", go: () => actions.go("module", { id: prevMod.id, lesson: 0 }) };
  const fwd = index < n - 1
    ? { label: "Next lesson", go: () => openLesson(index + 1) }
    : { label: "Take the knowledge check", go: () => openLesson("quiz") };
  const afterQuiz = nextMod
    ? { route: { name: "module", id: nextMod.id, lesson: 0 }, label: `Next module: ${nextMod.title}` }
    : { route: { name: "final" }, label: "Go to the final assessment" };

  const current = mod.lessons[index];

  return (
    <>
      <PageTitleOnly title={mod.title} />
      <div className="mb-1.5 text-[.88rem] text-muted">
        <button type="button" className="text-blue underline" onClick={() => actions.go("home")}>Home</button> / Module {mi + 1}
      </div>
      <div className="mb-3">
        <h1 className="font-head text-[clamp(2rem,4.4vw,3rem)] font-bold leading-[1.1]">{mod.title}</h1>
        <p className="mt-[.3em] text-muted">{mod.short}</p>
      </div>

      <nav aria-label="Lessons in this module" className="mb-[18px] mt-3.5 flex flex-wrap gap-1.5">
        {mod.lessons.map((l, j) => (
          <button
            key={l.id}
            type="button"
            onClick={() => openLesson(j)}
            aria-current={j === index && !isQuiz ? "step" : undefined}
            className={`${PAGER} ${seen.includes(j) ? "!border-green aria-[current=step]:!border-black" : ""}`}
          >
            <span className="font-head text-[1.05rem]">{j + 1}{seen.includes(j) ? " ✓" : ""}</span>
            {l.title}
          </button>
        ))}
        <button
          type="button"
          onClick={() => openLesson("quiz")}
          aria-current={isQuiz ? "step" : undefined}
          className={`${PAGER} ${quizPassed(t, mod) ? "!border-green aria-[current=step]:!border-black" : ""}`}
        >
          <span className="font-head text-[1.05rem]">Check{quizPassed(t, mod) ? " ✓" : ""}</span>
          Knowledge check
        </button>
      </nav>

      <Lesson>
        {isQuiz ? (
          <>
            <h2 className="mb-3.5 font-head text-[clamp(1.7rem,3.4vw,2.3rem)] font-bold leading-[1.1]">Knowledge check: {mod.title}</h2>
            {unread > 0 && (
              <Callout
                kind="warn"
                className="mb-4"
                title="Lessons still unread"
                text={`You have ${unread} lesson${unread > 1 ? "s" : ""} left. You can take the check now, but this module only completes when you have viewed every lesson and passed ${PASS_MARK}%.`}
              />
            )}
            <QuizRunner
              key={mod.id}
              questions={mod.quiz}
              passMsg="Module complete once every lesson is viewed."
              next={afterQuiz}
              onFinish={(result) => actions.recordQuiz(mod.id, result)}
            />
          </>
        ) : (
          <>
            <h2 className="mb-3.5 font-head text-[clamp(1.7rem,3.4vw,2.3rem)] font-bold leading-[1.1]">{current.title}</h2>
            <BlockList key={`${mod.id}-${index}`} blocks={current.blocks} />
            <div className="mt-5 flex flex-wrap justify-between gap-2.5">
              {back ? <Button onClick={back.go}>{back.label}</Button> : <span />}
              <Button variant="primary" onClick={fwd.go}>{fwd.label}</Button>
            </div>
          </>
        )}
      </Lesson>
    </>
  );
}