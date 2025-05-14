"use client";

import { useState, useEffect } from "react";
import DonutChart from "@/components/charts/DonutChart";
import BarGraph from "@/components/charts/BarGraph";
import { useJobOffer } from "@/context/JobOfferContext";
import { useJobApplicationContext } from "@/context/JobApplicationContext";
import { JobApplication, JobOffering } from "@/models/models";
import ReportSummaryCard from "@/components/ReportSummaryCard";

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Job Market Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          A comprehensive analysis of current job offerings and applications
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Job Offerings Distribution
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Job Type Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4 text-gray-700">
              Job Types
            </h3>
            <div className="h-64">
              <DonutChart
                labels={jobTypeDistribution.labels}
                data={jobTypeDistribution.data}
                backgroundColor={jobTypeColors}
                options={true}
              />
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {jobTypeDistribution.data.length > 0 && (
                  <>
                    {
                      jobTypeDistribution.labels[
                        jobTypeDistribution.data.indexOf(
                          Math.max(...jobTypeDistribution.data)
                        )
                      ]
                    }{" "}
                    positions dominate the current job market .
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Employment Type Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4 text-gray-700">
              Employment Types
            </h3>
            <div className="h-64">
              <DonutChart
                labels={employmentTypeDistribution.labels}
                data={employmentTypeDistribution.data}
                backgroundColor={employmentTypeColors}
                options={true}
              />
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {employmentTypeDistribution.data.length > 0 && (
                  <>
                    {
                      employmentTypeDistribution.labels[
                        employmentTypeDistribution.data.indexOf(
                          Math.max(...employmentTypeDistribution.data)
                        )
                      ]
                    }{" "}
                    positions account for the majority of job offerings, with
                    other employment types making up a smaller portion.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Experience Level Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4 text-gray-700">
              Experience Levels
            </h3>
            <div className="h-64">
              <DonutChart
                labels={experienceLevelDistribution.labels}
                data={experienceLevelDistribution.data}
                backgroundColor={experienceLevelColors}
                options={true}
              />
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {experienceLevelDistribution.data.length > 0 && (
                  <>
                    {
                      experienceLevelDistribution.labels[
                        experienceLevelDistribution.data.indexOf(
                          Math.max(...experienceLevelDistribution.data)
                        )
                      ]
                    }{" "}
                    positions are the most common
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Application Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Application Status Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4 text-gray-700">
              Application Status
            </h3>
            <div className="h-100">
              <DonutChart
                labels={applicationStatusDistribution.labels}
                data={applicationStatusDistribution.data}
                backgroundColor={applicationStatusColors}
                options={true}
              />
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium mt-2 text-gray-800">
                Total Applications:{" "}
                {applicationStatusDistribution.data.reduce(
                  (sum, count) => sum + count,
                  0
                )}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Accepted:{" "}
                {applicationStatusDistribution.labels.includes("accepted")
                  ? applicationStatusDistribution.data[
                      applicationStatusDistribution.labels.indexOf("accepted")
                    ]
                  : 0}{" "}
                | Rejected:{" "}
                {applicationStatusDistribution.labels.includes("rejected")
                  ? applicationStatusDistribution.data[
                      applicationStatusDistribution.labels.indexOf("rejected")
                    ]
                  : 0}{" "}
                | Pending:{" "}
                {applicationStatusDistribution.labels.includes("pending")
                  ? applicationStatusDistribution.data[
                      applicationStatusDistribution.labels.indexOf("pending")
                    ]
                  : 0}
              </p>
            </div>
          </div>

          {/* Applications Per Job */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4 text-gray-700">
              Applications Per Job
            </h3>
            <div className="h-64">
              <BarGraph
                labels={applicationsPerJob.labels}
                data={applicationsPerJob.data}
                type="Applications"
              />
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-600">
                {applicationsPerJob.data.length > 0 && (
                  <p>
                    {
                      applicationsPerJob.labels[
                        applicationsPerJob.data.indexOf(
                          Math.max(...applicationsPerJob.data)
                        )
                      ]
                    }{" "}
                    positions received the highest number of applications,
                    followed by{" "}
                    {applicationsPerJob.data.length > 1 &&
                      applicationsPerJob.labels
                        .map((label, index) => ({
                          label,
                          value: applicationsPerJob.data[index],
                        }))
                        .sort((a, b) => b.value - a.value)
                        .slice(1)
                        .map((item, idx, arr) =>
                          idx === arr.length - 1
                            ? `and ${item.label}`
                            : `${item.label}`
                        )
                        .join(", ")}
                    .
                  </p>
                )}
                {applicationsPerJob.data.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    The average number of applications per job is{" "}
                    {Math.round(
                      applicationsPerJob.data.reduce(
                        (sum, count) => sum + count,
                        0
                      ) / applicationsPerJob.data.length
                    )}
                    , with a{" "}
                    {Math.round(
                      (Math.max(...applicationsPerJob.data) /
                        Math.min(
                          ...applicationsPerJob.data.filter((n) => n > 0)
                        )) *
                        100
                    ) / 100}
                    x difference between the most and least applied-to
                    positions. This suggests
                    {Math.max(...applicationsPerJob.data) >
                    3 *
                      (applicationsPerJob.data.reduce(
                        (sum, count) => sum + count,
                        0
                      ) /
                        applicationsPerJob.data.length)
                      ? " significant candidate preference for certain roles."
                      : " relatively balanced interest across available positions."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Market Trends
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekly Job Postings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4 text-gray-700">
              Weekly Job Postings
            </h3>
            <div className="h-64">
              <BarGraph
                labels={weeklyJobPostings.labels}
                data={weeklyJobPostings.data}
                type="Job Postings"
              />
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {weeklyJobPostings.data.length > 0 ? (
                  <>
                    Job postings have{" "}
                    {weeklyJobPostings.data.every(
                      (val, i, arr) => i === 0 || val >= arr[i - 1]
                    )
                      ? "increased steadily"
                      : weeklyJobPostings.data.every(
                          (val, i, arr) => i === 0 || val <= arr[i - 1]
                        )
                      ? "decreased steadily"
                      : "fluctuated"}{" "}
                    throughout the period, with a peak in{" "}
                    {weeklyJobPostings.data.indexOf(
                      Math.max(...weeklyJobPostings.data)
                    ) !== -1
                      ? ` ${
                          weeklyJobPostings.labels[
                            weeklyJobPostings.data.indexOf(
                              Math.max(...weeklyJobPostings.data)
                            )
                          ]
                        }`
                      : "the reporting period"}
                    .
                  </>
                ) : (
                  "No job posting data available for this period."
                )}
              </p>
            </div>
          </div>

          {/* Top Required Skills */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4 text-gray-700">
              Top Required Skills
            </h3>
            <div className="h-64">
              <BarGraph
                labels={topSkills.labels}
                data={topSkills.data}
                type="Job Postings"
              />
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {topSkills.data.length > 0 ? (
                  <>
                    {
                      topSkills.labels[
                        topSkills.data.indexOf(Math.max(...topSkills.data))
                      ]
                    }{" "}
                    is the most in-demand skill across all job types
                    {topSkills.data.length > 1 &&
                      topSkills.labels.length > 1 && (
                        <>
                          , followed by{" "}
                          {topSkills.labels
                            .filter(
                              (_, i) =>
                                i !==
                                topSkills.data.indexOf(
                                  Math.max(...topSkills.data)
                                )
                            )
                            .slice(0, 2)
                            .join(" and ")}
                        </>
                      )}
                    .
                  </>
                ) : (
                  "No skill data available for this period."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Range Distribution */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Salary Analysis
        </h2>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4 text-gray-700">
            Salary Range Distribution
          </h3>
          <div className="h-64">
            <BarGraph
              labels={salaryRangeDistribution.labels}
              data={salaryRangeDistribution.data}
              type="Number of Jobs"
            />
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {salaryRangeDistribution.data.length > 0 ? (
                <>
                  Most positions offer salaries in the{" "}
                  {
                    salaryRangeDistribution.labels[
                      salaryRangeDistribution.data.indexOf(
                        Math.max(...salaryRangeDistribution.data)
                      )
                    ]
                  }{" "}
                  range, with senior roles commanding higher compensation.
                </>
              ) : (
                "No salary data available for this period."
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ReportSummaryCard
          data={`
        // Job Market Overview
    Total job offerings: ${
      offers.filter((offer: JobOffering) => offer.status === "Accepted").length
    }
    Total applications submitted: ${applicationStatusDistribution.data.reduce(
      (sum, count) => sum + count,
      0
    )}
    
    // Application Status Metrics
    Applications accepted: ${
      applicationStatusDistribution.labels.includes("accepted")
        ? applicationStatusDistribution.data[
            applicationStatusDistribution.labels.indexOf("accepted")
          ]
        : 0
    }
    Applications rejected: ${
      applicationStatusDistribution.labels.includes("rejected")
        ? applicationStatusDistribution.data[
            applicationStatusDistribution.labels.indexOf("rejected")
          ]
        : 0
    }
    Applications pending: ${
      applicationStatusDistribution.labels.includes("pending")
        ? applicationStatusDistribution.data[
            applicationStatusDistribution.labels.indexOf("pending")
          ]
        : 0
    }
    
    // Job Type Distribution
    Job types breakdown: ${jobTypeDistribution.labels
      .map((label, index) => `${label}: ${jobTypeDistribution.data[index]}`)
      .join(", ")}
    Most common job type: ${
      jobTypeDistribution.labels[
        jobTypeDistribution.data.indexOf(Math.max(...jobTypeDistribution.data))
      ]
    }
    
    // Employment Type Distribution
    Employment types breakdown: ${employmentTypeDistribution.labels
      .map(
        (label, index) => `${label}: ${employmentTypeDistribution.data[index]}`
      )
      .join(", ")}
    Most common employment type: ${
      employmentTypeDistribution.labels[
        employmentTypeDistribution.data.indexOf(
          Math.max(...employmentTypeDistribution.data)
        )
      ]
    }
    
    // Experience Level Distribution
    Experience levels breakdown: ${experienceLevelDistribution.labels
      .map(
        (label, index) => `${label}: ${experienceLevelDistribution.data[index]}`
      )
      .join(", ")}
    Most common experience level: ${
      experienceLevelDistribution.labels[
        experienceLevelDistribution.data.indexOf(
          Math.max(...experienceLevelDistribution.data)
        )
      ]
    }
    
    // Application Metrics
    Average applications per job: ${Math.round(
      applicationsPerJob.data.reduce((sum, count) => sum + count, 0) /
        applicationsPerJob.data.length
    )}
    Job with most applications: ${
      applicationsPerJob.labels[
        applicationsPerJob.data.indexOf(Math.max(...applicationsPerJob.data))
      ]
    } (${Math.max(...applicationsPerJob.data)} applications)
    
    // Top Skills
    Top 5 in-demand skills: ${topSkills.labels
      .map((label, index) => `${label} (${topSkills.data[index]})`)
      .join(", ")}
    Most requested skill: ${
      topSkills.labels[topSkills.data.indexOf(Math.max(...topSkills.data))]
    }
    
    // Salary Distribution
    Salary range breakdown: ${salaryRangeDistribution.labels
      .map((label, index) => `${label}: ${salaryRangeDistribution.data[index]}`)
      .join(", ")}
    Most common salary range: ${
      salaryRangeDistribution.labels[
        salaryRangeDistribution.data.indexOf(
          Math.max(...salaryRangeDistribution.data)
        )
      ]
    }
    
    // Market Trends
    Weekly job posting trend: ${weeklyJobPostings.labels
      .map((label, index) => `${label}: ${weeklyJobPostings.data[index]}`)
      .join(", ")}
    Week with highest postings: ${
      weeklyJobPostings.labels[
        weeklyJobPostings.data.indexOf(Math.max(...weeklyJobPostings.data))
      ]
    } (${Math.max(...weeklyJobPostings.data)} postings)
    Job posting trend: ${
      weeklyJobPostings.data.every(
        (val, i, arr) => i === 0 || val >= arr[i - 1]
      )
        ? "Increasing"
        : weeklyJobPostings.data.every(
            (val, i, arr) => i === 0 || val <= arr[i - 1]
          )
        ? "Decreasing"
        : "Fluctuating"
    }
    
    // Application Success Rate
    Application success rate: ${
      applicationStatusDistribution.labels.includes("accepted")
        ? Math.round(
            (applicationStatusDistribution.data[
              applicationStatusDistribution.labels.indexOf("accepted")
            ] /
              applicationStatusDistribution.data.reduce(
                (sum, count) => sum + count,
                0
              )) *
              100
          )
        : 0
    }%
    Application rejection rate: ${
      applicationStatusDistribution.labels.includes("rejected")
        ? Math.round(
            (applicationStatusDistribution.data[
              applicationStatusDistribution.labels.indexOf("rejected")
            ] /
              applicationStatusDistribution.data.reduce(
                (sum, count) => sum + count,
                0
              )) *
              100
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
  );
}
