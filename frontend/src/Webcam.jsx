import { useState, useEffect, useRef } from 'react';

export default function WebcamApp() {
  const videoRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to initialize and access the webcam
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true,
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setError(err.message);
        setHasPermission(false);
      }
    };

    startWebcam();

    // Cleanup function to stop all tracks when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
                className="w-full rounded-md bg-black"
              />
            </div>
          )}
        </div>
        
        <p className="text-sm text-gray-500 text-center mt-4">
          Note: You'll need to grant camera permissions when prompted by your browser.
        </p>
      </div>
    </div>
  );
}