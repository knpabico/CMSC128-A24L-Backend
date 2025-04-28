"use client";

import { useState, useEffect, useRef } from "react";
import { useJobOffer } from "@/context/JobOfferContext";
import { JobOffering } from "@/models/models";
import { Bookmark } from "@/models/models";
import { useBookmarks } from "@/context/BookmarkContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuTrigger,} from "@radix-ui/react-dropdown-menu";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import BookmarkButton from "@/components/ui/bookmark-button";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import ModalInput from "@/components/ModalInputForm";
import { Briefcase, Bookmark, FilePlus, MapPin } from 'lucide-react';

function formatDate(timestamp: any) {
  if (!timestamp || !timestamp.seconds) return "Invalid Date";
  const date = new Date(timestamp.seconds * 1000);
  return date.toISOString().split("T")[0];
}

export default function JobOffers() {
  const {
    jobOffers,
    bookmarks,
    isLoading,
    setShowForm,
    showForm,
    handleSubmit,
    company,
    setCompany,
    employmentType,
    setEmploymentType,
    experienceLevel,
    setExperienceLevel,
    jobDescription,
    setJobDescription,
    jobType,
    setJobType,
    position,
    setPosition,
    handleSkillChange,
    salaryRange,
    setSalaryRange,
    location,
    setLocation,
    image,
    setImage,
  } = useJobOffer();

  
  const [currentPage, setCurrentPage] = useState(1);
  const [latestFirst, setLatestFirst] = useState(true); // true = latest first, false = oldest first
  const [selectedJob, setSelectedJob] = useState<JobOffering | null>(null);
  const [activeFilterCategory, setActiveFilterCategory] = useState<
    string | null
  >(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [sidebarFilter, setSidebarFilter] = useState<string>("Job Postings");
  const filterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const filterContainerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  const acceptedJobs = jobOffers.filter(
    (job: { status: string }) => job.status === "Accepted"
  );

  const jobsPerPage = 8;

  // Define filter categories and their respective filter options
  const filterCategories = {
    "Experience Level": ["Entry Level", "Mid Level", "Senior Level"],
    "Job Type": [
      "Cybersecurity",
      "Software Development",
      "Data Science",
      "UX/UI Design",
      "Project Management",
      "Others"
    ],
    "Employment Type": ["Full Time", "Part Time", "Contract", "Internship"],
    Skills: [
      "JavaScript",
      "Python",
      "Java",
      "C++",
      "React",
      "Node.js",
      "SQL",
      "Figma",
      "Canva",
    ],
    ...(sidebarFilter === "Create Jobs" && {
      Status: ["Accepted", "Rejected", "Pending"],
    })
  };

  // Close filter dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterContainerRef.current &&
        !filterContainerRef.current.contains(event.target as Node)
      ) {
        setShowFilterDropdown(false);
        setShowFilterOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Auto-dismiss filter options after inactivity
  useEffect(() => {
    // Clear any existing timeout
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }

    // If filters are shown, set a timeout to hide them
    if (showFilterOptions || showFilterDropdown) {
      filterTimeoutRef.current = setTimeout(() => {
        setShowFilterOptions(false);
        setShowFilterDropdown(false);
      }, 5000); // 5 seconds of inactivity will close filters
    }

    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [showFilterOptions, showFilterDropdown]);

  // Filters
  const toggleFilterCategory = (filterCategory: string) => {
    if (filterCategory === "None") {
      setActiveFilterCategory(null);
      setActiveFilters([]);
      setShowFilterOptions(false);
    } else {
      // Set the active filter category
      setActiveFilterCategory(filterCategory);
      setShowFilterOptions(true);
    }
    setShowFilterDropdown(false);
    setCurrentPage(1); // Reset to first page on filter category change
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
    setCurrentPage(1); // Reset to first page on filter change

    // Reset the auto-dismiss timer when user interacts
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
      filterTimeoutRef.current = setTimeout(() => {
        setShowFilterOptions(false);
      }, 5000);
    }
  };

  // Sort job offers by date
  const filteredAndSortedJobs = [...acceptedJobs]
    .filter((job) => {
      if (activeFilters.length === 0) return true;

      // Check if job matches any of the active filters
      return activeFilters.some((filter) => {
        // Check each possible filter category
        return (
          job.experienceLevel === filter ||
          job.jobType === filter ||
          job.employmentType === filter ||
          job.requiredSkill.includes(filter)
        );
      });
    })
    .sort((a, b) => {
      const dateA = a.datePosted.seconds;
      const dateB = b.datePosted.seconds;
      return latestFirst ? dateB - dateA : dateA - dateB;
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSortedJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = filteredAndSortedJobs.slice(startIndex, endIndex);

  return (
    <>
      {/* Header Banner - magaadd pa ako pic wait lang guys huhu */}
      <div className="w-full h-80 relative bg-[#0856BA] overflow-hidden">
        <div className="left-[200px] top-[109px] absolute text-[#FFFFFF] text-6xl font-semibold">
          Job Opportunities
        </div>
        <div className="w-[971px] left-[200px] top-[200px] absolute text-[#FFFFFF] text-base font-normal">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla porta,
          ligula non sagittis tempus, risus erat aliquam mi, nec vulputate dolor
          nunc et eros. Fusce fringilla, neque et ornare eleifend, enim turpis
          maximus quam, vitae luctus dui sapien in ipsum. Pellentesque mollis
          tempus nulla, sed ullamcorper quam hendrerit eget.
        </div>
      </div>
  
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center mb-4">

        <button
            className={`px-3 py-2 bg-red-50 text-red-700 rounded text-sm transition-opacity duration-200 mb-4 ${
              activeFilters.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => {
              setActiveFilters([]);
              setActiveFilterCategory(null);
              setShowFilterOptions(false);
              setCurrentPage(1);
            }}
          >
            Clear Filters
          </button>

          <div className="flex space-x-3">
            <div className="relative" ref={filterContainerRef}>
              <button
                className="px-4 py-2 bg-[#0856BA] text-white rounded shadow hover:bg-[#0648a0] text-sm flex items-center"
                onClick={() => {
                  setShowFilterDropdown(!showFilterDropdown);
                  setShowFilterOptions(false);
  
                  if (filterTimeoutRef.current) {
                    clearTimeout(filterTimeoutRef.current);
                  }
                  filterTimeoutRef.current = setTimeout(() => {
                    setShowFilterDropdown(false);
                  }, 5000);
                }}
              >
                Filter
              </button>
  
              {showFilterDropdown && (
                <div className="absolute mt-2 right-0 bg-white p-2 rounded shadow-lg z-20 border border-gray-200 w-40">
                  {["None", ...Object.keys(filterCategories)].map(
                    (filterCategory) => (
                      <div
                        key={filterCategory}
                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-sm"
                        onClick={() => toggleFilterCategory(filterCategory)}
                      >
                        {filterCategory}
                      </div>
                    )
                  )}
                </div>
              )}
  
              {showFilterOptions &&
                activeFilterCategory &&
                activeFilterCategory !== "None" && (
                  <div
                    className="absolute mt-2 right-0 bg-white p-4 rounded shadow-lg z-10 border border-gray-200 w-60"
                    style={{ top: "40px" }}
                  >
                    <h3 className="font-semibold mb-2">
                      {activeFilterCategory}
                    </h3>
                    <div className="space-y-2">
                      {filterCategories[
                        activeFilterCategory as keyof typeof filterCategories
                      ].map((filter) => (
                        <div key={filter} className="flex items-center">
                          <input
                            type="checkbox"
                            id={filter}
                            checked={activeFilters.includes(filter)}
                            onChange={() => toggleFilter(filter)}
                            className="mr-2"
                          />
                          <label htmlFor={filter}>{filter}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
  
            <button
              className="px-4 py-2 bg-[#0856BA] text-white rounded shadow hover:bg-[#0648a0] text-sm flex items-center"
              onClick={() => setLatestFirst(!latestFirst)}
            >
              {latestFirst ? "Latest First" : "Oldest First"}
            </button>
          </div>
        </div>
  
        <div className="flex">
            {/* Sidebar */}
            <div className="bg-[#FFFFFF] flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max">
            <ul className="space-y-2">
              <li>
                <button
                  className="bg -white w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    setSidebarFilter("Job Postings");
                  }}
                >
                  <Briefcase className="w-5 h-5 mr-2" />
                  All Job Postings
                </button>
              </li>
              <li>
                <button
                  className="bg-white w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex items-center"
                  onClick={() => {
                    setSidebarFilter("Saved Jobs");
                  }}
                >
                  <Bookmark className="w-5 h-5 mr-2" />
                  Saved Jobs
                </button>
              </li>
              <li>
                <button
                  className="bg-white w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex items-center"
                  onClick={() => setSidebarFilter("Create Jobs")}
                >
                  <FilePlus className="w-5 h-5 mr-2" />
                  Created Jobs
                </button>
              </li>
            </ul>
          </div>
  
          {/* Main content revised yass */}
          <div className="flex-1 grid grid-cols-2 gap-4 pl-4">
            {/* Left Column - Job Listings */}
              {/* Job Postings Filter */}
              <div>
                {sidebarFilter === "Job Postings" ? (
                  isLoading ? (
                    <div className="space-y-2">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <>
                      {filteredAndSortedJobs.length === 0 ? (
                        <div className="text-center text-gray-500 py-8 h-[480px] flex items-center justify-center">
                          <p className="text-lg">No job offers found.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {currentJobs.map((job, index) => (
                            <div
                              key={index}
                              className={`bg-white p-3 border rounded-lg cursor-pointer hover:border-blue-300 ${
                                selectedJob?.jobId === job.jobId
                                  ? "border-blue-500"
                                  : "border-gray-200"
                              }`}
                              onClick={() => setSelectedJob(job)}
                            >
                              <div className="flex">
                                <div className="mr-2">
                                  <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
                                    {job.company.charAt(0).toUpperCase()}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h2 className="font-semibold text-md">
                                    {job.position}
                                  </h2>
                                  <p className="text-sm text-gray-600">
                                    {job.company}
                                  </p>
                                  <p className="text-xs text-[#0856BA] flex items-center">
                                  <MapPin className="w-3.5 h-3.5 mr-1" />
                                    {job.location}
                                  </p>
                                </div>
                                <div className="ml-2">
                                  <BookmarkButton
                                    entryId={job.jobId}
                                    type="job_offering"
                                    size="sm"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          {currentJobs.length < jobsPerPage &&
                            [...Array(jobsPerPage - currentJobs.length)].map(
                              (_, i) => (
                                <div
                                  key={`empty-${i}`}
                                  className="h-[72px] invisible"
                                >
                                </div>
                              )
                            )}
                        </div>
                      )}
  
                      {/* Pagination Controls */}
                      {filteredAndSortedJobs.length > 0 && (
                        <div className="flex justify-center mt-4 space-x-2">
                          <button
                            className="px-3 py-1 bg-white rounded text-sm"
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                          >
                            Prev
                          </button>
  
                          <span className="text-sm font-medium px-3 py-1">
                            {currentPage} of {totalPages}
                          </span>
  
                          <button
                            className="px-3 py-1 bg-white rounded text-sm"
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                              )
                            }
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  )
                ) : sidebarFilter === "Saved Jobs" ? (
                  <div className="space-y-2">
                    {bookmarks.filter(
                      (bookmark: Bookmark) => bookmark.type === "job_offering"
                    ).length === 0 ? (
                      <div className="text-center text-gray-500 p-4 min-h-[600px] flex flex-col items-center justify-center">
                        <p className="text-lg">No saved jobs found.</p>
                      </div>
                    ) : (
                      bookmarks
                        .filter(
                          (bookmark: Bookmark) => bookmark.type === "job_offering"
                        )
                        .sort((a, b) => {
                          const dateA = a.timestamp.seconds;
                          const dateB = b.timestamp.seconds;
                          return latestFirst ? dateB - dateA : dateA - dateB;
                        })
                        .map((bookmark: Bookmark, index: number) => {
                          const job = jobOffers.find(
                            (job: { jobId: string }) =>
                              job.jobId === bookmark.entryId
                          );
                          return job &&
                            activeFilters.every(
                              (filter) =>
                                job.experienceLevel === filter ||
                                job.jobType === filter ||
                                job.employmentType === filter ||
                                job.requiredSkill.includes(filter)
                            ) ? (
                            <div
                              key={index}
                              className={`bg-white p-3 border rounded-lg cursor-pointer hover:border-blue-300 ${
                                selectedJob?.jobId === job.jobId
                                  ? "border-blue-500"
                                  : "border-gray-200"
                              }`}
                              onClick={() => setSelectedJob(job)}
                            >
                              <div className="flex">
                                <div className="mr-3">
                                  <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
                                    {job.company.charAt(0).toUpperCase()}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h2 className="font-semibold text-md">
                                    {job.position}
                                  </h2>
                                  <p className="text-sm text-gray-600">
                                    {job.company}
                                  </p>
                                </div>
                                <div className="ml-2">
                                  <BookmarkButton
                                    entryId={job.jobId}
                                    type="job_offering"
                                    size="sm"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : null;
                        })
                    )}
                  </div>
                ) : sidebarFilter === "Create Jobs" ? (
                  <div className="space-y-2">
                    {jobOffers.filter(
                      (job: JobOffering) => job.alumniId === user?.uid
                    ).length === 0 ? (
                      <div className="rounded-lg text-center text-gray-500 p-4 min-h-[600px] flex flex-col items-center justify-center">
                        <p className="text-lg">No created jobs found.</p>
                      </div>
                    ) : (
                      [...jobOffers]
                        .filter((job: JobOffering) => {
                          if (job.alumniId !== user?.uid) return false;
  
                          if (activeFilters.length === 0) return true;
  
                          return activeFilters.some(
                            (filter) =>
                              [
                                job.experienceLevel,
                                job.jobType,
                                job.employmentType,
                                job.status,
                              ].includes(filter) ||
                              job.requiredSkill.includes(filter)
                          );
                        })
                        .sort((a, b) => {
                          const dateA = a.datePosted.seconds;
                          const dateB = b.datePosted.seconds;
                          return latestFirst ? dateB - dateA : dateA - dateB;
                        })
                        .map((job: JobOffering, index: number) => (
                          <div
                            key={index}
                            className={`bg-white p-3 border rounded-lg cursor-pointer hover:border-blue-300 ${
                              selectedJob?.jobId === job.jobId
                                ? "border-blue-500"
                                : "border-gray-200"
                            }`}
                            onClick={() => setSelectedJob(job)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex">
                                <div className="mr-3">
                                  <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center">
                                    {job.company.charAt(0).toUpperCase()}
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h2 className="font-semibold text-md">
                                    {job.position}
                                  </h2>
                                  <p className="text-sm text-gray-600">
                                    {job.company}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    job.status === "Accepted"
                                      ? "bg-green-100 text-green-700"
                                      : job.status === "Rejected"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {job.status.charAt(0).toUpperCase() +
                                    job.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                ) : null}
              </div>
  
            {/* Right Column - Job Details */}
            <div className="bg-white rounded-lg p-4 min-h-[600px] flex flex-col">
              {selectedJob ? (
                <div className="w-full">
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedJob.position}
                  </h2>
                  <p className="text-gray-600 text-lg mb-4">
                    {selectedJob.company}
                  </p>
  
                  <div className="bg-[#EAEAEA] p-3 rounded-lg mb-4">
                    <div className="flex flex-wrap gap-4 mb-2">
                      <div className="text-sm">
                        <span className="text-gray-500">Type:</span>
                        <span className="ml-1 font-medium">
                          {selectedJob.employmentType}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Level:</span>
                        <span className="ml-1 font-medium">
                          {selectedJob.experienceLevel}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Salary:</span>
                      <span className="ml-1 font-medium">
                        {selectedJob.salaryRange}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Location:</span>
                      <span className="ml-1 font-medium">
                        {selectedJob.location}
                      </span>
                    </div>
                  </div>
  
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Job Description</h3>
                    <p className="text-sm text-gray-700">
                      {selectedJob.jobDescription}
                    </p>
                  </div>
  
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Required Skills</h3>
                    <div className="pl-[25px]">
                      {selectedJob.requiredSkill && selectedJob.requiredSkill.map((skill) => (
                        <ul key={skill} className="max-w-md space-y-1 text-gray-500 list-inside dark:text-gray-500"> 
                          <li className="flex items-center">
                            <svg className="w-3.5 h-3.5 me-2 text-green-500 dark:text-green-400 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
                            </svg>
                            {skill}
                          </li>
                        </ul>
                      ))}
                    </div>
                  </div>
  
                  <p className="text-xs text-gray-400 mt-4">
                    Posted on {formatDate(selectedJob.datePosted)}
                  </p>
                </div>
              ) : (
                <div className="text-center text-gray-500 h-full flex items-center justify-center w-full">
                  <p className="text-xl">Select a job to view details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
  
        {/* "Add Job" Button + Form */}
        <Button
          className="fixed bottom-8 right-8 bg-blue-500 text-white p-5 rounded-full"
          onClick={() => setShowForm(!showForm)}
        >
          Post a Job
        </Button>
        {showForm && (
          <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-8 rounded-lg border-2 border-gray shadow-lg w-3/4 max-w-4xl"
            >
              <h2 className="text-3xl mb-6 font-semibold border-b pb-4">
                Post a Job Opportunity
              </h2>
  
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column ng form */}
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Job Position<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineer"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Employment Type<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      className={`w-full p-2 border rounded ${
                        !employmentType ? "text-gray-500" : ""
                      }`}
                      required
                    >
                      <option value="">Select Employment Type</option>
                      {filterCategories["Employment Type"].map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Job Type<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className={`w-full p-2 border rounded ${
                        !jobType ? "text-gray-500" : ""
                      }`}
                      required
                    >
                      <option value="">Select Job Type</option>
                      {filterCategories["Job Type"].map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Job Description<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="E.g., Outline the role, responsibilities, and key qualifications for this position."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="w-full p-2 border rounded h-20"
                      required
                    />
                    <Button onClick={() => setIsModalOpen(true)}>
                      Need AI help for description?
                    </Button>
                    <ModalInput
                      isOpen={isModalOpen}
                      mainTitle={position}
                      onClose={() => setIsModalOpen(false)}
                      onSubmit={(response) => setJobDescription(response)}
                      title="AI Assistance for Job Description"
                      type="job offer"
                      subtitle="Get AI-generated description for your job offer. Only fill in the applicable fields."
                    />
                  </div>
                </div>
  
                {/* Right Column ng form */}
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Company Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Location<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Pedro R. Sandoval Ave, Los Baños, 4031 Laguna, Philippines"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Experience Level<span className="text-red-500">*</span>
                    </label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className={`w-full p-2 border rounded ${
                        !experienceLevel ? "text-gray-500" : ""
                      }`}
                      required
                    >
                      <option value="">Select Experience Level</option>
                      {filterCategories["Experience Level"].map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Salary Range<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">₱</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. 10000 - 30000"
                      value={salaryRange}
                      onChange={(e) =>
                        setSalaryRange(e.target.value)}
                      className="w-full pl-8 py-2 border rounded"
                      required
                    />
                  </div>
                  </div>
  
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Required Skills<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Required Skills (comma-separated)"
                      onChange={handleSkillChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Logo
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer">
                        <div className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                          Choose File
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setImage(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                      <span className="text-sm text-gray-500">
                        {image ? image.name : 'No file chosen'}
                      </span>
                    </div>
                    {image && (
                      <div className="mt-3">
                        <img
                          src={URL.createObjectURL(image)}
                          alt="Preview"
                          className="h-20 object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
  
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 p-2 rounded ring-1 ring-[#0856BA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0856BA] text-white p-2 rounded"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
