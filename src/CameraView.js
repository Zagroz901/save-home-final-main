import React, { useRef, useEffect } from 'react';

const CameraView = ({ cameraId, videoFile }) => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoFile) {
      const video = videoRef.current;
      video.src = URL.createObjectURL(videoFile);

      video.onloadeddata = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        video.play();

        const drawFrame = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(drawFrame);
        };
        drawFrame();
      };
    }
  }, [videoFile]);

  return (
    <div className="camera">
      <div className="camera-info">
        <span>{cameraId}</span>
        <span>Status: {videoFile ? 'Playing' : 'Idle'}</span>
      </div>
      <video ref={videoRef} style={{ display: 'none' }} />
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default CameraView;
