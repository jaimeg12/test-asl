//
import React from 'react';
import Webcam from './Webcam';
import './App.css'; // Assuming you have some basic styles
import SelectSign from './Components/SelectSign';

function App() {
  return (
    <div className="App">
      <header>
        <h1>Motion Mentor</h1>
      </header>
      <main>
        <Webcam />
        <SelectSign />
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} - Simple Webcam App</p>
      </footer>
    </div>
  );
}

export default App;