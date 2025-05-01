"use client";
import { useAlums } from "@/context/AlumContext";
import { Alumnus, WorkExperience } from "@/models/models";
import { Typography } from "@mui/material";
import React, { useMemo, useState } from "react";
import DonutChart from "@/components/charts/DonutChart";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import ReportSummaryCard from "@/components/ReportSummaryCard";
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";

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

  const [expandedCards, setExpandedCards] = useState({
    active: false,
    inactive: false,
    newsletter: false,
  });
  
  const toggleCard = (type: 'active' | 'inactive' | 'newsletter') => {
    setExpandedCards(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };
  
  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2">
        <div>Home</div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div>Statistical Reports</div>
      </div>
  
      {/* Page Title */}
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">Alumni Statistical Reports</div>
          <div className="text-sm text-gray-500">
            {!isLoading && `Total Alumni: ${approvedAlums.length}`}
          </div>
        </div>
      </div>
  
      {/* Charts Section */}
      <div className="mb-6 space-y-8 bg-white rounded-xl shadow-md p-6">
        {/* Registration Status */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-center">Registration Status Charts</h2>
          <div className="flex flex-col lg:flex-row gap-4">
            <Card className="flex-1 bg-white rounded-xl shadow-md border border-gray-300">
              <CardHeader>
                <CardTitle className="text-center text-lg font-semibold">
                  Active vs Inactive Alumni
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <DonutChart
                  labels={["Active", "Inactive"]}
                  data={[
                    approvedActiveAlums.length,
                    approvedAlums.length - approvedActiveAlums.length,
                  ]}
                />
              </CardContent>
            </Card>
  
            <Card className="flex-1 bg-white rounded-xl shadow-md border border-gray-300">
              <CardHeader>
                <CardTitle className="text-center text-lg font-semibold">
                  Newsletter Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <DonutChart
                  labels={["Subscribed", "Not Subscribed"]}
                  data={[
                    alumsSubscribedToNewsletters.length,
                    approvedAlums.length - alumsSubscribedToNewsletters.length,
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </div>
  
        {/* Work Experience */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-center">Alumni Current Work Experience</h2>
          <div className="flex flex-col lg:flex-row gap-4">
            <Card className="flex-1 bg-white rounded-xl shadow-md border border-gray-300">
              <CardHeader>
                <CardTitle className="text-center text-lg font-semibold">
                  Number of Alumni Currently Employed
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <DonutChart
                  labels={["Employed", "Unemployed"]}
                  data={[
                    currentWorkExperience.length,
                    approvedAlums.length - currentWorkExperience.length,
                  ]}
                />
              </CardContent>
            </Card>
  
            <Card className="flex-1 bg-white rounded-xl shadow-md border border-gray-300">
              <CardHeader>
                <CardTitle className="text-center text-lg font-semibold">
                  Current Work Experience Locations
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <DonutChart
                  labels={["Philippines", "Other Countries"]}
                  data={[
                    philippineWorkExperience.length,
                    currentWorkExperience.length - philippineWorkExperience.length,
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Expandable Alumni Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      {/* Active Alumni Card */}
      <div className="flex flex-col h-full">
        <Card
          className="bg-white overflow-hidden cursor-pointer rounded-xl shadow-sm border border-gray-300"
          onClick={() => toggleCard("active")}
        >
          <CardHeader className="px-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-gray-800">Active</CardTitle>
                {!isLoading && (
                  <div className="text-[var(--primary-blue)] font-bold text-2xl">
                    {approvedActiveAlums.length}
                  </div>
                )}
              </div>
              <div className="text-gray-500">
                {expandedCards.active ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </div>
            </div>
          </CardHeader>
          {expandedCards.active && (
            <CardContent className="pt-0 bg-gray-50 max-h-64 overflow-y-auto">
              {isLoading ? (
                <p className="text-gray-500">Loading...</p>
              ) : (
                <ul className="list-disc list-inside pr-2">
                  {approvedActiveAlums.map((alum: Alumnus, index: number) => (
                    <li key={index} className="text-gray-700">
                      {alum.firstName} {alum.lastName}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          )}
        </Card>
      </div>

      {/* Inactive Alumni Card */}
      <div className="flex flex-col h-full">
        <Card
          className="bg-white overflow-hidden cursor-pointer rounded-xl shadow-sm border border-gray-300"
          onClick={() => toggleCard("inactive")}
        >
          <CardHeader className="px-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-gray-800">Inactive</CardTitle>
                {!isLoading && (
                  <div className="text-[var(--primary-blue)] font-bold text-2xl">
                    {inactiveAlums.length}
                  </div>
                )}
              </div>
              <div className="text-gray-500">
                {expandedCards.inactive ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </div>
            </div>
          </CardHeader>
          {expandedCards.inactive && (
            <CardContent className="pt-0 bg-gray-50 max-h-64 overflow-y-auto">
              {isLoading ? (
                <p className="text-gray-500">Loading...</p>
              ) : (
                <ul className="list-disc list-inside pr-2">
                  {inactiveAlums.map((alum: Alumnus, index: number) => (
                    <li key={index} className="text-gray-700">
                      {alum.firstName} {alum.lastName}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          )}
        </Card>
      </div>

      {/* Newsletter Subscribers Card */}
      <div className="flex flex-col h-full">
        <Card
          className="bg-white overflow-hidden cursor-pointer rounded-xl shadow-sm border border-gray-300"
          onClick={() => toggleCard("newsletter")}
        >
          <CardHeader className="px-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-gray-800">Newsletter Subscribers</CardTitle>
                {!isLoading && (
                  <div className="text-[var(--primary-blue)] font-bold text-2xl">
                    {alumsSubscribedToNewsletters.length}
                  </div>
                )}
              </div>
              <div className="text-gray-500">
                {expandedCards.newsletter ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
              </div>
            </div>
          </CardHeader>
          {expandedCards.newsletter && (
            <CardContent className="pt-0 bg-gray-50 max-h-64 overflow-y-auto">
              {isLoading ? (
                <p className="text-gray-500">Loading...</p>
              ) : (
                <ul className="list-disc list-inside pr-2">
                  {alumsSubscribedToNewsletters.map((alum: Alumnus, index: number) => (
                    <li key={index} className="text-gray-700">
                      {alum.firstName} {alum.lastName}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  
      {/* Report Summary */}
      <div className="mt-6">
        <Card className="bg-white rounded-xl shadow-md border border-gray-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Report Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportSummaryCard
              data={`
                Total Number of alumni: ${approvedAlums.length} 
                Active alumni: ${approvedActiveAlums.length} 
                Inactive alumni: ${approvedAlums.length - approvedActiveAlums.length} 
                Number of alumni subscribed to newsletters: ${alumsSubscribedToNewsletters.length} 
                Number of alumni not subscribed to newsletters: ${approvedAlums.length - alumsSubscribedToNewsletters.length} 
                Number of Alumni currently employed: ${currentWorkExperience.length} 
                Number of alumni currently unemployed: ${approvedAlums.length - currentWorkExperience.length}
              `}
            />
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};  

export default StatisticalReports;
