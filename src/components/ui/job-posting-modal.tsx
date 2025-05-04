"use client"
import React from "react";
import { useState } from "react";
import { JobOffering } from "@/models/models"; // Assuming the JobOffering model exists
import { useJobOffer } from "@/context/JobOfferContext";
import { useAuth } from "@/context/AuthContext";
import { MapPin, DollarSign, Briefcase, Award, FileText, XIcon } from "lucide-react";


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
  const { getJobOfferByAlumni } = useJobOffer();
  const { user, alumInfo, loading } = useAuth();
  const { jobOffers, isLoading } = useJobOffer();

  const [selectedJob, setSelectedJob] = useState<JobOffering | null>(null);

  return (<div className="mx-50 my-15">
    <div className="flex w-full h-[500px] min-w-0">
      {/* Left: List */}
      <div
        className={`transition-all ease-in-out duration-500 overflow-auto ${
          selectedJob !== null ? 'w-1/2' : 'w-full'
        }`}
      >
        {jobOffers.filter((jobOffer:JobOffering) => jobOffer.alumniId == alumInfo?.alumniId).length > 0 ? (
          jobOffers.filter((jobOffer:JobOffering) => jobOffer.alumniId == alumInfo?.alumniId).map((jobOffer:JobOffering) => (
            <div key={jobOffer.jobId} onClick={() => setSelectedJob(jobOffer)} className=" bg-white shadow-md p-4 mb-4 cursor-pointer rounded-lg hover:bg-gray-50 transition-all duration-300 ease-in-out">
              <div className="flex items-center space-x-4">
                <div>
                  {jobOffer.image ? (
                    <img
                      src={jobOffer.image}
                      alt={`${jobOffer.company} logo`}
                      className="w-20 h-20 object-contain rounded-md border border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-xl font-semibold text-gray-500">
                      {jobOffer.company.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {jobOffer.position}
                  </h2>
                  <p className="text-gray-600">
                    {jobOffer.company}
                  </p>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-[#0856BA]" />
                    <span className="ml-1 font-semibold text-[#0856BA]">
                      {jobOffer.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col p-5 max-h-fit space-y-1 w-full justify-center items-center">
            <p className="text-gray-700">You haven't created any job posts yet.</p>
          </div>
        )}
      </div>

      {/* Right: Detail View */}
      <div
        className={`transition-all ease-in-out duration-500 overflow-auto  ${
          selectedJob !== null ? 'w-1/2 opacity-100 ml-4' : 'w-0 opacity-0'
        } bg-white h-full rounded-lg` }
      >
        {selectedJob !== null && (
          <div className="p-6">

            <div className="w-full space-y-4">
              <div className="flex justify-between">
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
                <XIcon className="text-gray-700 hover:text-red-500 cursor-pointer w-6 h-6" onClick={() => setSelectedJob(null)}/>
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
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default AlumniJobOffers;
