"use client";
import { useRef, useEffect } from "react";
import { Chart } from "chart.js/auto";

interface DonutChartProps {
  labels: string[];
  data: number[];
}

const DonutChart = ({ labels, data }: DonutChartProps) => {
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
                backgroundColor: ["#0856BA", "#979FAD"],
                borderColor: "#D1D5DB",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            animation: {
              duration: 1000, 
              easing: "easeInOutQuad", 
            },
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
