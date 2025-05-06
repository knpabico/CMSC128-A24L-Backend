"use client";

import { useState, useRef, useEffect } from "react";
import { useJobOffer } from "@/context/JobOfferContext";
import { JobOffering } from "@/models/models";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Trash2,
  ThumbsDown,
  ThumbsUp,
  ChevronDown,
  Check,
  CirclePlus,
  Pencil,
  CircleX,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ModalInput from "@/components/ModalInputForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Users() {
  const {
    jobOffers,
    isLoading,
    handleAccept,
    handleReject,
    handleView,
    selectedJob,
    closeModal,
    handleDelete,
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
  } = useJobOffer();

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
  };

  const [viewingJob, setViewingJob] = useState(null);
  const [currentPage, setCurrentPage] = useState("list");
  const [activeTab, setActiveTab] = useState("Accepted");
  const tableRef = useRef(null);
  const [headerWidth, setHeaderWidth] = useState("100%");
  const [isSticky, setIsSticky] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employmentTypeOpen, setEmploymentTypeOpen] = useState(false);
  const [jobTypeOpen, setJobTypeOpen] = useState(false);
  const [experienceLevelOpen, setExperienceLevelOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  const filterJobs = (status: string) => {
    console.log("Filtering jobs with status:", status);
    const filtered = jobOffers.filter(
      (job: JobOffering) => job.status === status
    );
    console.log("Filtered jobs:", filtered);
    return filtered;
  };

  const tabs = ["Accepted", "Pending", "Rejected"];

  const stats = {
    pending: jobOffers.filter((job) => job.status === "Pending").length,
    accepted: jobOffers.filter((job) => job.status === "Accepted").length,
    rejected: jobOffers.filter((job) => job.status === "Rejected").length,
    total: jobOffers.length,
  };

  // INCORPORATED FROM SAMPLE PAGE FROM DAPHNE
  // Track scroll position and update header state
  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current) return;

      const tableRect = tableRef.current.getBoundingClientRect();

      if (tableRect.top <= 0 && !isSticky) {
        setIsSticky(true);
        setHeaderWidth(tableRect.width);
      } else if (tableRect.top > 0 && isSticky) {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Set initial width
    if (tableRef.current) {
      setHeaderWidth(tableRef.current.offsetWidth);
    }

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isSticky]);

  // New function to handle viewing job details
  const handleViewJob = (jobId) => {
    const job = jobOffers.find((job) => job.jobId === jobId);
    if (job) {
      setViewingJob(job);
      setCurrentPage("view");
    }
  };

  const goBackToList = () => {
    setCurrentPage("list");
    setViewingJob(null);
  };

  // Render view page for a job posting
  const renderViewPage = () => {
    if (!viewingJob) return null;

    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <div>Home</div>
          <div>
            <ChevronRight size={15} />
          </div>
          <div
            className="cursor-pointer hover:text-blue-600"
            onClick={goBackToList}
          >
            Manage Job Posting
          </div>
          <div>
            <ChevronRight size={15} />
          </div>
          <div className="font-bold text-[var(--primary-blue)]">
            View Job Posting
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-center justify-between">
            <div className="font-bold text-3xl">View Job Posting</div>
            <div className="flex items-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300">
              <Pencil size={18} /> Edit Job Posting
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
            <div className="flex flex-col gap-5">
              {/* Company Logo and Job Details */}
              <div className="flex items-start gap-4">
                {/* Company Logo */}
                <div className="mr-2">
                  {viewingJob.image ? (
                    <img
                      src={viewingJob.image || "/placeholder.svg"}
                      alt={`${viewingJob.company} logo`}
                      className="w-35 h-35 object-contain rounded-md border border-gray-200"
                    />
                  ) : (
                    <div className="w-35 h-35 bg-gray-100 rounded-md flex items-center justify-center text-xl font-semibold text-gray-500">
                      {viewingJob.company.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Job Position and Company Name */}
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-sm font-medium">Job Position</label>
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">{viewingJob.position}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Company Name</label>
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">{viewingJob.company}</div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Location</label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {viewingJob.location}
                </div>
              </div>

              {/* Employment Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Employment Type
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {viewingJob.employmentType}
                </div>
              </div>

              {/* Job Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Job Type</label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {viewingJob.jobType}
                </div>
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Experience Level
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {viewingJob.experienceLevel}
                </div>
              </div>

              {/* Salary Range */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Salary Range
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {viewingJob.salaryRange}
                </div>
              </div>

              {/* Required Skills */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Required Skills
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {viewingJob.requiredSkill?.join(", ")}
                </div>
              </div>

              {/* Job Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Job Description
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 min-h-[110px]">
                  {viewingJob.jobDescription}
                </div>
              </div>

              {/* Date Posted */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Date Posted</label>
                <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {viewingJob.datePosted?.toLocaleString?.() ||
                    new Date(viewingJob.datePosted).toLocaleString()}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Status</label>
                <div
                  className={`px-3 py-2 border border-gray-300 rounded-md ${
                    viewingJob.status === "Accepted"
                      ? "bg-green-100 text-green-800"
                      : viewingJob.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {viewingJob.status}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ibang page na si post a job
  const renderPostJobPage = () => {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <div>Home</div>
          <div>
            <ChevronRight size={15} />
          </div>
          <div className="cursor-pointer hover:text-blue-600" onClick={goBackToList}>
            Manage Job Posting
          </div>
          <div>
            <ChevronRight size={15} />
          </div>
          <div className="font-bold text-[var(--primary-blue)]">Post a Job</div>
        </div>

        <div className="w-full">
          <div className="flex items-center justify-between">
            <div className="font-bold text-3xl">Post a Job Opportunity</div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
                goBackToList(); // navigates back to the manage job postings page
              }}
            >
              <div className="grid grid-cols-2 gap-6 mt-1">
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
                    <DropdownMenu open={employmentTypeOpen} onOpenChange={setEmploymentTypeOpen}>
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
                              setEmploymentType(type)
                              setEmploymentTypeOpen(false)
                            }}
                          >
                            {type}
                            {employmentType === type && <Check className="ml-auto h-4 w-4" />}
                          </Button>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Job Type<span className="text-red-500">*</span>
                    </label>
                    <DropdownMenu open={jobTypeOpen} onOpenChange={setJobTypeOpen}>
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
                              setJobType(type)
                              setJobTypeOpen(false)
                            }}
                          >
                            {type}
                            {jobType === type && <Check className="ml-auto h-4 w-4" />}
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
                      style={{ height: "110px" }}
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
                    <DropdownMenu open={experienceLevelOpen} onOpenChange={setExperienceLevelOpen}>
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
                              setExperienceLevel(level)
                              setExperienceLevelOpen(false)
                            }}
                          >
                            {level}
                            {experienceLevel === level && <Check className="ml-auto h-4 w-4" />}
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
                      placeholder="Required Skills (comma-separated)"
                      onChange={handleSkillChange}
                      className="w-full p-1.5 border rounded placeholder:text-sm"
                      required
                    />
                  </div>
                  </div>
                  </div>

                  <hr className="my-2 border-t border-gray-300" />

                  <div className="mb-4 pt-2 pl-1">
                    <label className="block text-sm font-medium mb-1">
                      Company Logo<span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <label className="cursor-pointer">
                        <div className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                          Choose File
                        </div>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                      <span className="text-sm text-gray-500">{fileName || "No file chosen"}</span>
                    </div>

                    {preview && (
                      <div className="mt-3">
                        <img src={preview || "/placeholder.svg"} alt="Preview" className="h-20 object-contain" />
                      </div>
                    )}
                  </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={goBackToList}
                  className="h-10 px-5 flex items-center justify-center rounded-full bg-[#FFFFFF] border border-[#0856BA] text-sm font-semibold text-[#0856BA] shadow-inner shadow-white/10 transition-all duration-300 hover:bg-[#0856BA] hover:text-white hover:shadow-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 flex items-center justify-center rounded-full bg-[#0856BA] border border-[#0856BA] text-sm font-semibold text-white shadow-inner shadow-white/10 transition-all duration-300 hover:bg-[#063d8c] hover:shadow-lg"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Main content */}
      {currentPage === "list" ? (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <div>Home</div>
            <div>
              <ChevronRight size={15} />
            </div>
            <div>Manage Job Posting</div>
          </div>
          <div className="w-full">
            <div className="flex items-center justify-between">
              <div className="font-bold text-3xl">Manage Job Posting</div>
              <div
                className="bg-[var(--primary-blue)] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-blue-600 flex items-center gap-2"
                onClick={() => setCurrentPage("post")}
              >
                <CirclePlus size={18} />
                Post a Job
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {/* Tabs */}
            <div className="w-full flex gap-2">
              {tabs.map((tab) => (
                <div
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full flex flex-col items-center justify-end rounded-t-2xl overflow-hidden pt-0.4 cursor-pointer ${
                    activeTab === tab ? "bg-[var(--primary-blue)]" : "bg-white"
                  }`}
                >
                  <div
                    className={`w-full h-1 transition-colors ${
                      activeTab === tab
                        ? "bg-[var(--primary-blue)]"
                        : "bg-transparent"
                    }`}
                  ></div>
                  <div
                    className={`w-full py-3 flex items-center justify-center gap-1 rounded-t-2xl font-semibold text-base ${
                      activeTab === tab
                        ? "text-[var(--primary-blue)] bg-white"
                        : "text-blue-200 bg-white"
                    }`}
                  >
                    {tab}
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-[13px] text-white ${
                        activeTab === tab ? "bg-amber-400" : "bg-blue-200"
                      }`}
                    >
                      {tab === "Pending"
                        ? stats.pending
                        : tab === "Accepted"
                        ? stats.accepted
                        : stats.rejected}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
              <div
                className="rounded-xl overflow-hidden border border-gray-300 relative"
                ref={tableRef}
              >
                <div className="bg-blue-100 w-full flex gap-4 p-4 text-xs z-10 shadow-sm">
                  <div className="w-1/2 flex items-center justify-baseline font-semibold">
                    Job Posting Info
                  </div>
                  <div className="w-1/2 flex justify-end items-center">
                    <div className="w-1/6 flex items-center justify-center font-semibold">
                      Status
                    </div>
                    <div className="w-1/6 flex items-center justify-center font-semibold">
                      Actions
                    </div>
                    <div className="w-1/6 flex items-center justify-center"></div>
                  </div>
                </div>

                {/* Dynamic rows */}
                {filterJobs(activeTab).map((job, index) => (
                  <div
                    key={index}
                    className={`w-full flex gap-4 border-t border-gray-300 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50`}
                  >
                    <div
                      className="w-1/2 flex flex-col p-4 gap-1 cursor-pointer"
                      onClick={() => handleViewJob(job.jobId)}
                    >
                      <div className="text-base font-bold">{job.position}</div>
                      <div className="text-sm text-gray-600">{job.company}</div>
                      <div className="text-sm text-gray-500">
                        {job.employmentType} • {job.experienceLevel} •{" "}
                        {job.salaryRange}
                      </div>
                    </div>
                    <div className="w-1/2 flex items-center justify-end p-5">
                      <div className="w-1/6 flex items-center justify-center">
                        <div
                          className={`px-2 py-1 text-xs rounded ${
                            job.status === "Accepted"
                              ? "bg-green-100 text-green-800"
                              : job.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {job.status}
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <div className="w-1/6 flex items-center justify-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            onChange={() => {
                              // No functionality added here
                            }}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>

                      <div className="w-1/6 flex items-center justify-center">
                        <div
                          className="text-[var(--primary-blue)] hover:underline cursor-pointer"
                          onClick={() => handleViewJob(job.jobId)}
                        >
                          View Details
                        </div>
                      </div>
                      <div className="w-1/6 flex items-center justify-center">
                        {activeTab === "Pending" ? (
                          <div className="w-1/6 flex flex-col gap-2 items-center justify-center">
                            <button
                              onClick={() => handleReject(job.jobId)}
                              className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                            >
                              <ThumbsDown size={14} />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => handleAccept(job.jobId)}
                              className="text-green-500 hover:text-green-700 text-sm flex items-center gap-1"
                            >
                              <ThumbsUp size={14} />
                              <span>Accept</span>
                            </button>
                          </div>
                        ) : (
                          <Trash2
                            size={20}
                            className="text-gray-500 hover:text-red-500 cursor-pointer"
                            onClick={() => {
                              setJobToDelete(job); // Set the job to delete
                              setIsConfirmationOpen(true); // Open the confirmation dialog}
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : currentPage == "view" ? (
        renderViewPage()
      ) : (
        renderPostJobPage()
      )}

      {/* Confirmation Dialog */}
      {isConfirmationOpen && (
        <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
          <DialogContent className="w-96">
            <DialogHeader className="text-red-500 flex items-center gap-5">
              <CircleX className="size-15" />
              <DialogTitle className="text-md text-center">
                Are you sure you want to delete <br />{" "}
                <strong>{jobToDelete?.position}</strong>?
              </DialogTitle>
            </DialogHeader>
            <DialogFooter className="mt-5">
              <button
                className="text-sm text-white w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-red-700 bg-red-700  hover:bg-red-500 hover:cursor-pointer"
                onClick={() => {
                  if (jobToDelete) {
                    handleDelete(jobToDelete.jobId);
                    setIsConfirmationOpen(false);
                  }
                }}
              >
                Delete
              </button>
              <button
                className="text-sm text-[#0856BA] w-full px-1 py-[5px] rounded-full font-semibold text-center flex justify-center border-[#0856BA] border-2 hover:bg-gray-100"
                onClick={() => setIsConfirmationOpen(false)}
              >
                Cancel
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
