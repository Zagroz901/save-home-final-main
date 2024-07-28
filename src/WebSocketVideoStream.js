// WebSocketVideoStream.js
import React, { useRef, useState, useEffect } from 'react';
import WebSocketService from './WebsocketService';
import './App.css';

const WebSocketVideoStream = ({ useLSTM, detectBreak }) => {
  const videoRef = useRef(null);
  const rawCanvasRef = useRef(null);
  const processedCanvasRef = useRef(null);
  const [videoFile, setVideoFile] = useState(null);
  const [websocketService, setWebSocketService] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [firstFrameUrl, setFirstFrameUrl] = useState(null);

  const reconnectInterval = 5000;

  useEffect(() => {
    const wsService = new WebSocketService('ws://127.0.0.1:8000/ws/video');
    wsService.connect(handleMessage, handleOpen, handleError, handleClose);
    setWebSocketService(wsService);

    return () => {
      if (wsService) wsService.close();
    };
  }, []);

  useEffect(() => {
    // Only run this effect if detectBreak is true and there is a videoFile
    if (detectBreak && videoFile) {
      captureAndDisplayFirstFrame();
    }
  }, [videoFile, detectBreak]);  // Dependency array includes detectBreak and videoFile

  useEffect(() => {
    // This effect handles the visibility of the first frame
    if (!detectBreak) {
      setFirstFrameUrl(null);  // Clear the first frame display when detectBreak is false
    }
  }, [detectBreak]);  // Dependency only on detectBreak
  
  

  const handleOpen = () => {
    console.log('WebSocket connection opened.');
    setReconnectAttempts(0);
    setError(null);
  };

  const handleMessage = (data) => {
    if (typeof data === 'string') {
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.type === 'ack') {
          console.log('Frame acknowledged by server.');
        }
      } catch (e) {
        console.error('Failed to parse JSON data:', e);
      }
      return;
    }

    console.log('Processed frame received from server.');
    const blob = new Blob([data], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = processedCanvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleClose = (event) => {
    if (!event) {
      console.log('WebSocket connection closed with no event details available.');
      return;
    }
    
    console.log('WebSocket connection closed:', event.code, event.reason);
    if (event.code !== 1000 && reconnectAttempts < 5) {
      setReconnectAttempts(reconnectAttempts + 1);
      setTimeout(() => {
        if (websocketService) {
          websocketService.connect(handleMessage, handleOpen, handleError, handleClose);
        }
      }, Math.min(reconnectInterval * (2 ** reconnectAttempts), 30000));
    }
  };
  

  const handleError = (error) => {
    console.error('WebSocket error:', error);
    setError('An error occurred with the WebSocket connection.');
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Video file selected:', file.name);
      setVideoFile(file);
      setIsProcessing(true);
    }
  };

  const captureAndDisplayFirstFrame = () => {
    const video = videoRef.current;
    if (video) {
      video.src = URL.createObjectURL(videoFile);
      video.onloadedmetadata = () => {
        video.currentTime = 0;  // Seek to the first frame
        video.onseeked = () => {
          const canvas = rawCanvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const context = canvas.getContext('2d');
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const url = canvas.toDataURL('image/jpeg');
          setFirstFrameUrl(url);  // Update state to show first frame
        };
      };
      video.load();  // Load the video to trigger onloadedmetadata
    }
  };
  

  const processAndSendVideo = () => {
    const video = videoRef.current;
    if (video && videoFile) {
      video.src = URL.createObjectURL(videoFile);
      video.onloadedmetadata = () => {
        video.play();
        processFrames(video);
      };
    } else {
      console.error("Video element is not properly referenced or file is missing.");
      setError('Video element reference error or file missing.');
    }
  };

  const processFrames = (video) => {
    const canvas = processedCanvasRef.current; // Use processedCanvasRef to display frames
    const context = canvas.getContext('2d');
    let frameCount = 0;
    const fps = 10; // Frames per second, adjust as necessary for performance
    const frameSkip = 5; // Process every 5th frame, adjust according to your needs
  
    const step = () => {
      if (video.paused || video.ended) {
        console.log('Video playback ended.');
        setIsProcessing(false);
        return;
      }
  
      if (frameCount % frameSkip === 0) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height); // Draw the frame for display
        canvas.toBlob((blob) => {
          blob.arrayBuffer().then((buffer) => {
            console.log('Sending video frame to server...');
            if (websocketService && websocketService.websocket.readyState === WebSocket.OPEN) {
              websocketService.send(JSON.stringify({ useLSTM, frame: frameCount })); // Optionally include frame number
              websocketService.send(buffer);
            }
          });
        }, 'image/jpeg', 1.0);
      }
  
      frameCount++;
      setTimeout(step, 1000 / fps);
    };
  
    video.play(); // Ensure the video starts playing
    step(); // Start the frame processing loop
  };
  

  return (
    <div className="video-container">
      {error && <div className="error-message">{error}</div>}
      <input type="file" accept="video/*" onChange={handleFileChange} className="file-input" />
      {isProcessing && <div className="loading-message">Processing video...</div>}
      {firstFrameUrl && <img src={firstFrameUrl} alt="First Frame" className="first-frame-image" />}
      <button onClick={processAndSendVideo} className="send-video-button">
        Send Video to Server
      </button>
      <canvas ref={processedCanvasRef} className="video-canvas" style={{ display: 'block' }} />
      <canvas ref={rawCanvasRef} style={{ display: 'none' }} />
      <video ref={videoRef} style={{ display: 'none' }} />
    </div>
  );
  
};

export default WebSocketVideoStream;
