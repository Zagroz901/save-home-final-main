// import './App.css';

// import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// import { Login } from './Componants/Login/Login';
// import { Signup } from './Componants/SignUp/Signup';
// import VideoStream from './WebSocketVideoStream';

// function App() {
//   return (
//     // <Router>
//     //   <Routes>
//     //     <Route path='/' element={<Login/>}/>
//     //     <Route path='/signup' element={<Signup/>}/>
//     //   </Routes>
//     // </Router>
//     <div className="App">
//     <h1>WebSocket Video Stream</h1>
//     <VideoStream />
//   </div>
//   );
// }

// export default App;

// src/components/App.js
import React, { useState } from 'react';
import './App.css';
import WebSocketVideoStream from './WebSocketVideoStream';

function App() {
  return (
    <div>
      <div className="header">
        <h1>Surveillance System</h1>
      </div>
      <div className="main-container">
        <div className="sidebar">
          <h2>Controls</h2>
          {/* Add more controls if necessary */}
        </div>
        <div className="camera-grid">
          <WebSocketVideoStream />
        </div>
      </div>
      <div className="footer">
        <p>© 2023 Surveillance System</p>
      </div>
    </div>
  );
}

export default App;
