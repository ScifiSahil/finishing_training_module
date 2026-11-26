// All course content. The bundled file courseData.json is the fallback. When the course is loaded
// from the API (trainingService.loadCourse), applyCourse() replaces these values.
// Every screen reads these exports when it renders, so a re-render shows the new content.
import bundled from "./courseData.json";

export let PASS_MARK = 80;
export let PRODUCTS = [];
export let STATIONS = [];
export let DEFECTS = {};
export let TPM = [];
export let SPOTS = [];
export let FINAL_EXTRA = [];
export let VIDEO_SOPS = [];
export let SELECTORS = {};
export let DECIDER = {};
export let PASSPORT_PHASES = [];
export let MODULES = [];
export let COURSE_VERSION = 0;

// Station modules get the video SOP as their last lesson
const withVideoLesson = (m) => {
  const sop = VIDEO_SOPS.find((v) => v.id === m.id);
  const isStation = STATIONS.some((s) => s.id === m.id);
  if (!sop || !isStation) return m;
  return {
    ...m,
    lessons: [
      ...m.lessons,
      {
        id: "video",
        title: "Watch the video SOP",
        blocks: [
          {
            t: "p",
            text: "Watch the **" + sop.n + "** SOP as a short video. Turn on voice-over, or read the narration script under the video. Drag the slider to replay any step.",
          },
          { t: "vsop", sop: m.id },
        ],
      },
    ],
  };
};

// Keys missing in `course` are taken from the bundled content
function build(course) {
  const pick = (key) => (course[key] !== undefined && course[key] !== null ? course[key] : bundled[key]);
  PASS_MARK = pick("passMark");
  PRODUCTS = pick("products");
  STATIONS = pick("stations");
  DEFECTS = pick("defects");
  TPM = pick("tpm");
  SPOTS = pick("spots");
  FINAL_EXTRA = pick("finalExtra");
  VIDEO_SOPS = pick("videoSops");
  SELECTORS = pick("selectors");
  DECIDER = pick("decider");
  PASSPORT_PHASES = pick("passport");
  MODULES = pick("modules").map(withVideoLesson);
  COURSE_VERSION += 1;
}

build({});

export const BUNDLED_COURSE = bundled;

// Use the content that came from the API (null or empty modules = keep the bundled content)
export function applyCourse(course) {
  if (!course || !Array.isArray(course.modules) || course.modules.length === 0) {
    build({});
    return false;
  }
  build(course);
  return true;
}

export const getModule = (id) => MODULES.find((m) => m.id === id);