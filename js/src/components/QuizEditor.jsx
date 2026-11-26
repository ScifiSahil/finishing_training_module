// Edit quiz questions with normal fields: question, 2 to 6 answers, the right answer, explanation.
import { Button } from "./Ui";

const INPUT = "w-full rounded-md border border-line bg-surface2 px-2.5 py-2 text-base text-ink";

export default function QuizEditor({ quiz, onChange }) {
  const setQ = (i, patch) => onChange(quiz.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  const setOpt = (i, k, text) => setQ(i, { o: quiz[i].o.map((o, j) => (j === k ? text : o)) });
  const addOpt = (i) => quiz[i].o.length < 6 && setQ(i, { o: [...quiz[i].o, ""] });
  const removeOpt = (i, k) => {
    if (quiz[i].o.length <= 2) return;
    const a = quiz[i].a;
    setQ(i, { o: quiz[i].o.filter((_, j) => j !== k), a: a === k ? 0 : a > k ? a - 1 : a });
  };
  const move = (i, d) => {
    const j = i + d;
    if (j < 0 || j >= quiz.length) return;
    const copy = quiz.slice();
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };

  return (
    <div>
      {quiz.map((q, i) => (
        <div key={i} className="mb-3 rounded-lg border border-line bg-surface p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <b className="font-head text-[1.2rem]">Question {i + 1}</b>
            <span className="flex gap-1.5">
              <Button size="sm" onClick={() => move(i, -1)} disabled={i === 0}>Up</Button>
              <Button size="sm" onClick={() => move(i, 1)} disabled={i === quiz.length - 1}>Down</Button>
              <Button size="sm" onClick={() => onChange(quiz.filter((_, j) => j !== i))} disabled={quiz.length <= 1}>Delete</Button>
            </span>
          </div>
          <textarea rows={2} value={q.q} onChange={(e) => setQ(i, { q: e.target.value })} placeholder="Question" className={INPUT} />
          <p className="mb-1 mt-2 text-[.85rem] text-muted">Answers. Select the round button of the right one.</p>
          {q.o.map((o, k) => (
            <div key={k} className="mb-1.5 flex items-center gap-2">
              <input type="radio" name={`right-${i}`} checked={q.a === k} onChange={() => setQ(i, { a: k })} aria-label={`Answer ${k + 1} is right`} className="h-5 w-5 accent-green" />
              <input type="text" value={o} onChange={(e) => setOpt(i, k, e.target.value)} className={INPUT} />
              <Button size="sm" onClick={() => removeOpt(i, k)} disabled={q.o.length <= 2}>X</Button>
            </div>
          ))}
          <Button size="sm" onClick={() => addOpt(i)} disabled={q.o.length >= 6}>Add answer</Button>
          <textarea rows={2} value={q.why} onChange={(e) => setQ(i, { why: e.target.value })} placeholder="Explanation shown after answering" className={`${INPUT} mt-2`} />
        </div>
      ))}
      <Button onClick={() => onChange([...quiz, { q: "", o: ["", ""], a: 0, why: "" }])}>Add question</Button>
    </div>
  );
}
