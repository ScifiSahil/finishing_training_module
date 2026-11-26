// Knowledge check screens: one question, the result page, and the runner that connects them.
// Props of QuizRunner: questions, passMsg (shown on pass), next { route, label }, onFinish(pct, pass).
import { useEffect, useRef } from "react";
import { PASS_MARK } from "../data";
import { getImage } from "../utils/trainingUtils";
import { useQuiz } from "../utils/useQuiz";
import { useTraining } from "../utils/TrainingContext";
import { Button } from "./Ui";

const OPTION =
  "flex min-h-[56px] w-full items-center gap-3 rounded-lg border-2 border-line bg-surface px-3.5 py-3 text-left font-medium enabled:hover:border-ink disabled:cursor-default";

export function QuizQuestion({ question, index, total, picked, onAnswer, onNext }) {
  const nextRef = useRef(null);
  const img = question.k && getImage(question.k);
  const answered = picked !== null;
  const ok = picked === question.a;

  useEffect(() => {
    if (answered) if (nextRef.current) nextRef.current.focus();
  }, [answered]);

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="mb-2 flex justify-between text-[.92rem] text-muted">
        <span>
          Question {index + 1} of {total}
        </span>
        <span>Need {PASS_MARK}% to pass</span>
      </div>
      <div className="mb-[18px] h-2 overflow-hidden rounded-sm border border-line bg-surface2">
        <i className="block h-full bg-yellow transition-[width] duration-300" style={{ width: `${Math.round((index / total) * 100)}%` }} />
      </div>
      <div className="mb-3.5 font-head text-[clamp(1.5rem,3vw,2rem)] font-bold leading-[1.15]">{question.q}</div>
      {img && (
        <div className="mb-3.5">
          <img src={img.src} alt="Picture for this question" className="mx-auto max-h-[320px] rounded-lg border border-line bg-chip" />
        </div>
      )}
      <div className={`grid gap-2.5 ${question.binary ? "grid-cols-2 phone:grid-cols-1" : ""}`}>
        {question.opts.map((text, j) => {
          let state = "";
          if (answered && j === question.a) state = "!border-green !bg-greenBg";
          else if (answered && j === picked) state = "!border-red !bg-redBg";
          return (
            <button key={text} type="button" disabled={answered} onClick={() => onAnswer(j)} className={`${OPTION} ${state}`}>
              <span className="grid h-[30px] w-[30px] flex-none place-items-center rounded-full border-2 border-current font-head font-bold">
                {String.fromCharCode(65 + j)}
              </span>
              {text}
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {answered && (
          <div className={`mt-3.5 rounded-lg border-l-8 px-3.5 py-3 ${ok ? "border-green bg-greenBg" : "border-red bg-redBg"}`}>
            <b className="block font-head text-[1.3rem]">{ok ? "Correct" : "Not quite"}</b>
            <span>{question.why}</span>
            <div className="mt-3.5">
              <Button ref={nextRef} variant="primary" onClick={onNext}>
                {index + 1 >= total ? "See result" : "Next question"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function QuizResult({ result, missed, passMsg, next, onRetake }) {
  const { actions } = useTraining();
  const { pct, pass, score, total } = result;
  return (
    <div className="mx-auto max-w-[760px]">
      <div className="p-2.5 text-center">
        <div className={`font-head text-[5rem] leading-none ${pass ? "text-green" : "text-red"}`}>{pct}%</div>
        <h3 className="my-1.5 text-[2rem]">{pass ? "Passed" : "Not yet"}</h3>
        <p className="mx-auto mb-3.5">
          {score} of {total} correct.{" "}
          {pass ? passMsg : `You need ${PASS_MARK}% to pass. Review the lessons and try again.`}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button onClick={onRetake}>Retake</Button>
          {next && (
            <Button variant="primary" onClick={() => actions.goRoute(next.route)}>
              {next.label}
            </Button>
          )}
        </div>
      </div>
      {missed.length > 0 && (
        <div className="mx-auto my-4 max-w-[640px] text-left">
          <h4 className="mb-2 text-[1.4rem]">Review what you missed</h4>
          {missed.map((m) => (
            <div key={m.q} className="mb-2.5 rounded-lg border border-line bg-surface p-4 shadow-card">
              <strong>{m.q}</strong>
              <p className="mb-0 mt-[.4em]">
                Right answer: {m.opts[m.a]}. {m.why}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function QuizRunner({ questions, passMsg, next, onFinish }) {
  const quiz = useQuiz(questions, onFinish);
  const topRef = useRef(null);
  const first = useRef(true);

  // Bring the next question or the result into view
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (topRef.current) topRef.current.scrollIntoView({ block: "start" });
  }, [quiz.index, quiz.result]);

  return (
    <div ref={topRef}>
      {quiz.result ? (
        <QuizResult result={quiz.result} missed={quiz.missed} passMsg={passMsg} next={next} onRetake={quiz.retake} />
      ) : (
        <QuizQuestion
          question={quiz.question}
          index={quiz.index}
          total={quiz.total}
          picked={quiz.picked}
          onAnswer={quiz.answer}
          onNext={quiz.next}
        />
      )}
    </div>
  );
}
