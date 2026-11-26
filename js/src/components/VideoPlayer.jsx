// Video SOP player: picture stage with subtitles, controls (play, speed, voice-over, full screen)
// and the narration script. With sopId it shows one SOP (inside a lesson); with picker it lists all.
import { forwardRef, useMemo, useRef } from "react";
import { VIDEO_SOPS } from "../data";
import { formatTime, sopDuration, useVideoPlayer } from "../utils/useVideoPlayer";
import { Button } from "./Ui";
import { DoDontScene, GalleryScene, ListScene, PhotoScene, CurveScene } from "./VideoScenes";

const TAPE =
  "absolute inset-x-0 z-[3] h-[1.3cqw] bg-[repeating-linear-gradient(-45deg,#F5B800_0_1.3cqw,#1F252A_1.3cqw_2.6cqw)]";

const SCENES = {
  photo: PhotoScene,
  list: ListScene,
  dd: DoDontScene,
  gal: GalleryScene,
  curve: CurveScene,
};

export const VideoStage = forwardRef(function VideoStage({ player }, ref) {
  const { sop, scene, shownT, sceneLength, subs, started, actions } = player;
  const Scene = SCENES[scene.k];
  const sopNumber = VIDEO_SOPS.indexOf(sop) + 1;

  return (
    <div
      ref={ref}
      className="relative aspect-video overflow-hidden rounded-[10px] bg-[#1F252A] text-[#F1F3F4] shadow-[0_6px_24px_rgba(20,26,30,.25)] [container-type:inline-size]"
    >
      <div className={`${TAPE} top-0`} />
      <div className={`${TAPE} bottom-0`} />
      <div className="absolute left-[3.5cqw] top-[2.6cqw] z-[4] bg-[#F5B800] px-[1.4cqw] pb-0 pt-[.3cqw] font-head text-[2.2cqw] font-bold text-[#1F252A]">
        SOP {sopNumber}: {sop.n}
      </div>
      {Scene && <Scene key={`${sop.id}-${player.sceneIndex}`} sc={scene} t={shownT} d={sceneLength} />}
      {subs && (
        <div className="absolute inset-x-[6cqw] bottom-[2.4cqw] z-[5] text-center text-[1.85cqw] leading-[1.3]" aria-live="polite">
          <span className="bg-[rgba(10,12,14,.82)] px-[1cqw] py-[.3cqw] [box-decoration-break:clone]">{scene.vo}</span>
        </div>
      )}
      {!started && (
        <button
          type="button"
          aria-label="Play video"
          onClick={actions.bigPlay}
          className="absolute inset-0 z-[6] grid place-items-center border-0 bg-[rgba(20,24,28,.55)] text-white"
        >
          <b className="grid h-[11cqw] w-[11cqw] place-items-center rounded-full bg-[#F5B800] pl-[.8cqw] text-[5cqw] text-[#1F252A]">▶</b>
        </button>
      )}
    </div>
  );
});

const TOGGLE = "aria-pressed:border-black aria-pressed:bg-black aria-pressed:text-yellow";

export function VideoControls({ player, onFullscreen }) {
  const { actions, playing, elapsed, total, speed, subs, voice, auto } = player;
  return (
    <>
      <div className="my-3 flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={actions.togglePlay}>
          {playing ? "Pause" : "Play"}
        </Button>
        <Button aria-label="Previous scene" onClick={actions.prev}>Prev</Button>
        <Button aria-label="Next scene" onClick={actions.next}>Next</Button>
        <input
          type="range"
          min={0}
          max={1000}
          value={Math.round((elapsed / total) * 1000)}
          onChange={(e) => actions.scrub(Number(e.target.value) / 1000)}
          aria-label="Position in this SOP"
          className="h-11 min-w-[180px] flex-1 accent-yellowDeep"
        />
        <span className="min-w-24 text-center tabular-nums text-muted">
          {formatTime(elapsed)} / {formatTime(total)}
        </span>
        <select
          aria-label="Speed"
          value={speed}
          onChange={(e) => actions.setSpeed(Number(e.target.value))}
          className="min-h-[44px] rounded-md border-2 border-ink bg-surface px-2 font-semibold text-ink"
        >
          <option value={1}>1x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={0.75}>0.75x</option>
        </select>
        <Button className={TOGGLE} aria-pressed={subs} onClick={actions.toggleSubs}>Subtitles</Button>
        <Button className={TOGGLE} aria-pressed={voice} onClick={actions.toggleVoice}>Voice-over</Button>
        <Button className={TOGGLE} aria-pressed={auto} onClick={actions.toggleAuto}>Auto-play next</Button>
        <Button onClick={onFullscreen}>Full screen</Button>
      </div>
      <p className="mt-2.5 text-[.9rem] text-muted">
        Voice-over uses your device’s built-in speech, so the voice differs by device.
        {!player.voiceSupported && " This browser cannot read aloud. Try Chrome or Edge."}
        {player.voiceSupported && !player.voiceName && " No voice found yet. Install an English voice in Windows Settings, Time and language, Speech."}
        {player.voiceSupported && player.voiceName && ` Voice: ${player.voiceName}.`}
        {player.voiceSupported && player.voiceName && !player.voiceLocal && " This voice needs internet. For offline use, add an English voice in Windows Settings, Time and language, Speech."}
        {voice && " Turn the PC volume up and keep this tab open while it plays."}
      </p>
    </>
  );
}

export function VideoScript({ player }) {
  const { sop, sopIndex, sceneIndex, actions } = player;
  return (
    <section className="mt-[18px] overflow-hidden rounded-[10px] border border-line bg-surface">
      <h3 className="bg-rail px-4 py-3 font-head text-[1.5rem] text-railInk">
        Narration script: SOP {sopIndex + 1} {sop.n}
      </h3>
      <div>
        {sop.scenes.map((sc, i) => (
          <button
            key={sc.cap}
            type="button"
            aria-current={i === sceneIndex}
            onClick={() => actions.playScene(i)}
            className="grid w-full grid-cols-[44px_minmax(0,1fr)] gap-3 border-0 border-t border-line bg-transparent px-4 py-3 text-left hover:bg-surface2 aria-[current=true]:bg-[color-mix(in_srgb,var(--yellow)_22%,var(--surface))]"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-black font-head text-[1.4rem] font-bold text-yellow">
              {i + 1}
            </span>
            <span>
              <b className="block">{sc.cap}</b>
              <span className="text-muted">{sc.vo}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function VideoPlayer({ sopId, picker = false }) {
  const sops = useMemo(
    () => (picker ? VIDEO_SOPS : [VIDEO_SOPS.find((v) => v.id === sopId) || VIDEO_SOPS[0]]),
    [picker, sopId]
  );
  const player = useVideoPlayer(sops, picker);
  const stageRef = useRef(null);
  const number = VIDEO_SOPS.indexOf(player.sop) + 1;

  const fullscreen = () => {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (stageRef.current && stageRef.current.requestFullscreen) stageRef.current.requestFullscreen();
    } catch {
      // Full screen can be blocked by the browser
    }
  };

  return (
    <div>
      {picker && (
        <div className="mb-3 flex flex-wrap gap-2">
          {sops.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-current={i === player.sopIndex}
              onClick={() => player.actions.loadSop(i)}
              className="min-h-[44px] rounded-full border-2 border-line bg-surface px-3.5 font-semibold text-ink aria-[current=true]:border-black aria-[current=true]:bg-black aria-[current=true]:text-yellow"
            >
              {i + 1}. {s.n}
              {player.seen[i] ? " ✓" : ""}
            </button>
          ))}
        </div>
      )}
      <h3 className="mb-0.5 text-[1.7rem] leading-[1.1]">
        SOP {number}: {player.sop.n}
      </h3>
      <p>
        {player.sop.d} · {player.sop.scenes.length} scenes · {formatTime(sopDuration(player.sop))}
      </p>
      <VideoStage ref={stageRef} player={player} />
      <VideoControls player={player} onFullscreen={fullscreen} />
      <VideoScript player={player} />
    </div>
  );
}