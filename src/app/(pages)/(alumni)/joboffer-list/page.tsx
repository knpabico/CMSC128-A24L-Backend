"use client";

import { useState } from "react";
import { useJobOffer } from "@/context/JobOfferContext";
import { JobOffering } from "@/models/models";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";

function formatDate(timestamp: any) {
  if (!timestamp || !timestamp.seconds) return "Invalid Date";
  const date = new Date(timestamp.seconds * 1000);
  return date.toISOString().split("T")[0];
}

export default function JobOffers() {
  const {
    jobOffers,
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
  } = useJobOffer();

  const [currentPage, setCurrentPage] = useState(1);
  const [latestFirst, setLatestFirst] = useState(true); // true = latest first, false = oldest first
  const [selectedJob, setSelectedJob] = useState<JobOffering | null>(null);
  const [activeFilterCategory, setActiveFilterCategory] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const acceptedJobs = jobOffers.filter((job: { status: string; }) => job.status === "Accepted");

  const jobsPerPage = 6;

  // Define filter categories and their respective filter options
  const filterCategories = {
    "Experience Level": ["Entry Level", "Mid Level", "Senior Level"],
    "Job Type": ["Cybersecurity", "Software Development", "Data Science", "UX/UI Design", "Project Management"],
    "Employment Type": ["Full Time", "Part Time", "Contract", "Internship"],
    "Skills": ["JavaScript", "Python", "Java", "C++", "React", "Node.js", "SQL"],
  };

  // Filters
  const toggleFilterCategory = (filterCategory: string) => {
    // Set the active filter category and reset active filters
    setActiveFilterCategory((prev) =>
      prev === filterCategory ? null : filterCategory // Toggle between setting and unsetting the active category
    );
    setActiveFilters([]); // Reset the active filters
    setCurrentPage(1); // Reset to first page on filter category change
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
    );
    setCurrentPage(1); // Reset to first page on filter change
  };


  // Sort job offers by date
  const filteredAndSortedJobs = [...acceptedJobs]
  .filter(job => {
    if (activeFilters.length === 0) return true;
    
    // Check if job matches any of the active filters
    return activeFilters.some(filter => {
      // Check each possible filter category
      return (
        job.experienceLevel === filter ||
        job.jobType === filter ||
        job.employmentType === filter
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
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Job Offers</h1>

      <div className="flex justify-end mb-4">
      <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-5 py-2 bg-gray-300 rounded shadow hover:bg-gray-400 mr-4 flex items-center gap-2">
              Filter by: {activeFilterCategory || "None"}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white p-2 rounded shadow">
            {["None", ...Object.keys(filterCategories)].map((filterCategory) => (
              <div
                key={filterCategory}
                className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => toggleFilterCategory(filterCategory)}
              >
                {filterCategory}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {activeFilterCategory && activeFilterCategory !== "None" && (
        <div className="absolute mt-2 bg-white p-4 rounded shadow-lg z-10 border border-gray-200">
          <h3 className="font-semibold mb-2">{activeFilterCategory}</h3>
          <div className="space-y-2">
            {filterCategories[activeFilterCategory as keyof typeof filterCategories].map((filter) => (
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
        <button
          className="px-4 py-2 bg-gray-300 rounded shadow hover:bg-gray-400"
          onClick={() => setLatestFirst(!latestFirst)}
        >
          Sort by: {latestFirst ? "Oldest First" : "Latest First"}
        </button>
      </div>
        {activeFilters.length > 0 && (
        <button 
          className="px-4 py-2 md:space-x-28 bg-red-100 text-red-700 rounded shadow hover:bg-red-200 ml-4"
          onClick={() => {
            setActiveFilters([]);
            setActiveFilterCategory(null);
            setCurrentPage(1);
          }}
        >
          Clear Filters
        </button>
      )}

      {!isLoading && filteredAndSortedJobs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-lg">There are currently no job offer of this type.</p>
          <p className="text-gray-500">Please check back later.</p>
        </div>
      )}

      {/* Job Cards */}      
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentJobs.map((job, index) => (
              <Card
              key={index}
              className="p-4 border border-gray-200 rounded-lg shadow-sm cursor-pointer"
              onClick={() => setSelectedJob(job)}
            >
              <CardContent>
                <h2 className="text-xl font-semibold">{job.position}</h2>
                <p className="text-gray-600">{job.company}</p>
                <p className="text-sm text-gray-500">
                  {job.employmentType} • {job.experienceLevel}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Posted on {formatDate(job.datePosted)}
                </p>
              </CardContent>
            </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-6 space-x-4">
            <button
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span className="text-lg font-semibold">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
         <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-md flex justify-center items-center z-50">
         <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] md:w-1/2">
           <h2 className="text-2xl font-bold mb-2">{selectedJob.position} | {selectedJob.employmentType}</h2>
           <p className="text-gray-600">{selectedJob.company}</p>
           <p className="text-sm text-gray-500">
             {selectedJob.jobType} • {selectedJob.experienceLevel}
           </p>
           <p className="mt-4">{selectedJob.jobDescription}</p>
           <p className="text-xs text-gray-400 mt-2">
             Posted on {formatDate(selectedJob.datePosted)}
           </p>
     
           <button
             className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
             onClick={() => setSelectedJob(null)}
           >
             Close
           </button>
         </div>
       </div>
      )}

      <button
        className="fixed bottom-8 right-8 bg-blue-500 text-white p-5 rounded-full"
        onClick={() => setShowForm(!showForm)}
      >
        +
      </button>
      {showForm && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-lg border-2 border-gray shadow-lg w"
          >
            <h2 className="text-xl mb-4">Post a Job</h2>

            <input
              type="text"
              placeholder="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
              required
            />

            <input
              type="text"
              placeholder="Employment Type"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
              required
            />

            <input
              type="text"
              placeholder="Experience Level"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
              required
            />

            <textarea
              placeholder="Job Description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
              required
            />

            <input
              type="text"
              placeholder="Job Type"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
              required
            />

            <input
              type="text"
              placeholder="Position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
              required
            />

            <input
              type="text"
              placeholder="Required Skills (comma-separated)"
              onChange={handleSkillChange}
              className="w-full mb-4 p-2 border rounded"
              required
            />

            <input
              type="text"
              placeholder="Salary Range"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
              required
            />

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
