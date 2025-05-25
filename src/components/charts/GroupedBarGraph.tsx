"use client";
import { useRef, useEffect, useState } from "react";
import { Chart } from "chart.js/auto";

interface GroupedBarGraphProps {
  labels: string[];
  currentAmounts: number[];
  targetAmounts: number[];
  campaignNames?: string[]; // Optional original campaign names for reference
}

const GroupedBarGraph = ({
  labels,
  currentAmounts,
  targetAmounts,
  campaignNames,
}: GroupedBarGraphProps) => {
  const chartRef = useRef<HTMLCanvasElement & { chart?: Chart }>(null);
  const [sortBy, setSortBy] = useState<
    "currentAsc" | "currentDesc" | "targetAsc" | "targetDesc"
  >("currentDesc");

  // Combine all data for sorting
  const sortData = () => {
    const combinedData = labels.map((label, index) => ({
      label,
      currentAmount: currentAmounts[index],
      targetAmount: targetAmounts[index],
      campaignName: campaignNames ? campaignNames[index] : label,
    }));

    // Sort based on the selected option
    switch (sortBy) {
      case "currentAsc":
        combinedData.sort((a, b) => a.currentAmount - b.currentAmount);
        break;
      case "currentDesc":
        combinedData.sort((a, b) => b.currentAmount - a.currentAmount);
        break;
      case "targetAsc":
        combinedData.sort((a, b) => a.targetAmount - b.targetAmount);
        break;
      case "targetDesc":
        combinedData.sort((a, b) => b.targetAmount - a.targetAmount);
        break;
    }

    return {
      sortedLabels: combinedData.map((d) => d.label).slice(0, 5),
      sortedCurrentAmounts: combinedData
        .map((d) => d.currentAmount)
        .slice(0, 5),
      sortedTargetAmounts: combinedData.map((d) => d.targetAmount).slice(0, 5),
    };
  };

  const { sortedLabels, sortedCurrentAmounts, sortedTargetAmounts } =
    sortData();

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
          labels: sortedLabels,
          datasets: [
        {
          label: "Current Amount",
          data: sortedCurrentAmounts,
          backgroundColor: "#0856BA",
          borderColor: "#0856BA",
          borderWidth: 1,
        },
        {
          label: "Target Amount",
          data: sortedTargetAmounts,
          backgroundColor: "#16A34A", // Green color for target
          borderColor: "#16A34A",
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
          plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
          let label = context.dataset.label || "";
          if (label) {
            label += ": ";
          }
          if (context.parsed.y !== null) {
            label += "₱" + context.parsed.y.toLocaleString();
          }
          return label;
            },
          },
        },
          },
          scales: {
        x: {
          type: "category",
          ticks: {
            autoSkip: true,
            maxRotation: 45,
            minRotation: 45,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
          return "₱" + value.toLocaleString();
            },
          },
        },
          },
        },
      });

      chartRef.current.chart = newChart;
    }
  }, [sortedLabels, sortedCurrentAmounts, sortedTargetAmounts, sortBy]);

  return (
    <div className="flex flex-col w-full">
      <div className="mb-4 flex justify-end">
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(
              e.target.value as
                | "currentAsc"
                | "currentDesc"
                | "targetAsc"
                | "targetDesc"
            )
          }
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#0856BA]"
        >
          <option value="currentDesc">Current Amount (Highest First)</option>
          <option value="currentAsc">Current Amount (Lowest First)</option>
          <option value="targetDesc">Target Amount (Highest First)</option>
          <option value="targetAsc">Target Amount (Lowest First)</option>
        </select>
      </div>
      <div style={{ position: "relative", height: "40vh" }}>
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default GroupedBarGraph;
