"use client";
import { useRef, useEffect } from "react";
import { Chart, ChartOptions } from "chart.js/auto";

interface DonutChartProps {
  labels: string[];
  data: number[];
  backgroundColor?: string[];
  options?: ChartOptions;
}

const DonutChartAdmin = ({
  labels,
  data,
  backgroundColor,
  options,
}: DonutChartProps) => {
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
                backgroundColor: backgroundColor || ["#0856BA", "#979FAD"],
                borderColor: "#D1D5DB",
                borderWidth: 1,
              },
            ],
          },
          options: options,
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
export default DonutChartAdmin;
