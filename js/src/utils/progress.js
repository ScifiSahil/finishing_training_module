// Progress calculations. They take the trainee data (the "t" object from useTraining)
// and return numbers or true/false.
import { MODULES, PASS_MARK } from "../data";

export const seenCount = (t, m) => (t.seen[m.id] || []).length;

export const quizPassed = (t, m) => {
  const q = t.quiz[m.id];
  return !!q && q.best >= PASS_MARK;
};

export const moduleDone = (t, m) =>
  seenCount(t, m) >= m.lessons.length && quizPassed(t, m);

// Half the module is lessons viewed, half is the passed knowledge check
export const moduleFraction = (t, m) =>
  (Math.min(seenCount(t, m), m.lessons.length) / m.lessons.length) * 0.5 +
  (quizPassed(t, m) ? 0.5 : 0);

export const overallPercent = (t) => {
  const total = MODULES.reduce((a, m) => a + moduleFraction(t, m), 0);
  return Math.round((total / MODULES.length) * 100);
};

export const finalPassed = (t) => !!t.final && t.final.best >= PASS_MARK;

export const allModulesDone = (t) => MODULES.every((m) => moduleDone(t, m));

export const certificateUnlocked = (t) => finalPassed(t) && allModulesDone(t);

// The next thing the trainee should open, as a route: { name, id, lesson }
export const nextTarget = (t) => {
  for (const m of MODULES) {
    if (moduleDone(t, m)) continue;
    const seen = t.seen[m.id] || [];
    let i = 0;
    while (seen.includes(i) && i < m.lessons.length) i++;
    return { name: "module", id: m.id, lesson: i >= m.lessons.length ? "quiz" : i };
  }
  return { name: finalPassed(t) ? "certificate" : "final" };
};
