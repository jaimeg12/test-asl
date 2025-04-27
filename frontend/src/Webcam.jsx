import { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
import ButtonScreenshot from "./Components/ButtonScreenshot"
import Feedback from './Components/Feedback';
import SelectSign from './Components/SelectSign';

export default function Webcam() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  // const photoRef = useRef(null);
  const [camStream, setCamStream] = useState();
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const [frames, setFrames] = useState([]);
  const [countDownText, setCountDownText] = useState();
  const [currentSign, setCurrentSign] = useState({
    entryCount: 1,
    signName: null
  })

  useEffect(() => {
    // Function to initialize and access the webcam
    const startWebcam = async () => {
      try {
        console.log("Attempting to access webcam...");
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false
        });
            console.log("Webcam access granted, setting up video stream");
            console.log(videoRef);
            setHasPermission(true);
            setCamStream(stream);
            console.log(stream);
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setError(err.message);
        setHasPermission(false);
      }
    };

    startWebcam();

    // Cleanup function to stop all tracks when component unmounts
    return () => {
      console.log("Cleaning up webcam resources");
      if (videoRef && videoRef.srcObject) {
        videoRef.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  //MDM docs
  // function clearPhoto() {
  //   const context = canvas.getContext("2d");
  //   context.fillStyle = "#AAA";
  //   context.fillRect(0, 0, canvas.width, canvas.height);
  
  //   const data = canvas.toDataURL("image/png");
  //   photo.setAttribute("src", data);
  // }

  async function takeScreenshot() {
    if (canvasRef.current === null) return
    
    const context = canvasRef.current.getContext("2d");
    // if (width && height) {
      // canvasRef.current.width = width;
      // canvasRef.current.height = height;
    context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
  
    const data = canvasRef.current.toDataURL("image/png");
    // console.log(data)
    // photoRef.current.setAttribute("src", data);
    // } else {
    //   clearPhoto();
    // }

    //sending photo URI to backend

    console.log(currentSign)
    const formdata = new FormData();
    formdata.append("signName", currentSign.signName); 
    formdata.append("frameNumber", currentSign.entryCount);
    formdata.append("imageBase64", data);

    const requestOptions = {
    method: "POST",
    body: formdata,
    redirect: "follow"
    };

    try {

      const response = await fetch("https://test-asl-api.onrender.com/evaluate", requestOptions)
          console.log(response)
          console.log(response.body)
        // console.log(response.text().then(v => v));
      const text = await response.text();
      // const newFeedbackArray = [...feedback, text];
      // setFeedback(newFeedbackArray);
      // console.log(feedback)
      // console.log(frames)
      // console.log([...feedback, text])
      return [data, text];
    } catch (e) {
      console.error(e);
    }
    return [];
  }
  

    useEffect(() => {
        console.log(videoRef)
        if (videoRef.current) {
            videoRef.current.srcObject = camStream;
        }
    }, [hasPermission])
  
  
  useEffect(() => {
      console.log(frames)
      console.log(feedback)
    }, [frames, feedback])

  // Handle video loaded event
  const handleVideoLoaded = () => {
    console.log("Video element loaded and playing");
    setIsVideoLoaded(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Learn Sign Language!</h1>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          {hasPermission === null ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Requesting camera permission...</p>
            </div>
          ) : hasPermission === false ? (
            <div className="text-center py-8 text-red-500">
              <p className="font-bold">Camera access denied</p>
              <p className="mt-2">{error || "Please allow camera access to use this app."}</p>
            </div>
          ) : (<>
            <div className="webcam-container" style= {{ position: "relative"}}>
                <canvas
                  ref={canvasRef}
                  // className="w-full rounded-md bg-black"
                  width={320}
                  height={240}
                  style={{ display: "none" }}
                />
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline
                    onCanPlay={handleVideoLoaded}
                    className="w-full rounded-md bg-black"
                    style={{ minHeight: "240px" }}
                  />
              {!isVideoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
                  Loading camera feed...
                </div>
              )}

              {countDownText && countDownText.length > 0 &&
                <div className="countdown-overlay"
                  style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(0, 0, 0, 0.6)",
                      color: "white",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      fontSize: "24px",
                      fontWeight: "bold",
                      zIndex: 10,
                      display: "flex",
                      gap: "10px"
                    }}
                    >
                    {countDownText}
                </div>
              }
            </div>

        </>)}
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Camera status: {hasPermission === null ? 'Requesting access' : hasPermission ? 'Connected' : 'Denied'}
          </p>
          {error && <p className="text-sm text-red-500 mt-1">Error: {error}</p>}
        </div>

        {/* <button
          onClick={(e) => {
            e.preventDefault()
            takeScreenshot()
          }}
        >
          Take screenshot
        </button> */}

        <SelectSign
          setCurrentSign={setCurrentSign}
        />

        <ButtonScreenshot
          currentSign={currentSign}
          takeScreenshot={() => takeScreenshot()}
          setCountDownText={setCountDownText}
          frames={frames}
          setFrames={setFrames}
          setFeedback={setFeedback}
        />

        {frames && frames.length > 0 &&
          <Feedback
            frames={frames}
            feedback={feedback}
          />
        }
              


        {/* <img
          ref={photoRef}
          // style={{ height: "1280px", width: "7"}}
        /> */}
      </div>
    </div>
  );
}