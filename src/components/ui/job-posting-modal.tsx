"use client"
import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { JobOffering, JobApplication, Alumnus } from "@/models/models"; // Assuming the JobOffering model exists
import { useJobOffer } from "@/context/JobOfferContext";
import { useAuth } from "@/context/AuthContext";
import { MapPin, DollarSign, Briefcase, Award, FileText, XIcon, ChevronDown, Check, FilePenLine, Trash2, Pencil, Search, Send, Users, ChevronRight, Settings, ClipboardList, FileUser, User, Mail, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import ModalInput from "@/components/ModalInputForm";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import JobApplicationModal from "@/components/JobApplicationModal";
import { useJobApplicationContext } from "@/context/JobApplicationContext";
import { useAlums } from "@/context/AlumContext";

function formatDate(timestamp: any): string {
  if (!timestamp) return "Invalid Date";

  let date: Date;

  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else if (typeof timestamp.toDate === "function") {
    date = timestamp.toDate();
  } else {
    return "Invalid Date";
  }

  return date.toISOString().split("T")[0];
}

const AlumniJobOffers = () => {
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
    setJobImage,
    preview,
    fileName,
    handleImageChange,
    handleDelete,
    updateStatus,
    handleEditDraft,
    handleSaveDraft,
  } = useJobOffer();
  const { user, alumInfo, loading } = useAuth();
  const [selectedJob, setSelectedJob] = useState<JobOffering | null>(null);
  const [employmentTypeOpen, setEmploymentTypeOpen] = useState(false);
  const [jobTypeOpen, setJobTypeOpen] = useState(false);
  const [experienceLevelOpen, setExperienceLevelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarFilter, setSidebarFilter] = useState<string>("Job Postings");
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

  const [createdView, setCreatedView]= useState(true);
  const [applicationView, setApplicationView]= useState(false);
  const [draftView, setDraftView]= useState(false);

  const handleCreatedView = () => {
    setCreatedView(true);
    setApplicationView(false);
    setDraftView(false);
    setSelectedJob(null);
  }
  const handleApplicationView = () => {
    setCreatedView(false);
    setApplicationView(true);
    setDraftView(false);
    setSelectedJob(null);
  }
  const handleDraftView = () => {
    setCreatedView(false);
    setApplicationView(false);
    setDraftView(true);
    setSelectedJob(null);
  }

  useEffect(() => {
    if (jobOffers.filter((jobOffer:JobOffering) => jobOffer.alumniId == alumInfo?.alumniId).filter((jobOffer:JobOffering) => jobOffer.status !== "Draft").length > 0 && selectedJob) {
      setSelectedJob(null);
    }
    if (jobOffers.filter((jobOffer:JobOffering) => jobOffer.alumniId == alumInfo?.alumniId).filter((jobOffer:JobOffering) => jobOffer.status === "Draft").length > 0 && selectedJob) {
      setSelectedJob(null);
    }
  }, []);

  const [sortOrder, setSortOrder] = useState("latest");
  const [sortedJobs, setSortedJobs] = useState<JobOffering[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isApplicantsOpen, setIsApplicantsOpen] = useState(false)
  const { jobApplications, updateApplicationStatus } = useJobApplicationContext();
  const { alums } = useAlums();

  const [sortApp, setSortApp] = useState("latest");
  const [sortedApps, setSortedApps] = useState<JobApplication[]>([]);

  const [pending, setPending] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [rejected, setRejected] = useState(false);

  const [sortStatus, setSortStatus] = useState("all");

  const handlePending = () => {
    setPending(true);
    setAccepted(false);
    setRejected(false);
  }
  const handleAccepted = () => {
    setPending(false);
    setAccepted(true);
    setRejected(false);
  }
  const handleRejected = () => {
    setPending(false);
    setAccepted(false);
    setRejected(true);
  }

  const handleStatusChange = (e: { target: { value: any; }; }) => {
    const status = e.target.value;
    setSortStatus(status);
  };


  useEffect(() => {
    setIsSearching(searchQuery.trim().length > 0);
    
    const filteredJobs = jobOffers.filter((job:JobOffering) => {
      if (!searchQuery.trim()) return true;
      
      return (
        job.position?.toLowerCase().includes(searchQuery) || 
        job.company?.toLowerCase().includes(searchQuery)
      );
    });

    const sorted = [...filteredJobs].sort((a, b) => {
      const aTime = a.datePosted?.toMillis ? a.datePosted.toMillis() : new Date(a.datePosted).getTime() || 0;
      const bTime = b.datePosted?.toMillis ? b.datePosted.toMillis() : new Date(b.datePosted).getTime() || 0;
      
      return sortOrder === "latest" ? bTime - aTime : aTime - bTime;
    });
    setSortedJobs(sorted);

    const sortedApp = [...jobApplications].sort((a, b) => {
      const aTime = a.dateApplied?.toMillis ? a.dateApplied.toMillis() : new Date(a.dateApplied).getTime() || 0;
      const bTime = b.dateApplied?.toMillis ? b.dateApplied.toMillis() : new Date(b.dateApplied).getTime() || 0;
      
      return sortApp === "latest" ? bTime - aTime : aTime - bTime;
    });
    setSortedApps(sortedApp);
  }, [jobOffers, sortOrder, searchQuery, jobApplications, sortApp]);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value.toLowerCase());
  }

  console.log(sortStatus.charAt(0).toUpperCase() + sortStatus.slice(1))
  
  return (
  <div className="mx-50 mt-10 mb-15">
    <div> 
      {applicationView ? (
        <div className="filter-controls flex space-x-5 mb-5 justify-end items-center text-sm">
          <div className="flex space-x-5 justify-end items-center text-sm">
            <p className="mr-2">Status:</p>
            <div className="relative">
              <select 
                value={sortStatus} 
                onChange={handleStatusChange}
                className="sort-select p-2 pl-5 pr-10 rounded-full bg-white shadow-sm appearance-none w-full focus:outline-none"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex space-x-5 justify-end items-center text-sm">
            <p className="mr-2">Order:</p>
            <div className="relative">
              <select 
                id="sort-app" 
                value={sortApp} 
                onChange={(e) => setSortApp(e.target.value)}
                className="sort-select p-2 pl-5 pr-10 rounded-full bg-white shadow-sm appearance-none w-full focus:outline-none"
              >
                <option value="latest">Latest Applications First</option>
                <option value="oldest">Oldest Applications First</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="filter-controls flex space-x-5 mb-5 justify-end items-center text-sm">
          <div className="flex items-center p-2 pl-5 rounded-full bg-white shadow-sm appearance-none w-fit">
            <Search className="w-4 h-4 text-gray-400 mr-3"/>
            <input
              type="text"
              placeholder="Search jobs"
              value={searchQuery}
              onChange={handleSearchChange}
              className="focus:outline-none"
            />
          </div>

          {createdView && (
            <div className="flex space-x-5 justify-end items-center text-sm">
            <p className="mr-2">Status:</p>
            <div className="relative">
              <select 
                value={sortStatus} 
                onChange={handleStatusChange}
                className="sort-select p-2 pl-5 pr-10 rounded-full bg-white shadow-sm appearance-none w-full focus:outline-none"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
          )}

          <div className="flex space-x-5 justify-end items-center text-sm">
            <p className="mr-2">Order:</p>
            <div className="relative">
              <select 
                id="sort-order" 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                className="sort-select p-2 pl-5 pr-10 rounded-full bg-white shadow-sm appearance-none w-full focus:outline-none"
              >
                <option value="latest">Latest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
        
      )}
    </div>

    <div className="flex">
      <div className="mr-7 w-content h-max md:sticky md:top-1/7">
        <div className="bg-[#FFFFFF] flex flex-col p-7 gap-[10px] rounded-[10px]">
          <div className="bg-white">
            <ul className="flex flex-col p-1 gap-[10px] rounded-[10px] w-50 h-max">
              <li className='flex gap-5 items-center justify-start cursor-pointer' onClick={handleCreatedView}>
                <FileText/>
                <p className={`group w-max relative py-1 transition-all ${createdView ? 'font-semibold  border-b-3 border-blue-500' : 'text-gray-700 group'}`}>
                  <span>Created Job Posts</span>
                  {!createdView && (<span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>)}
                </p>
              </li>
              <li className='flex gap-5 items-center justify-start cursor-pointer' onClick={handleApplicationView}>
                <Send/>
                <p className={`group w-max relative py-1 transition-all ${applicationView ? 'font-semibold  border-b-3 border-blue-500' : 'text-gray-700 group'}`}>
                  <span>Your Applications</span>
                  {!applicationView && (<span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>)}
                </p>
              </li>
              <li className='flex gap-5 items-center justify-start cursor-pointer' onClick={handleDraftView}>
                <FilePenLine/>
                <p className={`group w-max relative py-1 transition-all ${draftView ? 'font-semibold  border-b-3 border-blue-500' : 'text-gray-700 group'}`}>
                  <span>Drafts</span>
                  {!draftView && (<span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>)}
                </p>
              </li>
            </ul>
          </div>
        </div>
        <Button
          className="flex gap-3 items-center w-full px-3 py-2 mt-5 bg-[#0856BA] text-white rounded-[10px] hover:bg-[#063d8c] transition-all cursor-pointer"
          onClick={() => {setShowForm(!showForm); document.body.style.overflow = 'hidden'}}
        >
          <Pencil className="w-5 h-5" />
          <p className="group w-max relative py-1 transition-all font-semibold">
            Post a Job</p>
        </Button>
      </div>

      {createdView && (
      <div className="flex items-start w-full min-w-0">
        {/* Left: List */}
        <div
          className={`transition-all ease-in-out duration-500 overflow-hidden self-start ${
            selectedJob !== null ? 'w-0' : 'w-full'
          }`}
        >
          {sortedJobs.filter((jobOffer:JobOffering) => jobOffer.alumniId == alumInfo?.alumniId)
          .filter((jobOffer:JobOffering) => sortStatus !== "all" ? (jobOffer.status === (sortStatus.charAt(0).toUpperCase() + sortStatus.slice(1))) : (jobOffer.status !== "Draft"))
          .length > 0 ? (
            sortedJobs.filter((jobOffer:JobOffering) => jobOffer.alumniId == alumInfo?.alumniId)
            .filter((jobOffer:JobOffering) => sortStatus !== "all" ? (jobOffer.status === (sortStatus.charAt(0).toUpperCase() + sortStatus.slice(1))) : (jobOffer.status !== "Draft"))
            .map((jobOffer:JobOffering) => (
              <div 
                key={jobOffer.jobId} 
                onClick={() => setSelectedJob(jobOffer)} 
                className={`bg-white shadow-md p-4 mb-4 cursor-pointer rounded-lg hover:bg-gray-50 transition-all duration-300 ease-in-out`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="flex-shrink-0">
                      {jobOffer.image ? (
                        <img
                          src={jobOffer.image}
                          alt={`${jobOffer.company} logo`}
                          className="w-16 h-16 object-contain rounded-md border border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-xl font-semibold text-gray-500">
                          {jobOffer.company.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold truncate">
                        {jobOffer.position}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {jobOffer.company}
                      </p>
                      <div className="flex items-center text-sm pt-1">
                        <MapPin className="w-3 h-3 flex-shrink-0 text-[#0856BA]" />
                        <span className="ml-1 text-[#0856BA] text-xs truncate">
                          {jobOffer.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-5 flex-shrink-0">
                    {/* Toggle switch */}
                    {jobOffer.status !== "Pending" && (
                      <div className="flex-shrink-0">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={jobOffer.status === "Accepted"}
                            onChange={async (e) => {
                              e.stopPropagation();
                              try {
                                if (jobOffer.status === "Accepted") {
                                  await updateStatus("Closed", jobOffer.jobId);
                                } else {
                                  await updateStatus("Accepted", jobOffer.jobId);
                                }
                              } catch (error) {
                                toast.error("Failed to update job status");
                              }
                            }}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                    )}
                    {jobOffer.status === "Pending" && (
                      <div className="w-11 h-6 opacity-0 flex-shrink-0">
                        {/* Placeholder to prevent layout shift */}
                      </div>
                    )}
                    
                    {/* Status label */}
                    <div className="flex-shrink-0">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          jobOffer.status === "Accepted"
                            ? "bg-green-100 text-green-700"
                            : jobOffer.status === "Rejected" || jobOffer.status === "Closed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {jobOffer.status.charAt(0).toUpperCase() + jobOffer.status.slice(1)}
                      </span>
                    </div>

                    {/* Trash button */}
                    <button
                      className="text-gray-500 hover:text-red-500 transition-colors flex-shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(jobOffer.jobId);
                        {(selectedJob && selectedJob.jobId) === jobOffer.jobId && setSelectedJob(null);}
                      }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col p-5 max-h-fit space-y-1 w-full justify-center items-center">
              {isSearching ? (
                <p className="text-gray-700">No matches.</p>
              ) : (
                sortStatus !== "all" ? (
                  <p className="text-gray-700">No {sortStatus} job posts yet.</p>
                ) : (
                  <p className="text-gray-700">No created job posts yet.</p>
                )
              )}
            </div>
          )}
        </div>

        {/* Right: Detail View */}
        <div
          className={`transition-all ease-in-out duration-500 self-start ${
            selectedJob !== null ? 'w-full opacity-100' : 'w-0 opacity-0'
          } bg-white rounded-lg` }
        >
          {selectedJob !== null && (
            <div className="p-5">
              <div className="flex justify-between mb-7">
                <div className="flex items-center">
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
                    <p className="text-xl font-bold">
                      {selectedJob.position}
                    </p>
                    <p className="text-gray-600">
                      {selectedJob.company}
                    </p>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-[#0856BA] mr-2" />
                      <span className="text-[#0856BA]">
                        {selectedJob.location}
                      </span>
                    </div>
                  </div>
                </div>
                <XIcon className="text-gray-700 hover:text-red-500 cursor-pointer w-6 h-6" onClick={() => setSelectedJob(null)}/>
              </div>

              <div className="space-y-2">
                <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen} className="">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      className={`text-gray-800 flex w-full items-center justify-start gap-2 cursor-pointer hover:bg-gray-100 transition-all duration-300 ease-in-out ${
                        isDetailsOpen ? "bg-gray-100 shadow-sm" : ""
                      }`}
                      onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                    >
                      <div className="flex items-center justify-center">
                        {isDetailsOpen ? 
                          <ChevronDown className="w-5 h-5 min-w-5 min-h-5" /> : 
                          <ChevronRight className="w-5 h-5 min-w-5 min-h-5" />
                        }
                      </div>
                      <ClipboardList className="w-5 h-5 min-w-5 min-h-5" />
                      <span className="text-base">Job Details</span>
                    </Button>
                  </div>
                  <CollapsibleContent>
                    <div className="w-full space-y-4 bg-gray-50 p-5 mb-8 rounded-lg rounded-t-none">
              
                      <div className="border border-[#0856BA] p-3 rounded-lg mb-4 space-y-2">
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
                        <div className="pl-3">
                          {selectedJob.requiredSkill &&
                            selectedJob.requiredSkill.map((skill) => (
                              <ul
                                key={skill}
                                className="max-w-md space-y-1 text-gray-500 list-inside dark:text-gray-500"
                              >
                                <li className="flex items-center text-sm">
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
                  </CollapsibleContent>
                </Collapsible>

                {/* Settings Option */}
                <Collapsible open={isApplicantsOpen} onOpenChange={setIsApplicantsOpen}>
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      className={`text-gray-800 flex w-full items-center justify-start gap-2 cursor-pointer hover:bg-gray-100 transition-all duration-300 ease-in-out ${
                        isApplicantsOpen ? "bg-gray-100 shadow-sm" : ""
                      }`}
                      onClick={() => setIsApplicantsOpen(!isApplicantsOpen)}
                    >
                      <div className="flex items-center justify-center">
                        {isApplicantsOpen ? 
                          <ChevronDown className="w-5 h-5 min-w-5 min-h-5" /> : 
                          <ChevronRight className="w-5 h-5 min-w-5 min-h-5" />
                        }
                      </div>
                      <FileUser className="w-5 h-5 min-w-5 min-h-5" />
                      <span className="text-base">Applications</span>
                    </Button>
                  </div>
                  <CollapsibleContent>
                    <div className="w-full space-y-4 bg-gray-50 p-5 rounded-lg rounded-t-none">
                      <div className="flex justify-between items-center">
                        <div className="space-x-2">
                          <Button className={`cursor-pointer ${pending ? `bg-amber-200` : `text-gray-500 font-light border border-gray-200`}`} onClick={handlePending}>Pending</Button>
                          <Button className={`cursor-pointer ${accepted ? `bg-green-200` : `text-gray-500 font-light border border-gray-200`}`} onClick={handleAccepted}>Accepted</Button>
                          <Button className={`cursor-pointer ${rejected ? `bg-red-200` : `text-gray-500 font-light border border-gray-200`}`} onClick={handleRejected}>Rejected</Button>
                        </div>
                        <div className="filter-controls flex space-x-3 justify-end items-center text-sm">
                          <label htmlFor="sort-app" className="mr-2 text-xs">Order:</label>
                          <div className="relative">
                            <select 
                              id="sort-app" 
                              value={sortApp} 
                              onChange={(e) => setSortApp(e.target.value)}
                              className="sort-select p-2 pl-4 pr-8 rounded-full bg-white shadow-sm appearance-none w-full focus:outline-none text-xs"
                            >
                              <option value="latest">Latest First</option>
                              <option value="oldest">Oldest First</option>
                            </select>

                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {pending && (
                        sortedApps.filter((application: JobApplication) => application.jobId === selectedJob.jobId)
                          .filter((application: JobApplication) => application.status === "pending"
                        ).length === 0 ? (
                          <p className="text-gray-500 text-center py-4">
                            No pending applications.
                          </p>
                        ) : (
                          sortedApps
                            .filter(
                              (application: JobApplication) =>
                                application.jobId === selectedJob.jobId
                            )
                            .filter((application: JobApplication) => application.status === "pending")
                            .map((application: JobApplication) => {
                              const applicant: Alumnus = alums.find(
                                (alumni: Alumnus) =>
                                  alumni.alumniId === application.applicantId
                              );
                              return (
                                <div
                                  key={application.jobApplicationId}
                                  className="rounded-lg p-4 bg-white border border-gray-100 space-y-4"
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        {applicant?.image ? (
                                          <img
                                            src={applicant.image}
                                            alt={`${applicant.firstName} ${applicant.lastName}`}
                                            width={40}
                                            height={40}
                                            className="rounded-full object-cover object-center w-full h-full"
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
                                    <div className="flex gap-2 items-center">
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
                                            className="cursor-pointer flex gap-1 items-center px-2 py-1 bg-green-500 text-white rounded-md text-xs hover:bg-green-600 transition-colors"
                                          >
                                            <CheckIcon className="w-4 h-4"/>
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
                                            className="cursor-pointer flex gap-1 items-center px-2 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600 transition-colors"
                                          >
                                            <XIcon className="w-4 h-4"/>
                                            Reject
                                          </button>
                                        </>
                                      )}
                                      <a
                                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${applicant?.email}&su=Job Application Update for ${selectedJob.position} at ${selectedJob.company}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 transition-colors flex items-center gap-1"
                                      >
                                        <Mail className="w-4 h-4" />
                                        Email
                                      </a>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Applied on{" "}
                                    {formatDate(application.dateApplied)}
                                  </p>
                                </div>
                              );
                            })
                        )
                      )}

                      {accepted && (
                        sortedApps.filter((application: JobApplication) => application.jobId === selectedJob.jobId)
                          .filter((application: JobApplication) => application.status === "accepted"
                        ).length === 0 ? (
                          <p className="text-gray-500 text-center py-4">
                            No accepted applications.
                          </p>
                        ) : (
                          sortedApps
                            .filter(
                              (application: JobApplication) =>
                                application.jobId === selectedJob.jobId
                            )
                            .filter((application: JobApplication) => application.status === "accepted")
                            .map((application: JobApplication) => {
                              const applicant: Alumnus = alums.find(
                                (alumni: Alumnus) =>
                                  alumni.alumniId === application.applicantId
                              );
                              return (
                                <div
                                  key={application.jobApplicationId}
                                  className="rounded-lg p-4 bg-white border border-gray-100 space-y-4"
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        {applicant?.image ? (
                                          <img
                                            src={applicant.image}
                                            alt={`${applicant.firstName} ${applicant.lastName}`}
                                            width={40}
                                            height={40}
                                            className="rounded-full object-cover object-center w-full h-full"
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
                                    <div className="flex gap-2 items-center">
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
                                            className="cursor-pointer flex gap-1 items-center px-2 py-1 bg-green-500 text-white rounded-md text-xs hover:bg-green-600 transition-colors"
                                          >
                                            <CheckIcon className="w-4 h-4"/>
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
                                            className="cursor-pointer flex gap-1 items-center px-2 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600 transition-colors"
                                          >
                                            <XIcon className="w-4 h-4"/>
                                            Reject
                                          </button>
                                        </>
                                      )}
                                      <a
                                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${applicant?.email}&su=Job Application Update for ${selectedJob.position} at ${selectedJob.company}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 transition-colors flex items-center gap-1"
                                      >
                                        <Mail className="w-4 h-4" />
                                        Email
                                      </a>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Applied on{" "}
                                    {formatDate(application.dateApplied)}
                                  </p>
                                </div>
                              );
                            })
                        )
                      )}

                      {rejected && (
                        sortedApps.filter((application: JobApplication) => application.jobId === selectedJob.jobId)
                          .filter((application: JobApplication) => application.status === "rejected"
                        ).length === 0 ? (
                          <p className="text-gray-500 text-center py-4">
                            No rejected applications.
                          </p>
                        ) : (
                          sortedApps
                            .filter(
                              (application: JobApplication) =>
                                application.jobId === selectedJob.jobId
                            )
                            .filter((application: JobApplication) => application.status === "rejected")
                            .map((application: JobApplication) => {
                              const applicant: Alumnus = alums.find(
                                (alumni: Alumnus) =>
                                  alumni.alumniId === application.applicantId
                              );
                              return (
                                <div
                                  key={application.jobApplicationId}
                                  className="rounded-lg p-4 bg-white border border-gray-100 space-y-4"
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        {applicant?.image ? (
                                          <img
                                            src={applicant.image}
                                            alt={`${applicant.firstName} ${applicant.lastName}`}
                                            width={40}
                                            height={40}
                                            className="rounded-full object-cover object-center w-full h-full"
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
                                    <div className="flex gap-2 items-center">
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
                                            className="cursor-pointer flex gap-1 items-center px-2 py-1 bg-green-500 text-white rounded-md text-xs hover:bg-green-600 transition-colors"
                                          >
                                            <CheckIcon className="w-4 h-4"/>
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
                                            className="cursor-pointer flex gap-1 items-center px-2 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600 transition-colors"
                                          >
                                            <XIcon className="w-4 h-4"/>
                                            Reject
                                          </button>
                                        </>
                                      )}
                                      <a
                                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${applicant?.email}&su=Job Application Update for ${selectedJob.position} at ${selectedJob.company}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600 transition-colors flex items-center gap-1"
                                      >
                                        <Mail className="w-4 h-4" />
                                        Email
                                      </a>
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-400 mt-1">
                                    Applied on{" "}
                                    {formatDate(application.dateApplied)}
                                  </p>
                                </div>
                              );
                            })
                        )
                      )}
                      
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
              


            </div>
          )}
        </div>
      </div>)}

      {applicationView && (
      <div className="flex items-start w-full min-w-0">
        {/* Left: List */}
        <div
          className={`transition-all ease-in-out duration-500 overflow-hidden self-start ${
            selectedJob !== null ? 'w-1/2' : 'w-full'
          }`}
        >
          {sortedApps.filter(
                  (offer: JobApplication) =>
                    sortStatus !== "all" ? (offer.applicantId === user!.uid && offer.status === sortStatus) : (offer.applicantId === user!.uid)
                ).length === 0 ? (
            <div className="flex flex-col p-5 max-h-fit space-y-1 w-full justify-center items-center">
              <p className="text-gray-700">No {sortStatus} applications yet.</p>
            </div>
          ) : (
            <div>
              {sortedApps.filter((offer: JobApplication) => 
                sortStatus !== "all" ? (offer.applicantId === user!.uid && offer.status === sortStatus) : (offer.applicantId === user!.uid))
                .map((jobOffer: JobApplication, index: number) => {
                  const job = jobOffers.find(
                    (job: JobOffering) => job.jobId === jobOffer.jobId
                  );
                  if (!job) return null;
                  return (
                    <div
                      key={index}
                      className={`bg-white shadow-md p-4 mb-4 cursor-pointer rounded-lg hover:bg-gray-50 transition-all duration-300 ease-in-out ${
                        selectedJob?.jobId === job.jobId
                          ? "border-blue-500"
                          : "border-gray-200"
                      }`}
                      onClick={() => setSelectedJob(job)}
                    >
                      <div className="flex justify-between">
                        {/* Left side - Job details */}
                        <div className="flex items-center space-x-4 min-w-0">
                          <div className="flex-shrink-0">
                            {job.image ? (
                              <img
                                width={0}
                                height={0}
                                sizes="100vw"
                                src={job.image || "/placeholder.svg"}
                                alt={`${job.company} logo`}
                                className="w-16 h-16 object-contain rounded-md border border-gray-200"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                                {job.company?.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          {!job.company || !job.location ? (
                            <div>
                              <h2 className="font-semibold text-md">
                                {job.position}
                              </h2>
                              <p className="text-sm text-gray-500">
                                Job Details not available
                              </p>
                            </div>
                          ) : (
                            <div className="min-w-0">
                              <p className="font-bold truncate">
                                {job.position}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {job.company}
                              </p>
                              <div className="flex justify-between">
                                <div className="flex items-center text-sm pt-1">
                                  <MapPin className="w-3 h-3 flex-shrink-0 text-[#0856BA]" />
                                  <span className="ml-1 text-[#0856BA] text-xs truncate">
                                    {job.location}
                                  </span>
                                </div>

                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right side */}
                        <div className="flex items-center justify-between space-x-8">
                          <p className="text-xs text-gray-400">
                            Applied on{" "}
                            {formatDate(sortedApps.find((offer: JobApplication) => (offer.applicantId === user!.uid) && (offer.jobId === jobOffer.jobId))?.dateApplied)}
                          </p>
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
          )}
        </div>

        {/* Right: Detail View */}
        <div
          className={`transition-all ease-in-out duration-500 overflow-auto self-start ${
            selectedJob !== null ? 'w-1/2 opacity-100 ml-4' : 'w-0 opacity-0'
          } bg-white rounded-lg` }
        >
          {selectedJob !== null && (
            <div className="p-6">

              <div className="w-full space-y-4">
                <div className="flex justify-between">
                  <div className="flex items-center">
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
                      <p className="text-xl font-bold">
                        {selectedJob.position}
                      </p>
                      <p className="text-gray-600">
                        {selectedJob.company}
                      </p>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-[#0856BA] mr-2" />
                        <span className="text-[#0856BA]">
                          {selectedJob.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <XIcon className="text-gray-700 hover:text-red-500 cursor-pointer w-6 h-6" onClick={() => setSelectedJob(null)}/>
                </div>
                
                <div className="border border-[#0856BA] p-3 rounded-lg mb-4 space-y-2">
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
            </div>
          )}
        </div>
      </div>

        
      )}

      {draftView && (
      <div className="flex items-start w-full min-w-0">
        {/* Left: List */}
        <div
          className={`transition-all ease-in-out duration-500 overflow-hidden self-start ${
            selectedJob !== null ? 'w-1/2' : 'w-full'
          }`}
        >
          {sortedJobs.filter((jobOffer:JobOffering) => jobOffer.alumniId == alumInfo?.alumniId).filter((jobOffer:JobOffering) => jobOffer.status === "Draft").length > 0 ? (
            sortedJobs.filter((jobOffer:JobOffering) => jobOffer.alumniId == alumInfo?.alumniId).filter((jobOffer:JobOffering) => jobOffer.status === "Draft").map((jobOffer:JobOffering) => (
              <div 
                key={jobOffer.jobId} 
                onClick={() => setSelectedJob(jobOffer)} 
                className={`bg-white shadow-md p-4 mb-4 cursor-pointer rounded-lg hover:bg-gray-50 transition-all duration-300 ease-in-out`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="flex-shrink-0">
                      {jobOffer.image ? (
                        <img
                          src={jobOffer.image}
                          alt={`${jobOffer.company} logo`}
                          className="w-16 h-16 object-contain rounded-md border border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-xl font-semibold text-gray-500">
                          {jobOffer.company.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold truncate">
                        {jobOffer.position}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {jobOffer.company}
                      </p>
                      <div className="flex items-center text-sm pt-1">
                        <MapPin className="w-3 h-3 flex-shrink-0 text-[#0856BA]" />
                        <span className="ml-1 text-[#0856BA] text-xs truncate">
                          {jobOffer.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right side */}
                  <div className="flex space-x-5 flex-shrink-0">
                    {/* Draft label */}
                    <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      Draft
                    </span>

                    {/* Edit button */}
                    <button
                      className="text-gray-500 hover:text-blue-500 transition-colors"
                      onClick={(e) => {
                        handleEditDraft(jobOffer);
                        setShowForm(true);
                      }}
                    >
                      <Pencil className="w-5 h-5" />
                    </button>

                    {/* Delete button */}
                    <button
                      className="text-gray-500 hover:text-red-500 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(jobOffer.jobId);
                        {(selectedJob && selectedJob.jobId) === jobOffer.jobId && setSelectedJob(null);}
                      }}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col p-5 max-h-fit space-y-1 w-full justify-center items-center">
              {isSearching ? (
                <p className="text-gray-700">No matches.</p>
              ) : (
                <p className="text-gray-700">No drafts yet.</p>
              )}
            </div>
          )}
        </div>

        {/* Right: Detail View */}
        <div
          className={`transition-all ease-in-out duration-500 overflow-auto self-start ${
            selectedJob !== null ? 'w-1/2 opacity-100 ml-4' : 'w-0 opacity-0'
          } bg-white rounded-lg` }
        >
          {selectedJob !== null && (
            <div className="p-6">

              <div className="w-full space-y-4">
                <div className="flex justify-between">
                  <div className="flex items-center">
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
                      <p className="text-xl font-bold">
                        {selectedJob.position}
                      </p>
                      <p className="text-gray-600">
                        {selectedJob.company}
                      </p>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-[#0856BA] mr-2" />
                        <span className="text-[#0856BA]">
                          {selectedJob.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <XIcon className="text-gray-700 hover:text-red-500 cursor-pointer w-6 h-6" onClick={() => setSelectedJob(null)}/>
                </div>
                
                <div className="border border-[#0856BA] p-3 rounded-lg mb-4 space-y-2">
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
            </div>
          )}
        </div>
      </div>)}

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-lg border-0 border-gray shadow-lg w-11/12 max-w-3xl max-h-[90vh] overflow-auto"
          >
            <div className="bg-white z-30 w-full flex justify-between items-start">
              <h2 className="text-2xl font-semibold">
                Post a Job Opportunity
              </h2>
              <button
                type="button"
                onClick={() => {setShowForm(false); document.body.style.overflow = 'auto'}}
              >
                <XIcon className="cursor-pointer hover:text-red-500"/>
              </button>
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
                      placeholder="e.g. 10000 - 30000"
                      value={salaryRange}
                      onChange={(e) => setSalaryRange(e.target.value)}
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
                    placeholder="Required Skills (comma-separated)"
                    onChange={handleSkillChange}
                    className="w-full p-1.5 border rounded placeholder:text-sm"
                    required
                  />
                </div>

                <div className="mb-4">
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
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="h-10 px-5 flex items-center justify-center rounded-full bg-[#FFFFFF] border border-[#0856BA] text-sm font-semibold text-[#0856BA] shadow-inner shadow-white/10 transition-all duration-300 hover:bg-[#0856BA] hover:text-white hover:shadow-lg"
                onClick={async (e) => {
                  try {
                    // Save draft - this function needs to be implemented in JobOfferContext
                    await handleSaveDraft(e);
                    
                    document.body.style.overflow = 'auto'
                    setShowForm(false);
                  } catch (error) {
                    
                    document.body.style.overflow = 'auto'
                    console.error("Error saving draft:", error);
                  }
                }}
              >
                Save as Draft
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="h-10 px-5 flex items-center justify-center rounded-full bg-[#0856BA] border border-[#0856BA] text-sm font-semibold text-white shadow-inner shadow-white/10 transition-all duration-300 hover:bg-[#063d8c] hover:shadow-lg"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  </div>
  );
};

export default AlumniJobOffers;
