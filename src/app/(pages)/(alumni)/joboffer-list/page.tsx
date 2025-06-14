"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Key } from "react";
import { useJobOffer } from "@/context/JobOfferContext";
import {
  Alumnus,
  JobApplication,
  JobOffering,
  Bookmark,
} from "@/models/models";
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
  FilePlus,
  MapPin,
  ChevronDown,
  DollarSign,
  Award,
  FileText,
  Check,
  Pencil,
  Trash2,
  CheckCircle,
  Bookmark as BookmarkIcon,
  Mail,
  User,
  Asterisk,
} from "lucide-react";
import Banner from "@/components/Banner";
import { set } from "zod";
import Image from "next/image";
import JobApplicationModal from "@/components/JobApplicationModal";
import { useJobApplicationContext } from "@/context/JobApplicationContext";
import { useAlums } from "@/context/AlumContext";
import SearchParamsWrapper from "@/components/SearchParamsWrapper";
import CollapseText from "@/components/CollapseText";

function formatDate(timestamp: any) {
  if (!timestamp || !timestamp.seconds) return "Invalid Date";
  const date = new Date(timestamp.seconds * 1000);
  return date.toISOString().split("T")[0];
}

export default function JobOffers() {
  return (
    <SearchParamsWrapper>
      <JobOffersContent />
    </SearchParamsWrapper>
  );
}

function JobOffersContent() {
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
    updateStatus,
    setPreview,
    setFileName,
  } = useJobOffer();

  const { addJobApplication } = useJobApplicationContext();
  const { alums } = useAlums();
  const { jobApplications, updateApplicationStatus } =
    useJobApplicationContext();

  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
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

  const [applyModalOpen, setApplyModalOpen] = useState(false);

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

  useEffect(() => {
    if (jobId) {
      const foundJob = currentSavedJobs.find(
        (job: JobOffering) => job.jobId === jobId
      );
      if (foundJob) {
        setSidebarFilter("Saved Jobs");
        setSelectedJob(foundJob);
      }
    }
  }, [jobId]);

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
    .filter((bookmark: Bookmark) => bookmark.type === "job_offering")
    .map((bookmark: Bookmark) =>
      jobOffers.find((job: JobOffering) => job.jobId === bookmark.entryId)
    )
    .filter(Boolean)
    .filter(
      (job: JobOffering) =>
        activeFilters.length === 0 ||
        activeFilters.some(
          (filter) =>
            job.experienceLevel === filter ||
            job.jobType === filter ||
            job.employmentType === filter ||
            job.requiredSkill.includes(filter)
        )
    )
    .sort(
      (
        a: { timestamp: { seconds: any }; datePosted: { seconds: any } },
        b: { timestamp: { seconds: any }; datePosted: { seconds: any } }
      ) => {
        const dateA = a.timestamp ? a.timestamp.seconds : a.datePosted.seconds;
        const dateB = b.timestamp ? b.timestamp.seconds : b.datePosted.seconds;
        return latestFirst ? dateB - dateA : dateA - dateB;
      }
    );

  const savedJobsTotalPages = Math.ceil(filteredSavedJobs.length / jobsPerPage);
  const savedJobsStartIndex = (savedJobsCurrentPage - 1) * jobsPerPage;
  const savedJobsEndIndex = savedJobsStartIndex + jobsPerPage;
  const currentSavedJobs = filteredSavedJobs.slice(
    savedJobsStartIndex,
    savedJobsEndIndex
  );

  // Created Jobs pagination
  const filteredCreatedJobs = jobOffers
    .filter(
      (job: JobOffering) => job.alumniId === user?.uid && job.status !== "Draft"
    )
    .filter((job: JobOffering) => {
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
    .sort(
      (
        a: { datePosted: { seconds: any } },
        b: { datePosted: { seconds: any } }
      ) => {
        const dateA = a.datePosted.seconds;
        const dateB = b.datePosted.seconds;
        return latestFirst ? dateB - dateA : dateA - dateB;
      }
    );

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
    .filter(
      (job: JobOffering) => job.status === "Draft" && job.alumniId === user?.uid
    ) // Filter drafts for current user
    .filter(
      (job: JobOffering) =>
        activeFilters.length === 0 ||
        activeFilters.some(
          (filter) =>
            job.experienceLevel === filter ||
            job.jobType === filter ||
            job.employmentType === filter ||
            job.requiredSkill.includes(filter)
        )
    )
    .sort(
      (
        a: { datePosted: { seconds: any } },
        b: { datePosted: { seconds: any } }
      ) => {
        const dateA = a.datePosted.seconds;
        const dateB = b.datePosted.seconds;
        return latestFirst ? dateB - dateA : dateA - dateB;
      }
    );

  const draftJobsTotalPages = Math.ceil(filteredDraftJobs.length / jobsPerPage);
  const draftJobsStartIndex = (draftJobsCurrentPage - 1) * jobsPerPage;
  const draftJobsEndIndex = draftJobsStartIndex + jobsPerPage;
  const currentDraftJobs = filteredDraftJobs.slice(
    draftJobsStartIndex,
    draftJobsEndIndex
  );

  return (
    <>
      <title>Job Opportunities | ICS-ARMS</title>
      {/* Header Banner - magaadd pa ako pic wait lang guys huhu */}
      <Banner
        title="Job Opportunities"
        description="Discover job opportunities through ICS and alumni partnerships, bridging the gap between education and career success for ICS graduates."
      />

      <div className="px-[10%] py-10">
        {/*Job filter and sort */}
        <div className=" bg-white rounded-lg flex items-center justify-between px-5 py-3 mb-4 shadow-sm">
          <button
            className={`px-3 py-2 bg-red-50 text-red-700 rounded text-sm transition-opacity duration-200 ${
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
            <div className="">
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-5 h-10 w-64 flex items-center justify-center rounded-full bg-[#FFFFFF] border-[2px] border-[var(--primary-blue)] text-sm  text-[var(--primary-blue)] shadow-inner shadow-white/10 transition-all duration-300 focus:border-2 focus:border-[#0856BA]  focus:outline-none"
              />
            </div>
            <div className="relative" ref={filterContainerRef}>
              <button
                className="pl-5 h-10 w-30 flex items-center justify-center rounded-full bg-[#FFFFFF] border-[2px] border-[var(--primary-blue)] text-sm  text-[var(--primary-blue)] shadow-inner shadow-white/10 transition-all duration-300"
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
                <div className="absolute mt-2 right-0 bg-white p-2 rounded shadow-lg  border border-gray-200 w-40">
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
                      {activeFilterCategory &&
                        filterCategories[
                          activeFilterCategory as keyof typeof filterCategories
                        ]?.map((filter) => (
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
              className="pl-5 h-10 w-30 items-center flex flex-row rounded-full bg-[#FFFFFF] border-[2px] border-[var(--primary-blue)] text-sm text-[var(--primary-blue)] shadow-inner shadow-white/10 transition-all duration-300 "
              onClick={() => setLatestFirst(!latestFirst)}
            >
              {latestFirst ? "Latest First" : "Oldest First"}
            </button>
          </div>
        </div>

        <div className="flex">
          <div className="flex flex-col gap-2">
            {/* Sidebar */}
            <div className="bg-[#FFFFFF] flex flex-col px-10 py-8 gap-[10px] rounded-[10px] w-content h-max md:top-1/7">
              <button
                onClick={() => {
                  setSidebarFilter("Job Postings");
                  setSelectedJob(null);
                }}
                className="flex items-center gap-3"
              >
                <Briefcase className="w-5 h-5" />
                <p
                  className={`group w-max relative py-1 transition-all ${
                    sidebarFilter === "Job Postings"
                      ? "font-semibold border-b-3 border-[var(--primary-blue)]"
                      : "text-gray-700 group"
                  }`}
                >
                  <span>All Job Posts</span>
                  {sidebarFilter !== "Job Postings" && (
                    <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-[var(--primary-blue)] transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
                  )}
                </p>
              </button>
              <button
                onClick={() => {
                  setSidebarFilter("Saved Jobs");
                  setSelectedJob(null);
                }}
                className="flex items-center gap-3"
              >
                <BookmarkIcon className="w-5 h-5" />
                <p
                  className={`group w-max relative py-1 transition-all ${
                    sidebarFilter === "Saved Jobs"
                      ? "font-semibold border-b-3 border-[var(--primary-blue)]"
                      : "text-gray-700 group"
                  }`}
                >
                  <span>Saved Jobs</span>
                  {sidebarFilter !== "Saved Jobs" && (
                    <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-[var(--primary-blue)] transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
                  )}
                </p>
              </button>
              <button
                onClick={() => {
                  setSidebarFilter("Create Jobs");
                  setSelectedJob(null);
                }}
                className="flex items-center gap-3"
              >
                <FilePlus className="w-5 h-5" />
                <p
                  className={`group w-max relative py-1 transition-all ${
                    sidebarFilter === "Create Jobs"
                      ? "font-semibold border-b-3 border-[var(--primary-blue)]"
                      : "text-gray-700 group"
                  }`}
                >
                  <span>Created Jobs</span>
                  {sidebarFilter !== "Create Jobs" && (
                    <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-[var(--primary-blue)] transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
                  )}
                </p>
              </button>
              <button
                onClick={() => {
                  setSidebarFilter("Applied Jobs");
                  setSelectedJob(null);
                }}
                className="flex items-center gap-3"
              >
                <Mail className="w-5 h-5" />
                <p
                  className={`group w-max relative py-1 transition-all ${
                    sidebarFilter === "Applied Jobs"
                      ? "font-semibold border-b-3 border-[var(--primary-blue)]"
                      : "text-gray-700 group"
                  }`}
                >
                  <span>Applied Jobs</span>
                  {sidebarFilter !== "Applied Jobs" && (
                    <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-[var(--primary-blue)] transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
                  )}
                </p>
              </button>
              <button
                onClick={() => {
                  setSidebarFilter("Drafts");
                  setSelectedJob(null);
                }}
                className="flex items-center gap-3"
              >
                <FileText className="w-5 h-5" />
                <p
                  className={`group w-max relative py-1 transition-all ${
                    sidebarFilter === "Drafts"
                      ? "font-semibold border-b-3 border-[var(--primary-blue)]"
                      : "text-gray-700 group"
                  }`}
                >
                  <span>Drafts</span>
                  {sidebarFilter !== "Drafts" && (
                    <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-[var(--primary-blue)] transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
                  )}
                </p>
              </button>
            </div>
            {/* Post a Job Button */}
            <Button
              className="flex gap-3 items-center w-full px-3 py-2 mt-2 bg-[#0856BA] text-white rounded-full hover:bg-[#063d8c] transition-all cursor-pointer"
              onClick={() => setShowForm(!showForm)}
            >
              <Pencil className="w-5 h-5" />
              <p className="group w-max relative py-1 transition-all font-semibold">
                Post a Job
              </p>
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
                            className={`bg-white shadow-md p-3 border-1 rounded-lg cursor-pointer hover:border-blue-500 ${
                              selectedJob?.jobId === job.jobId
                                ? "border-[var(--primary-blue)]"
                                : "border-gray-200"
                            }`}
                            onClick={() => setSelectedJob(job)}
                          >
                            <div className="flex">
                              <div className="mr-2">
                                {job.image ? (
                                  <Image
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    priority
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
                                <h2 className="font-semibold text-md max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                                  {job.position}
                                </h2>
                                <p className="text-sm text-gray-600 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                                  {job.company}
                                </p>
                                <p className="text-xs text-[#0856BA] flex items-center max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
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
                        {currentSavedJobs.map(
                          (job: JobOffering, index: Key | null | undefined) => (
                            <div
                              key={index}
                              className={`bg-white shadow-md p-3 border-1 rounded-lg cursor-pointer hover:border-blue-500 ${
                                selectedJob?.jobId === job.jobId
                                  ? "border-[var(--primary-blue)]"
                                  : "border-gray-200"
                              }`}
                              onClick={() => setSelectedJob(job)}
                            >
                              <div className="flex">
                                <div className="mr-3">
                                  {job.image ? (
                                    <Image
                                      width={0}
                                      height={0}
                                      sizes="100vw"
                                      priority
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
                                  <h2 className="font-semibold text-md max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                                    {job.position}
                                  </h2>
                                  <p className="text-sm text-gray-600 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                                    {job.company}
                                  </p>
                                  <p className="text-xs text-[#0856BA] flex items-center max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
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
                          )
                        )}
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
                        {currentCreatedJobs.map(
                          (job: JobOffering, index: Key | null | undefined) => {
                            return (
                              <div
                                key={index}
                                className={`bg-white shadow-md p-3 border-1 rounded-lg cursor-pointer hover:border-blue-500 ${
                                  selectedJob?.jobId === job.jobId
                                    ? "border-[var(--primary-blue)]"
                                    : "border-gray-200"
                                }`}
                                onClick={() => setSelectedJob(job)}
                              >
                                <div className="flex justify-between items-center">
                                  {/* Left side - Job details */}
                                  <div className="flex items-center">
                                    <div className="mr-3">
                                      {job.image ? (
                                        <Image
                                          width={0}
                                          height={0}
                                          sizes="100vw"
                                          priority
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
                                      <h2 className="font-semibold text-md max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                                        {job.position}
                                      </h2>
                                      <p className="text-sm text-gray-600 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                                        {job.company}
                                      </p>
                                      <p className="text-xs text-[#0856BA] flex items-center max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                                        <MapPin className="w-3.5 h-3.5 mr-1" />
                                        {job.location}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Right side - Status and trash icon with toggle moved here */}
                                  <div className="flex items-center space-x-3">
                                    {/* Toggle switch */}
                                    {job.status !== "Pending" && (
                                      <div className="w-12 flex justify-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                          <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={job.status === "Accepted"}
                                            onChange={async () => {
                                              try {
                                                if (job.status === "Accepted") {
                                                  await updateStatus(
                                                    "Closed",
                                                    job.jobId
                                                  );
                                                } else {
                                                  await updateStatus(
                                                    "Accepted",
                                                    job.jobId
                                                  );
                                                }
                                              } catch (error) {
                                                toastError(
                                                  "Failed to update job status"
                                                );
                                              }
                                            }}
                                          />
                                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                        </label>
                                      </div>
                                    )}
                                    {job.status === "Pending" && (
                                      <div className="w-11 h-6 opacity-0">
                                        {/* Placeholder to prevent layout shift */}
                                      </div>
                                    )}
                                    <div className="w-24 flex items-center justify-center">
                                      {/* Status label */}
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
                                        {job.status.charAt(0).toUpperCase() +
                                          job.status.slice(1)}
                                      </span>
                                    </div>

                                    {/* Trash button */}
                                    <button
                                      className="text-gray-500 hover:text-red-500 transition-colors mr-3"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(job.jobId);
                                      }}
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                        )}
                        {currentCreatedJobs.length < jobsPerPage &&
                          [
                            ...Array(jobsPerPage - currentCreatedJobs.length),
                          ].map((_, i) => (
                            <div
                              key={`empty-created-${i}`}
                              className="h-[72px] invisible"
                            ></div>
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
              ) : sidebarFilter === "Applied Jobs" ? (
                jobApplications.length === 0 ? (
                  <div className="text-center text-gray-500 p-4 min-h-[600px] flex flex-col items-center justify-center">
                    <p className="text-lg">No applied jobs found.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {jobApplications
                      .filter(
                        (offer: JobApplication) =>
                          offer.applicantId === user!.uid
                      )
                      .map((jobOffer: JobApplication, index: number) => {
                        const job = jobOffers.find(
                          (job: JobOffering) => job.jobId === jobOffer.jobId
                        );
                        if (!job) return null;
                        return (
                          <div
                            key={index}
                            className={`bg-white shadow-md p-3 border-1 rounded-lg cursor-pointer hover:border-blue-500 ${
                              selectedJob?.jobId === job.jobId
                                ? "border-[var(--primary-blue)]"
                                : "border-gray-200"
                            }`}
                            onClick={() => setSelectedJob(job)}
                          >
                            <div className="flex justify-between items-center">
                              {/* Left side - Job details */}
                              <div className="flex items-center">
                                <div className="mr-3">
                                  {job.image ? (
                                    <Image
                                      width={0}
                                      height={0}
                                      sizes="100vw"
                                      priority
                                      src={job.image || "/placeholder.svg"}
                                      alt={`${job.company} logo`}
                                      className="w-15 h-15 object-contain rounded-md border border-gray-200"
                                    />
                                  ) : (
                                    <div className="w-15 h-15 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                                      {job.company?.charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                {!job.company || !job.location ? (
                                  <div>
                                    <h2 className="font-semibold text-md max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                                      {job.position}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                      Job Details not available
                                    </p>
                                  </div>
                                ) : (
                                  <div>
                                    <h2 className="font-semibold text-md max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                                      {job.position}
                                    </h2>
                                    <p className="text-sm text-gray-600 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                                      {job.company}
                                    </p>
                                    <p className="text-xs text-[#0856BA] flex items-center max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                                      <MapPin className="w-3.5 h-3.5 mr-1" />
                                      {job.location || "No location added yet."}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* Right side */}
                              <div className="flex items-center space-x-3">
                                {/* Draft label */}
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    jobOffer.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : jobOffer.status === "accepted"
                                      ? "bg-green-100 text-green-800"
                                      : jobOffer.status === "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {jobOffer.status === "pending"
                                    ? "Pending"
                                    : jobOffer.status === "accepted"
                                    ? "Accepted"
                                    : jobOffer.status === "rejected"
                                    ? "Rejected"
                                    : "Closed"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )
              ) : sidebarFilter === "Drafts" ? (
                <div className="space-y-2">
                  {filteredDraftJobs.length === 0 ? (
                    <div className="text-center text-gray-500 p-4 min-h-[600px] flex flex-col items-center justify-center">
                      <p className="text-lg">No draft jobs found.</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {filteredDraftJobs.map(
                          (job: JobOffering, index: Key | null | undefined) => (
                            <div
                              key={index}
                              className={`bg-white shadow-md p-3 border-1 rounded-lg cursor-pointer hover:border-blue-500 ${
                                selectedJob?.jobId === job.jobId
                                  ? "border-[var(--primary-blue)]"
                                  : "border-gray-200"
                              }`}
                              onClick={() => setSelectedJob(job)}
                            >
                              <div className="flex justify-between items-center">
                                {/* Left side - Job details */}
                                <div className="flex items-center">
                                  <div className="mr-3">
                                    {job.image ? (
                                      <Image
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        priority
                                        src={job.image || "/placeholder.svg"}
                                        alt={`${job.company} logo`}
                                        className="w-15 h-15 object-contain rounded-md border border-gray-200"
                                      />
                                    ) : (
                                      <div className="w-15 h-15 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                                        {job.company.charAt(0).toUpperCase()}
                                      </div>
                                    )}
                                  </div>
                                  {!job.company || !job.location ? (
                                    <div>
                                      <h2 className="font-semibold text-md max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                                        {job.position}
                                      </h2>
                                      <p className="text-sm text-gray-500">
                                        This draft can't be published yet.
                                        <br /> Please complete all required
                                        fields.
                                      </p>
                                    </div>
                                  ) : (
                                    <div>
                                      <h2 className="font-semibold text-md max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                                        {job.position}
                                      </h2>
                                      <p className="text-sm text-gray-600 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                                        {job.company}
                                      </p>
                                      <p className="text-xs text-[#0856BA] flex items-center max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                                        <MapPin className="w-3.5 h-3.5 mr-1" />
                                        {job.location ||
                                          "No location added yet."}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Right side */}
                                <div className="flex items-center space-x-3">
                                  {/* Draft label */}
                                  <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                    Draft
                                  </span>

                                  {/* Edit button */}
                                  <button
                                    className="text-gray-500 hover:text-[#0856BA] transition-all"
                                    onClick={(e) => {
                                      handleEditDraft(job);
                                      setShowForm(true);
                                    }}
                                  >
                                    <Pencil className="w-5 h-5" />
                                  </button>

                                  {/* Delete button */}
                                  <button
                                    className="text-gray-500 hover:text-red-500 transition-colors mr-3"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(job.jobId);
                                    }}
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                        {filteredDraftJobs.length < jobsPerPage &&
                          [
                            ...Array(jobsPerPage - filteredDraftJobs.length),
                          ].map((_, i) => (
                            <div
                              key={`empty-draft-${i}`}
                              className="h-[72px] invisible"
                            ></div>
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
            <div className="bg-white rounded-lg p-4 h-180 flex flex-col overflow-y-auto shadow-md">
              {selectedJob ? (
                <div className="w-full space-y-4 flex flex-col h-full">
                  <div className="flex items-start">
                    {/* Company Logo */}
                    <div className="mr-4 flex-shrink-0">
                      {selectedJob.image ? (
                        <Image
                          width={0}
                          height={0}
                          sizes="100vw"
                          priority
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
                        <MapPin className="w-4 h-4 min-w-4 text-[#0856BA] mr-1" />
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

                  <div className="space-y-1">
                    <h3 className="font-semibold mb-2">Job Description</h3>
                    <CollapseText
                      text={selectedJob.jobDescription}
                      maxChars={500}
                    />
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-semibold mb-2">Required Skills</h3>
                    <div className="pl-[25px]">
                      {selectedJob.requiredSkill &&
                        selectedJob.requiredSkill.map((skill) => (
                          <ul
                            key={skill}
                            className="max-w-md space-y-1 text-gray-500 list-inside dark:text-gray-500"
                          >
                            <li
                              key={skill}
                              className="flex items-center gap-[5px]"
                            >
                              <CheckCircle className="size-4 text-green-500" />
                              {skill}
                            </li>
                          </ul>
                        ))}
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 mt-auto pt-4">
                    Posted on {formatDate(selectedJob.datePosted)}
                  </p>
                  {sidebarFilter !== "Create Jobs" &&
                    sidebarFilter !== "Applied Jobs" &&
                    sidebarFilter !== "Drafts" &&
                    !jobApplications.find(
                      (application: JobApplication) =>
                        application.jobId === selectedJob.jobId &&
                        application.applicantId === user!.uid
                    ) &&
                    !jobOffers.find(
                      (job: JobOffering) =>
                        selectedJob.jobId === job.jobId &&
                        job.alumniId === user!.uid
                    ) && (
                      <div className="sticky bottom-0 pt-4 pb-2 bg-white">
                        {/* <h3 className="font-semibold mb-2">
                          Interested in this job?
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Click the button below to apply.
                        </p> */}
                        <Button
                          variant={"outline"}
                          className="w-full cursor-pointer rounded-full bg-[#0856BA] border border-[#0856BA] text-sm font-semibold text-white shadow-inner shadow-white/10 transition-all duration-300 hover:bg-[#063d8c] hover:shadow-lg"
                          onClick={() => {
                            setApplyModalOpen(true);
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                    )}

                  {sidebarFilter === "Create Jobs" && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-2">Applicants</h3>
                      {jobApplications.filter(
                        (application: JobApplication) =>
                          application.jobId === selectedJob.jobId
                      ).length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                          No applicants yet
                        </p>
                      ) : (
                        jobApplications
                          .filter(
                            (application: JobApplication) =>
                              application.jobId === selectedJob.jobId
                          )
                          .map((application: JobApplication) => {
                            const applicant: Alumnus = alums.find(
                              (alumni: Alumnus) =>
                                alumni.alumniId === application.applicantId
                            );
                            return (
                              <div
                                key={application.jobApplicationId}
                                className="border rounded-lg p-4 mb-2"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    {applicant?.image ? (
                                      <Image
                                        src={applicant.image}
                                        alt={`${applicant.firstName} ${applicant.lastName}`}
                                        width={40}
                                        height={40}
                                        className="rounded-full"
                                      />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <User className="w-5 h-5" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-medium">
                                      {applicant?.firstName}{" "}
                                      {applicant?.lastName}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {applicant?.email}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      application.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : application.status === "accepted"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {application.status
                                      .charAt(0)
                                      .toUpperCase() +
                                      application.status.slice(1)}
                                  </span>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Applied on{" "}
                                    {formatDate(application.dateApplied)}
                                  </p>
                                </div>
                                <div className="mt-3 flex gap-2">
                                  {application.status === "pending" && (
                                    <>
                                      <button
                                        onClick={() => {
                                          // Add your accept logic here
                                          updateApplicationStatus(
                                            application.jobApplicationId,
                                            "accepted",
                                            applicant,
                                            selectedJob
                                          );
                                        }}
                                        className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors"
                                      >
                                        Accept
                                      </button>
                                      <button
                                        onClick={() => {
                                          // Add your reject logic here
                                          updateApplicationStatus(
                                            application.jobApplicationId,
                                            "rejected",
                                            applicant,
                                            selectedJob
                                          );
                                        }}
                                        className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition-colors"
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  <a
                                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${applicant?.email}&su=Job Application Update for ${selectedJob.position} at ${selectedJob.company}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 bg-[var(--primary-blue)] text-white rounded-md text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
                                  >
                                    <Mail className="w-4 h-4" />
                                    Email
                                  </a>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  )}
                  <JobApplicationModal
                    isOpen={applyModalOpen}
                    onClose={() => setApplyModalOpen(false)}
                    onSubmit={async () => {
                      addJobApplication(
                        {
                          jobApplicationId: crypto.randomUUID(),
                          jobId: selectedJob.jobId,
                          applicantId: user!.uid,
                          status: "pending",
                          dateApplied: new Date(),
                          jobTitle: selectedJob.position,
                          contactId: selectedJob.alumniId,
                        } as JobApplication,
                        selectedJob
                      );
                    }}
                    jobTitle={selectedJob.position}
                    companyName={selectedJob.company}
                  />
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
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <form
              onSubmit={handleSubmit}
              className="bg-white p-6 rounded-2xl border-0 border-gray shadow-lg w-11/12 max-w-3xl max-h-[100vh] overflow-y-auto"
            >
              <div className="bg-white  w-full  pb-3">
                <h2 className="text-2xl font-semibold">
                  Post a Job Opportunity
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-5 ">
                {/* Left Column ng form */}
                <div className="flex flex-col gap-4">
                  <div className="space-y-1">
                    <label htmlFor="name" className="text-sm flex items-center">
                      <Asterisk size={16} className="text-red-600" /> Job
                      Position
                    </label>
                    <input
                      type="text"
                      className="text-sm w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-blue)]"
                      placeholder="e.g. Software Engineer"
                      value={position}
                      required
                      maxLength={100}
                      onChange={(e) => setPosition(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1 ">
                    <label
                      htmlFor="name"
                      className="text-sm flex items-center "
                    >
                      <Asterisk size={16} className="text-red-600" /> Employment
                      Type
                    </label>
                    <DropdownMenu
                      open={employmentTypeOpen}
                      onOpenChange={setEmploymentTypeOpen}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className={`font-normal w-full justify-between border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-blue)] ${
                            employmentType ? "text-black " : "text-gray-500"
                          }`}
                        >
                          {employmentType || "Select Employment Type"}
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[300px] bg-white p-1 border border-gray-300 rounded shadow-md">
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

                  <div className="space-y-1">
                    <label htmlFor="name" className="text-sm flex items-center">
                      <Asterisk size={16} className="text-red-600" /> Job Type
                    </label>
                    <DropdownMenu
                      open={jobTypeOpen}
                      onOpenChange={setJobTypeOpen}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className={`font-normal w-full justify-between border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-blue)] ${
                            jobType ? "text-black " : "text-gray-500"
                          }`}
                        >
                          {jobType || "Select Job Type"}
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[300px] bg-white p-1 border border-gray-300 rounded shadow-md">
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

                  <div className="space-y-1">
                    <label htmlFor="name" className="text-sm flex items-center">
                      <Asterisk size={16} className="text-red-600" /> Job
                      Description
                    </label>
                    <textarea
                      placeholder="e.g., Outline the role, responsibilities, and key qualifications for this position."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="text-sm w-full p-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-blue)] resize-none"
                      style={{ height: "110px" }}
                      maxLength={2000}
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
                <div className="flex flex-col gap-4">
                  <div className="space-y-1">
                    <label htmlFor="name" className="text-sm flex items-center">
                      <Asterisk size={16} className="text-red-600" /> Company
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="text-sm w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-blue)]"
                      maxLength={200}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="name" className="text-sm flex items-center">
                      <Asterisk size={16} className="text-red-600" /> Location
                    </label>
                    <input
                      type="text"
                      placeholder="Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="text-sm w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-blue)]"
                      maxLength={200}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="name" className="text-sm flex items-center">
                      <Asterisk size={16} className="text-red-600" /> Experience
                      Level
                    </label>
                    <DropdownMenu
                      open={experienceLevelOpen}
                      onOpenChange={setExperienceLevelOpen}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className={`font-normal w-full justify-between border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-blue)] ${
                            experienceLevel ? "text-black " : "text-gray-500"
                          }`}
                        >
                          {experienceLevel || "Select Experience Level"}
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[300px] bg-white p-1 border border-gray-300 rounded shadow-md">
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

                  <div className="space-y-1">
                    <label htmlFor="name" className="text-sm flex items-center">
                      <Asterisk size={16} className="text-red-600" /> Salary
                      Range
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
                          const value = (e.target as HTMLInputElement).value;
                          if (!/^\d+(-\d+)?$/.test(value)) {
                            (e.target as HTMLInputElement).value = value
                              .replace(/[^0-9-]/g, "") // Remove non-digit and non-dash characters
                              .replace(/^-/g, "") // Remove a dash if it's the first character
                              .replace(/(-.*)-+/g, "$1"); // Remove any extra dashes after the first one
                          }
                        }}
                        pattern="^\d+(-\d+)?$" // Regex to allow numbers or a range like "10000-30000"
                        className="pl-8 p-1.5 text-sm w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-blue)]"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="name" className="text-sm flex items-center">
                      <Asterisk size={16} className="text-red-600" /> Required
                      Skills
                    </label>
                    <input
                      type="text"
                      value={requiredSkill.join(", ")}
                      placeholder="Required Skills (comma-separated)"
                      onChange={handleSkillChange}
                      className="text-sm w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--primary-blue)]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1 mt-3">
                <label htmlFor="name" className="text-sm flex items-center">
                  <Asterisk size={16} className="text-red-600" /> Company Logo
                </label>
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer">
                    <div className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary-blue)] transition-colors">
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
                    <Image
                      width={0}
                      height={0}
                      sizes="100vw"
                      priority
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
                    className="h-10 px-5 flex items-center justify-center rounded-full bg-[#FFFFFF] border border-gray-400 text-sm font-semibold text-gray-700 shadow-inner shadow-white/10 transition-all  hover:bg-red-700 hover:text-white hover:shadow-lg cursor-pointer"
                    onClick={() => {
                      setShowForm(false);
                      setPosition("");
                      setEmploymentType("");
                      setJobType("");
                      setJobDescription("");
                      setCompany("");
                      setLocation("");
                      setExperienceLevel("");
                      setSalaryRange("");
                      setJobImage(null);
                      setPreview(null);
                      setFileName("");
                    }}
                  >
                    Cancel
                  </button>
                </div>

                {/* Right side - Save as Draft and Submit buttons */}
                <div className="flex gap-2">
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
                        alert("Please fill in all required fields");
                        return;
                      }
                      try {
                        await handleSubmit(e);
                        toastSuccess("Job submitted successfully");
                        setShowForm(false);
                      } catch (error) {
                        toastError(
                          "There was an error submitting the job. Please try again."
                        );
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
