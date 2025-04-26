import React from 'react'

function Feedback({frames, feedback}) {
  return (<>
    <div>
      {frames && frames.length > 0 && frames.map((v, i) => <>
        <p>
          {i}: 
        </p>
        
        <img
          src={frames[i] ?? "Loading..."}
        />

        <p>
          {feedback[i] ?? "Loading..."}
        </p>
      </>)}
    </div>
  </>)
}

export default Feedback