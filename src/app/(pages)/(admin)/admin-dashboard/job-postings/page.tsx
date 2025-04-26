"use client";

import { useState } from "react";
import { useJobOffer } from "@/context/JobOfferContext";
import { JobOffering } from "@/models/models";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <div className="bg-[#EAEAEA] flex flex-col h-full w-full p-6">
      <h1 className="text-2xl font-bold mb-6 text-left">Job Offers</h1>

      <div className="flex w-full">
      {/* Stats Sidebar kasi gusto ko eh ba8 ba!! */}
      <div className="w-64 bg-white shadow-md p-6 rounded-[10px] w-content h-max">
      <div className="space-y-4">
        <div className="bg-gray-200 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>

            <div className="bg-gray-200 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>

            <div className="bg-gray-200 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-2xl font-bold">{stats.accepted}</p>
            </div>

            <div className="bg-gray-200 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold">{stats.rejected}</p>
            </div>
          </div>
        </div>

    <div className="flex-1 pl-6">

      {/* Filter Tab Buttons */}
      <div className='flex flex-col gap-[10px] w-full mb-10'>
        <div className="bg-[#FFFFFF] rounded-[10px] flex justify-around">
          {["Accepted", "Pending", "Rejected"].map((status) => (
            <button 
              key={status}
              className="mr-2" 
              onClick={() => setActiveTab(status)}
            >
              <p className={`relative px-4 py-2 w-full transition-all ${activeTab === status ? 'font-semibold border-b-2 border-blue-500' : 'text-gray-600 group'}`}>
                <span>{status}</span>
                {activeTab !== status && (
                  <span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>
                )}
              </p>
            </button>
          ))}
        </div>
      </div>

      {isLoading && <div className="text-center py-6">Loading...</div>}

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {filterJobs(activeTab).map((job: JobOffering, index: number) => (
          <Card key={index} className="bg-white border-0 overflow-hidden relative flex flex-col">
            <div className="p-4 flex-1">
              <div className="flex items-start mb-4">
                <div className="h-16 w-16 bg-gray-200 rounded-md mr-4 flex-shrink-0"></div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{job.position}</h2>
                  <p className="text-gray-700">{job.company}</p>
                  <div className="text-gray-500 text-sm mt-1">
                  </div>
                </div>
                <div className="ml-2">
                  {job.status === "Pending" && <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">Pending</span>}
                  {job.status === "Accepted" && <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Accepted</span>}
                  {job.status === "Rejected" && <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded">Rejected</span>}
                </div>
              </div>
              
              <div className="text-gray-700 line-clamp-3 text-ellipsis overflow-hidden">
                <p className="line-clamp-3">{job.jobDescription}</p>
              </div>
              
              {activeTab === "Accepted" && (
                <Button className="absolute bottom-4 right-1 flex justify-end">
                  <button
                    onClick={() => handleDelete(job.jobId)}
                    className="px-4 py-2 bg-[#D42020] text-white rounded-md hover:bg-opacity-90"
                  >
                    Delete
                  </button>
                </Button>
              )}

              {activeTab === "Pending" && (
                <Button className="absolute bottom-4 right-1 flex">
                  <button 
                    onClick={() => handleView(job.jobId)}
                    className="px-4 py-2 bg-white text-[#0856BA] border border-[#0856BA] rounded-md hover:bg-gray-50">
                    View More
                  </button>
                  <button
                    onClick={() => handleReject(job.jobId)}
                    className="px-4 py-2 bg-[#D42020] text-white rounded-md hover:bg-opacity-90"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAccept(job.jobId)}
                    className="px-4 py-2 bg-[#0856BA] text-white rounded-md hover:bg-opacity-90"
                  >
                    Accept
                  </button>
                </Button>
              )}
            </div>
          </Card>
        ))}
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
    </div>
  );
}