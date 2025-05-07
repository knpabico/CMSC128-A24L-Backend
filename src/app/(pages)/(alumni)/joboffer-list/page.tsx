"use client";

import { useState, useEffect, useRef } from "react";
import { useJobOffer } from "@/context/JobOfferContext";
import { JobOffering } from "@/models/models";
import { Bookmark } from "@/models/models";
import { toastError, toastSuccess } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
//import { DropdownMenuTrigger,} from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import BookmarkButton from "@/components/ui/bookmark-button";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import ModalInput from "@/components/ModalInputForm";
import {
  Briefcase,
  Bookmark,
  FilePlus,
  MapPin,
  ChevronDown,
  DollarSign,
  Award,
  FileText,
  Check,
  Pencil,
  Trash2,
} from "lucide-react";
import { set } from "zod";

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
    requiredSkill,
    handleSkillChange,
    salaryRange,
    setSalaryRange,
    location,
    setLocation,
    image,
    setJobImage,
    preview,
    fileName,
    handleImageChange,
    handleSaveDraft,
    handleEditDraft,
    handleDelete,
    updateStatus
  } = useJobOffer();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [savedJobsCurrentPage, setSavedJobsCurrentPage] = useState(1);
  const [createdJobsCurrentPage, setCreatedJobsCurrentPage] = useState(1);
  const [draftJobsCurrentPage, setDraftJobsCurrentPage] = useState(1);
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
  const [employmentTypeOpen, setEmploymentTypeOpen] = useState(false);
  const [jobTypeOpen, setJobTypeOpen] = useState(false);
  const [experienceLevelOpen, setExperienceLevelOpen] = useState(false);

  const acceptedJobs = jobOffers.filter(
    (job: JobOffering) =>
      job.status === "Accepted" &&
      (job.position.toLowerCase().includes(searchQuery) ||
       job.company.toLowerCase().includes(searchQuery))
  );

  const jobsPerPage = 8;

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value.toLowerCase());
  }

  // Define filter categories and their respective filter options
  const filterCategories = {
    "Experience Level": ["Entry Level", "Mid Level", "Senior Level"],
    "Job Type": [
      "Cybersecurity",
      "Software Development",
      "Data Science",
      "UX/UI Design",
      "Project Management",
      "Others",
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
    }),
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

  // Saved Jobs pagination
  const filteredSavedJobs = bookmarks
    .filter((bookmark) => bookmark.type === "job_offering")
    .map((bookmark) => jobOffers.find((job) => job.jobId === bookmark.entryId))
    .filter(Boolean)
    .filter(
      (job) =>
        activeFilters.length === 0 ||
        activeFilters.some(
          (filter) =>
            job.experienceLevel === filter ||
            job.jobType === filter ||
            job.employmentType === filter ||
            job.requiredSkill.includes(filter)
        )
    )
    .sort((a, b) => {
      const dateA = a.timestamp ? a.timestamp.seconds : a.datePosted.seconds;
      const dateB = b.timestamp ? b.timestamp.seconds : b.datePosted.seconds;
      return latestFirst ? dateB - dateA : dateA - dateB;
    });

  const savedJobsTotalPages = Math.ceil(filteredSavedJobs.length / jobsPerPage);
  const savedJobsStartIndex = (savedJobsCurrentPage - 1) * jobsPerPage;
  const savedJobsEndIndex = savedJobsStartIndex + jobsPerPage;
  const currentSavedJobs = filteredSavedJobs.slice(
    savedJobsStartIndex,
    savedJobsEndIndex
  );

  // Created Jobs pagination
  const filteredCreatedJobs = jobOffers
    .filter((job) => job.alumniId === user?.uid && job.status !== "Draft") 
    .filter((job) => {
      if (activeFilters.length === 0) return true;
      return activeFilters.some(
        (filter) =>
          [
            job.experienceLevel,
            job.jobType,
            job.employmentType,
            job.status,
          ].includes(filter) || job.requiredSkill.includes(filter)
      );
    })
    .sort((a, b) => {
      const dateA = a.datePosted.seconds;
      const dateB = b.datePosted.seconds;
      return latestFirst ? dateB - dateA : dateA - dateB;
    });

  const createdJobsTotalPages = Math.ceil(
    filteredCreatedJobs.length / jobsPerPage
  );
  const createdJobsStartIndex = (createdJobsCurrentPage - 1) * jobsPerPage;
  const createdJobsEndIndex = createdJobsStartIndex + jobsPerPage;
  const currentCreatedJobs = filteredCreatedJobs.slice(
    createdJobsStartIndex,
    createdJobsEndIndex
  );

  // Draft Jobs pagination
  const filteredDraftJobs = jobOffers
    .filter((job) => job.status === "Draft" && job.alumniId === user?.uid) // Filter drafts for current user
    .filter(
      (job) =>
        activeFilters.length === 0 ||
        activeFilters.some(
          (filter) =>
            job.experienceLevel === filter ||
            job.jobType === filter ||
            job.employmentType === filter ||
            job.requiredSkill.includes(filter)
        )
    )
    .sort((a, b) => {
      const dateA = a.datePosted.seconds;
      const dateB = b.datePosted.seconds;
      return latestFirst ? dateB - dateA : dateA - dateB;
    });

  const draftJobsTotalPages = Math.ceil(filteredDraftJobs.length / jobsPerPage);
  const draftJobsStartIndex = (draftJobsCurrentPage - 1) * jobsPerPage;
  const draftJobsEndIndex = draftJobsStartIndex + jobsPerPage;
  const currentDraftJobs = filteredDraftJobs.slice(
    draftJobsStartIndex, 
    draftJobsEndIndex
  );

  return (
    <>
      {/* Header Banner - magaadd pa ako pic wait lang guys huhu */}
      <div
        className="relative bg-cover bg-center pt-20 pb-10 px-10 md:px-30 md:pt-30 md:pb-20 lg:px-50"
        style={{ backgroundImage: 'url("/ICS2.jpg")' }}
      >
        <div className="absolute inset-0 bg-blue-500/50" />
        <div className="relative">
          <h1 className="text-5xl font-bold my-2 text-white">Job Opportunities</h1>
          <p className="text-white text-sm md:text-base">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla porta, ligula non sagittis tempus, risus erat
            aliquam mi, nec vulputate dolor nunc et eros. Fusce fringilla, neque et ornare eleifend, enim turpis maximus
            quam, vitae luctus dui sapien in ipsum. Pellentesque mollis tempus nulla, sed ullamcorper quam hendrerit
            eget.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <button
            className={`px-3 py-2 bg-red-50 text-red-700 rounded text-sm transition-opacity duration-200 mb-4 ${
              activeFilters.length > 0
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
            onClick={() => {
              setActiveFilters([]);
              setActiveFilterCategory(null);
              setShowFilterOptions(false);
              setCurrentPage(1);
              setSavedJobsCurrentPage(1);
              setCreatedJobsCurrentPage(1);
            }}
          >
            Clear Filters
          </button>

          <div className="flex space-x-3">
          <div className="mb-4">
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-5 h-10 w-64 flex items-center justify-center rounded-full bg-[#FFFFFF] border-1 border-[#0856BA] text-sm font-semibold text-[#0856BA] shadow-inner shadow-white/10 transition-all duration-300 focus:border-2 focus:border-[#0856BA] hover:shadow-lg focus:outline-none"
              />
            </div>
            <div className="relative" ref={filterContainerRef}>
              <button
                className="pl-5 h-10 w-30 flex items-center justify-center rounded-full bg-[#FFFFFF] border-1 border-[#0856BA] text-sm font-semibold text-[#0856BA] shadow-inner shadow-white/10 transition-all duration-300 hover:bg-[#0856BA] hover:text-white hover:shadow-lg"
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
                Filter by
                <ChevronDown className="size-4 fill-white/60 ml-5" />
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
              className="pl-5 h-10 w-30 items-center flex flex-row rounded-full bg-[#FFFFFF] border-1 border-[#0856BA] text-sm font-semibold text-[#0856BA] shadow-inner shadow-white/10 transition-all duration-300 hover:bg-[#0856BA] hover:text-white hover:shadow-lg"
              onClick={() => setLatestFirst(!latestFirst)}
            >
              {latestFirst ? "Latest First" : "Oldest First"}
            </button>
          </div>
        </div>

        <div className="flex">
          <div>
            {/* Sidebar */}
            <div className="bg-[#FFFFFF] flex flex-col px-10 py-8 gap-[10px] rounded-[10px] w-content h-max md:top-1/7">
              <button
                onClick={() => {
                  setSidebarFilter("Job Postings")
                  setSelectedJob(null)
                }}
                className="flex items-center gap-3"
              >
                <Briefcase className="w-5 h-5" />
                <p
                  className={`group w-max relative py-1 transition-all ${
                    sidebarFilter === "Job Postings"
                      ? "font-semibold border-b-3 border-blue-500"
                      : "text-gray-700 group"
                  }`}
                >
                  <span>All Job Posts</span>
                  {sidebarFilter !== "Job Postings" && (
                    <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
                  )}
                </p>
              </button>
              <button
                onClick={() => {
                  setSidebarFilter("Saved Jobs")
                  setSelectedJob(null)
                }}
                className="flex items-center gap-3"
              >
                <Bookmark className="w-5 h-5" />
                <p
                  className={`group w-max relative py-1 transition-all ${
                    sidebarFilter === "Saved Jobs" ? "font-semibold border-b-3 border-blue-500" : "text-gray-700 group"
                  }`}
                >
                  <span>Saved Jobs</span>
                  {sidebarFilter !== "Saved Jobs" && (
                    <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
                  )}
                </p>
              </button>
              <button
                onClick={() => {
                  setSidebarFilter("Create Jobs")
                  setSelectedJob(null)
                }}
                className="flex items-center gap-3"
              >
                <FilePlus className="w-5 h-5" />
                <p
                  className={`group w-max relative py-1 transition-all ${
                    sidebarFilter === "Create Jobs" ? "font-semibold border-b-3 border-blue-500" : "text-gray-700 group"
                  }`}
                >
                  <span>Created Jobs</span>
                  {sidebarFilter !== "Create Jobs" && (
                    <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
                  )}
                </p>
              </button>
              <button
                onClick={() => {
                  setSidebarFilter("Drafts")
                  setSelectedJob(null)
                }}
                className="flex items-center gap-3"
              >
                <FileText className="w-5 h-5" />
                <p
                  className={`group w-max relative py-1 transition-all ${
                    sidebarFilter === "Drafts" ? "font-semibold border-b-3 border-blue-500" : "text-gray-700 group"
                  }`}
                >
                  <span>Drafts</span>
                  {sidebarFilter !== "Drafts" && (
                    <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
                  )}
                </p>
              </button>
            </div>

            {/* Post a Job Button */}
            <Button
              className="flex gap-3 items-center w-full px-3 py-2 mt-2 bg-[#0856BA] text-white rounded-[10px] hover:bg-[#063d8c] transition-all"
              onClick={() => setShowForm(!showForm)}
            >
              <Pencil className="w-5 h-5" />
              <p className="group w-max relative py-1 transition-all font-semibold">
                Post a Job</p>
            </Button>
          </div>

          
          {/* Main content revised yass */}
          <div className="flex-1 flex-col grid grid-cols-2 gap-4 pl-4 min-h-[600px]">
            {/* Left Column - Job Listings */}
            {/* Job Postings Filter */}
            <div>
              {sidebarFilter === "Job Postings" ? (
                isLoading ? (
                  <div className="space-y-2 flex-grow">
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
                            className={`bg-white p-3 border-1 rounded-lg cursor-pointer hover:border-blue-500 ${
                              selectedJob?.jobId === job.jobId
                                ? "border-blue-500"
                                : "border-gray-200"
                            }`}
                            onClick={() => setSelectedJob(job)}
                          >
                            <div className="flex">
                              <div className="mr-2">
                                {job.image ? (
                                  <img
                                    src={job.image}
                                    alt={`${job.company} logo`}
                                    className="w-15 h-15 object-contain rounded-md border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-15 h-15 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                                    {job.company.charAt(0).toUpperCase()}
                                  </div>
                                )}
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
                              ></div>
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
                    <>
                      <div className="space-y-2">
                        {currentSavedJobs.map((job, index) => (
                          <div
                            key={index}
                            className={`bg-white p-3 border-1 rounded-lg cursor-pointer hover:border-blue-500 ${
                              selectedJob?.jobId === job.jobId
                                ? "border-blue-500"
                                : "border-gray-200"
                            }`}
                            onClick={() => setSelectedJob(job)}
                          >
                            <div className="flex">
                              <div className="mr-3">
                                {job.image ? (
                                  <img
                                    src={job.image}
                                    alt={`${job.company} logo`}
                                    className="w-15 h-15 object-contain rounded-md border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-15 h-15 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                                    {job.company.charAt(0).toUpperCase()}
                                  </div>
                                )}
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
                        {currentSavedJobs.length < jobsPerPage &&
                          [...Array(jobsPerPage - currentSavedJobs.length)].map(
                            (_, i) => (
                              <div
                                key={`empty-saved-${i}`}
                                className="h-[72px] invisible"
                              ></div>
                            )
                          )}
                      </div>

                      {/* Pagination Controls for Saved Jobs */}
                      {filteredSavedJobs.length > 0 && (
                        <div className="flex justify-center mt-4 space-x-2">
                          <button
                            className="px-3 py-1 bg-white rounded text-sm"
                            onClick={() =>
                              setSavedJobsCurrentPage((prev) =>
                                Math.max(prev - 1, 1)
                              )
                            }
                            disabled={savedJobsCurrentPage === 1}
                          >
                            Prev
                          </button>

                          <span className="text-sm font-medium px-3 py-1">
                            {savedJobsCurrentPage} of {savedJobsTotalPages || 1}
                          </span>

                          <button
                            className="px-3 py-1 bg-white rounded text-sm"
                            onClick={() =>
                              setSavedJobsCurrentPage((prev) =>
                                Math.min(prev + 1, savedJobsTotalPages || 1)
                              )
                            }
                            disabled={
                              savedJobsCurrentPage === savedJobsTotalPages ||
                              filteredSavedJobs.length <= jobsPerPage
                            }
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
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
                    <>
                      <div className="space-y-2">
                        {currentCreatedJobs.map((job, index) => (
                          <div
                            key={index}
                            className={`bg-white p-3 border-1 rounded-lg cursor-pointer hover:border-blue-500 ${
                              selectedJob?.jobId === job.jobId
                                ? "border-blue-500"
                                : "border-gray-200"
                            }`}
                            onClick={() => setSelectedJob(job)}
                          >
                            <div className="flex justify-between items-center">
                              {/* Left side - Job details */}
                              <div className="flex items-center">
                                <div className="mr-3">
                                  {job.image ? (
                                    <img
                                      src={job.image || "/placeholder.svg"}
                                      alt={`${job.company} logo`}
                                      className="w-15 h-15 object-contain rounded-md border border-gray-200"
                                    />
                                  ) : (
                                    <div className="w-15 h-15 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                                      {job.company.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h2 className="font-semibold text-md">{job.position}</h2>
                                  <p className="text-sm text-gray-600">{job.company}</p>
                                  <p className="text-xs text-[#0856BA] flex items-center">
                                    <MapPin className="w-3.5 h-3.5 mr-1" />
                                    {job.location}
                                  </p>
                                </div>
                              </div>

                                {/* Middle - Toggle switch */}
                                {job.status !== "Pending" && (
                                <div className="w-[100px] flex justify-center">
                                  <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={job.status === "Accepted"}
                                    onChange={async () => {
                                      try {
                                      if (job.status === "Accepted") {
                                        await updateStatus("Closed", job.jobId);
                                      } else {
                                        await updateStatus("Accepted", job.jobId);
                                      }
                                      } catch (error) {
                                      toastError("Failed to update job status");
                                      }
                                    }}
                                  />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                  </label>
                                </div>
                                )}

                                {/* Right side - Status and trash icon */}
                                <div className="flex items-center space-x-3">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                  job.status === "Accepted"
                                    ? "bg-green-100 text-green-700"
                                    : job.status === "Rejected"
                                    ? "bg-red-100 text-red-700"
                                    : job.status === "Closed"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                </span>

                                {/* Trash button */}
                                <button
                                  className="text-gray-500 hover:text-red-500 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // No functionality yet
                                  }}
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {currentCreatedJobs.length < jobsPerPage &&
                          [...Array(jobsPerPage - currentCreatedJobs.length)].map((_, i) => (
                            <div key={`empty-created-${i}`} className="h-[72px] invisible"></div>
                          ))}
                      </div>

                      {/* Pagination Controls for Created Jobs */}
                      {filteredCreatedJobs.length > 0 && (
                        <div className="flex justify-center mt-4 space-x-2">
                          <button
                            className="px-3 py-1 bg-white rounded text-sm"
                            onClick={() =>
                              setCreatedJobsCurrentPage((prev) =>
                                Math.max(prev - 1, 1)
                              )
                            }
                            disabled={createdJobsCurrentPage === 1}
                          >
                            Prev
                          </button>

                          <span className="text-sm font-medium px-3 py-1">
                            {createdJobsCurrentPage} of{" "}
                            {createdJobsTotalPages || 1}
                          </span>

                          <button
                            className="px-3 py-1 bg-white rounded text-sm"
                            onClick={() =>
                              setCreatedJobsCurrentPage((prev) =>
                                Math.min(prev + 1, createdJobsTotalPages || 1)
                              )
                            }
                            disabled={
                              createdJobsCurrentPage ===
                                createdJobsTotalPages ||
                              filteredCreatedJobs.length <= jobsPerPage
                            }
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
                ) : sidebarFilter === "Drafts" ? (
                <div className="space-y-2">
                  {filteredDraftJobs.length === 0 ? (
                  <div className="text-center text-gray-500 p-4 min-h-[600px] flex flex-col items-center justify-center">
                  <p className="text-lg">No draft jobs found.</p>
                  </div>
                  ) : (
                  <>
                  <div className="space-y-2">
                  {filteredDraftJobs.map((job, index) => (
                    <div
                      key={index}
                      className={`bg-white p-3 border-1 rounded-lg cursor-pointer hover:border-blue-500 ${
                      selectedJob?.jobId === job.jobId
                      ? "border-blue-500"
                      : "border-gray-200"
                      }`}
                      onClick={() => setSelectedJob(job)}
                      >
                      <div className="flex justify-between items-center">
                        {/* Left side - Job details */}
                        <div className="flex items-center">
                          <div className="mr-3">
                            {job.image ? (
                            <img
                            src={job.image || "/placeholder.svg"}
                            alt={`${job.company} logo`}
                            className="w-15 h-15 object-contain rounded-md border border-gray-200"
                            />
                            ) : (
                            <div className="w-15 h-15 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                            {job.company.charAt(0).toUpperCase()}
                            </div>
                            )}
                          </div>

                          <div>
                            <h2 className="font-semibold text-md">{job.position}</h2>
                            <p className="text-sm text-gray-600">{job.company}</p>
                            <p className="text-xs text-[#0856BA] flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            {job.location}
                            </p>
                          </div>
                          </div>

                          {/* Right side */}
                          <div className="flex items-center space-x-3">
                          {/* Draft label */}
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            Draft
                          </span>

                          {/* Edit button */}
                          <button
                            className="text-gray-500 hover:text-blue-500 transition-colors"
                            onClick={(e) => {
                              handleEditDraft(job);
                              setShowForm(true);
                            }}
                          >
                            <Pencil className="w-5 h-5" />
                          </button>

                          {/* Delete button */}
                          <button
                            className="text-gray-500 hover:text-red-500 transition-colors"
                            onClick={(e) => {
                              handleDelete(job.jobId);
                            }}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredDraftJobs.length < jobsPerPage &&
                    [...Array(jobsPerPage - filteredDraftJobs.length)].map((_, i) => (
                    <div key={`empty-draft-${i}`} className="h-[72px] invisible"></div>
                    ))}
                  </div>

                  {/* Pagination Controls for Draft Jobs */}
                  {filteredDraftJobs.length > 0 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    <button
                    className="px-3 py-1 bg-white rounded text-sm"
                    onClick={() =>
                    setDraftJobsCurrentPage((prev) =>
                    Math.max(prev - 1, 1)
                    )
                    }
                    disabled={draftJobsCurrentPage === 1}
                    >
                    Prev
                    </button>

                    <span className="text-sm font-medium px-3 py-1">
                    {draftJobsCurrentPage} of {draftJobsTotalPages || 1}
                    </span>

                    <button
                    className="px-3 py-1 bg-white rounded text-sm"
                    onClick={() =>
                    setDraftJobsCurrentPage((prev) =>
                    Math.min(prev + 1, draftJobsTotalPages || 1)
                    )
                    }
                    disabled={
                    draftJobsCurrentPage === draftJobsTotalPages ||
                    filteredDraftJobs.length <= jobsPerPage
                    }
                    >
                    Next
                    </button>
                  </div>
                  )}
                  </>
                  )}
                </div>
                ) : null}
              </div>

            {/* Right Column - Job Details */}
            <div className="bg-white rounded-lg p-4 min-h-[600px] flex flex-col">
              {selectedJob ? (
                <div className="w-full space-y-4">
                  <div className="flex items-start">
                    {/* Company Logo */}
                    <div className="mr-4">
                      {selectedJob.image ? (
                        <img
                          src={selectedJob.image}
                          alt={`${selectedJob.company} logo`}
                          className="w-20 h-20 object-contain rounded-md border border-gray-200"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-xl font-semibold text-gray-500">
                          {selectedJob.company.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedJob.position}
                      </h2>
                      <p className="text-gray-600 text-lg">
                        {selectedJob.company}
                      </p>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-[#0856BA] mr-1" />
                        <span className="ml-1 font-semibold text-[#0856BA]">
                          {selectedJob.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-[#0856BA] p-3 rounded-lg mb-4 space-y-2">
                    <div className="text-sm flex items-center">
                      <DollarSign className="w-4 h-4 text-[#0856BA] mr-2.5" />
                      <span className="text-[#0856BA] font-semibold">
                        Salary Range:
                      </span>
                      <span className="ml-1 font-medium">
                        {selectedJob.salaryRange}
                      </span>
                    </div>

                    <div className="text-sm flex items-center">
                      <Briefcase className="w-4 h-4 text-[#0856BA] mr-2.5" />
                      <span className="text-[#0856BA] font-semibold">
                        Employment Type:
                      </span>
                      <span className="ml-1 font-medium">
                        {selectedJob.employmentType}
                      </span>
                    </div>

                    <div className="text-sm flex items-center">
                      <Award className="w-4 h-4 text-[#0856BA] mr-2.5" />
                      <span className="text-[#0856BA] font-semibold">
                        Experience Level:
                      </span>
                      <span className="ml-1 font-medium">
                        {selectedJob.experienceLevel}
                      </span>
                    </div>

                    {selectedJob.jobType && (
                      <div className="flex flex-wrap gap-4">
                        <div className="text-sm flex items-center">
                          <FileText className="w-4 h-4 text-[#0856BA] mr-2.5" />
                          <span className="text-[#0856BA] font-semibold">
                            Job Type:
                          </span>
                          <span className="ml-1 font-medium">
                            {selectedJob.jobType}
                          </span>
                        </div>
                      </div>
                    )}
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
                      {selectedJob.requiredSkill &&
                        selectedJob.requiredSkill.map((skill) => (
                          <ul
                            key={skill}
                            className="max-w-md space-y-1 text-gray-500 list-inside dark:text-gray-500"
                          >
                            <li className="flex items-center">
                              <svg
                                className="w-3.5 h-3.5 me-2 text-green-500 dark:text-green-400 shrink-0"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
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
        {/* <Button
          className="h-10 px-5 fixed bottom-8 right-8 bg-[#0856BA] border border-[#0856BA] text-sm font-semibold text-white shadow-inner shadow-white/10 transition-all duration-300 hover:bg-[#063d8c] hover:shadow-lg rounded-full"
          onClick={() => setShowForm(!showForm)}
        >
          Post a Job
        </Button> */}
        {showForm && (
          <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-lg border-0 border-gray shadow-lg w-11/12 max-w-3xl max-h-[80vh] overflow-y-auto"
            >
              <div className="bg-white z-30 w-full border-b px-6 pt-6 pb-3">
                <h2 className="text-2xl font-semibold">
                  Post a Job Opportunity
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-5">
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
                      className="w-full p-1.5 border rounded text-sm"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Employment Type<span className="text-red-500">*</span>
                    </label>
                    <DropdownMenu
                      open={employmentTypeOpen}
                      onOpenChange={setEmploymentTypeOpen}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between border rounded p-2 bg-white text-left font-normal"
                        >
                          {employmentType || "Select Employment Type"}
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[300px] bg-white p-1 border rounded shadow-md">
                        {filterCategories["Employment Type"].map((type) => (
                          <Button
                            key={type}
                            variant="ghost"
                            className="w-full justify-start p-2 text-left hover:bg-gray-100"
                            onClick={() => {
                              setEmploymentType(type);
                              setEmploymentTypeOpen(false);
                            }}
                          >
                            {type}
                            {employmentType === type && (
                              <Check className="ml-auto h-4 w-4" />
                            )}
                          </Button>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Job Type<span className="text-red-500">*</span>
                    </label>
                    <DropdownMenu
                      open={jobTypeOpen}
                      onOpenChange={setJobTypeOpen}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between border rounded p-2 bg-white text-left font-normal"
                        >
                          {jobType || "Select Job Type"}
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[300px] bg-white p-2 border rounded shadow-md">
                        {filterCategories["Job Type"].map((type) => (
                          <Button
                            key={type}
                            variant="ghost"
                            className="w-full justify-start p-2 text-left hover:bg-gray-100"
                            onClick={() => {
                              setJobType(type);
                              setJobTypeOpen(false);
                            }}
                          >
                            {type}
                            {jobType === type && (
                              <Check className="ml-auto h-4 w-4" />
                            )}
                          </Button>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Job Description<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="E.g., Outline the role, responsibilities, and key qualifications for this position."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="w-full p-1.5 border rounded resize-none text-sm"
                      style={{ height: "110px" }} // Increased height (4x the original)
                      required
                    />
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      variant="ghost"
                      className="pl-2 text-[#0856BA] hover:text-blue-700 text-sm bg-transparent hover:bg-transparent"
                    >
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
                      className="w-full p-1.5 border rounded text-sm"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Location<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full p-1.5 border rounded text-sm"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Experience Level<span className="text-red-500">*</span>
                    </label>
                    <DropdownMenu
                      open={experienceLevelOpen}
                      onOpenChange={setExperienceLevelOpen}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between border rounded p-2 bg-white text-left font-normal"
                        >
                          {experienceLevel || "Select Experience Level"}
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[300px] bg-white p-2 border rounded shadow-md">
                        {filterCategories["Experience Level"].map((level) => (
                          <Button
                            key={level}
                            variant="ghost"
                            className="w-full justify-start p-1.5 text-left hover:bg-gray-100"
                            onClick={() => {
                              setExperienceLevel(level);
                              setExperienceLevelOpen(false);
                            }}
                          >
                            {level}
                            {experienceLevel === level && (
                              <Check className="ml-auto h-4 w-4" />
                            )}
                          </Button>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
                      placeholder="e.g. 10000-30000"
                      value={salaryRange}
                      onChange={(e) => setSalaryRange(e.target.value)}
                      onInput={(e) => {
                        const value = e.target.value;
                        if (!/^[0-9-]*$/.test(value)) {
                          e.target.value = value.replace(/[^0-9-]/g, "");
                        }
                      }}
                      pattern="^\d+(-\d+)?$" // Regex to allow numbers or a range like "10000-30000"
                      className="w-full pl-8 p-1.5 border rounded text-sm"
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
                      value={requiredSkill.join(', ')}
                      placeholder="Required Skills (comma-separated)"
                      onChange={handleSkillChange}
                      className="w-full p-1.5 border rounded placeholder:text-sm"
                      required
                    />
                  </div>
                  </div>
                </div>

                  <hr className="my-2 border-t border-gray-300" />

                  <div className="mb-6 pt-2 pl-1">
                    <label className="block text-sm font-medium mb-1">
                      Company Logo<span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer">
                        <div className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                          Choose File
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <span className="text-sm text-gray-500">
                        {fileName || "No file chosen"}
                      </span>
                    </div>

                    {preview && (
                      <div className="mt-3">
                        <img
                          src={preview}
                          alt="Preview"
                          className="h-20 object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-6">
                {/* Left side - Cancel button */}
                <div>
                    <button
                    type="button"
                    className="h-10 px-5 flex items-center justify-center rounded-full bg-[#FFFFFF] border border-gray-400 text-sm font-semibold text-gray-700 shadow-inner shadow-white/10 transition-all duration-300 hover:bg-red-700 hover:text-white hover:shadow-lg"
                    onClick={() => {
                      setShowForm(false);
                      setPosition('');
                      setEmploymentType('');
                      setJobType('');
                      setJobDescription('');
                      setCompany('');
                      setLocation('');
                      setExperienceLevel('');
                      setSalaryRange('');
                      setJobImage(null);
                    }}
                    >
                    Cancel
                    </button>
                </div>

                {/* Right side - Save as Draft and Submit buttons */}
                <div className="flex gap-4">
                    <button
                    type="button"
                    className="h-10 px-5 flex items-center justify-center rounded-full bg-[#FFFFFF] border border-[#0856BA] text-sm font-semibold text-[#0856BA] shadow-inner shadow-white/10 transition-all duration-300 hover:bg-[#0856BA] hover:text-white hover:shadow-lg"
                    onClick={async (e) => {
                      try {
                        // Save draft - this function needs to be implemented in JobOfferContext
                        await handleSaveDraft(e);
                        toastSuccess("Draft saved successfully");
                        setShowForm(false);
                      } catch (error) {
                        toastError("Failed to save draft. Please try again.");
                        console.error("Error saving draft:", error);
                      }
                    }}
                    >
                    Save as Draft
                    </button>

                    <button
                    type="submit"
                    onClick={async (e) => {
                    if (
                      !position ||
                      !employmentType ||
                      !jobType ||
                      !jobDescription ||
                      !company ||
                      !location ||
                      !experienceLevel ||
                      !salaryRange ||
                      !image
                    ) {
                      alert("Please fill in all required fields")
                      return
                    }
                    try {
                      await handleSubmit(e);
                      toastSuccess("Job submitted successfully");
                      setShowForm(false);
                    } catch (error) {
                      toastError("There was an error submitting the job. Please try again.");
                    }
                    }}
                  className="h-10 px-5 flex items-center justify-center rounded-full bg-[#0856BA] border border-[#0856BA] text-sm font-semibold text-white shadow-inner shadow-white/10 transition-all duration-300 hover:bg-[#063d8c] hover:shadow-lg"
                >
                  Submit
                </button>
                </div>
                </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
