import React, { useState } from 'react'

function HintButton({ text, video }) {
  const [showHints, setShowHints] = useState(false)
  return (<>
    <button
      onClick={() => setShowHints(v => !v)}
    >
      {showHints ? "Hide Hints" : "Show Hints"}  
    </button>

    {showHints && <>
      <p>
        Hint: {text}
      </p>
      <p>
        Video Demonstration:
      </p>
      <iframe
        src={video}
        width="640"
        height="480"
        allow="autoplay"
      />
    </>}
  </>)
}

export default HintButton