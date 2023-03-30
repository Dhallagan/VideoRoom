import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import firebase from "@/utils/firebaseConfig"
import { MdPlayCircleOutline, MdPauseCircleOutline } from 'react-icons/md'; // Import the play button icon


const database = firebase.database();

function StreamRoom() {
  const [playbackStatus, setPlaybackStatus] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [timerId, setTimerId] = useState(null);

  useEffect(() => {
    const playbackStatusRef = database.ref('playbackStatus');
    const currentTimeRef = database.ref('currentTime');
    const timestampRef = database.ref('timestamp');

    playbackStatusRef.once('value', (snapshot) => {
      setPlaybackStatus(snapshot.val());
    });

    currentTimeRef.once('value', (snapshot) => {
      setCurrentTime(snapshot.val());
      playerRef.current.seekTo(currentTime);
    });

    database.ref('timestamp').once('value', (snapshot) => {

      const serverTimestamp = snapshot.val();
      const clientTimestamp = Date.now();
      const lag = (clientTimestamp - serverTimestamp) / 1000; // Convert to seconds

      playerRef.current.seekTo(currentTime + lag + 0.0015);
    });

    const onPlaybackStatusChanged = (snapshot) => {
      const newPlaybackStatus = snapshot.val();
      if (newPlaybackStatus !== playbackStatus) {
        setPlaybackStatus(newPlaybackStatus);
      }
    };

    playbackStatusRef.on('value', onPlaybackStatusChanged);

    return () => {
      playbackStatusRef.off('value', onPlaybackStatusChanged);
    };

  }, [playbackStatus]);

  const handlePlayPause = () => {
    const newPlaybackStatus = !playbackStatus;
    setPlaybackStatus(newPlaybackStatus);
    database.ref('playbackStatus').set(newPlaybackStatus);
    database.ref('currentTime').set(playerRef.current.getCurrentTime());
    database.ref('timestamp').set(firebase.database.ServerValue.TIMESTAMP);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (timerId) {
      clearTimeout(timerId);
    }
  };

  const handleMouseLeave = () => {
    const id = setTimeout(() => {
      setIsHovering(false);
    }, 5000);
    setTimerId(id);
  };

  const handleVideoEnded = () => {
    playerRef.current.seekTo(0);
  };

  return (
    <div className="App"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ReactPlayer
        ref={playerRef}
        className="react-player"
        url="https://firebasestorage.googleapis.com/v0/b/video-room-8c622.appspot.com/o/IMG_3118.MOV?alt=media&token=b63fa0b7-dc19-44a6-af35-58d1cff1df3b"
        playing={playbackStatus}
        //controls={true}
        progressInterval={1000}
        width="100%"
        height="100%"
        onEnded={handleVideoEnded}
      />
      {!playbackStatus && (isHovering || !playbackStatus) && (
        <MdPlayCircleOutline className="play-button" onClick={handlePlayPause} />
      )}
      {playbackStatus && isHovering && (
        <MdPauseCircleOutline className="play-button" onClick={handlePlayPause} />
      )}
    </div>
  );
}

export default StreamRoom;