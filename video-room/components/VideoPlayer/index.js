import React, { useState, useEffect } from 'react';
import firebase from '@/utils/firebaseConfig';

const VideoPlayer = ({ roomId }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const videoUrlRef = firebase.database().ref(`rooms/${roomId}/video/url`);
    videoUrlRef.on('value', (snapshot) => {
      setVideoUrl(snapshot.val());
    });

    const isPlayingRef = firebase.database().ref(`rooms/${roomId}/video/isPlaying`);
    isPlayingRef.on('value', (snapshot) => {
      setIsPlaying(snapshot.val());
    });

    const currentTimeRef = firebase.database().ref(`rooms/${roomId}/video/currentTime`);
    currentTimeRef.on('value', (snapshot) => {
      setCurrentTime(snapshot.val());
    });

    return () => {
      videoUrlRef.off();
      isPlayingRef.off();
      currentTimeRef.off();
    };
  }, [roomId]);

  const handlePlay = () => {
    setIsPlaying(true);
    const timestamp = Math.floor(Date.now() / 1000);
    const videoRef = firebase.database().ref(`rooms/${roomId}/video`);
    videoRef.update({ isPlaying: true, timestamp });
  };

  const handlePause = (e ) => {
    setIsPlaying(false);
    // firebase.database().ref(`rooms/${roomId}/video/isPlaying`).set(false);
    const videoRef = firebase.database().ref(`rooms/${roomId}/video`);
    videoRef.update({ isPlaying: false, currentTime: e.target.currentTime });
  };

  const handleSeek = (e) => {
    const newTime = e.target.currentTime;
    setCurrentTime(newTime);
    const videoRef = firebase.database().ref(`rooms/${roomId}/video`);
    videoRef.update({ currentTime: newTime });
  };

    // // Update the video playback based on Firebase changes for the specific room
    // useEffect(() => {
    //   const videoRef = firebase.database().ref(`rooms/${roomId}/video`);
    //   videoRef.on('value', (snapshot) => {
    //     const { timestamp, currentTime } = snapshot.val();
    //     const diff = Math.floor(Date.now()) - timestamp;
    //     console.log(currentTime, Math.floor(Date.now()))
    //     setCurrentTime(currentTime + diff);
    //   });
    // }, [isPlaying]);
  

  return (
    <div>
      <video
        src={videoUrl}
        controls
        onPlay={handlePlay}
        onPause={handlePause}
        //onTimeUpdate={handleSeek}
        currenttime={currentTime}
      />
    </div>
  );
};

export default VideoPlayer;