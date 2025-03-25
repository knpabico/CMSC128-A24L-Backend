"use client";

import { useState } from "react";
import { useJobOffer } from "@/context/JobOfferContext";
import { JobOffering } from "@/models/models";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(timestamp: any) {
  if (!timestamp || !timestamp.seconds) return "Invalid Date";
  const date = new Date(timestamp.seconds * 1000);
  return date.toISOString().split("T")[0];
}

export default function JobOffers() {
  const { jobOffers, isLoading } = useJobOffer();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [latestFirst, setLatestFirst] = useState(true); // true = latest first, false = oldest first
  const jobsPerPage = 5;

  // Sort job offers by date
  const sortedJobs = [...jobOffers].sort((a, b) => {
    const dateA = a.datePosted.seconds;
    const dateB = b.datePosted.seconds;
    return latestFirst ? dateB - dateA : dateA - dateB;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = sortedJobs.slice(startIndex, endIndex);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Job Offers</h1>

      {/* Sorting Button */}
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-gray-300 rounded shadow hover:bg-gray-400"
          onClick={() => setLatestFirst(!latestFirst)}
        >
          Sort by: {latestFirst ? "Oldest First" : "Latest First"}
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentJobs.map((job: JobOffering, index: number) => (
              <Card key={index} className="p-4 border border-gray-200 rounded-lg shadow-sm">
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
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
