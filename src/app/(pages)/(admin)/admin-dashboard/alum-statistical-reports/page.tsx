"use client";
import { useAlums } from "@/context/AlumContext";
import { Alumnus, WorkExperience } from "@/models/models";
import { Typography } from "@mui/material";
import React, { useMemo } from "react";
import DonutChart from "@/components/charts/DonutChart";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import ReportSummaryCard from "@/components/ReportSummaryCard";

const StatisticalReports = () => {
  const { activeAlums, isLoading, alums } = useAlums();
  const { allWorkExperience } = useWorkExperience();

  const approvedActiveAlums = useMemo(() => {
    return activeAlums.filter((alum: Alumnus) => alum.regStatus === "approved");
  }, [activeAlums]);

  const approvedAlums = useMemo(() => {
    return alums.filter((alum: Alumnus) => alum.regStatus === "approved");
  }, [alums]);

  const inactiveAlums = useMemo(() => {
    return alums.filter(
      (alum: Alumnus) =>
        alum.activeStatus === false && alum.regStatus === "approved"
    );
  }, [alums]);

  const currentWorkExperience: WorkExperience[] = useMemo(() => {
    return allWorkExperience.filter(
      (work: WorkExperience) =>
        work.endYear === "present" &&
        approvedAlums.some((alum: Alumnus) => alum.alumniId === work.alumniId)
    );
  }, [allWorkExperience, approvedAlums]);

  const philippineWorkExperience = useMemo(() => {
    return currentWorkExperience.filter((work: WorkExperience) =>
      work.location.endsWith("Philippines")
    );
  }, [currentWorkExperience]);

  const alumsSubscribedToNewsletters = useMemo(() => {
    return alums.filter(
      (alum: Alumnus) =>
        alum.regStatus === "approved" && alum.subscribeToNewsletter
    );
  }, [alums]);

  return (
    <div className="p-6">
      <Typography variant="h4" className="mb-4">
        Alumni Statistical Report
      </Typography>

      {/* <BarGraph /> */}
      <div className="mb-4">
        <div className="flex justify-between gap-6">
          <div className="flex-1 bg-white shadow-md rounded-lg p-4 pb-7">
            <Typography variant="h6" className="font-semibold mb-2 text-center">
              Registration Status Charts
            </Typography>
            <div className="flex items-center justify-around">
              <div className="flex-1 flex flex-col items-center">
                <Typography variant="subtitle2" className="text-center mb-2">
                  Active vs Inactive Alumni
                </Typography>
                <div>
                  <DonutChart
                    labels={["Active", "Inactive"]}
                    data={[
                      approvedActiveAlums.length,
                      approvedAlums.length - approvedActiveAlums.length,
                    ]}
                  />
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <Typography variant="subtitle2" className="text-center mb-2">
                  Newsletter Subscription
                </Typography>
                <div>
                  <DonutChart
                    labels={["Subscribed", "Not Subscribed"]}
                    data={[
                      alumsSubscribedToNewsletters.length,
                      approvedAlums.length -
                        alumsSubscribedToNewsletters.length,
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mas maganda to I think if may dropdown na lang para puro graph makikita HAHAHAH pero nasa sau naman pano mapapaganda */}
      <div className="flex justify-between gap-6 mb-4">
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
            {activeAlums.map((alum: Alumnus, index: number) => (
              <li key={index} className="text-gray-700">
                {alum.firstName} {alum.lastName}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 bg-white shadow-md rounded-lg p-4">
          <Typography variant="h6" className="font-semibold mb-2">
            Inactive Members
          </Typography>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <Typography className="text-blue-600">
              Total: {inactiveAlums.length}
            </Typography>
          )}
          <ul className="list-disc list-inside mt-2">
            {inactiveAlums.map((alum: Alumnus, index: number) => (
              <li key={index} className="text-gray-700">
                {alum.firstName} {alum.lastName}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 bg-white shadow-md rounded-lg p-4">
          <Typography variant="h6" className="font-semibold mb-2">
            Users subscribed to newsletters
          </Typography>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <Typography className="text-blue-600">
              Total: {alumsSubscribedToNewsletters.length}
            </Typography>
          )}
          <ul className="list-disc list-inside mt-2">
            {alumsSubscribedToNewsletters.map(
              (alum: Alumnus, index: number) => (
                <li key={index} className="text-gray-700">
                  {alum.firstName} {alum.lastName}
                </li>
              )
            )}
          </ul>
        </div>
      </div>

      <div className="flex justify-between gap-6 mb-4">
        <div className="flex-1 bg-white shadow-md rounded-lg p-4 pb-7">
          <Typography variant="h6" className="font-semibold mb-2 text-center">
            Alumni Current Work Experience
          </Typography>
          <div className="flex items-center justify-around">
            <div className="flex-1 flex flex-col items-center">
              <Typography variant="subtitle2" className="text-center mb-2">
                Number of Alumni Currently Employed
              </Typography>
              <div>
                <DonutChart
                  labels={["Employed", "Unemployed"]}
                  data={[
                    currentWorkExperience.length,
                    approvedAlums.length - currentWorkExperience.length,
                  ]}
                />
              </div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <Typography variant="subtitle2" className="text-center mb-2">
                Current Work Experience Locations
              </Typography>
              <div>
                <DonutChart
                  labels={["Philippines", "Other Countries"]}
                  data={[
                    philippineWorkExperience.length,
                    currentWorkExperience.length -
                      philippineWorkExperience.length,
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ReportSummaryCard
        data={`
        Total Number of alumni: ${approvedAlums.length} 
        Active alumni: ${approvedActiveAlums.length} 
        Inactive alumni: ${approvedAlums.length - approvedActiveAlums.length} 
        Number of alumni subscribed to newsletters: ${
          alumsSubscribedToNewsletters.length
        } 
        Number of alumni not subscribed to newsletters: ${
          approvedAlums.length - alumsSubscribedToNewsletters.length
        } 
        Number of Alumni currently employed: ${currentWorkExperience.length} 
        Number of alumni currently working in the Philippines: ${
          philippineWorkExperience.length
        }
        Number of alumni currently unemployed: ${
          approvedAlums.length - currentWorkExperience.length
        }
      `}
      />
    </div>
  );
};

export default StatisticalReports;
