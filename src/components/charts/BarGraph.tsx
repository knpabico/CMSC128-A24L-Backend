"use client";
import { useRef, useEffect } from "react";
import { Chart } from "chart.js/auto";
interface BarGraphProps {
  labels: string[];
  data: number[];
  type: string;
}

const BarGraph = ({ data, labels, type }: BarGraphProps) => {
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
          labels,
          datasets: [
            {
              label: type,
              data,
              backgroundColor: "#0856BA",
              borderColor: "#D1D5DB",
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
  }, [data, labels, type]);
  return (
    <div style={{ position: "relative", width: "30vw", height: "40vh" }}>
      <canvas ref={chartRef} />
    </div>
  );
};

export default BarGraph;
