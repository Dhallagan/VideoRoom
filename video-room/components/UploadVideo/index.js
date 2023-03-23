import React, { useState } from 'react';
import firebase from '@/utils/firebaseConfig';

const UploadVideo = ({ roomId }) => {
  const [videoFile, setVideoFile] = useState(null);

  // Upload the video to Firebase Storage for the specific room
  const handleUpload = () => {
    const storageRef = firebase.storage().ref();
    const videoRef = storageRef.child(videoFile.name);
    videoRef.put(videoFile).then(() => {
      videoRef.getDownloadURL().then((url) => {
        const videoUrlRef = firebase.database().ref(`rooms/${roomId}/video`);
        videoUrlRef.update({ url });
      });
    });
  };

  return (
    <div>
      <input type="file" onChange={(e) => setVideoFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default UploadVideo;