// // 
// import React, { useState, useEffect, useRef } from "react";

// function App() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [facingMode, setFacingMode] = useState("environment"); // "environment" = back, "user" = front
//   const [lastFrameTime, setLastFrameTime] = useState("No frame sent yet");
//   const [textColor, setTextColor] = useState("#fff"); // Default white text
//   const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });

//   // Set up the camera stream when facingMode changes
//   useEffect(() => {
//     let stream;
//     async function setupCamera() {
//       if (videoRef.current && navigator.mediaDevices.getUserMedia) {
//         try {
//           // Stop any active tracks before switching cameras
//           if (videoRef.current.srcObject) {
//             videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
//           }
//           stream = await navigator.mediaDevices.getUserMedia({
//             video: { facingMode },
//           });
//           videoRef.current.srcObject = stream;
//           await videoRef.current.play();
//         } catch (error) {
//           console.error("Error accessing camera:", error);
//         }
//       }
//     }
//     setupCamera();
//     return () => {
//       if (stream) {
//         stream.getTracks().forEach((track) => track.stop());
//       }
//     };
//   }, [facingMode]);

//   // Capture a frame every 45 seconds and send it to the server
//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (videoRef.current && canvasRef.current) {
//         const video = videoRef.current;
//         const canvas = canvasRef.current;
//         canvas.width = video.videoWidth;
//         canvas.height = video.videoHeight;
//         const ctx = canvas.getContext("2d");
//         ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//         const dataUrl = canvas.toDataURL("image/jpeg");

//         fetch("https://6ba8-38-34-121-59.ngrok-free.app/upload", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ image: dataUrl, timestamp: Date.now() }),
//         })
//           .then((response) => response.json())
//           .then((data) => {
//             const time = new Date().toLocaleTimeString();
//             setLastFrameTime(`Last frame sent at ${time}`);
//             // Toggle text color to red for 1 second
//             setTextColor("red");
//             setTimeout(() => setTextColor("#fff"), 1000);
//             console.log("Frame sent at", time, "Server response:", data);
//           })
//           .catch((error) => console.error("Error sending image:", error));
//       }
//     }, 45000); // every 45 seconds

//     return () => clearInterval(interval);
//   }, []);

//   // Listen for accelerometer data and update state
//   useEffect(() => {
//     function handleMotion(event) {
//       const { x, y, z } = event.accelerationIncludingGravity || {};
//       setAccelData({ x, y, z });
//     }
//     window.addEventListener("devicemotion", handleMotion);
//     return () => window.removeEventListener("devicemotion", handleMotion);
//   }, []);

//   // Toggle between front and back cameras
//   const toggleCamera = () => {
//     setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
//   };

//   return (
//     <div style={styles.container}>
//       <h1 style={styles.title}>Axon Robot Feed</h1>
//       <button onClick={toggleCamera} style={styles.toggleButton} aria-label="Switch Camera">
//         🔄
//       </button>
//       <div style={styles.videoContainer}>
//         <video ref={videoRef} style={styles.video} playsInline muted />
//       </div>
//       {/* Display last frame sent time directly below the video */}
//       <p style={{ ...styles.text, color: textColor }}>{lastFrameTime}</p>
//       {/* Accelerometer Data Box */}
//       <div style={styles.accelBox}>
//         <p>Accelerometer Data:</p>
//         <p>X: {accelData.x?.toFixed(2)}</p>
//         <p>Y: {accelData.y?.toFixed(2)}</p>
//         <p>Z: {accelData.z?.toFixed(2)}</p>
//       </div>
//       {/* Hidden canvas for capturing video frames */}
//       <canvas ref={canvasRef} style={{ display: "none" }} />
//     </div>
//   );
// }

// const styles = {
//   container: {
//     backgroundColor: "#000",
//     minHeight: "100vh",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     justifyContent: "center",
//     position: "relative",
//     color: "#fff",
//     padding: 20,
//   },
//   title: {
//     fontSize: "24px",
//     fontWeight: "bold",
//     position: "absolute",
//     top: 40,
//   },
//   toggleButton: {
//     position: "absolute",
//     top: 40,
//     right: 20,
//     backgroundColor: "transparent",
//     border: "none",
//     fontSize: "24px",
//     color: "#fff",
//   },
//   videoContainer: {
//     width: "75vh",
//     height: "75vh",
//     overflow: "hidden",
//     borderRadius: "8px",
//   },
//   video: {
//     width: "100%",
//     height: "100%",
//     objectFit: "cover",
//   },
//   text: {
//     fontSize: "16px",
//     marginTop: "10px",
//   },
//   accelBox: {
//     backgroundColor: "#222",
//     padding: "10px",
//     borderRadius: "8px",
//     marginTop: "20px",
//     textAlign: "center",
//     width: "75vh",
//   },
// };

// export default App;
import { useState, useEffect } from "react";

export default function Accelerometer() {
  const [acceleration, setAcceleration] = useState({ x: 0, y: 0, z: 0 });
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    const handleMotion = (event) => {
      if (event.acceleration) {
        setAcceleration({
          x: event.acceleration.x?.toFixed(2) || 0,
          y: event.acceleration.y?.toFixed(2) || 0,
          z: event.acceleration.z?.toFixed(2) || 0,
        });
      }
    };

    const requestPermission = async () => {
      if (
        typeof DeviceMotionEvent.requestPermission === "function"
      ) {
        try {
          const permission = await DeviceMotionEvent.requestPermission();
          if (permission === "granted") {
            setPermissionGranted(true);
            window.addEventListener("devicemotion", handleMotion);
          } else {
            console.warn("Motion permission denied");
          }
        } catch (error) {
          console.error("Permission request failed:", error);
        }
      } else {
        // For non-iOS devices (Android, Desktop)
        setPermissionGranted(true);
        window.addEventListener("devicemotion", handleMotion);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, []);

  return (
    <div>
      <h1>Accelerometer Data</h1>
      {!permissionGranted ? (
        <p>Waiting for permission...</p>
      ) : (
        <>
          <p>X: {acceleration.x} m/s²</p>
          <p>Y: {acceleration.y} m/s²</p>
          <p>Z: {acceleration.z} m/s²</p>
        </>
      )}
    </div>
  );
}
