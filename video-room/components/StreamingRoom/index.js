import React, { useState, useEffect, useRef } from "react";
import firebase from "@/utils/firebaseConfig"

const StreamingRoom = ({ roomId }) => {
  const [playbackState, setPlaybackState] = useState({ state: "paused", timestamp: 0 });
  const [currentTime, setCurrentTime] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const dbRef = firebase.database().ref(`rooms/${roomId}`);
  const videoRef = useRef(null);

  useEffect(() => {
    const videoUrl = firebase.database().ref(`rooms/${roomId}/video/url`);
    videoUrl.on('value', (snapshot) => {
    setVideoUrl(snapshot.val());
    });
  },[roomId]);


  useEffect(() => {
    // Set up a listener for the playback state
    dbRef.child("playbackState").on("value", (snapshot) => {
      if (snapshot.exists()) {
        const playbackState = snapshot.val();
        const { state, timestamp } = playbackState;

        const localTime = Date.now();
        const serverTimeRef = firebase.database().ref(".info/serverTimeOffset");

        serverTimeRef.once("value", (snapshot) => {
          const serverTime = snapshot.val() + localTime;
          const bufferTime = 1000; // 1 second buffer

          if (playbackState === "playing" && serverTime - timestamp < bufferTime) {
            setPlaybackState({ state: "paused", timestamp: timestamp });
          } else {
            setPlaybackState(playbackState);
          }
        });
      }
    });

    // Set up a listener for the current time
    dbRef.child("currentTime").on("value", (snapshot) => {
      if (snapshot.exists()) {
        setCurrentTime(snapshot.val());
      }
    });
  }, []);

  const handlePlay = () => {
    const localTime = Date.now();
    const serverTimeRef = firebase.database().ref(".info/serverTimeOffset");

    serverTimeRef.once("value", (snapshot) => {
      const serverTime = snapshot.val() + localTime;
      const bufferTime = 1000; // 1 second buffer

      setPlaybackState({ state: "playing", timestamp: serverTime });
      dbRef.child("playbackState").transaction((currentState) => {
        if (currentState === null || serverTime - currentState.timestamp >= bufferTime) {
          return { state: "playing", timestamp: serverTime };
        } else {
          return null; // Abort transaction
        }
      });

      if (videoRef.current) {
        videoRef.current.play();
      }
    });
  };

  const handlePause = () => {
    const localTime = Date.now();
    const serverTimeRef = firebase.database().ref(".info/serverTimeOffset");

    serverTimeRef.once("value", (snapshot) => {
      const serverTime = snapshot.val() + localTime;
      const bufferTime = 1000; // 1 second buffer

      setPlaybackState({ state: "paused", timestamp: serverTime });
      dbRef.child("playbackState").transaction((currentState) => {
        if (currentState === null || serverTime - currentState.timestamp >= bufferTime) {
          return { state: "paused", timestamp: serverTime };
        } else {
          return null; // Abort transaction
        }
      });

      if (videoRef.current) {
        videoRef.current.pause();
      }
    });
  };

  const handleSeek = (time) => {
    dbRef.child("currentTime").set(time);

    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleEnded = () => {
    const localTime = Date.now();
    const serverTimeRef = firebase.database().ref(".info/serverTimeOffset");

    serverTimeRef.once("value", (snapshot) => {
      const serverTime = snapshot.val() + localTime;
      const bufferTime = 1000; // 1 second buffer

      setPlaybackState({ state: "paused", timestamp: serverTime });
      dbRef.child("playbackState").transaction((currentState) => {
        if (currentState === null || serverTime - currentState.timestamp >= bufferTime) {
          return { state: "paused", timestamp: serverTime };
        } else {
          return null; // Abort transaction
        }
      });

      if (videoRef.current) {
        videoRef.current.pause();
      }
    });
  };
  

  return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <h1>Streaming Room</h1>
        <div style={{ position: "relative", height: "100%", width: "100%" }}>
          <video
            ref={videoRef}
            onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
            style={{
              position: "absolute",
              height: "100%",
              width: "100%",
              objectFit: "cover"
            }}
            src={videoUrl}
            onEnded={handleEnded}
          >
            <source src={videoUrl} type="video/mov" />
          </video>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
          <div>
            {playbackState.state === "paused" ? (
              <button onClick={handlePlay}>Play</button>
            ) : (
              <button onClick={handlePause}>Pause</button>
            )}
          </div>
          {/* <button onClick={handlePlay}>Play</button>
          <button onClick={handlePause}>Pause</button> */}
          <button onClick={() => handleSeek(10)}>Seek to 10 seconds</button>
        </div>
        <div style={{ marginTop: "10px" }}>
          Current Time: {currentTime.toFixed(2)}
        </div>
        <div style={{ marginTop: "10px" }}>
          Playback State: {playbackState.state}
        </div>
      </div>
  );
};

export default StreamingRoom;



