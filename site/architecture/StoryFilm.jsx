import React, { useRef, useEffect } from "react";
import { Player } from "@remotion/player";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { FILM_SCENES } from "./content";

function Composition() {
  const frame = useCurrentFrame();
  const index = Math.min(6, Math.floor(frame / 300));
  const local = frame - index * 300;
  const scene = FILM_SCENES[index];
  return (
    <AbsoluteFill
      style={{
        background: "#0b1712",
        color: "#eef1e8",
        fontFamily: "Manrope Variable, sans-serif",
        padding: 64,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 22,
          color: "#aec0b3",
        }}
      >
        <span>Mypaisaa / The architecture story</span>
        <span>Proposed system · no live activity</span>
      </div>
      <div
        style={{
          display: "flex",
          gap: 36,
          marginTop: 42,
          alignItems: "center",
        }}
      >
        {FILM_SCENES.map((s, i) => (
          <React.Fragment key={s.number}>
            {i > 0 && (
              <div
                style={{
                  width: 38,
                  height: 2,
                  background: i <= index ? "#c8f36a" : "#32463a",
                }}
              />
            )}
            <div
              style={{
                height: 68,
                width: 68,
                borderRadius: 34,
                display: "grid",
                placeItems: "center",
                border: "1px solid " + (i === index ? "#c8f36a" : "#32463a"),
                background: i === index ? "#c8f36a" : "transparent",
                color: i === index ? "#102014" : "#aec0b3",
                fontSize: 24,
              }}
            >
              {i + 1}
            </div>
          </React.Fragment>
        ))}
      </div>
      <div
        style={{
          marginTop: 50,
          opacity: interpolate(local, [0, 18], [0, 1], {
            extrapolateRight: "clamp",
          }),
          translate: `0 ${interpolate(local, [0, 22], [18, 0], { extrapolateRight: "clamp" })}px`,
        }}
      >
        <h1
          style={{
            fontSize: 62,
            fontWeight: 600,
            letterSpacing: "-.035em",
            margin: "0 0 22px",
            maxWidth: 1050,
            lineHeight: 1.08,
          }}
        >
          {scene.title}
        </h1>
        <p
          style={{
            fontFamily: "Instrument Sans Variable,sans-serif",
            fontSize: 29,
            lineHeight: 1.5,
            color: "#ced9cf",
            maxWidth: 1080,
            margin: 0,
          }}
        >
          {scene.caption}
        </p>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 82,
          left: 64,
          right: 64,
          color: "#c8f36a",
          fontSize: 21,
          lineHeight: 1.5,
        }}
      >
        Evidence retained: {scene.technical}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 64,
          right: 64,
          height: 3,
          background: "#26382d",
        }}
      >
        <div
          style={{
            height: 3,
            width: `${(frame / 2159) * 100}%`,
            background: "#c8f36a",
          }}
        />
      </div>
    </AbsoluteFill>
  );
}

export default function StoryFilm({ motionEnabled }) {
  const player = useRef(null);
  useEffect(() => {
    if (!motionEnabled) player.current?.pause();
  }, [motionEnabled]);
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) player.current?.pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);
  return (
    <div className="film-player">
      <Player
        ref={player}
        component={Composition}
        durationInFrames={2160}
        compositionWidth={1280}
        compositionHeight={720}
        fps={30}
        controls
        autoPlay={false}
        loop={false}
        clickToPlay={false}
        showVolumeControls={false}
        style={{ width: "100%", aspectRatio: "16/9" }}
        acknowledgeRemotionLicense
      />
    </div>
  );
}
