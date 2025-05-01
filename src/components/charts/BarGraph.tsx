"use client";
import { useRef, useEffect } from "react";
import { Chart } from "chart.js/auto";
const BarGraph = () => {
  const chartRef = useRef<HTMLCanvasElement & { chart?: Chart }>(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }
      const context = chartRef.current.getContext("2d");
      if (!context) return;
      const newChart = new Chart(context, {
        type: "bar",
        data: {
          labels: ["John", "jane", "Doe", "Dave", "Jose"],
          datasets: [
            {
              label: "Info",
              data: [34, 64, 23, 45, 67],
              backgroundColor: ["orange", "red", "blue", "green", "violet"],
              borderColor: "black",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            x: {
              type: "category",
            },
            y: {
              beginAtZero: true,
            },
          },
        },
      });

      chartRef.current.chart = newChart;
    }
  }, []);
  return (
    <div style={{ position: "relative", width: "70vw", height: "70vh" }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default BarGraph;
