import React, { useState, useEffect, useRef } from "react";
import firebase from "@/utils/firebaseConfig"


const StreamingRoom = ({ roomId }) => {
  const [playbackState, setPlaybackState] = useState("paused");
  const [currentTime, setCurrentTime] = useState(0);
  const dbRef = firebase.database().ref(`rooms/${roomId}`);
  const [videoUrl, setVideoUrl] = useState('');
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
        const playbackState = snapshot.val().state;
        const timestamp = snapshot.val().timestamp;

        const localTime = Date.now();
        const serverTimeRef = firebase.database().ref(".info/serverTimeOffset");

        serverTimeRef.once("value", (snapshot) => {
          const serverTime = snapshot.val() + localTime;
          const bufferTime = 1000; // 1 second buffer

          if (playbackState === "playing" && serverTime - timestamp < bufferTime) {
            setPlaybackState("paused");
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

      setPlaybackState("playing");
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

      setPlaybackState("paused");
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
  };

  return (
    <div>
      <video src={videoUrl} controls />
      <div>
        <button onClick={handlePlay}>Play</button>
        <button onClick={handlePause}>Pause</button>
        <input type="range" min={0} max={100} value={currentTime} onChange={(e) => handleSeek(e.target.value)} />
      </div>
    </div>
  );
};

export default StreamingRoom;