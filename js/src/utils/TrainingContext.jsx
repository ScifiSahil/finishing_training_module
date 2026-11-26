// Shared app state: who is logged in, which page is open, the trainee's progress, theme and text size.
// Progress is stored on the server (CONTACT collection API, see services/trainingService.js).
// The screen changes at once; the save runs in the background and shows a message if it fails.
import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { PASS_MARK, COURSE_VERSION, applyCourse } from "../data";
import { allModulesDone } from "./progress";
import userService from "../services/userService";
import { THEME_IDS } from "./themes";
import * as service from "../services/trainingService";

const PREFS_KEY = "finishing-training-prefs";
const SIZES = ["m", "l", "xl"];
const next = (list, value) => list[(list.indexOf(value) + 1) % list.length];

// Theme and text size stay in this browser
function loadPrefs() {
  try {
    const p = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}");
    return { theme: THEME_IDS.indexOf(p.theme) >= 0 ? p.theme : "auto", size: SIZES.indexOf(p.size) >= 0 ? p.size : "m" };
  } catch (e) {
    return { theme: "auto", size: "m" };
  }
}

const emptyProgress = () => ({ name: "", seen: {}, quiz: {}, final: null, passport: {}, certificate: null });

const initialState = () => ({
  ...loadPrefs(),
  ...emptyProgress(),
  login: userService.getLogin(),   // "" = ask the trainee for the Employee ID
  role: "",                        // "admin", "trainer" or ""
  loading: false,
  loadError: "",
  courseVersion: COURSE_VERSION,
  route: { name: "home" },
  railOpen: false,
  lightbox: null,
  toast: null,
});

export function reducer(state, a) {
  switch (a.type) {
    case "go":
      return { ...state, route: a.route, railOpen: false };
    case "setLogin":
      return { ...state, ...emptyProgress(), login: a.login, role: "", route: { name: "home" } };
    case "loading":
      return { ...state, loading: true, loadError: "" };
    case "loadFailed":
      return { ...state, loading: false, loadError: a.message };
    case "hydrate":
      return { ...state, ...a.progress, role: a.role, loading: false, loadError: "", courseVersion: COURSE_VERSION };
    case "courseReloaded":
      return { ...state, courseVersion: COURSE_VERSION };
    case "setName":
      return { ...state, name: a.name };
    case "setTheme":
      return THEME_IDS.indexOf(a.id) >= 0 ? { ...state, theme: a.id } : state;
    case "cycleTheme":
      return { ...state, theme: next(THEME_IDS, state.theme) };
    case "cycleSize":
      return { ...state, size: next(SIZES, state.size) };
    case "markSeen": {
      const list = state.seen[a.moduleId] || [];
      if (list.includes(a.index)) return state;
      return { ...state, seen: { ...state.seen, [a.moduleId]: [...list, a.index] } };
    }
    case "recordQuiz": {
      const cur = state.quiz[a.moduleId] || { best: 0, attempts: 0 };
      const rec = { best: Math.max(cur.best, a.result.pct), attempts: cur.attempts + 1, last: a.result.pct };
      return { ...state, quiz: { ...state.quiz, [a.moduleId]: rec } };
    }
    case "recordFinal": {
      const r = a.result;
      const cur = state.final || { best: 0, attempts: 0 };
      const final = { best: Math.max(cur.best, r.pct), attempts: cur.attempts + 1, date: r.pass ? a.at : cur.date };
      let { passport, certificate } = state;
      // Passing the final with every module done completes passport phase 1 and gives the certificate
      if (r.pass && r.pct >= PASS_MARK && allModulesDone(state)) {
        const p1 = passport.p1 || {};
        passport = { ...passport, p1: { ...p1, done: true, date: p1.date || a.at.slice(0, 10) } };
        certificate = certificate
          ? { ...certificate, score: Math.max(certificate.score, final.best) }
          : { certNo: a.certNo, name: state.name, score: final.best, issuedAt: a.at };
      }
      return { ...state, final, passport, certificate };
    }
    case "updatePassport":
      return { ...state, passport: { ...state.passport, [a.id]: { ...state.passport[a.id], ...a.patch } } };
    case "setRefresh":
      return { ...state, passport: { ...state.passport, refresh: { ...state.passport.refresh, [a.day]: a.value } } };
    case "setRail":
      return { ...state, railOpen: a.open };
    case "openLightbox":
      return { ...state, lightbox: a.box };
    case "closeLightbox":
      return { ...state, lightbox: null };
    case "showToast":
      return { ...state, toast: { id: a.id, message: a.message } };
    case "clearToast":
      return { ...state, toast: null };
    default:
      return state;
  }
}

const makeCertNo = (at) => `BFAL-${at.slice(0, 4)}-${service.makeId().slice(0, 6).toUpperCase()}`;

const TrainingContext = createContext(null);

export function TrainingProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const ref = useRef(state);
  ref.current = state;
  const savedName = useRef("");

  const actions = useMemo(() => {
    // Runs an action on the screen state at once and returns the new state
    const apply = (act) => {
      const nextState = reducer(ref.current, act);
      ref.current = nextState;
      dispatch(act);
      return nextState;
    };
    const toast = (message) => dispatch({ type: "showToast", message, id: Date.now() });
    // Background save: a failure shows a message and keeps the app usable
    const save = (promise) => promise.catch((e) => toast(`Could not save to the server: ${e.message}`));
    const login = () => ref.current.login;

    // Loads course content, progress and role for a login. A part that fails is reported in the
    // banner, and the rest of the app keeps working with what did load.
    const bootstrap = async (who, name) => {
      dispatch({ type: "loading" });
      const problems = [];
      const attempt = async (work, fallback) => {
        try {
          return await work();
        } catch (e) {
          if (problems.indexOf(e.message) < 0) problems.push(e.message);
          return fallback;
        }
      };
      await attempt(() => service.ensureTrainee(who, name));
      const [course, progress, role] = await Promise.all([
        attempt(() => service.loadCourse(), null),
        attempt(() => service.loadProgress(who), emptyProgress()),
        attempt(() => service.getRole(who), ""),
      ]);
      applyCourse(course);
      savedName.current = progress.name;
      dispatch({ type: "hydrate", progress, role });
      if (problems.length) dispatch({ type: "loadFailed", message: problems.join(" | ") });
    };

    return {
      bootstrap,
      startSession: (who, name) => {
        const clean = userService.setLogin(who);
        if (!clean) return;
        apply({ type: "setLogin", login: clean });
        bootstrap(clean, name);
      },
      switchUser: () => {
        userService.clear();
        savedName.current = "";
        apply({ type: "setLogin", login: "" });
      },
      reloadCourse: async () => {
        applyCourse(await service.loadCourse());
        dispatch({ type: "courseReloaded" });
      },
      go: (name, params) => dispatch({ type: "go", route: { name, ...(params || {}) } }),
      goRoute: (route) => dispatch({ type: "go", route }),
      setName: (name) => dispatch({ type: "setName", name }),
      setTheme: (id) => dispatch({ type: "setTheme", id }),
      cycleTheme: () => dispatch({ type: "cycleTheme" }),
      cycleSize: () => dispatch({ type: "cycleSize" }),
      markSeen: (moduleId, index) => {
        if ((ref.current.seen[moduleId] || []).includes(index)) return;
        apply({ type: "markSeen", moduleId, index });
        save(service.markLessonSeen(login(), moduleId, index));
      },
      // result = { pct, pass, correct, total, missed }
      recordQuiz: (moduleId, result) => {
        apply({ type: "recordQuiz", moduleId, result });
        save(service.saveAttempt(login(), "module", moduleId, result));
      },
      recordFinal: (result) => {
        const at = new Date().toISOString();
        const before = ref.current;
        const after = apply({ type: "recordFinal", result, at, certNo: makeCertNo(at) });
        save(service.saveAttempt(login(), "final", "", result));
        if (after.certificate && (!before.certificate || after.certificate.score > before.certificate.score)) {
          const c = after.certificate;
          save(service.issueCertificate(login(), c.name, c.score, c.certNo));
          save(service.savePassport(login(), "p1", { done: true, date: after.passport.p1.date }, "system"));
        }
      },
      updatePassport: (id, patch) => {
        apply({ type: "updatePassport", id, patch });
        save(service.savePassport(login(), id, patch, login()));
      },
      setRefresh: (day, value) => {
        apply({ type: "setRefresh", day, value });
        save(service.savePassport(login(), `refresh_${day}`, { done: value }, login()));
      },
      setRail: (open) => dispatch({ type: "setRail", open }),
      openLightbox: (key, cap) => dispatch({ type: "openLightbox", box: { key, cap } }),
      closeLightbox: () => dispatch({ type: "closeLightbox" }),
      showToast: toast,
      clearToast: () => dispatch({ type: "clearToast" }),
      saveNameNow: (name) => {
        savedName.current = name;
        return save(service.saveName(login(), name));
      },
      isNameSaved: (name) => savedName.current === name,
    };
  }, []);

  // A returning trainee is loaded when the app opens
  useEffect(() => {
    if (ref.current.login) actions.bootstrap(ref.current.login);
  }, []);

  // The typed name is saved shortly after the trainee stops typing
  useEffect(() => {
    if (!state.login || state.loading || !state.name || actions.isNameSaved(state.name)) return undefined;
    const id = setTimeout(() => actions.saveNameNow(state.name), 800);
    return () => clearTimeout(id);
  }, [state.name, state.login, state.loading]);

  // Theme and text size are kept in this browser
  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify({ theme: state.theme, size: state.size }));
    } catch (e) {
      // storage blocked
    }
  }, [state.theme, state.size]);

  const value = useMemo(() => ({ t: state, actions }), [state, actions]);
  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>;
}

// Returns { t, actions }: t is the state, actions are the functions that change it
export function useTraining() {
  return useContext(TrainingContext);
}