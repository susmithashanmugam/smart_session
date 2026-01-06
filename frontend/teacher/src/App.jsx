import { useEffect, useRef, useState } from "react";
import "./App.css";
import TimelineChart from "./TimelineChart";

function App() {
  const socketRef = useRef(null);
  const lastRecordedMinuteRef = useRef(null); // 🔥 key change

  const [status, setStatus] = useState("WAITING");
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const connectSocket = () => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/teacher");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Update live status always
      setStatus(data.status);

      // 🔹 Timeline update ONLY once per minute
      const now = new Date();
      const currentMinute = now.getMinutes();

      if (lastRecordedMinuteRef.current !== currentMinute) {
        lastRecordedMinuteRef.current = currentMinute;

        setTimeline((prev) => [
          ...prev.slice(-10), // last ~10 minutes
          {
            time: now.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: data.status,
          },
        ]);
      }
    };

    socket.onerror = (err) => {
      console.error("Teacher WebSocket error:", err);
    };

    socketRef.current = socket;
  };

  return (
    <div className="container">
      <div className="header">
        <h2>SmartSession – Teacher Dashboard</h2>
        <p>Live student engagement & proctoring view</p>
      </div>

      <div className="card">
        <h3>Current Student Status</h3>
        <StatusBadge status={status} />
      </div>

      <div className="card">
        <h3>Session Timeline</h3>
        <TimelineChart timeline={timeline} />
        <p className="footer-note">
          Showing student engagement levels (one data point per minute)
        </p>
      </div>
    </div>
  );
}

/* ---------------- Status Badge ---------------- */

function StatusBadge({ status }) {
  let className = "status-badge";

  if (status === "FOCUSED") className += " status-focused";
  else if (status === "CONFUSED") className += " status-confused";
  else if (status === "PROCTOR_ALERT") className += " status-alert";

  return <div className={className}>{status}</div>;
}

export default App;
