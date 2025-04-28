<<<<<<< HEAD
"use client";

import { useState } from "react";
import { useJobOffer } from "@/context/JobOfferContext";
import { JobOffering } from "@/models/models";

export default function Users() {
  const { jobOffers, isLoading, handleAccept, handleReject, handleView, selectedJob, closeModal, handleDelete} = useJobOffer();
  const [activeTab, setActiveTab] = useState("Accepted");

  const filterJobs = (status: string) => {
    return jobOffers.filter((job: JobOffering) => job.status === status);
  };

  return (
    <div>
      <h1>Job Offers</h1>

      <div className="flex gap-5 mb-5">
        {["Accepted", "Pending", "Rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`px-4 py-2 rounded-md ${
              activeTab === status ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {isLoading && <h1>Loading</h1>}

      {filterJobs(activeTab).map((job: JobOffering, index: number) => (
        <div key={index} className="flex justify-between p-1 border-b mb-4">
          <div> 
            <h2>{job.company}</h2>
            <h1>{job.employmentType}</h1>
            <h2>{job.experienceLevel}</h2>
            <h2>{job.position}</h2>
            <h2>{job.datePosted.toLocaleString()}</h2>
          </div>

          {activeTab === "Accepted" && (
            <button
              onClick={() => handleDelete(job.jobId)}
              className="px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Delete
            </button>
          )}

          {activeTab === "Pending" && (
            <div className="flex gap-3 mt-2">
              <button 
                onClick={() => handleView(job.jobId)}
                className="px-4 py-2 bg-green-500 text-white rounded-md">
                View
              </button>
              <button
                onClick={() => handleAccept(job.jobId)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(job.jobId)}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
              >
                Reject
              </button>
            </div>
          )}

          {selectedJob && (
            <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full">
              <div className="bg-white p-6 rounded-lg w-2/3">
                <h1 className="text-2xl font-bold mb-4">Job Details</h1>
                <p><strong>Company:</strong> {selectedJob.company}</p>
                <p><strong>Position:</strong> {selectedJob.position}</p>
                <p><strong>Employment Type:</strong> {selectedJob.employmentType}</p>
                <p><strong>Experience Level:</strong> {selectedJob.experienceLevel}</p>
                <p><strong>Salary Range:</strong> {selectedJob.salaryRange}</p>
                <p><strong>Skills Required:</strong> {selectedJob.requiredSkill.join(", ")}</p>
                <p><strong>Job Type:</strong> {selectedJob.jobType}</p>
                <p><strong>Description:</strong> {selectedJob.jobDescription}</p>
                <p><strong>Date Posted:</strong> {selectedJob.datePosted.toLocaleString()}</p>

                <button
                  onClick={closeModal}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </div>
      ))}
    </div>
  );
=======
"use client";

import { useState } from "react";
import { useJobOffer } from "@/context/JobOfferContext";
import { JobOffering } from "@/models/models";

export default function Users() {
  const { jobOffers, isLoading, handleAccept, handleReject, handleView, selectedJob, closeModal, handleDelete} = useJobOffer();
  const [activeTab, setActiveTab] = useState("Accepted");

  console.log("Job Offers:", jobOffers);

  const filterJobs = (status: string) => {
    return jobOffers.filter((job: JobOffering) => job.status === status);
  };

  return (
    <div>
      <h1>Job Offers</h1>

      <div className="flex gap-5 mb-5">
        {["Accepted", "Pending", "Rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`px-4 py-2 rounded-md ${
              activeTab === status ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {isLoading && <h1>Loading</h1>}

      {filterJobs(activeTab).map((job: JobOffering, index: number) => (
        <div key={index} className="flex justify-between p-1 border-b mb-4">
          <div> 
            <h2>{job.company}</h2>
            <h1>{job.employmentType}</h1>
            <h2>{job.experienceLevel}</h2>
            <h2>{job.position}</h2>
            <h2>{job.datePosted.toLocaleString()}</h2>
          </div>

          {activeTab === "Accepted" && (
            <button
              onClick={() => handleDelete(job.jobId)}
              className="px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Delete
            </button>
          )}

          {activeTab === "Pending" && (
            <div className="flex gap-3 mt-2">
              <button 
                onClick={() => handleView(job.jobId)}
                className="px-4 py-2 bg-green-500 text-white rounded-md">
                View
              </button>
              <button
                onClick={() => handleAccept(job.jobId)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(job.jobId)}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
              >
                Reject
              </button>
            </div>
          )}

          {selectedJob && (
            <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full">
              <div className="bg-white p-6 rounded-lg w-2/3">
                <h1 className="text-2xl font-bold mb-4">Job Details</h1>
                <p><strong>Company:</strong> {selectedJob.company}</p>
                <p><strong>Position:</strong> {selectedJob.position}</p>
                <p><strong>Employment Type:</strong> {selectedJob.employmentType}</p>
                <p><strong>Experience Level:</strong> {selectedJob.experienceLevel}</p>
                <p><strong>Salary Range:</strong> {selectedJob.salaryRange}</p>
                <p><strong>Skills Required:</strong> {selectedJob.requiredSkill.join(", ")}</p>
                <p><strong>Job Type:</strong> {selectedJob.jobType}</p>
                <p><strong>Description:</strong> {selectedJob.jobDescription}</p>
                <p><strong>Date Posted:</strong> {selectedJob.datePosted.toLocaleString()}</p>

                <button
                  onClick={closeModal}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md"
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </div>
      ))}
    </div>
  );
>>>>>>> origin/vinly-be-newsletter
}