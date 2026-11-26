// Video SOP engine: time helpers plus the playback hook (play/pause, scene jumps,
// speech for the voice-over, auto-play of the next SOP).
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

// ---------- time and animation helpers ----------
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
// Progress (0-1) of t between a and b
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const easeOut = (x) => 1 - Math.pow(1 - x, 3);
export const easeInOut = (x) =>
  x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export const lerp = (a, b, x) => a + (b - a) * x;

// Scene length in seconds: set by the narration length (about 2.5 words per second)
export const sceneDuration = (sc) =>
  sc.dur || Math.max(5, 1.5 + sc.vo.split(/\s+/).length / 2.5);

export const sopDuration = (sop) =>
  sop.scenes.reduce((sum, sc) => sum + sceneDuration(sc), 0);

// Seconds from the start of the SOP to the start of scene i
export const sceneStart = (sop, i) =>
  sop.scenes.slice(0, i).reduce((sum, sc) => sum + sceneDuration(sc), 0);

export const formatTime = (s) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// Fade and slide in an element at time `at` (inline style, values change every frame)
export const revealStyle = (t, at, dx = 0, dy = 18) => {
  const p = easeOut(seg(t, at, at + 0.5));
  return {
    opacity: p,
    transform: `translate(${lerp(dx, 0, p)}cqw,${lerp(dy, 0, p) / 10}cqw)`,
  };
};

// Slow zoom and drift over the length of a scene
export const kenBurnsStyle = (t, d, z0 = 1.02, z1 = 1.12, px = -1.5) => {
  const p = easeInOut(clamp(t / d));
  return { transform: `scale(${lerp(z0, z1, p)}) translateX(${lerp(0, px, p)}cqw)` };
};

// ---------- playback hook ----------
// ---------- voice-over (the browser's built-in speech) ----------
const speechOK = () => typeof window !== "undefined" && "speechSynthesis" in window;

// Picks the voice. Voices installed on the PC (localService) come first because they work
// without internet. Online voices (for example "Google ...") are used only when nothing else exists.
function pickVoice() {
  if (!speechOK()) return null;
  const voices = window.speechSynthesis.getVoices();
  const english = voices.filter((v) => /^en/i.test(v.lang));
  const local = english.filter((v) => v.localService);
  const us = (list) => list.find((v) => /^en[-_]US/i.test(v.lang));
  return (
    us(local) || local[0] ||
    us(english) || english[0] ||
    voices.find((v) => v.localService) || voices[0] || null
  );
}

let speakToken = 0; // lets a late speak() be dropped when the scene has changed
let speaking = false; // true while the voice is really talking
let keep = null; // keeps the utterance alive (the browser can otherwise drop it)

const stopSpeech = () => {
  speakToken += 1;
  speaking = false;
  try {
    window.speechSynthesis.cancel();
  } catch (e) {
    // Speech is not available in every browser
  }
};

const speak = (text, enabled) => {
  stopSpeech();
  if (!enabled || !text || !speechOK()) return;
  const token = speakToken;
  const synth = window.speechSynthesis;
  const u = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) {
    u.voice = voice;
    u.lang = voice.lang;
  } else {
    u.lang = "en-US";
  }
  u.rate = 0.95;
  u.onstart = () => {
    if (token === speakToken) speaking = true;
  };
  u.onend = () => {
    if (token === speakToken) speaking = false;
  };
  u.onerror = u.onend;
  keep = u;
  // Chrome and Edge drop speech that starts right after cancel(): wait a moment first
  setTimeout(() => {
    if (token !== speakToken) return;
    try {
      synth.resume();
      synth.speak(u);
    } catch (e) {
      // ignore
    }
  }, 150);
};

export function useVideoPlayer(sops, startWithAuto) {
  const st = useRef({ sop: 0, scene: 0, t: 0, playing: false, voice: true, subs: true, speed: 1, auto: startWithAuto });
  const seen = useRef({});
  const last = useRef(0);
  const [, bump] = useReducer((x) => x + 1, 0);
  const [voiceName, setVoiceName] = useState("");
  const [voiceLocal, setVoiceLocal] = useState(true);

  // The list of installed voices can load a moment after the page opens
  useEffect(() => {
    if (!speechOK()) return undefined;
    const update = () => {
      const v = pickVoice();
      setVoiceName(v ? v.name : "");
      setVoiceLocal(v ? v.localService !== false : true);
    };
    update();
    window.speechSynthesis.addEventListener("voiceschanged", update);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", update);
  }, []);

  const sceneOf = (si, i) => sops[si].scenes[i];

  const enter = useCallback((si, i, t = 0, doSpeak = true) => {
    const S = st.current;
    S.sop = si;
    S.scene = i;
    S.t = t;
    if (doSpeak && S.playing) speak(sops[si].scenes[i].vo, S.voice);
    bump();
  }, [sops]);

  // Animation loop
  useEffect(() => {
    let raf;
    const loop = (now) => {
      const S = st.current;
      if (S.playing) {
        S.t += Math.min(0.1, (now - last.current) / 1000) * S.speed;
        const sop = sops[S.sop];
        const d = sceneDuration(sop.scenes[S.scene]);
        // With voice-over on, let the voice finish its sentence before the scene changes
        const waitForVoice = S.voice && speaking && S.t < d + 12;
        if (S.t >= d && !waitForVoice) {
          if (S.scene < sop.scenes.length - 1) {
            enter(S.sop, S.scene + 1, 0);
          } else {
            seen.current[S.sop] = 1;
            if (S.auto && S.sop < sops.length - 1) enter(S.sop + 1, 0, 0);
            else {
              S.playing = false;
              S.t = d;
              stopSpeech();
            }
          }
        }
        bump();
      }
      last.current = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame((t0) => {
      last.current = t0;
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      stopSpeech();
    };
  }, [sops, enter]);

  const S = st.current;
  const sop = sops[S.sop];
  const scene = sop.scenes[S.scene];
  const d = sceneDuration(scene);
  const total = sopDuration(sop);
  const elapsed = Math.min(
    total,
    sop.scenes.slice(0, S.scene).reduce((a, x) => a + sceneDuration(x), 0) + S.t
  );

  const actions = {
    togglePlay: () => {
      S.playing = !S.playing;
      if (S.playing) {
        if (S.t >= d - 0.05) enter(S.sop, 0, 0);
        speak(sceneOf(S.sop, S.scene).vo, S.voice);
      } else stopSpeech();
      bump();
    },
    bigPlay: () => {
      S.playing = true;
      enter(S.sop, S.scene, S.t);
    },
    prev: () => enter(S.sop, Math.max(0, S.scene - 1), 0),
    next: () => enter(S.sop, Math.min(sop.scenes.length - 1, S.scene + 1), 0),
    // Jump to a scene from the script list and start playing
    playScene: (i) => {
      S.playing = true;
      enter(S.sop, i, 0);
    },
    // Move the slider: fraction 0-1 of the whole SOP
    scrub: (fraction) => {
      stopSpeech();
      const sec = fraction * total;
      let a = 0;
      for (let i = 0; i < sop.scenes.length; i++) {
        const len = sceneDuration(sop.scenes[i]);
        if (sec < a + len || i === sop.scenes.length - 1) {
          enter(S.sop, i, clamp(sec - a, 0, len), false);
          return;
        }
        a += len;
      }
    },
    setSpeed: (v) => {
      S.speed = v;
      bump();
    },
    toggleVoice: () => {
      S.voice = !S.voice;
      if (S.voice && S.playing) speak(scene.vo, true);
      else stopSpeech();
      bump();
    },
    toggleSubs: () => {
      S.subs = !S.subs;
      bump();
    },
    toggleAuto: () => {
      S.auto = !S.auto;
      bump();
    },
    // Choose another SOP in picker mode
    loadSop: (si) => {
      S.playing = false;
      stopSpeech();
      enter(si, 0, 0, false);
    },
  };

  return {
    sopIndex: S.sop,
    sceneIndex: S.scene,
    sop,
    scene,
    // Paused at the start of a scene: show a mid-animation still so the picture is not empty
    shownT: !S.playing && S.t === 0 ? Math.min(2.8, d - 0.1) : S.t,
    sceneLength: d,
    elapsed,
    total,
    playing: S.playing,
    started: S.playing || S.t > 0.01 || S.scene > 0,
    voice: S.voice,
    voiceSupported: speechOK(),
    voiceName,
    voiceLocal,
    subs: S.subs,
    auto: S.auto,
    speed: S.speed,
    seen: seen.current,
    actions,
  };
}