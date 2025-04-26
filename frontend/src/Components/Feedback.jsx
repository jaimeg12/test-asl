import React from 'react'
import '../styles/feedback.css'

function Feedback({frames, feedback}) {
  return (<>
    <div>
      {frames && frames.length > 0 && frames.map((v, i) => <>
        <p>
          {i + 1}: 
        </p>
        
        <img
          src={frames[i] ?? "Loading..."}
          className='feedback-image'
        />

        <p>
          {feedback[i] ?? "Loading..."}
        </p>
      </>)}
    </div>
  </>)
}

export default Feedback