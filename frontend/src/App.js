import React from 'react';
import { Link, BrowserRouter, Routes, Route } from 'react-router';
import Webcam from './Webcam';
import './App.css'; // Assuming you have some basic styles
import SelectSign from './Components/SelectSign';
import WelcomeScreen from './WelcomeScreen';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header>
          <h1>Motion Mentor</h1>
        </header>
        <nav>
          <ul style={{ display: 'flex', listStyle: 'none', gap: '20px' }}>
            <li><Link to="/">Welcome</Link></li>
            <li><Link to="/webcam">Take me there!</Link></li>
            </ul>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<WelcomeScreen />} />
            <Route path="/webcam" element={<Webcam />} />
            {/* <SelectSign /> */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;