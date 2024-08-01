import React, { useState } from 'react';
import './App.css';
import WebSocketVideoStream from './WebSocketVideoStream';

function App() {
  const [useLSTM, setUseLSTM] = useState(false);
  const [anotherFeature, setAnotherFeature] = useState(false);

  return (
    <div className="app-container">
      <div className="header">
        <h1>Surveillance System</h1>
      </div>
      <div className="content">
        <div className="sidebar">
          <h2>Controls</h2>
          <div className="control-item">
            <input
              type="checkbox"
              checked={useLSTM}
              onChange={() => setUseLSTM(!useLSTM)}
            />
            <label>Enable Violence Detection (LSTM)</label>
          </div>
          <div className="control-item">
            <input
              type="checkbox"
              checked={anotherFeature}
              onChange={() => setAnotherFeature(!anotherFeature)}
            />
            <label>Another Feature</label>
          </div>
        </div>
        <div className="main-container">
          <WebSocketVideoStream useLSTM={useLSTM} />
        </div>
      </div>
      <div className="footer">
        <p>© 2023 Surveillance System</p>
      </div>
    </div>
  );
}

export default App;