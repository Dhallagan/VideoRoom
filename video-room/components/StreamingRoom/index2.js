import React, { useEffect, useRef, useState } from "react";
import firebase from "@/utils/firebaseConfig"

const StreamingRoom = ({ roomId }) => {
  const [user, setUser] = useState(null);
  const [playbackState, setPlaybackState] = useState(null);
  const videoRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState('');
  const dbRef = firebase.database().ref(`rooms/${roomId}`);

  // Authenticate the user on component mount
//   useEffect(() => {
//     const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
//       setUser(user);
//     });
//     return unsubscribe;
//   }, []);
    useEffect(() => {
        const videoUrlRef = firebase.database().ref(`rooms/${roomId}/video/url`);
        videoUrlRef.on('value', (snapshot) => {
        setVideoUrl(snapshot.val());
        });
    },[roomId]);

  // Sync the playback state with Firebase database
  useEffect(() => {
    dbRef.child("playbackState").on("value", (snapshot) => {
      setPlaybackState(snapshot.val());
    });
    return () => {
      dbRef.child("playbackState").off();
    };
  }, []);

  // Sync the playback time with Firebase database
  useEffect(() => {
    const onTimeUpdate = () => {
      dbRef.child("currentTime").set(videoRef.current.currentTime);
    };
    videoRef.current.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      videoRef.current.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, []);

  // Handle user actions
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

  // Render the component
  return (
    <>
      <video ref={videoRef} src={videoUrl}/>
      <div>
        {playbackState === "paused" ? (
          <button onClick={handlePlay}>Play</button>
        ) : (
          <button onClick={handlePause}>Pause</button>
        )}
      </div>
      {/* <div>
        {user ? (
          <p>Welcome, {user.displayName}!</p>
        ) : (
          <button onClick={() => firebase.auth().signInAnonymously()}>
            Join as Guest
          </button>
        )}
      </div> */}
    </>
  );
};

export default StreamingRoom;