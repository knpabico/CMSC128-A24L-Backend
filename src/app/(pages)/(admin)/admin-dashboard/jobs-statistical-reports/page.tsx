"use client";

import { useState, useEffect } from "react";
import DonutChart from "@/components/charts/DonutChart";
import BarGraph from "@/components/charts/BarGraph";
import { useJobOffer } from "@/context/JobOfferContext";
import { useJobApplicationContext } from "@/context/JobApplicationContext";
import { JobApplication, JobOffering } from "@/models/models";
import ReportSummaryCard from "@/components/ReportSummaryCard";
import { BarChart, ChevronRight } from "lucide-react";

export default function JobStatisticsReport() {
  // State for all of our statistical data
  const [jobTypeDistribution, setJobTypeDistribution] = useState<{
    labels: string[];
    data: number[];
  }>({ labels: [], data: [] });
  const [employmentTypeDistribution, setEmploymentTypeDistribution] = useState<{
    labels: string[];
    data: number[];
  }>({ labels: [], data: [] });
  const [experienceLevelDistribution, setExperienceLevelDistribution] =
    useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [applicationStatusDistribution, setApplicationStatusDistribution] =
    useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [applicationsPerJob, setApplicationsPerJob] = useState<{
    labels: string[];
    data: number[];
  }>({ labels: [], data: [] });
  const [weeklyJobPostings, setWeeklyJobPostings] = useState<{
    labels: string[];
    data: number[];
  }>({ labels: [], data: [] });
  const [topSkills, setTopSkills] = useState<{
    labels: string[];
    data: number[];
  }>({ labels: [], data: [] });
  const [salaryRangeDistribution, setSalaryRangeDistribution] = useState<{
    labels: string[];
    data: number[];
  }>({ labels: [], data: [] });

  // Colors for charts
  const jobTypeColors = ["#0856BA", "#4B9CD3", "#F59E0B", "#10B981", "#8B5CF6"];
  const employmentTypeColors = ["#0856BA", "#4B9CD3", "#F59E0B", "#10B981"];
  const experienceLevelColors = ["#0856BA", "#4B9CD3", "#F59E0B"];
  const applicationStatusColors = ["#0856BA", "#4B9CD3", "#F59E0B", "#10B981"];

  const { jobOffers: offers } = useJobOffer();
  const { jobApplications } = useJobApplicationContext();

  useEffect(() => {
    // Process job type distribution
    const jobOffers = offers.filter(
      (offer: JobOffering) => offer.status === "Accepted"
    );
    const jobTypeCounts: Record<string, number> = {};
    jobOffers.forEach((job: JobOffering) => {
      jobTypeCounts[job.jobType] = (jobTypeCounts[job.jobType] || 0) + 1;
    });

    setJobTypeDistribution({
      labels: Object.keys(jobTypeCounts),
      data: Object.values(jobTypeCounts),
    });

    // Process employment type distribution
    const employmentTypeCounts: Record<string, number> = {};
    jobOffers.forEach((job: JobOffering) => {
      employmentTypeCounts[job.employmentType] =
        (employmentTypeCounts[job.employmentType] || 0) + 1;
    });

    setEmploymentTypeDistribution({
      labels: Object.keys(employmentTypeCounts),
      data: Object.values(employmentTypeCounts),
    });

    // Process experience level distribution
    const experienceLevelCounts: Record<string, number> = {};
    jobOffers.forEach((job: JobOffering) => {
      experienceLevelCounts[job.experienceLevel] =
        (experienceLevelCounts[job.experienceLevel] || 0) + 1;
    });

    setExperienceLevelDistribution({
      labels: Object.keys(experienceLevelCounts),
      data: Object.values(experienceLevelCounts),
    });

    // Process application status distribution
    const applicationStatusCounts: Record<string, number> = {};
    jobApplications.forEach((app: JobApplication) => {
      applicationStatusCounts[app.status] =
        (applicationStatusCounts[app.status] || 0) + 1;
    });

    setApplicationStatusDistribution({
      labels: Object.keys(applicationStatusCounts),
      data: Object.values(applicationStatusCounts),
    });

    // Process applications per job
    const applicationsCountPerJob: Record<string, number> = {};
    jobApplications.forEach((app: JobApplication) => {
      applicationsCountPerJob[app.jobId] =
        (applicationsCountPerJob[app.jobId] || 0) + 1;
    });

    // Sort jobs by application count (highest to lowest)
    const sortedJobIds = Object.keys(applicationsCountPerJob).sort(
      (a, b) => applicationsCountPerJob[b] - applicationsCountPerJob[a]
    );

    // Create arrays for sorted labels and data
    const sortedJobLabels = [];
    const sortedApplicationCounts = [];

    // Populate arrays with sorted data
    for (const jobId of sortedJobIds) {
      const job = jobOffers.find((j: JobOffering) => j.jobId === jobId);
      if (job) {
        sortedJobLabels.push(`${job.position} (${job.company})`);
        sortedApplicationCounts.push(applicationsCountPerJob[jobId]);
      }
    }

    setApplicationsPerJob({
      labels: sortedJobLabels.slice(0, 5),
      data: sortedApplicationCounts.slice(0, 5),
    });

    // Process weekly job postings
    const weekCounts: Record<string, number> = {};
    jobOffers.forEach((job: JobOffering) => {
      // Handle datePosted which could be a Timestamp from Firebase or a Date
      let weekStart;
      if (
        job.datePosted &&
        typeof job.datePosted === "object" &&
        "toDate" in job.datePosted &&
        typeof job.datePosted.toDate === "function"
      ) {
        // Handle Firebase Timestamp by converting to Date
        weekStart = job.datePosted.toDate();
      } else if (job.datePosted) {
        // Handle if it's already a Date or can be converted to one
        weekStart = new Date(job.datePosted);
      } else {
        // Fallback if datePosted is undefined or invalid
        return;
      }

      // Make sure we have a valid date before proceeding
      if (!isNaN(weekStart.getTime())) {
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
        weekCounts[weekKey] = (weekCounts[weekKey] || 0) + 1;
      }
    });

    // Sort weeks chronologically
    const sortedWeeks = Object.keys(weekCounts).sort((a, b) => {
      const [aMonth, aDay] = a.split("/").map(Number);
      const [bMonth, bDay] = b.split("/").map(Number);
      return aMonth !== bMonth ? aMonth - bMonth : aDay - bDay;
    });
    setWeeklyJobPostings({
      labels: sortedWeeks.map((week) => {
        // Ensure week is a valid string before using it
        return typeof week === "string" && !isNaN(Date.parse(`2023/${week}`))
          ? `Week of ${week}`
          : `Week ${sortedWeeks.indexOf(week) + 1}`;
      }),
      data: sortedWeeks.map((week) => weekCounts[week] || 0),
    });

    // Process top skills
    const skillsCounts: Record<string, number> = {};
    jobOffers.forEach((job: JobOffering) => {
      job.requiredSkill.forEach((skill) => {
        skillsCounts[skill] = (skillsCounts[skill] || 0) + 1;
      });
    });

    // Sort skills by count and take top 5
    const sortedSkills = Object.entries(skillsCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    setTopSkills({
      labels: sortedSkills.map(([skill]) => skill),
      data: sortedSkills.map(([, count]) => count),
    });

    // Process salary range distribution
    const salaryRanges = [
      "<=P50K",
      "P50K-P70K",
      "P70K-P90K",
      "P90K-P110K",
      "P110K-P130K",
      ">P130K",
    ];

    const salaryRangeCounts = salaryRanges.map(() => 0);

    jobOffers.forEach((job: JobOffering) => {
      const salaryString = job.salaryRange;
      let maxSalary = 0;

      if (salaryString.includes("-")) {
        // Handle range format like "20000-30000" or "200000-300000"
        const parts = salaryString.split("-");
        maxSalary = parseInt(parts[1].trim());
      } else {
        // Handle single value like "1000" or "50000"
        maxSalary = parseInt(salaryString.trim());
      }

      if (!isNaN(maxSalary)) {
        if (maxSalary <= 50000) {
          salaryRangeCounts[0]++;
        } else if (maxSalary <= 70000) {
          salaryRangeCounts[1]++;
        } else if (maxSalary <= 90000) {
          salaryRangeCounts[2]++;
        } else if (maxSalary <= 110000) {
          salaryRangeCounts[3]++;
        } else if (maxSalary <= 130000) {
          salaryRangeCounts[4]++;
        } else {
          salaryRangeCounts[5]++;
        }
      }
    });

    setSalaryRangeDistribution({
      labels: salaryRanges,
      data: salaryRangeCounts,
    });
  }, [offers, jobApplications]);

  return (
    <div className="flex flex-col gap-4 p-2 sm:p-4 max-w-7xl mx-auto w-full overflow-hidden">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2">
        <div className="hover:text-[#0856BA] cursor-pointer transition-colors">Home</div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div className="font-medium text-[#0856BA]">Job Market Analytics</div>
      </div>

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-2">
          <BarChart className="w-8 h-8 text-[#0856BA]" />
          <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-gray-800">Job Market Analytics Dashboard</h1>
        </div>
        <div className="bg-[#0856BA] text-white px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm whitespace-nowrap">
          Total Jobs: {offers.filter((offer: JobOffering) => offer.status === "Accepted").length}
        </div>
      </div>

      {/* Top Section - Report Summary (60%) and Application Status (40%) */}
      <div className="flex flex-col xl:flex-row gap-3">
        {/* Left Side - Report Summary (60%) */}
        <div className="w-full xl:w-[60%]">
          <div className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all flex flex-col">
            <div className="pb-1 border-b border-gray-100 p-4">
              <div className="flex items-center text-xl font-bold text-gray-800">
                <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
                Report Summary
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-center">
              <div className="p-1 sm:p-2 rounded-lg h-100 overflow-auto max-h-[400px]">
                <ReportSummaryCard
                  data={`
        // Job Market Overview
        Total job offerings: ${offers.filter((offer: JobOffering) => offer.status === "Accepted").length}
        Total applications submitted: ${applicationStatusDistribution.data.reduce((sum, count) => sum + count, 0)}
        
        // Application Status Metrics
        Applications accepted: ${
          applicationStatusDistribution.labels.includes("accepted")
            ? applicationStatusDistribution.data[applicationStatusDistribution.labels.indexOf("accepted")]
            : 0
        }
        Applications rejected: ${
          applicationStatusDistribution.labels.includes("rejected")
            ? applicationStatusDistribution.data[applicationStatusDistribution.labels.indexOf("rejected")]
            : 0
        }
        Applications pending: ${
          applicationStatusDistribution.labels.includes("pending")
            ? applicationStatusDistribution.data[applicationStatusDistribution.labels.indexOf("pending")]
            : 0
        }
        
        // Job Type Distribution
        Job types breakdown: ${jobTypeDistribution.labels
          .map((label, index) => `${label}: ${jobTypeDistribution.data[index]}`)
          .join(", ")}
        Most common job type: ${
          jobTypeDistribution.labels[jobTypeDistribution.data.indexOf(Math.max(...jobTypeDistribution.data))]
        }
        
        // Employment Type Distribution
        Employment types breakdown: ${employmentTypeDistribution.labels
          .map((label, index) => `${label}: ${employmentTypeDistribution.data[index]}`)
          .join(", ")}
        Most common employment type: ${
          employmentTypeDistribution.labels[
            employmentTypeDistribution.data.indexOf(Math.max(...employmentTypeDistribution.data))
          ]
        }
        
        // Experience Level Distribution
        Experience levels breakdown: ${experienceLevelDistribution.labels
          .map((label, index) => `${label}: ${experienceLevelDistribution.data[index]}`)
          .join(", ")}
        Most common experience level: ${
          experienceLevelDistribution.labels[
            experienceLevelDistribution.data.indexOf(Math.max(...experienceLevelDistribution.data))
          ]
        }
        
        // Application Metrics
        Average applications per job: ${Math.round(
          applicationsPerJob.data.reduce((sum, count) => sum + count, 0) / applicationsPerJob.data.length,
        )}
        Job with most applications: ${
          applicationsPerJob.labels[applicationsPerJob.data.indexOf(Math.max(...applicationsPerJob.data))]
        } (${Math.max(...applicationsPerJob.data)} applications)
        
        // Top Skills
        Top 5 in-demand skills: ${topSkills.labels
          .map((label, index) => `${label} (${topSkills.data[index]})`)
          .join(", ")}
        Most requested skill: ${topSkills.labels[topSkills.data.indexOf(Math.max(...topSkills.data))]}
        
        // Salary Distribution
        Salary range breakdown: ${salaryRangeDistribution.labels
          .map((label, index) => `${label}: ${salaryRangeDistribution.data[index]}`)
          .join(", ")}
        Most common salary range: ${
          salaryRangeDistribution.labels[
            salaryRangeDistribution.data.indexOf(Math.max(...salaryRangeDistribution.data))
          ]
        }
        
        // Market Trends
        Weekly job posting trend: ${weeklyJobPostings.labels
          .map((label, index) => `${label}: ${weeklyJobPostings.data[index]}`)
          .join(", ")}
        Week with highest postings: ${
          weeklyJobPostings.labels[weeklyJobPostings.data.indexOf(Math.max(...weeklyJobPostings.data))]
        } (${Math.max(...weeklyJobPostings.data)} postings)
        Job posting trend: ${
          weeklyJobPostings.data.every((val, i, arr) => i === 0 || val >= arr[i - 1])
            ? "Increasing"
            : weeklyJobPostings.data.every((val, i, arr) => i === 0 || val <= arr[i - 1])
              ? "Decreasing"
              : "Fluctuating"
        }
        
        // Application Success Rate
        Application success rate: ${
          applicationStatusDistribution.labels.includes("accepted")
            ? Math.round(
                (applicationStatusDistribution.data[applicationStatusDistribution.labels.indexOf("accepted")] /
                  applicationStatusDistribution.data.reduce((sum, count) => sum + count, 0)) *
                  100,
              )
            : 0
        }%
        Application rejection rate: ${
          applicationStatusDistribution.labels.includes("rejected")
            ? Math.round(
                (applicationStatusDistribution.data[applicationStatusDistribution.labels.indexOf("rejected")] /
                  applicationStatusDistribution.data.reduce((sum, count) => sum + count, 0)) *
                  100,
              )
            : 0
        }%
        
        // Date Context
        Current date: ${new Date().toLocaleDateString()}
        Report generated on: ${new Date().toLocaleString()}
        
        `}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Application Status (40%) */}
        <div className="w-full xl:w-[40%]">
          <div className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all h-full flex flex-col">
            <div className="pb-2 border-b border-gray-100 p-4">
              <div className="text-lg font-bold text-gray-800 flex items-center">
                <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
                Application Status
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center p-4">
              <div className="w-full flex justify-center items-center flex-1">
                <div className="w-full max-w-[140px] sm:max-w-[160px] min-w-[100px] sm:min-w-[120px] aspect-square flex items-center justify-center mx-auto">
                  <DonutChart
                    labels={applicationStatusDistribution.labels}
                    data={applicationStatusDistribution.data}
                    backgroundColor={applicationStatusColors}
                    options={true}
                  />
                </div>
              </div>
              <div className="mt-4 text-center w-full">
                <p className="text-sm font-medium mt-2 text-gray-800">
                  Total Applications: {applicationStatusDistribution.data.reduce((sum, count) => sum + count, 0)}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Accepted:{" "}
                  {applicationStatusDistribution.labels.includes("accepted")
                    ? applicationStatusDistribution.data[applicationStatusDistribution.labels.indexOf("accepted")]
                    : 0}{" "}
                  | Rejected:{" "}
                  {applicationStatusDistribution.labels.includes("rejected")
                    ? applicationStatusDistribution.data[applicationStatusDistribution.labels.indexOf("rejected")]
                    : 0}{" "}
                  | Pending:{" "}
                  {applicationStatusDistribution.labels.includes("pending")
                    ? applicationStatusDistribution.data[applicationStatusDistribution.labels.indexOf("pending")]
                    : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section - Job Offerings Distribution charts row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Employment Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all flex flex-col">
          <div className="pb-1 border-b border-gray-100 p-3">
            <div className="text-lg font-bold text-gray-800 flex items-center">
              <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
              Employment Types
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-3">
            <div className="w-full max-w-[140px] sm:max-w-[160px] min-w-[100px] sm:min-w-[120px] aspect-square flex items-center justify-center mx-auto">
              <DonutChart
                labels={employmentTypeDistribution.labels}
                data={employmentTypeDistribution.data}
                backgroundColor={employmentTypeColors}
                options={true}
              />
            </div>
          </div>
          {employmentTypeDistribution.data.length > 0 && (
            <div className="px-2 sm:px-3 py-2 sm:py-3 mt-auto mb-2 mx-2 bg-gray-50 rounded-lg border-l-4 border-[#0856BA]">
              <p className="text-xs sm:text-sm font-medium text-gray-800">
                <span className="font-semibold text-[#0856BA]">
                  {
                    employmentTypeDistribution.labels[
                      employmentTypeDistribution.data.indexOf(Math.max(...employmentTypeDistribution.data))
                    ]
                  }
                </span>{" "}
                positions account for the majority of job offerings, with other employment types making up a smaller
                portion.
              </p>
            </div>
          )}
        </div>
        {/* Job Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all flex flex-col">
          <div className="pb-1 border-b border-gray-100 p-3">
            <div className="text-lg font-bold text-gray-800 flex items-center">
              <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
              Job Types
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-3">
            <div className="w-full max-w-[140px] sm:max-w-[160px] min-w-[100px] sm:min-w-[120px] aspect-square flex items-center justify-center mx-auto">
              <DonutChart
                labels={jobTypeDistribution.labels}
                data={jobTypeDistribution.data}
                backgroundColor={jobTypeColors}
                options={true}
              />
            </div>
          </div>
          {jobTypeDistribution.data.length > 0 && (
            <div className="px-2 sm:px-3 py-2 sm:py-3 mt-auto mb-2 mx-2 bg-gray-50 rounded-lg border-l-4 border-[#0856BA]">
              <p className="text-xs sm:text-sm font-medium text-gray-800">
                <span className="font-semibold text-[#0856BA]">
                  {jobTypeDistribution.labels[jobTypeDistribution.data.indexOf(Math.max(...jobTypeDistribution.data))]}
                </span>{" "}
                positions dominate the current job market.
              </p>
            </div>
          )}
        </div>

        {/* Experience Level Distribution */}
        <div className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all flex flex-col">
          <div className="pb-1 border-b border-gray-100 p-3">
            <div className="text-lg font-bold text-gray-800 flex items-center">
              <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
              Experience Levels
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-3">
            <div className="w-full max-w-[140px] sm:max-w-[160px] min-w-[100px] sm:min-w-[120px] aspect-square flex items-center justify-center mx-auto">
              <DonutChart
                labels={experienceLevelDistribution.labels}
                data={experienceLevelDistribution.data}
                backgroundColor={experienceLevelColors}
                options={true}
              />
            </div>
          </div>
          {experienceLevelDistribution.data.length > 0 && (
            <div className="px-2 sm:px-3 py-2 sm:py-3 mt-auto mb-2 mx-2 bg-gray-50 rounded-lg border-l-4 border-[#0856BA]">
              <p className="text-xs sm:text-sm font-medium text-gray-800">
                <span className="font-semibold text-[#0856BA]">
                  {
                    experienceLevelDistribution.labels[
                      experienceLevelDistribution.data.indexOf(Math.max(...experienceLevelDistribution.data))
                    ]
                  }
                </span>{" "}
                positions are the most common
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Top Skills */}
        <div className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all flex flex-col">
          <div className="pb-1 border-b border-gray-100 p-3">
            <div className="text-lg font-bold text-gray-800 flex items-center">
              <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
              Top Required Skills
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-3">
            <div className="w-full min-h-[150px] sm:min-h-[180px] overflow-hidden">
              <BarGraph labels={topSkills.labels} data={topSkills.data} type="Job Postings" />
            </div>
          </div>
          {topSkills.data.length > 0 && (
            <div className="px-2 sm:px-3 py-2 sm:py-3 mt-auto mb-2 mx-2 bg-gray-50 rounded-lg border-l-4 border-[#0856BA]">
              <p className="text-xs sm:text-sm text-gray-800">
                {topSkills.data.length > 0 ? (
                  <>
                    <span className="font-semibold text-[#0856BA]">
                      {topSkills.labels[topSkills.data.indexOf(Math.max(...topSkills.data))]}
                    </span>{" "}
                    is the most in-demand skill across all job types
                    {topSkills.data.length > 1 && topSkills.labels.length > 1 && (
                      <>
                        , followed by{" "}
                        <span className="font-medium">
                          {topSkills.labels
                            .filter((_, i) => i !== topSkills.data.indexOf(Math.max(...topSkills.data)))
                            .slice(0, 2)
                            .join(" and ")}
                        </span>
                      </>
                    )}
                    .
                  </>
                ) : (
                  "No skill data available for this period."
                )}
              </p>
            </div>
          )}
        </div>

        {/* Applications Per Job */}
        <div className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all flex flex-col">
          <div className="pb-1 border-b border-gray-100 p-3">
            <div className="text-lg font-bold text-gray-800 flex items-center">
              <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
              Applications Per Job
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-3">
            <div className="w-full flex items-center justify-center" style={{ minHeight: 180 }}>
              <div className="w-full min-h-[150px] sm:min-h-[180px] overflow-hidden">
                <BarGraph labels={applicationsPerJob.labels} data={applicationsPerJob.data} type="Applications" />
              </div>
            </div>
          </div>
          {applicationsPerJob.data.length > 0 && (
            <div className="px-2 sm:px-3 py-2 sm:py-3 mt-auto mb-2 mx-2 bg-gray-50 rounded-lg border-l-4 border-[#0856BA]">
              <p className="text-xs sm:text-sm font-medium text-gray-800">
                <span className="font-semibold text-[#0856BA]">
                  {applicationsPerJob.labels[applicationsPerJob.data.indexOf(Math.max(...applicationsPerJob.data))]}
                </span>{" "}
                received the highest number of applications
                {applicationsPerJob.data.length > 1 && (
                  <>
                    , followed by{" "}
                    <span className="font-medium">
                      {applicationsPerJob.labels
                        .map((label, index) => ({
                          label,
                          value: applicationsPerJob.data[index],
                        }))
                        .sort((a, b) => b.value - a.value)
                        .slice(1)
                        .map((item, idx, arr) =>
                          idx === arr.length - 1 && arr.length > 1 ? `and ${item.label}` : `${item.label}`,
                        )
                        .join(", ")}
                    </span>
                  </>
                )}
                .
              </p>
              <p className="mt-2 text-xs sm:text-sm text-gray-800">
                The average number of applications per job is{" "}
                <span className="font-semibold text-[#0856BA]">
                  {Math.round(
                    applicationsPerJob.data.reduce((sum, count) => sum + count, 0) / applicationsPerJob.data.length,
                  )}
                </span>
                , with a{" "}
                <span className="font-semibold text-[#0856BA]">
                  {applicationsPerJob.data.length > 1
                    ? (
                        Math.max(...applicationsPerJob.data) / Math.min(...applicationsPerJob.data.filter((n) => n > 0))
                      ).toFixed(2)
                    : "1.00"}
                  x
                </span>{" "}
                difference between the most and least applied-to positions. This suggests
                <span className="font-semibold text-[#0856BA]">
                  {Math.max(...applicationsPerJob.data) >
                  3 * (applicationsPerJob.data.reduce((sum, count) => sum + count, 0) / applicationsPerJob.data.length)
                    ? " significant candidate preference for certain roles."
                    : " relatively balanced interest across available positions."}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Weekly Job Postings */}
        <div className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all flex flex-col">
          <div className="pb-1 border-b border-gray-100 p-3">
            <div className="text-lg font-bold text-gray-800 flex items-center">
              <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
              Weekly Job Postings
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-3">
            <div className="w-full min-h-[150px] sm:min-h-[180px] overflow-hidden">
              <BarGraph labels={weeklyJobPostings.labels} data={weeklyJobPostings.data} type="Job Postings" />
            </div>
          </div>
          <div className="px-2 sm:px-3 py-2 sm:py-3 mt-auto mb-2 mx-2 bg-gray-50 rounded-lg border-l-4 border-[#0856BA]">
            <p className="text-xs sm:text-sm font-medium text-gray-800">
              {weeklyJobPostings.data.length > 0 ? (
                <>
                  Job postings have{" "}
                  <span className="font-semibold text-[#0856BA]">
                    {weeklyJobPostings.data.every((val, i, arr) => i === 0 || val >= arr[i - 1])
                      ? "increased steadily"
                      : weeklyJobPostings.data.every((val, i, arr) => i === 0 || val <= arr[i - 1])
                        ? "decreased steadily"
                        : "fluctuated"}
                  </span>{" "}
                  throughout the period, with peak in{" "}
                  <span className="font-medium">
                    {weeklyJobPostings.labels[weeklyJobPostings.data.indexOf(Math.max(...weeklyJobPostings.data))]
                      ? ` ${
                          weeklyJobPostings.labels[weeklyJobPostings.data.indexOf(Math.max(...weeklyJobPostings.data))]
                        }`
                      : "the reporting period"}
                    .
                  </span>
                </>
              ) : (
                "No job posting data available for this period."
              )}
            </p>
          </div>
        </div>

        {/* Salary Range Distribution */}
        <div className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all flex flex-col">
          <div className="pb-1 border-b border-gray-100 p-3">
            <div className="text-lg font-bold text-gray-800 flex items-center">
              <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
              Salary Range Distribution
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-3">
            <div className="w-full min-h-[150px] sm:min-h-[180px] overflow-hidden">
              <BarGraph
                labels={salaryRangeDistribution.labels}
                data={salaryRangeDistribution.data}
                type="Number of Jobs"
              />
            </div>
          </div>
          {salaryRangeDistribution.data.length > 0 && (
            <div className="px-2 sm:px-3 py-2 sm:py-3 mt-auto mb-2 mx-2 bg-gray-50 rounded-lg border-l-4 border-[#0856BA]">
              <p className="text-xs sm:text-sm font-medium text-gray-800">
                Most positions offer salaries in the{" "}
                <span className="font-semibold text-[#0856BA]">
                  {
                    salaryRangeDistribution.labels[
                      salaryRangeDistribution.data.indexOf(Math.max(...salaryRangeDistribution.data))
                    ]
                  }
                </span>{" "}
                range, with senior roles commanding higher compensation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}