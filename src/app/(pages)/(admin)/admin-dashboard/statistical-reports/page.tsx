"use client";
import { useAlums } from "@/context/AlumContext";
import { Alumnus } from "@/models/models";
import { Typography } from "@mui/material";
import React from "react";

const StatisticalReports = () => {
  const { activeAlums, isLoading } = useAlums();
  return (
    <div className="p-6">
      <Typography variant="h4" className="mb-4">
        Statistical Reports
      </Typography>

      <div className="flex justify-between gap-6">
        <div className="flex-1 bg-white shadow-md rounded-lg p-4">
          <Typography variant="h6" className="font-semibold mb-2">
            Active Members
          </Typography>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <Typography className="text-blue-600">
              Total: {activeAlums.length}
            </Typography>
          )}
          <ul className="list-disc list-inside mt-2">
            {activeAlums.map((alum: Alumnus) => (
              <li key={alum.alumniId} className="text-gray-700">
                {alum.firstName} {alum.lastName}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 bg-white shadow-md rounded-lg p-4">
          <Typography variant="h6" className="font-semibold mb-2">
            Donations
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default StatisticalReports;
