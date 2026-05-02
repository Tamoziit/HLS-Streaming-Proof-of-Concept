import { useRef } from "react";
import videojs from "video.js";
import VideoPlayer from "./components/VideoPlayer";

function App() {
  const playerRef = useRef(null);
  const videoLink = "http://localhost:5000/uploads/courses/014acd9a-e4d1-4522-a804-0601cd4878fa/index.m3u8"; // to be fetched from GET request in prod

  const videoPlayerOptions = {
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: videoLink,
        type: "application/x-mpegURL"
      }
    ]
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  }

  return (
    <>
      <div>
        <h1>HLS Proof of Concept</h1>
      </div>

      <VideoPlayer
        options={videoPlayerOptions}
        onReady={handlePlayerReady}
      />
    </>
  )
}

export default App;
