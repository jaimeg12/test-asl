import React from 'react';
import { Link, BrowserRouter, Routes, Route } from 'react-router';
import Webcam from './Webcam';
import './App.css'; // Assuming you have some basic styles
import SelectSign from './Components/SelectSign';
import WelcomeScreen from './WelcomeScreen';
import Navbar from './Components/Navbar';
import Home from './Home';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/webcam" element={<Webcam />} />
            {/* <SelectSign /> */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;