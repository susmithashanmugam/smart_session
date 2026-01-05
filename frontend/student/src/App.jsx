import { useEffect, useRef, useState } from "react";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);

  const [status, setStatus] = useState("Connecting...");

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  const connectSocket = () => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/student");

    socket.onopen = () => console.log("WebSocket connected");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStatus(data.status);
    };

    socketRef.current = socket;
  };

  const sendFrame = () => {
    if (!videoRef.current || !socketRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL("image/jpeg").split(",")[1];
    socketRef.current.send(base64Image);
  };

  useEffect(() => {
    startCamera();
    connectSocket();

    const interval = setInterval(sendFrame, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h2>Student Portal</h2>

      <video ref={videoRef} autoPlay muted width="400" />
      <canvas ref={canvasRef} width="400" height="300" style={{ display: "none" }} />

      <p>Status: {status}</p>
    </div>
  );
}

export default App;
