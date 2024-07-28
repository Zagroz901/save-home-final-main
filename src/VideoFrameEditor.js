import React, { useRef, useState, useEffect } from 'react';

function VideoFrameEditor() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [videoURL, setVideoURL] = useState(null);
  const [sectionsCount, setSectionsCount] = useState(1);
  const [riskLevels, setRiskLevels] = useState({1: ''});
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });

  // Handle video file upload
  const handleVideoUpload = event => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoURL(url);
    }
  };

  // Capture the first frame of the video to a canvas
  const captureFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      setVideoDimensions({ width: canvas.width, height: canvas.height });
      videoRef.current = null; // Cleanup video element after capturing frame
    }
  };

  // Draw rectangles on the canvas according to the sections count
  const drawRectangles = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const sectionWidth = canvas.width / sectionsCount;

    // Clear previous drawings
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Draw new sections
    for (let i = 0; i < sectionsCount; i++) {
      context.strokeStyle = '#FF0000'; // Red for visibility
      context.strokeRect(i * sectionWidth, 0, sectionWidth, canvas.height);
    }
  };

  // Watch for changes in sectionsCount and re-draw the rectangles
  useEffect(() => {
    if (canvasRef.current && sectionsCount) {
      drawRectangles();
    }
  }, [sectionsCount, videoDimensions]);

  return (
    <div>
      <input type="file" accept="video/*" onChange={handleVideoUpload} />
      {videoURL && <video ref={videoRef} src={videoURL} style={{ display: 'none' }} onLoadedMetadata={captureFrame} />}
      <canvas ref={canvasRef}></canvas>
      <div>
        <label>Number of Sections:</label>
        <input
          type="number"
          min="1"
          value={sectionsCount}
          onChange={e => setSectionsCount(parseInt(e.target.value, 10))}
        />
      </div>
    </div>
  );
}

export default VideoFrameEditor;
