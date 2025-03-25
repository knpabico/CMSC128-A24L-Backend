"use client";
import { useState } from "react";
import { useAnnouncement } from "@/context/AnnouncementContext";
import { Announcement } from "@/models/models";

function formatDate(timestamp: any) {
  if (!timestamp || !timestamp.seconds) return "Invalid Date";
  const date = new Date(timestamp.seconds * 1000);
  return date.toISOString().split("T")[0];
}

export default function Announcements() {
  const { announces, isLoading } = useAnnouncement();

  const [currentPage, setCurrentPage] = useState(1);
  const [latestFirst, setLatestFirst] = useState(true);
  const itemsPerPage = 5;

  // Sort announcements by date
  const sortedAnnounces = [...announces].sort((a, b) => {
    const dateA = a.datePosted.seconds;
    const dateB = b.datePosted.seconds;
    return latestFirst ? dateB - dateA : dateA - dateB;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedAnnounces.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAnnouncements = sortedAnnounces.slice(startIndex, endIndex);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">ANNOUNCEMENTS</h1>

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
        <h1>Loading...</h1>
      ) : (
        <>
          {currentAnnouncements.map((user: Announcement, index: number) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg shadow-sm">
              <h1 className="text-xl font-semibold">{user.title}</h1>
              <h2 className="text-gray-600">{formatDate(user.datePosted)}</h2>
              <h2 className="text-sm text-gray-500">{user.description}</h2>
              <h2 className="text-xs text-gray-400">
                Announcement Type: {user.type.join(", ")}
              </h2>
            </div>
          ))}

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
 