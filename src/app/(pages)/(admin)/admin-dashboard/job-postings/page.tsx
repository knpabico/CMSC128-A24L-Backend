"use client";

import { useState } from "react";
import { useJobOffer } from "@/context/JobOfferContext";
import { JobOffering } from "@/models/models";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Trash2 } from "lucide-react";

export default function Users() {
  const { jobOffers, isLoading, handleAccept, handleReject, handleView, selectedJob, closeModal, handleDelete} = useJobOffer();
  const [activeTab, setActiveTab] = useState("Accepted");

  console.log("Job Offers:", jobOffers);

  const filterJobs = (status: string) => {
    return jobOffers.filter((job: JobOffering) => job.status === status);
  };

  const stats = {
    pending: jobOffers.filter(job => job.status === "Pending").length,
    accepted: jobOffers.filter(job => job.status === "Accepted").length,
    rejected: jobOffers.filter(job => job.status === "Rejected").length,
    total: jobOffers.length
  };

  // limit job description on admin side
  const truncateDescription = (text) => {
    // mga 150 characters lang ipapakita sa description
    const maxLength = 150;
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div>
          Home
        </div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div>
          Manage Job Offers
        </div>
      </div>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">
            Manage Job Offers
          </div>
          <div className="bg-[var(--primary-blue)] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-blue-600">
            + Create Job Offer
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Tabs */}
        <div className="w-full flex gap-2">
          {["Accepted", "Pending", "Rejected"].map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex flex-col items-center justify-end rounded-t-2xl overflow-hidden pt-0.4 cursor-pointer ${
                activeTab === tab ? "bg-[var(--primary-blue)]" : "bg-white"
              }`}
            >
              {/* Blue bar above active tab */}
              <div
                className={`w-full h-1 transition-colors ${
                  activeTab === tab ? "bg-[var(--primary-blue)]" : "bg-transparent"
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
                    activeTab === tab
                      ? "bg-amber-400"
                      : "bg-blue-200"
                  }`}
                >
                  {tab === "Pending" ? stats.pending : tab === "Accepted" ? stats.accepted : stats.rejected}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
          <div className="rounded-xl overflow-hidden border border-gray-300 relative">
            <div className="bg-blue-100 w-full flex gap-4 p-4 text-xs z-10 shadow-sm">
              <div className="w-1/2 flex items-center justify-baseline font-semibold">
                Job Offer Info
              </div>
              <div className="w-1/2 flex justify-end items-center">
                <div className="w-1/6 flex items-center justify-center font-semibold">Status</div>
                <div className="w-1/6 flex items-center justify-center font-semibold">Actions</div>
                <div className="w-1/6 flex items-center justify-center"></div>
              </div>
            </div>
            
            {filterJobs(activeTab).map((job, index) => (
              <div
                key={index}
                className={`w-full flex gap-4 border-t border-gray-300 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-blue-50`}
              >
                <div className="w-1/2 flex flex-col p-4 gap-1">
                  <div className="text-base font-bold">{job.position}</div>
                  <div className="text-sm text-gray-600">{job.company}</div>
                  <div className="text-sm text-gray-500">
                    {job.employmentType} • {job.experienceLevel} • {job.salaryRange}
                  </div>
                </div>
                <div className="w-1/2 flex items-center justify-end p-5">
                  <div className="w-1/6 flex items-center justify-center">
                    <div className={`px-2 py-1 text-xs rounded ${
                      job.status === "Accepted" ? "bg-green-100 text-green-800" : 
                      job.status === "Pending" ? "bg-yellow-100 text-yellow-800" : 
                      "bg-red-100 text-red-800"
                    }`}>
                      {job.status}
                    </div>
                  </div>

                  <div className="w-1/6 flex items-center justify-center">
                    <div 
                      className="text-[var(--primary-blue)] hover:underline cursor-pointer"
                      onClick={() => handleView(job.jobId)}
                    >View Details</div>
                  </div>
                  <div className="w-1/6 flex items-center justify-center">
                    {activeTab === "Pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(job.jobId)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleAccept(job.jobId)}
                          className="text-green-500 hover:text-green-700 text-sm"
                        >
                          Accept
                        </button>
                      </div>
                    ) : (
                      <Trash2 
                        size={20} 
                        className="text-gray-500 hover:text-red-500 cursor-pointer"
                        onClick={() => handleDelete(job.jobId)}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full">
          <div className="bg-white p-8 rounded-lg border-2 border-gray shadow-lg w-3/4 max-w-4xl">
            <h1 className="text-3xl mb-6 font-semibold border-b pb-4">Job Details</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <p><strong>Company:</strong> {selectedJob.company}</p>
              <p><strong>Position:</strong> {selectedJob.position}</p>
              <p><strong>Employment Type:</strong> {selectedJob.employmentType}</p>
              <p><strong>Experience Level:</strong> {selectedJob.experienceLevel}</p>
              <p><strong>Salary Range:</strong> {selectedJob.salaryRange}</p>
              <p><strong>Job Type:</strong> {selectedJob.jobType}</p>
              <p><strong>Date Posted:</strong> {selectedJob.datePosted.toLocaleString()}</p>
            </div>
            
            <div className="mb-4">
              <p><strong>Skills Required:</strong> {selectedJob.requiredSkill?.join(", ")}</p>
            </div>
            
            <div className="mb-6">
              <p><strong>Description:</strong></p>
              <p className="mt-2 text-gray-700">{selectedJob.jobDescription}</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}