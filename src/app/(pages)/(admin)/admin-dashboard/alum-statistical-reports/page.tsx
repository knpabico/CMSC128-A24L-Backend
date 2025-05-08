"use client";
import { useAlums } from "@/context/AlumContext";
import { Alumnus, WorkExperience } from "@/models/models";
import { Typography } from "@mui/material";
import React, { useMemo, useState } from "react";
import DonutChart from "@/components/charts/DonutChart";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import ReportSummaryCard from "@/components/ReportSummaryCard";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";

const StatisticalReports = () => {
  const { activeAlums, isLoading, alums } = useAlums();
  const { allWorkExperience } = useWorkExperience();

  const approvedActiveAlums = useMemo(() => {
    console.log(activeAlums.length);
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

  const toggleCard = (type: "active" | "inactive" | "newsletter") => {
    setExpandedCards((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2">
        <div className="hover:text-[#0856BA] cursor-pointer transition-colors">
          Home
        </div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div className="font-medium text-[#0856BA]">Statistical Reports</div>
      </div>

      {/* Page Title and Info */}
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl text-gray-800">
            Alumni Statistical Reports
          </div>
          <div className="bg-[var(--primary-blue)] text-white px-4 py-2 rounded-full text-sm font-medium">
            {!isLoading && `Total Alumni: ${approvedAlums.length}`}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mb-6 space-y-8 bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        {/* Registration Status */}
        <div>
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2 border-gray-100">
            Registration Status
          </h2>
          <div className="flex flex-col lg:flex-row gap-6">
            <Card className="flex-1 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-lg font-semibold text-gray-700">
                  Active vs Inactive Alumni
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center pt-0">
                <DonutChart
                  labels={["Active", "Inactive"]}
                  data={[
                    approvedActiveAlums.length,
                    approvedAlums.length - approvedActiveAlums.length,
                  ]}
                />
              </CardContent>
            </Card>

            <Card className="flex-1 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-lg font-semibold text-gray-700">
                  Newsletter Subscription
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center pt-0">
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
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2 border-gray-100">
            Alumni Current Work Experience
          </h2>
          <div className="flex flex-col lg:flex-row gap-6">
            <Card className="flex-1 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-lg font-semibold text-gray-700">
                  Number of Alumni Currently Employed
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center pt-0">
                <DonutChart
                  labels={["Employed", "Unemployed"]}
                  data={[
                    currentWorkExperience.length,
                    approvedAlums.length - currentWorkExperience.length,
                  ]}
                />
              </CardContent>
            </Card>

            <Card className="flex-1 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-lg font-semibold text-gray-700">
                  Current Work Experience Locations
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center pt-0">
                <DonutChart
                  labels={["Philippines", "Other Countries"]}
                  data={[
                    philippineWorkExperience.length,
                    currentWorkExperience.length -
                      philippineWorkExperience.length,
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Expandable Alumni Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Active Alumni Card */}
          <div className="flex flex-col">
            <Card
              className="bg-white overflow-hidden cursor-pointer rounded-lg shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all"
              onClick={() => toggleCard("active")}
            >
              <CardHeader className="px-4 py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-gray-700 text-base">
                      Active Alumni
                    </CardTitle>
                    {!isLoading && (
                      <div className="text-[#0856BA] font-bold text-2xl">
                        {approvedActiveAlums.length}
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-full p-1.5 text-[#0856BA]">
                    {expandedCards.active ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </div>
                </div>
              </CardHeader>
              {expandedCards.active && (
                <CardContent className="pt-0 bg-gray-50 max-h-48 overflow-y-auto px-4 py-2">
                  {isLoading ? (
                    <p className="text-gray-500 py-2 text-sm">Loading...</p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {approvedActiveAlums.map(
                        (alum: Alumnus, index: number) => (
                          <li
                            key={index}
                            className="py-1.5 text-gray-700 text-sm flex items-center"
                          >
                            <span className="w-1.5 h-1.5 bg-[#0856BA] rounded-full mr-2"></span>
                            {alum.firstName} {alum.lastName}
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </CardContent>
              )}
            </Card>
          </div>

          {/* Inactive Alumni Card */}
          <div className="flex flex-col">
            <Card
              className="bg-white overflow-hidden cursor-pointer rounded-lg shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all"
              onClick={() => toggleCard("inactive")}
            >
              <CardHeader className="px-4 py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-gray-700 text-base">
                      Inactive Alumni
                    </CardTitle>
                    {!isLoading && (
                      <div className="text-[#0856BA] font-bold text-2xl">
                        {inactiveAlums.length}
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-full p-1.5 text-[#0856BA]">
                    {expandedCards.inactive ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </div>
                </div>
              </CardHeader>
              {expandedCards.inactive && (
                <CardContent className="pt-0 bg-gray-50 max-h-48 overflow-y-auto px-4 py-2">
                  {isLoading ? (
                    <p className="text-gray-500 py-2 text-sm">Loading...</p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {inactiveAlums.map((alum: Alumnus, index: number) => (
                        <li
                          key={index}
                          className="py-1.5 text-gray-700 text-sm flex items-center"
                        >
                          <span className="w-1.5 h-1.5 bg-[#0856BA] rounded-full mr-2"></span>
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
          <div className="flex flex-col">
            <Card
              className="bg-white overflow-hidden cursor-pointer rounded-lg shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all"
              onClick={() => toggleCard("newsletter")}
            >
              <CardHeader className="px-4 py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-gray-700 text-base">
                      Newsletter Subscribers
                    </CardTitle>
                    {!isLoading && (
                      <div className="text-[#0856BA] font-bold text-2xl">
                        {alumsSubscribedToNewsletters.length}
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-full p-1.5 text-[#0856BA]">
                    {expandedCards.newsletter ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </div>
                </div>
              </CardHeader>
              {expandedCards.newsletter && (
                <CardContent className="pt-0 bg-gray-50 max-h-48 overflow-y-auto px-4 py-2">
                  {isLoading ? (
                    <p className="text-gray-500 py-2 text-sm">Loading...</p>
                  ) : (
                    <ul className="divide-y divide-gray-200">
                      {alumsSubscribedToNewsletters.map(
                        (alum: Alumnus, index: number) => (
                          <li
                            key={index}
                            className="py-1.5 text-gray-700 text-sm flex items-center"
                          >
                            <span className="w-1.5 h-1.5 bg-[#0856BA] rounded-full mr-2"></span>
                            {alum.firstName} {alum.lastName}
                          </li>
                        )
                      )}
                    </ul>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        </div>

        {/* Report Summary */}
        <div className="mt-8">
          <Card className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
            <CardHeader className="pb-2 border-b border-gray-100">
              <CardTitle className="text-xl font-bold text-gray-800">
                Report Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-gradient-to-r from-[#0856BA]/5 to-white p-6 rounded-lg">
                <ReportSummaryCard
                  data={`
                    Total Number of alumni: ${approvedAlums.length} 
                    Active alumni: ${approvedActiveAlums.length} 
                    Inactive alumni: ${
                      approvedAlums.length - approvedActiveAlums.length
                    } 
                    Number of alumni subscribed to newsletters: ${
                      alumsSubscribedToNewsletters.length
                    } 
                    Number of alumni not subscribed to newsletters: ${
                      approvedAlums.length - alumsSubscribedToNewsletters.length
                    } 
                    Number of Alumni currently employed: ${
                      currentWorkExperience.length
                    } 
                    Number of alumni currently unemployed: ${
                      approvedAlums.length - currentWorkExperience.length
                    }
                    Number of alumni currently working in Philippines: ${
                      philippineWorkExperience.length
                    }
                  `}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StatisticalReports;
