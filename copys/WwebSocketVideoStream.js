import React, { useRef, useState, useEffect } from 'react';
import './App.css'; // Make sure to import the CSS file

const WebSocketVideoStream = () => {
  const videoRef = useRef(null);
  const rawCanvasRef = useRef(null); // Canvas for raw video frames
  const processedCanvasRef = useRef(null); // Canvas for processed frames
  const [websocket, setWebSocket] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const reconnectInterval = 5000; // Base interval for reconnection (5 seconds)

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    console.log('Connecting WebSocket...');
    const ws = new WebSocket('ws://127.0.0.1:8000/ws/video');
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      console.log('WebSocket connection opened.');
      setReconnectAttempts(0); // Reset reconnection attempts on successful connection
    };

    ws.onmessage = (event) => {
      if (event.data === '{"type": "ping"}') {
        console.log('Ping received from server.');
        return;
      }
      console.log('Processed frame received from server.');
      const blob = new Blob([event.data], { type: 'image/jpeg' });
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

    ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      if (event.code !== 1000 && reconnectAttempts < 5) { // Limit reconnection attempts
        setReconnectAttempts(reconnectAttempts + 1);
        console.log('Attempting to reconnect...');
        setTimeout(() => {
          connectWebSocket();
        }, Math.min(reconnectInterval * (2 ** reconnectAttempts), 30000)); // Exponential back-off
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      ws.close(); // Ensure closure on error to trigger reconnection logic if needed
    };

    setWebSocket(ws);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert('Please select a video file first.');
      return;
    }
    console.log('Video file selected:', file.name);
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      uploadVideo(file);
    } else {
      websocket.onopen = () => {
        console.log('WebSocket connection opened.');
        uploadVideo(file);
      };
    }
  };

  const uploadVideo = (file) => {
    const video = videoRef.current;
    video.src = URL.createObjectURL(file);

    video.onloadeddata = () => {
      console.log('Video loaded.');
      const canvas = rawCanvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      processFrames(video);
    };
  };

  const processFrames = (video) => {
    const canvas = rawCanvasRef.current;
    const context = canvas.getContext('2d');
    let frameCount = 0;
    const fps = 10; // Frames per second
    const frameSkip = 5; // Skip frames for reducing load

    video.play();

    const step = () => {
      if (video.paused || video.ended) {
        console.log('Video playback ended.');
        return;
      }

      if (frameCount % frameSkip === 0) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          blob.arrayBuffer().then((buffer) => {
            console.log('Sending video frame to server...');
            if (websocket.readyState === WebSocket.OPEN) {
              websocket.send(buffer);
            }
          });
        }, 'image/jpeg', 1.0);
      }

      frameCount++;
      setTimeout(step, 1000 / fps);
    };

    step();
  };

  return (
    <div>
      <div className="monitor-header">WebSocket Video Stream</div>
      <input type="file" accept="video/*" onChange={handleFileChange} className="file-input" />
      <div className="monitor-container">
        <div className="monitor-frame">
          <canvas ref={processedCanvasRef} />
          <canvas ref={rawCanvasRef} style={{ display: 'none' }} /> {/* Hide raw frames canvas */}
        </div>
      </div>
    </div>
  );
};

export default WebSocketVideoStream;
