import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);

  const [status, setStatus] = useState("CONNECTING");

  useEffect(() => {
    startCamera();
    connectSocket();

    const interval = setInterval(sendFrame, 500);
    return () => clearInterval(interval);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera error:", err);
      setStatus("CAMERA BLOCKED");
    }
  };

  const connectSocket = () => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/student");

    socket.onopen = () => {
      console.log("Student WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStatus(data.status);
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    socketRef.current = socket;
  };

  const sendFrame = () => {
    if (
      !videoRef.current ||
      !canvasRef.current ||
      !socketRef.current ||
      socketRef.current.readyState !== WebSocket.OPEN ||
      videoRef.current.videoWidth === 0
    )
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL("image/jpeg").split(",")[1];
    socketRef.current.send(base64Image);
  };

  return (
    <div className="student-container">
      <div className="student-header">
        <h2>SmartSession – Student Portal</h2>
        <p>Please stay focused and face the screen</p>
      </div>

      <div className="student-card">
        <video
          ref={videoRef}
          width="480"
          height="360"
          muted
          playsInline
          className="video-box"
        />

        <canvas
          ref={canvasRef}
          width="480"
          height="360"
          style={{ display: "none" }}
        />

        <StatusBadge status={status} />

        <p className="student-note">
          Your video is processed locally and not shared with the teacher.
        </p>
      </div>
    </div>
  );
}

/* -------- Status Badge -------- */

function StatusBadge({ status }) {
  let className = "status-badge";

  if (status === "FOCUSED") className += " status-focused";
  else if (status === "CONFUSED") className += " status-confused";
  else if (status === "PROCTOR_ALERT") className += " status-alert";

  return <div className={className}>{status}</div>;
}

export default App;
