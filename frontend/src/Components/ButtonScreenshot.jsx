import React, { useState } from 'react';

const DelayedAction = ({takeScreenshot, currentSign, setCountDownText}) => {
  // const [actionStatus, setActionStatus] = useState('Idle');
  const [timerText, setTimerText] = useState();
  
  function startRecording() {
    const delay = 3; // # of seconds between captures
    for (let i = 0; i < currentSign.entryCount; i++) {
      setTimeout(() => {
        takeScreenshot();
        setCountDownText("Picture Taken!")
        console.log("screenshot taken")
      }, (delay + 1) * 1000 * (i + 1))
      
      for (let j = 0; j < delay; j++) {
        setTimeout(() => {
          setCountDownText((j + 1).toString());
        }, (delay - j) * 1000 + (i * delay * 1000));
      }
    }
  }

  const handleButtonClick = () => {
    setCountDownText('Action in progress...');

    
    
    // Use setTimeout to delay the action
    setTimeout(() => {
      setCountDownText('Action completed!');
      // Your actual action code here
    }, 3000); // 3 second delay
  };

  return (
    <div>
      {/* <p>Status: {actionStatus}</p> */}
      <button onClick={() => startRecording()}>Trigger Delayed Action</button>
      <p>{ timerText }</p>
    </div>
  );
};

export default DelayedAction