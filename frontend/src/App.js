//
import React from 'react';
import Webcam from './Webcam';
import './App.css'; // Assuming you have some basic styles

function App() {
  return (
    <div className="App">
      <header>
        <h1>My Webcam Application</h1>
      </header>
      <main>
        <Webcam />
      </main>
      <footer>
        <p>&copy; {new Date().getFullYear()} - Simple Webcam App</p>
      </footer>
    </div>
  );
}

export default App;