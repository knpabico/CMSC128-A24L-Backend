"use client";
import { useRef, useEffect } from "react";
import { Chart } from "chart.js/auto";
import { useAlums } from "@/context/AlumContext";

interface DonutChartProps {
  labels: string[];
  data: number[];
}

const DonutChart = ({ labels, data }: DonutChartProps) => {
  const { alums, activeAlums } = useAlums();
  const chartRef = useRef<(HTMLCanvasElement & { chart?: Chart }) | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }
      const context = chartRef.current.getContext("2d");
      let newChart;
      if (context) {
        newChart = new Chart(context, {
          type: "doughnut",
          data: {
            labels,
            datasets: [
              {
                label: "Number",
                data,
                backgroundColor: ["blue", "gray"],
                borderColor: "black",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
          },
        });
        chartRef.current.chart = newChart;
      }
      chartRef.current.chart = newChart;
    }
  }, [data, labels]);
  return (
    <div style={{ position: "relative" }}>
      <canvas ref={chartRef} />
    </div>
  );
};
export default DonutChart;
