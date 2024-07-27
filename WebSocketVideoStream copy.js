import React, { useRef, useState, useEffect } from 'react';
import WebSocketService from './WebsocketService';
import './App.css';

const WebSocketVideoStream = () => {
  const videoRef = useRef(null);
  const rawCanvasRef = useRef(null);
  const processedCanvasRef = useRef(null);
  const [websocketService, setWebSocketService] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [useLSTM, setUseLSTM] = useState(false);

  const reconnectInterval = 5000;

  useEffect(() => {
    const wsService = new WebSocketService('ws://127.0.0.1:8000/ws/video');
    wsService.connect(handleMessage, handleOpen, handleError, handleClose);
    setWebSocketService(wsService);

    return () => {
      if (wsService) wsService.close();
    };
  }, []);

  const handleOpen = () => {
    console.log('WebSocket connection opened.');
    setReconnectAttempts(0);
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
    if (event) {
      console.log('WebSocket connection closed:', event.code, event.reason);
      if (event.code !== 1000 && reconnectAttempts < 5) {
        setReconnectAttempts(reconnectAttempts + 1);
        setTimeout(() => {
          websocketService.connect(handleMessage, handleOpen, handleError, handleClose);
        }, Math.min(reconnectInterval * (2 ** reconnectAttempts), 30000));
      }
    } else {
      console.log('WebSocket connection closed with no event details.');
    }
  };

  const handleError = (error) => {
    console.error('WebSocket error:', error);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Video file selected:', file.name);
      uploadVideo(file);
    }
  };

  const uploadVideo = (file) => {
    const video = videoRef.current;
    if (video) {
      video.src = URL.createObjectURL(file);

      video.onloadeddata = () => {
        console.log('Video loaded.');
        const canvas = rawCanvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        processFrames(video);
      };
    } else {
      console.error("Video element is not properly referenced.");
    }
  };

  const processFrames = (video) => {
    const canvas = rawCanvasRef.current;
    const context = canvas.getContext('2d');
    let frameCount = 0;
    const fps = 10;
    const frameSkip = 5;

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
            if (websocketService && websocketService.websocket.readyState === WebSocket.OPEN) {
              // First, send JSON control data
              websocketService.send(JSON.stringify({ useLSTM }));
              // Then, send the binary frame data
              websocketService.send(buffer);
            }
          });
        }, 'image/jpeg', 1.0);
      }

      frameCount++;
      setTimeout(step, 1000 / fps);
    };

    step();
  };

  const toggleLSTM = () => {
    setUseLSTM(!useLSTM);
  };

  return (
    <div>
      <div className="monitor-header">WebSocket Video Stream</div>
      <input
        type="checkbox"
        checked={useLSTM}
        onChange={toggleLSTM}
        className="lstm-checkbox"
      />
      <label>Enable Violence Detection (LSTM)</label>
      <input type="file" accept="video/*" onChange={handleFileChange} className="file-input" />
      <div className="monitor-container">
        <div className="monitor-frame">
          <canvas ref={processedCanvasRef} />
          <canvas ref={rawCanvasRef} style={{ display: 'none' }} />
          <video ref={videoRef} style={{ display: 'none' }} />
        </div>
      </div>
    </div>
  );
};

export default WebSocketVideoStream;
