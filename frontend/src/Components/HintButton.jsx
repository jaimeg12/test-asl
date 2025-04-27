import React, { useState } from 'react'

function HintButton({ text, video }) {
  const [showHints, setShowHints] = useState(false)
  return (<>
    <button
      onClick={() => setShowHints(v => !v)}
      className='hide-hints'
    >
      {showHints ? "Hide Hints" : "Show Hints"}  
    </button>

    {showHints && <>
      <p className='frame-text'>
        Hint: {text}
      </p>
      <p className='frame-title'>
        Video Demonstration:
      </p>
      <iframe
        src={video + "/preview"}
        width={640}
        height={360}
        allow="autoplay"
      />
    </>}
  </>)
}

export default HintButton