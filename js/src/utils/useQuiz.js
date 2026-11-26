// Quiz logic: prepares the questions (shuffled answers) and runs one attempt:
// current question, score, missed questions and the final result.
import { useState } from "react";
import { PASS_MARK } from "../data";
import { shuffle } from "./trainingUtils";

// True/false questions keep their order; other answers are shuffled
function prepareQuestions(questions) {
  return questions.map((q) => {
    const binary = q.o.length === 2;
    const order = binary ? q.o.map((_, j) => j) : shuffle(q.o.map((_, j) => j));
    return {
      q: q.q,
      k: q.k,
      why: q.why,
      binary,
      opts: order.map((j) => q.o[j]),
      a: order.indexOf(q.a),
    };
  });
}

export function useQuiz(questions, onFinish) {
  const [qs, setQs] = useState(() => prepareQuestions(questions));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [missed, setMissed] = useState([]);
  const [result, setResult] = useState(null);

  const question = qs[index];

  const answer = (j) => {
    if (picked !== null) return;
    setPicked(j);
    if (j === question.a) setScore(score + 1);
    else setMissed([...missed, question]);
  };

  const next = () => {
    if (index + 1 < qs.length) {
      setIndex(index + 1);
      setPicked(null);
      return;
    }
    const pct = Math.round((score / qs.length) * 100);
    const pass = pct >= PASS_MARK;
    setResult({ pct, pass, score, total: qs.length });
    if (onFinish) onFinish(pct, pass);
  };

  const retake = () => {
    setQs(prepareQuestions(questions));
    setIndex(0);
    setScore(0);
    setPicked(null);
    setMissed([]);
    setResult(null);
  };

  return { question, index, total: qs.length, picked, missed, result, answer, next, retake };
}
