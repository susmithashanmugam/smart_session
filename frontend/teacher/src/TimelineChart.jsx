import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const statusToValue = {
  FOCUSED: 0,
  CONFUSED: 1,
  PROCTOR_ALERT: 2,
};

function TimelineChart({ timeline }) {
  const data = {
    labels: timeline.map((item) => item.time),
    datasets: [
      {
        label: "Engagement Level",
        data: timeline.map((item) => statusToValue[item.status]),
        borderColor: "#4da3ff",
        backgroundColor: "#4da3ff",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        ticks: {
          callback: (value) => {
            if (value === 0) return "Focused";
            if (value === 1) return "Confused";
            if (value === 2) return "Alert";
            return "";
          },
          stepSize: 1,
          min: 0,
          max: 2,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
}

export default TimelineChart;
