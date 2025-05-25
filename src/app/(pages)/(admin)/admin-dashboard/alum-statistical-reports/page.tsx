"use client";
import { useAlums } from "@/context/AlumContext";
import { Alumnus, WorkExperience } from "@/models/models";
import React, { useMemo, useState } from "react";
import DonutChart from "@/components/charts/DonutChart";
import { useWorkExperience } from "@/context/WorkExperienceContext";
import ReportSummaryCard from "@/components/ReportSummaryCard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ChevronDown, ChevronRight, ClipboardList } from "lucide-react";

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

  const toggleCard = (type: "active" | "inactive" | "newsletter") => {
    setExpandedCards((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <div className="flex flex-col gap-4 p-2 sm:p-4 max-w-7xl mx-auto w-full overflow-hidden">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2">
        <div className="hover:text-[#0856BA] cursor-pointer transition-colors">Home</div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div className="font-medium text-[#0856BA]">Statistical Reports</div>
      </div>

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-6 sm:w-8 h-6 sm:h-8 text-[#0856BA]" />
          <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-gray-800">Alumni Statistical Reports</h1>
        </div>
        <div className="bg-[#0856BA] text-white px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm whitespace-nowrap">
          {!isLoading && `Total Alumni: ${approvedAlums.length}`}
        </div>
      </div>

      {/* Top Section*/}
      <div className="flex flex-col xl:flex-row gap-3">
        {/* Report Summary */}
        <div className="w-full xl:w-[60%]">
          <div className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all flex flex-col">
            <div className="pb-1 border-b border-gray-100 p-3 sm:p-4">
              <div className="text-lg font-bold text-gray-800 flex items-center">
                <span className="w-1 h-4 bg-[#0856BA] rounded mr-2"></span>
                Report Summary
              </div>
            </div>
            <div className="p-3 sm:p-4 flex-1 flex flex-col justify-center">
              <div className="p-1 sm:p-2 rounded-lg h-100 overflow-auto max-h-[400px]">
                <ReportSummaryCard
                  data={`
                  // Alumni Overview
                  Total Number of alumni: ${approvedAlums.length} 
                  Active alumni: ${approvedActiveAlums.length} 
                  Inactive alumni: ${approvedAlums.length - approvedActiveAlums.length} 
                  
                  // Newsletter Metrics
                  Number of alumni subscribed to newsletters: ${alumsSubscribedToNewsletters.length} 
                  Number of alumni not subscribed to newsletters: ${
                    approvedAlums.length - alumsSubscribedToNewsletters.length
                  } 
                  Newsletter subscription rate: ${Math.round(
                    (alumsSubscribedToNewsletters.length / approvedAlums.length) * 100,
                  )}%
                  
                  // Employment Status
                  Number of Alumni currently employed: ${currentWorkExperience.length} 
                  Number of alumni currently unemployed: ${approvedAlums.length - currentWorkExperience.length}
                  Employment rate: ${Math.round((currentWorkExperience.length / approvedAlums.length) * 100)}%
                  
                  // Work Location
                  Number of alumni currently working in Philippines: ${philippineWorkExperience.length}
                  Number of alumni working abroad: ${currentWorkExperience.length - philippineWorkExperience.length}
                  Percentage working in Philippines: ${Math.round(
                    (philippineWorkExperience.length / currentWorkExperience.length) * 100,
                  )}%
                  
                  // Activity Metrics
                  Active alumni percentage: ${Math.round((approvedActiveAlums.length / approvedAlums.length) * 100)}%
                  Inactive alumni percentage: ${Math.round(
                    ((approvedAlums.length - approvedActiveAlums.length) / approvedAlums.length) * 100,
                  )}%
                  
                  // Date Context
                  Current date: ${new Date().toLocaleDateString()}
                  Report generated on: ${new Date().toLocaleString()}
                `}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Registration Status */}
        <div className="w-full xl:w-[40%]">
          <div className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all h-full flex flex-col">
            <div className="pb-1 border-b border-gray-100 p-3 sm:p-4">
              <div className="text-lg font-bold text-gray-800 flex items-center">
                <span className="w-1 h-4 bg-[#0856BA] rounded mr-2"></span>
                Registration Status
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-3">
              <div className="flex-1 bg-white border-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-center text-base sm:text-lg font-semibold text-gray-700">
                    Active vs Inactive Alumni
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center pt-0">
                  <div className="w-full max-w-[140px] sm:max-w-[160px] min-w-[100px] sm:min-w-[120px] aspect-square flex items-center justify-center mx-auto">
                    <DonutChart
                      labels={["Active", "Inactive"]}
                      data={[approvedActiveAlums.length, approvedAlums.length - approvedActiveAlums.length]}
                    />
                  </div>
                </CardContent>
              </div>
            </div>
            <div className="mt-4 text-center w-full p-3">
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Active: {approvedActiveAlums.length} | Inactive: {approvedAlums.length - approvedActiveAlums.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Newsletter Subscription */}
        <div className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all flex flex-col">
          <div className="pb-1 border-b border-gray-100 p-3">
            <div className="text-base sm:text-lg font-bold text-gray-800 flex items-center">
              <span className="w-1 h-4 bg-[#0856BA] rounded mr-2"></span>
              Newsletter Subscription
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-3">
            <div className="w-full max-w-[140px] sm:max-w-[160px] min-w-[100px] sm:min-w-[120px] aspect-square flex items-center justify-center mx-auto">
              <DonutChart
                labels={["Subscribed", "Not Subscribed"]}
                data={[alumsSubscribedToNewsletters.length, approvedAlums.length - alumsSubscribedToNewsletters.length]}
              />
            </div>
          </div>
          <div className="mt-2 text-center w-full p-2">
            <p className="text-xs sm:text-sm text-gray-600">
              Subscribed: {alumsSubscribedToNewsletters.length} | Not Subscribed:{" "}
              {approvedAlums.length - alumsSubscribedToNewsletters.length}
            </p>
          </div>
        </div>

        {/* Employment Status */}
        <div className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all flex flex-col">
          <div className="pb-1 border-b border-gray-100 p-3">
            <div className="text-base sm:text-lg font-bold text-gray-800 flex items-center">
              <span className="w-1 h-4 bg-[#0856BA] rounded mr-2"></span>
              Alumni Currently Employed
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-3">
            <div className="w-full max-w-[140px] sm:max-w-[160px] min-w-[100px] sm:min-w-[120px] aspect-square flex items-center justify-center mx-auto">
              <DonutChart
                labels={["Employed", "Unemployed"]}
                data={[currentWorkExperience.length, approvedAlums.length - currentWorkExperience.length]}
              />
            </div>
          </div>
          <div className="mt-2 text-center w-full p-2">
            <p className="text-xs sm:text-sm text-gray-600">
              Employed: {currentWorkExperience.length} | Unemployed:{" "}
              {approvedAlums.length - currentWorkExperience.length}
            </p>
          </div>
        </div>

        {/* Work Location */}
        <div className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all flex flex-col sm:col-span-2 lg:col-span-1">
          <div className="pb-1 border-b border-gray-100 p-3">
            <div className="text-base sm:text-lg font-bold text-gray-800 flex items-center">
              <span className="w-1 h-4 bg-[#0856BA] rounded mr-2"></span>
              Current Work Experience Locations
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-3">
            <div className="w-full max-w-[140px] sm:max-w-[160px] min-w-[100px] sm:min-w-[120px] aspect-square flex items-center justify-center mx-auto">
              <DonutChart
                labels={["Philippines", "Other Countries"]}
                data={[philippineWorkExperience.length, currentWorkExperience.length - philippineWorkExperience.length]}
              />
            </div>
          </div>
          <div className="mt-2 text-center w-full p-2">
            <p className="text-xs sm:text-sm text-gray-600">
              Philippines: {philippineWorkExperience.length} | Abroad:{" "}
              {currentWorkExperience.length - philippineWorkExperience.length}
            </p>
          </div>
        </div>
      </div>

      {/* Expandable Alumni Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Active Alumni Card */}
        <div className="flex flex-col">
          <Card
            className="bg-white overflow-hidden cursor-pointer rounded-lg shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all"
            onClick={() => toggleCard("active")}
          >
            <CardHeader className="px-3 sm:px-4 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-gray-700 text-sm sm:text-base">Active Alumni</CardTitle>
                  {!isLoading && (
                    <div className="text-[#0856BA] font-bold text-xl sm:text-2xl">{approvedActiveAlums.length}</div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-full p-1.5 text-[#0856BA]">
                  {expandedCards.active ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </div>
            </CardHeader>
            {expandedCards.active && (
              <CardContent className="pt-0 bg-gray-50 max-h-48 overflow-y-auto px-3 sm:px-4 py-2">
                {isLoading ? (
                  <p className="text-gray-500 py-2 text-sm">Loading...</p>
                ) : approvedActiveAlums.length === 0 ? (

                  <p className="text-gray-500 py-2 text-sm text-center">No active alumni found</p>

                ) : (
                  <ul className="divide-y divide-gray-200">
                    {approvedActiveAlums.map((alum: Alumnus, index: number) => (
                      <li key={index} className="py-1.5 text-gray-700 text-xs sm:text-sm flex items-center">
                        <span className="w-1.5 h-1.5 bg-[#0856BA] rounded-full mr-2 flex-shrink-0"></span>
                        <span className="truncate">
                          {alum.firstName} {alum.lastName}
                        </span>
                      </li>
                    ))}
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
            <CardHeader className="px-3 sm:px-4 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-gray-700 text-sm sm:text-base">Inactive Alumni</CardTitle>
                  {!isLoading && (
                    <div className="text-[#0856BA] font-bold text-xl sm:text-2xl">{inactiveAlums.length}</div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-full p-1.5 text-[#0856BA]">
                  {expandedCards.inactive ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </div>
            </CardHeader>
            {expandedCards.inactive && (
              <CardContent className="pt-0 bg-gray-50 max-h-48 overflow-y-auto px-3 sm:px-4 py-2">
                {isLoading ? (
                  <p className="text-gray-500 py-2 text-sm">Loading...</p>
                ) :
                inactiveAlums.length === 0 ? (

                  <p className="text-gray-500 py-2 text-sm text-center">No inactive alumni found</p>

                ) : (
                  <ul className="divide-y divide-gray-200">
                    {inactiveAlums.map((alum: Alumnus, index: number) => (
                      <li key={index} className="py-1.5 text-gray-700 text-xs sm:text-sm flex items-center">
                        <span className="w-1.5 h-1.5 bg-[#0856BA] rounded-full mr-2 flex-shrink-0"></span>
                        <span className="truncate">
                          {alum.firstName} {alum.lastName}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            )}
          </Card>
        </div>

        {/* Newsletter Subscribers Card */}
        <div className="flex flex-col sm:col-span-2 lg:col-span-1">
          <Card
            className="bg-white overflow-hidden cursor-pointer rounded-lg shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all"
            onClick={() => toggleCard("newsletter")}
          >
            <CardHeader className="px-3 sm:px-4 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-gray-700 text-sm sm:text-base">Newsletter Subscribers</CardTitle>
                  {!isLoading && (
                    <div className="text-[#0856BA] font-bold text-xl sm:text-2xl">
                      {alumsSubscribedToNewsletters.length}
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-full p-1.5 text-[#0856BA]">
                  {expandedCards.newsletter ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </div>
            </CardHeader>
            {expandedCards.newsletter && (
              <CardContent className="pt-0 bg-gray-50 max-h-48 overflow-y-auto px-3 sm:px-4 py-2">
                {isLoading ? (
                  <p className="text-gray-500 py-2 text-sm">Loading...</p>
                ) :
                alumsSubscribedToNewsletters.length === 0 ? (

                  <p className="text-gray-500 py-2 text-sm text-center">No newsletter subscribers found</p>

                ) : (
                  <ul className="divide-y divide-gray-200">
                    {alumsSubscribedToNewsletters.map((alum: Alumnus, index: number) => (
                      <li key={index} className="py-1.5 text-gray-700 text-xs sm:text-sm flex items-center">
                        <span className="w-1.5 h-1.5 bg-[#0856BA] rounded-full mr-2 flex-shrink-0"></span>
                        <span className="truncate">
                          {alum.firstName} {alum.lastName}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default StatisticalReports;
