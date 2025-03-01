// import React, { useState, useEffect, useRef } from 'react';

// function App() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   // Set up the camera when the component mounts
//   useEffect(() => {
//     async function setupCamera() {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;
//           videoRef.current.onloadedmetadata = () => {
//             videoRef.current.play().catch(error => console.error("Video play error:", error));
//           };        }
//       } catch (error) {
//         console.error("Error accessing camera:", error);
//       }
//     }
//     setupCamera();
//   }, []);
//   // 2. Capture a frame every 30 seconds and send it to the server
//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (videoRef.current && canvasRef.current) {
//         const video = videoRef.current;
//         const canvas = canvasRef.current;
//         // Set canvas dimensions to match the video stream
//         canvas.width = video.videoWidth;
//         canvas.height = video.videoHeight;
//         const ctx = canvas.getContext("2d");
//         ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//         const dataUrl = canvas.toDataURL("image/jpeg");
        
//         // Send the captured image to your server
//         fetch("https://6ba8-38-34-121-59.ngrok-free.app/upload", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ image: dataUrl, timestamp: Date.now() }),
//         })
//         .then((response) => response.json())
//         .then((data) => console.log("Server response:", data))
//         .catch((error) => console.error("Error sending image:", error));
//       }
//     }, 30000); // 30000 ms = 30 seconds

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div>
//       <h1>Camera Frame Capture</h1>
//       {/* Hidden video element for the camera stream */}
//       <video ref={videoRef} style={{ display: "true" }} />
//       {/* Hidden canvas used for capturing a frame */}
//       <canvas ref={canvasRef} style={{ display: "true" }} />
//       <p>The app captures a frame every 30 seconds and sends it to the server.</p>
//     </div>
//   );
// }

// export default App;

import React, { useState, useEffect, useRef } from "react";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [facingMode, setFacingMode] = useState("environment"); // "environment" = back camera, "user" = front camera
  const [logMessage, setLogMessage] = useState("");

  // Set up the camera stream whenever facingMode changes
  useEffect(() => {
    let stream;
    async function setupCamera() {
      if (videoRef.current && navigator.mediaDevices.getUserMedia) {
        try {
          // If a stream is already active, stop its tracks before setting up a new one.
          if (videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
          }
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode } 
          });
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        } catch (error) {
          console.error("Error accessing camera:", error);
        }
      }
    }
    setupCamera();

    // Clean up: stop the stream tracks when component unmounts or before re-running effect
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  // Capture a frame every 30 seconds and send it to the server
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
          .then((data) => {
            const time = new Date().toLocaleTimeString();
            setLogMessage(`Frame sent at ${time}`);
            console.log("Server response:", data);
          })
          .catch((error) => console.error("Error sending image:", error));
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Toggle between front and back camera
  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Axon Robot Feed</h1>
      <button onClick={toggleCamera} style={styles.toggleButton} aria-label="Switch Camera">
        🔄
      </button>
      <div style={styles.logContainer}>
        {logMessage && <p style={styles.logText}>{logMessage}</p>}
      </div>
      {/* Hidden video element used solely for capturing the stream */}
      <video ref={videoRef} style={styles.hiddenMedia} />
      {/* Hidden canvas used for capturing a frame */}
      <canvas ref={canvasRef} style={styles.hiddenMedia} />
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#000",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    position: "relative",
    margin: 0,
    padding: 0,
    color: "#fff",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    margin: 0,
    position: "absolute",
    top: 40,
  },
  toggleButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "transparent",
    border: "none",
    fontSize: "24px",
    color: "#fff",
  },
  logContainer: {
    position: "absolute",
    bottom: 40,
  },
  logText: {
    fontSize: "16px",
    margin: 0,
  },
  hiddenMedia: {
    display: "none",
  },
};

export default App;
