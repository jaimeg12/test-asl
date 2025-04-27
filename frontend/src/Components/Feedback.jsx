import React, { useState, useMemo, useEffect } from 'react'
import HintButton from './HintButton';

async function fetchHints(signName) {
  console.log("swdfiofgui")
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };
  
  const videoResponse = await fetch(`https://test-asl-api.onrender.com/video?signName=${signName}`, requestOptions)
  const textResponse = await fetch(`https://test-asl-api.onrender.com/explain?signName=${signName}`, requestOptions)

  const videoURL = await videoResponse.text()
  const hintText = await textResponse.text()

  console.log(videoResponse)
  console.log(textResponse)

  return {
    text: hintText,
    video: videoURL
  }
}

function Feedback({ frames, feedback }) {
  const [hint, setHint] = useState({
    text: "",
    video: ""
  })

  const _response = useMemo(async () => {
    console.log(feedback)
    const res = await fetchHints(feedback[0].signName)
    setHint(res)
  }, [])

  useEffect(() => {
    console.log(hint)
  }, [hint])
  
  return (<>
      
    {frames && frames.length > 0 && frames.map((_, i) => <>
      <p className='frame-title'>
        Frame {i + 1}:
      </p>
      
      <img
        src={frames[i] ?? "Loading..."}
      />

      <p className='frame-text'>
        {feedback[i].text ?? "Loading..."}
      </p>
    </>)}
      <HintButton
        text={hint.text}
        video={hint.video}
      />
  </>)
}

export default Feedback