import React, { useState, useEffect, useRef } from 'react';

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Set up the camera when the component mounts
  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().catch(error => console.error("Video play error:", error));
          };        }
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    }
    setupCamera();
  }, []);
  // 2. Capture a frame every 30 seconds and send it to the server
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        // Set canvas dimensions to match the video stream
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        
        // Send the captured image to your server
        fetch("https://6ba8-38-34-121-59.ngrok-free.app/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: dataUrl, timestamp: Date.now() }),
        })
        .then((response) => response.json())
        .then((data) => console.log("Server response:", data))
        .catch((error) => console.error("Error sending image:", error));
      }
    }, 30000); // 30000 ms = 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Camera Frame Capture</h1>
      {/* Hidden video element for the camera stream */}
      <video ref={videoRef} style={{ display: "none" }} />
      {/* Hidden canvas used for capturing a frame */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <p>The app captures a frame every 30 seconds and sends it to the server.</p>
    </div>
  );
}

export default App;