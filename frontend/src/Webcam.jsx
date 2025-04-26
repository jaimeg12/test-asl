import { useState, useEffect, useRef } from 'react';

export default function Webcam() {
  const videoRef = useRef(null);
  const [camStream, setCamStream] = useState();
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

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

    useEffect(() => {
        console.log(videoRef)
        if (videoRef.current) {
            videoRef.current.srcObject = camStream;
        }
    }, [hasPermission])

  // Handle video loaded event
  const handleVideoLoaded = () => {
    console.log("Video element loaded and playing");
    setIsVideoLoaded(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Webcam App</h1>
        
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
          ) : (
            <div className="relative">
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
            </div>
          )}
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            Camera status: {hasPermission === null ? 'Requesting access' : hasPermission ? 'Connected' : 'Denied'}
          </p>
          {error && <p className="text-sm text-red-500 mt-1">Error: {error}</p>}
        </div>
      </div>
    </div>
  );
}