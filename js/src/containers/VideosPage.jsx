// All video SOPs with a picker (voice-over, subtitles, speed, full screen).
import { PageTitle } from "../components/Ui";
import { VideoPlayer } from "../components/VideoPlayer";

export default function VideosPage() {
  return (
    <>
      <PageTitle
        title="Video SOPs"
        intro="One short video for each station, built from the manual. Pick an SOP, press play, and turn on voice-over if you want it read aloud. Each station module also has this video as its last lesson."
      />
      <VideoPlayer picker />
    </>
  );
}
