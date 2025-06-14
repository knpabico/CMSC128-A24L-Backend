"use client";

import PostJobPage from "@/app/(pages)/(admin)/admin-dashboard/job-postings/post/page";
import Breadcrumb from "@/components/breadcrumb";
import JobApplicationModalAdmin from "@/components/JobApplicationModalAdmin";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toastError } from "@/components/ui/sonner";
import { useAlums } from "@/context/AlumContext";
import { useJobApplicationContext } from "@/context/JobApplicationContext";
import { useJobOffer } from "@/context/JobOfferContext";
import type { JobApplication, JobOffering } from "@/models/models";
import {
  ChevronRight,
  CirclePlus,
  CircleX,
  Pencil,
  CircleCheck,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

function formatDate(timestamp: any) {
  if (!timestamp || !timestamp.seconds) return "Invalid Date";
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function Users() {
  const router = useRouter();

  const {
    jobOffers,
    handleAccept,
    handleReject,
    handleDelete,
    handleEdit,
    updateStatus,
    handleEditDraft,
  } = useJobOffer();

  const {
    jobApplications,
    updateApplicationStatusAdmin,
  }: {
    jobApplications: JobApplication[];
    updateApplicationStatusAdmin: (
      jobId: string,
      newStatus: string
    ) => Promise<void>;
  } = useJobApplicationContext();
  const [openApplications, setOpenApplications] = useState(false);
  const { alums } = useAlums();
  const [searchTerm, setSearchTerm] = useState("");

  const [currentJobSelected, setCurrentJobSelected] =
    useState<JobOffering | null>(null);

  const [viewingJob, setViewingJob] = useState<JobOffering | null>(null);
  const [currentPage, setCurrentPage] = useState("list");
  const [activeTab, setActiveTab] = useState("Accepted");
  const tableRef = useRef<HTMLDivElement>(null);
  const [headerWidth, setHeaderWidth] = useState("100%");
  const [isSticky, setIsSticky] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<JobOffering | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedJob, setEditedJob] = useState<JobOffering | null>(null);

  const filterJobs = (status: string) => {
    const filteredJobs = jobOffers.filter((job: JobOffering) => {
      const matchesStatus =
        status === "Accepted"
          ? job.status === "Accepted" || job.status === "Closed"
          : status === "Draft"
          ? job.status === status && job.alumniId === "Admin"
          : job.status === status;
      const matchesSearch =
        job.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
    return filteredJobs;
  };

  const tabs = ["Accepted", "Pending", "Rejected", "Draft", "Applications"];

  const stats = {
    pending: jobOffers.filter(
      (job: { status: string }) => job.status === "Pending"
    ).length,
    accepted: jobOffers.filter(
      (job: { status: string }) =>
        job.status === "Accepted" || job.status === "Closed"
    ).length,
    rejected: jobOffers.filter(
      (job: { status: string }) => job.status === "Rejected"
    ).length,
    drafts: jobOffers.filter(
      (job: JobOffering) => job.status === "Draft" && job.alumniId === "Admin"
    ).length,
    applications: jobOffers.filter((job: JobOffering) => {
      return jobApplications.some(
        (application: JobApplication) =>
          application.jobId === job.jobId && application.contactId === "Admin"
      );
    }).length,
    total: jobOffers.length,
  };

  const filteredJobs: JobOffering[] = useMemo(() => {
    return jobOffers.filter((job: JobOffering) => {
      return jobApplications.some(
        (application: JobApplication) =>
          application.jobId === job.jobId && application.contactId === "Admin"
      );
    });
  }, [jobOffers, jobApplications]);

  // INCORPORATED FROM SAMPLE PAGE FROM DAPHNE
  // Track scroll position and update header state
  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current) return;

      const tableRect = tableRef.current.getBoundingClientRect();

      if (tableRect.top <= 0 && !isSticky) {
        setIsSticky(true);
        setHeaderWidth(tableRect.width.toString());
      } else if (tableRect.top > 0 && isSticky) {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Set initial width
    if (tableRef.current) {
      setHeaderWidth(tableRef.current.offsetWidth.toString());
    }

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isSticky]);

  // New function to handle viewing job details
  const handleViewJob = (jobId: string) => {
    const job = jobOffers.find((job: JobOffering) => job.jobId === jobId);
    if (job) {
      setViewingJob(job);
      setCurrentPage("view");
      setEditedJob(job);
    }
  };

  const goBackToList = () => {
    setViewingJob(null);
    router.push("/admin-dashboard/job-postings");
  };

  const breadcrumbItems = [
    { label: "Home", href: "/admin-dashboard" },
    { label: "Manage Job Posting", href: "#", active: true },
  ];

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
            className="cursor-pointer hover:text-[#0856BA]"
            onClick={() => {
              goBackToList();
              setCurrentPage("list");
            }}
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
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div className="font-bold text-3xl">View Job Posting</div>
            <div
              className="flex items-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Pencil size={18} />
              {isEditing ? "Cancel Edit" : "Edit Job Posting"}
            </div>
          </div>

          {/* Job Info Section */}
          <div className="flex flex-col gap-3 mt-6">
            <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
              <div className="flex flex-col gap-5">
                <div className="flex items-start gap-4">
                  <div className="mr-2">
                    {editedJob && editedJob.image ? (
                      <img
                        src={editedJob.image || "/placeholder.svg"}
                        alt={`${editedJob.company} logo`}
                        className="w-35 h-35 object-contain rounded-md border border-gray-200"
                      />
                    ) : (
                      <div className="w-35 h-35 bg-gray-100 rounded-md flex items-center justify-center text-xl font-semibold text-gray-500">
                        {editedJob?.company?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-sm font-medium">
                        Job Position
                      </label>
                      {isEditing ? (
                        <input
                          value={editedJob?.position || ""}
                          onChange={(e) => {
                            if (editedJob) {
                              setEditedJob({
                                ...editedJob,
                                position: e.target.value,
                              });
                            }
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md w-full"
                        />
                      ) : (
                        <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                          {editedJob?.position || "N/A"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                        Company Name
                      </label>
                      {isEditing ? (
                        <input
                          value={editedJob?.company || ""}
                          onChange={(e) => {
                            if (editedJob) {
                              setEditedJob({
                                ...editedJob,
                                company: e.target.value,
                              } as JobOffering);
                            }
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md w-full"
                        />
                      ) : (
                        <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                          {editedJob?.company || "N/A"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Other Fields */}
                {[
                  ["Location", editedJob?.location || "N/A"],
                  ["Employment Type", editedJob?.employmentType || "N/A"],
                  ["Job Type", editedJob?.jobType || "N/A"],
                  ["Experience Level", editedJob?.experienceLevel || "N/A"],
                  ["Salary Range", editedJob?.salaryRange || "N/A"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <label className="block text-sm font-medium">{label}</label>
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      {value}
                    </div>
                  </div>
                ))}

                {/* Required Skills */}
                <div>
                  <label className="block text-sm font-medium">
                    Required Skills
                  </label>
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {editedJob?.requiredSkill?.join(", ")}
                  </div>
                </div>

                {/* Job Description */}
                <div>
                  <label className="block text-sm font-medium">
                    Job Description
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editedJob?.jobDescription || ""}
                      onChange={(e) =>
                        setEditedJob({
                          ...editedJob,
                          jobDescription: e.target.value,
                        } as JobOffering)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-md w-full min-h-[100px]"
                    />
                  ) : (
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 min-h-[100px]">
                      {editedJob?.jobDescription || "N/A"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Date Posted
                  </label>
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {formatDate(viewingJob.datePosted)}
                  </div>
                </div>
              </div>

              {/* Revised buttons */}
              {isEditing && (
                <div className="bg-white rounded-2xl p-4 flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      goBackToList();
                      setCurrentPage("list");
                    }}
                    className="w-30 flex items-center justify-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 bg-[var(--primary-blue)] text-[var(--primary-white)] border-2 border-[var(--primary-blue)] px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--blue-600)]"
                    onClick={() => {
                      setIsEditing(false);
                      handleEdit(editedJob);
                      goBackToList();
                      setCurrentPage("list");
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <title>Manage Job Posting | ICS-ARMS</title>
      {/* Main content */}
      {currentPage === "list" ? (
        <div className="flex flex-col gap-5">
          <Breadcrumb items={breadcrumbItems} />
          <div className="w-full">
            <div className="flex items-center justify-between">
              <div className="font-bold text-3xl">Manage Job Posting</div>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search jobs..."
                  className="pl-5 h-10 w-64 flex items-center justify-center rounded-full bg-[#FFFFFF] border-2 border-[#0856BA] text-sm font-semibold text-[#0856BA] shadow-inner shadow-white/10 transition-all duration-300 focus:border-2 focus:border-[#0856BA] hover:shadow-lg focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div
                  className="bg-[var(--primary-blue)] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-[#063d8c] flex items-center gap-2"
                  onClick={() =>
                    router.push("/admin-dashboard/job-postings/post")
                  }
                >
                  + Create a Job Post
                </div>
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
                        : tab === "Rejected"
                        ? stats.rejected
                        : tab == "Applications"
                        ? stats.applications
                        : stats.drafts}
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
                {/* Sticky header */}
                <div
                  className={`bg-blue-100 w-full flex gap-4 p-4 text-xs z-10 shadow-sm ${
                    isSticky ? "fixed top-0" : ""
                  }`}
                  style={{ width: isSticky ? headerWidth : "100%" }}
                >
                  <div className="w-160 flex items-center pl-20 font-semibold">
                    Job Posting Info
                  </div>
                  {activeTab === "Accepted" && (
                    <div className="w-[1px] flex items-center justify-center font-semibold whitespace-nowrap">
                      Availability
                    </div>
                  )}
                  <div className="w-[170px] flex items-center justify-center font-semibold mr-13">
                    Status
                  </div>
                  <div className="w-[300px] flex items-center justify-center font-semibold">
                    Actions
                  </div>
                </div>

                {/* Spacer div to prevent content jump when header becomes fixed */}
                {isSticky && <div style={{ height: "56px" }}></div>}

                {/* Dynamic rows */}
                {activeTab === "Applications"
                  ? filteredJobs.map((job: JobOffering, index) => {
                      const applications: JobApplication[] =
                        jobApplications.filter(
                          (application: JobApplication) =>
                            application.jobId === job.jobId &&
                            application.contactId === "Admin"
                        );
                      return (
                        <div
                          key={index}
                          className={`w-full flex items-center border-t border-gray-300 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-50`}
                        >
                          {/* Company Logo */}
                          <div className="flex-shrink-0 p-4">
                            {job.image ? (
                              <Image
                                src={job.image || "/placeholder.svg"}
                                alt={`${job.company} logo`}
                                className="w-16 h-16 object-cover rounded"
                                width={0}
                                height={0}
                                sizes="100vw"
                                priority
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xl font-semibold text-gray-500">
                                {job.company.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          {/* Job Details */}
                          <div
                            className="flex-grow flex flex-col p-4 gap-1 cursor-pointer"
                            onClick={() => handleViewJob(job.jobId)}
                          >
                            <div className="text-base font-bold">
                              {job.position}
                            </div>
                            <div className="text-sm text-gray-600">
                              {job.company}
                            </div>
                            <div className="text-sm text-gray-500">
                              {job.employmentType ? (
                                <>
                                  {job.employmentType}
                                  {job.experienceLevel && (
                                    <> • {job.experienceLevel}</>
                                  )}
                                  {job.salaryRange && (
                                    <> • ₱{job.salaryRange}</>
                                  )}
                                </>
                              ) : (
                                <>
                                  {job.experienceLevel ? (
                                    <>
                                      {job.experienceLevel}
                                      {job.salaryRange && (
                                        <> • ₱{job.salaryRange}</>
                                      )}
                                    </>
                                  ) : job.salaryRange ? (
                                    `₱${job.salaryRange}`
                                  ) : (
                                    "This draft can't be published yet. Please complete all required fields."
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          {/* Actions Section */}
                          <div className="flex items-center gap-4 p-4">
                            {/* Toggle and Status*/}
                            <div className="flex items-center w-[220px]">
                              {/* Toggle Switch */}

                              {/* Status Badge */}
                              <div className="w-24 flex items-center justify-center">
                                <div
                                  className={`px-2 py-1 text-xs rounded whitespace-nowrap `}
                                >
                                  {applications.length} Applications
                                </div>
                              </div>
                            </div>

                            {/* View/Edit Details Button */}
                            <div className="w-28 flex items-center justify-center">
                              <button
                                className="text-[var(--primary-blue)] hover:underline whitespace-nowrap mr-10"
                                onClick={() => {
                                  setOpenApplications(true);
                                  setCurrentJobSelected(job);
                                }}
                              >
                                View Applications
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  : filterJobs(activeTab).map(
                      (job: JobOffering, index: number) => (
                        <div
                          key={index}
                          className={`w-full flex items-center border-t border-gray-300 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-50`}
                        >
                          {/* Company Logo */}
                          <div className="flex-shrink-0 p-4">
                            {job.image ? (
                              <img
                                src={job.image || "/placeholder.svg"}
                                alt={`${job.company} logo`}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xl font-semibold text-gray-500">
                                {job.company.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          {/* Job Details */}
                          <div
                            className="flex-grow flex flex-col p-4 gap-1 cursor-pointer"
                            onClick={() => handleViewJob(job.jobId)}
                          >
                            <div className="text-base font-bold">
                              {job.position}
                            </div>
                            <div className="text-sm text-gray-600">
                              {job.company}
                            </div>
                            <div className="text-sm text-gray-500">
                              {job.employmentType ? (
                                <>
                                  {job.employmentType}
                                  {job.experienceLevel && (
                                    <> • {job.experienceLevel}</>
                                  )}
                                  {job.salaryRange && (
                                    <> • ₱{job.salaryRange}</>
                                  )}
                                </>
                              ) : (
                                <>
                                  {job.experienceLevel ? (
                                    <>
                                      {job.experienceLevel}
                                      {job.salaryRange && (
                                        <> • ₱{job.salaryRange}</>
                                      )}
                                    </>
                                  ) : job.salaryRange ? (
                                    `₱${job.salaryRange}`
                                  ) : (
                                    "This draft can't be published yet. Please complete all required fields."
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Actions Section */}
                          <div className="flex items-center gap-4 p-4">
                            {/* Toggle and Status*/}
                            <div className="flex items-center w-[220px]">
                              {/* Toggle Switch */}
                              <div className="w-16 flex items-center justify-center">
                                {activeTab === "Accepted" && (
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
                                            `Failed to update job status: ${error}`
                                          );
                                        }
                                      }}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                  </label>
                                )}
                              </div>

                              {/* Status Badge */}
                              <div className="w-24 flex items-center justify-center">
                                <div
                                  className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
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
                            </div>

                            {/* View/Edit Details Button */}
                            <div className="w-28 flex items-center justify-center">
                              {activeTab === "Draft" ? (
                                <button
                                  className="text-[var(--primary-blue)] hover:underline whitespace-nowrap mr-8"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditDraft(job);
                                    setCurrentPage("post");
                                  }}
                                >
                                  Edit Draft
                                </button>
                              ) : (
                                <button
                                  className="text-[var(--primary-blue)] flex items-center justify-end gap-10 text-[14px] hover:underline whitespace-nowrap mr-10"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewJob(job.jobId);
                                  }}
                                >
                                  View Details
                                </button>
                              )}
                            </div>

                            <div className="w-[180px] flex items-center justify-center">
                              {activeTab === "Pending" ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAccept(job.jobId);
                                    }}
                                    className="px-3 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 cursor-pointer flex gap-1 items-center"
                                  >
                                    <CircleCheck size={18} />
                                    Accept
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReject(job.jobId);
                                    }}
                                    className="px-3 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 cursor-pointer flex gap-1 items-center mr-4"
                                  >
                                    <CircleX size={18} />
                                    Reject
                                  </button>
                                </div>
                              ) : activeTab === "Drafts" ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setJobToDelete(job);
                                      setIsConfirmationOpen(true);
                                    }}
                                    className="text-white bg-red-500 hover:bg-red-600 text-xs px-2 py-1 rounded flex items-center gap-1 whitespace-nowrap"
                                  >
                                    <Trash2 size={20} />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center w-full">
                                  <Trash2
                                    size={20}
                                    className="text-gray-500 hover:text-red-500 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setJobToDelete(job);
                                      setIsConfirmationOpen(true);
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    )}
              </div>
            </div>
          </div>
        </div>
      ) : currentPage === "view" ? (
        renderViewPage()
      ) : (
        <PostJobPage />
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
      {openApplications && (
        <JobApplicationModalAdmin
          jobs={jobOffers}
          isOpen={openApplications}
          jobId={currentJobSelected!.jobId}
          alums={alums}
          onClose={() => setOpenApplications(false)}
          applications={jobApplications}
          onStatusChange={async (id, newStatus) => {
            updateApplicationStatusAdmin(id, newStatus);
          }}
        />
      )}
    </>
  );
}
