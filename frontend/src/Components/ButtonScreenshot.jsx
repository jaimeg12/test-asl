import React, { useState } from 'react';
import '../styles/button.css'

const DelayedAction = ({takeScreenshot, currentSign, setCountDownText, frames, setFrames, setFeedback}) => {
  // const [actionStatus, setActionStatus] = useState('Idle');
  const [timerText, setTimerText] = useState();
  const [loading, setLoading] = useState(false);
  
  function startRecording() {
    const delay = 4; // # of seconds between captures
    setFrames([])
    const newFramesArray = []
    const newFeedbackArray = []
    setLoading(true);

    for (let i = 0; i < currentSign.entryCount; i++) {
      setTimeout(async () => {
        const [frame, text] = await takeScreenshot();
        newFramesArray.push(frame);
        newFeedbackArray.push({
          text,
          signName: currentSign.signName
        });
        console.log(newFeedbackArray)
        console.log(newFramesArray)
        console.log("screenshot taken")
        if (newFeedbackArray.length === Number.parseInt(currentSign.entryCount) && newFramesArray.length === Number.parseInt(currentSign.entryCount)) {
          setFrames(newFramesArray);
          setFeedback(newFeedbackArray);
          setLoading(false);
          setCountDownText('')
        }
      }, delay * 1000 * (i + 1))
      
      for (let j = 0; j < delay; j++) {
        setTimeout(() => {
          if (j === 0) {
            setCountDownText(`Picture Taken! (${i + 1}/${currentSign.entryCount})`)
            if ((i + 1) === Number.parseInt(currentSign.entryCount)) {
              setTimeout(() => {
                setCountDownText('All pictures taken, loading feedback...')
              }, 1000)
            }
          } else {
            setCountDownText(j.toString());
          }
        }, (delay - j) * 1000 + (i * delay * 1000));
      }

      // setTimeout(() => {
      //   setFrames(newFramesArray);
      //   setFeedback(newFeedbackArray);
      // }, [delay * (currentSign.entryCount + 2) * 1000])
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

  return (<>
    {/* <p>Status: {actionStatus}</p> */}
    <button
      onClick={() => {
        if (!loading)
          startRecording()
      }}
      className='button'
    >
      Start Countdown
    </button>

    <p>{ timerText }</p>
  </>)
};

export default DelayedAction