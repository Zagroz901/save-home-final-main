import React, { useState } from 'react';
import './App.css';
import WebSocketVideoStream from './WebSocketVideoStream';

function App() {
  const [useLSTM, setUseLSTM] = useState(false);
  const [anotherFeature, setAnotherFeature] = useState(false);
  const [detectBreak, setDetectBreak] = useState(false);
  const [sectionsCount, setSectionsCount] = useState(1);
  const [riskLevels, setRiskLevels] = useState({1: ''});
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    console.log("Saving sections and risk levels:", sectionsCount, riskLevels);
    setIsSaved(true);
  };

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
          <div className="control-item">
            <input
              type="checkbox"
              checked={detectBreak}
              onChange={(e) => {
                setDetectBreak(e.target.checked);
                if (!e.target.checked) {
                  setSectionsCount(1);
                  setRiskLevels({1: ''});  // Reset when checkbox is unchecked
                }
              }}
            />
            <label>Detect Break</label>
            {detectBreak && (
              <>
                <div>
                  <label>Number of Sections:</label>
                  <input
                    type="number"
                    min="1"
                    value={sectionsCount}
                    onChange={(e) => {
                      const newCount = parseInt(e.target.value, 10);
                      setSectionsCount(newCount);
                      const newRiskLevels = {...riskLevels};
                      const currentKeys = Object.keys(newRiskLevels).map(key => parseInt(key, 10));
                      const maxKey = Math.max(...currentKeys);

                      // Remove risk levels that are no longer needed
                      if (maxKey > newCount) {
                        for (let i = newCount + 1; i <= maxKey; i++) {
                          delete newRiskLevels[i];
                        }
                      }

                      // Add new keys for new sections if needed
                      for (let i = 1; i <= newCount; i++) {
                        if (!newRiskLevels[i]) newRiskLevels[i] = '';
                      }

                      setRiskLevels(newRiskLevels);
                    }}
                  />
                </div>
                <div>
                  {Object.keys(riskLevels).map((key) => (
                    <div key={key}>
                      <label>Risk Level for Section {key}:</label>
                      <input
                        type="text"
                        value={riskLevels[key]}
                        onChange={(e) => {
                          const newRiskLevels = {...riskLevels};
                          newRiskLevels[key] = e.target.value;
                          setRiskLevels(newRiskLevels);
                        }}
                      />
                    </div>
                  ))}
                </div>
                <button onClick={handleSave}>Save Settings</button>
              </>
            )}
          </div>
        </div>
        <div className="main-container">
          <WebSocketVideoStream useLSTM={useLSTM} detectBreak={detectBreak} />
        </div>
      </div>
      <div className="footer">
        <p>© 2023 Surveillance System</p>
      </div>
    </div>
  );
}

export default App;
