"use client";
import { useState } from "react";
import { useAnnouncement } from "@/context/AnnouncementContext";
import { Announcement } from "@/models/models";

function formatDate(timestamp: any) {
  if (!timestamp || !timestamp.seconds) return "Invalid Date";
  const date = new Date(timestamp.seconds * 1000);
  return date.toISOString().split("T")[0];
}

const FILTER_TAGS = ["Donation Update", "Achievements", "Upcoming Event"];

export default function Announcements() {
  const { announces, isLoading } = useAnnouncement();

  const [currentPage, setCurrentPage] = useState(1);
  const [latestFirst, setLatestFirst] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const itemsPerPage = 5;

  // Toggle filters on click
  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter) // Remove filter if already active
        : [...prev, filter] // Add filter if not active
    );
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Sort announcements by date
  let filteredAnnounces = [...announces].sort((a, b) => {
    const dateA = a.datePosted.seconds;
    const dateB = b.datePosted.seconds;
    return latestFirst ? dateB - dateA : dateA - dateB;
  });

  // Apply active filters (if any)
  if (activeFilters.length > 0) {
    filteredAnnounces = filteredAnnounces.filter((announcement) =>
      announcement.type.some((t: string) => activeFilters.includes(t))
    );
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredAnnounces.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAnnouncements = filteredAnnounces.slice(startIndex, endIndex);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">ANNOUNCEMENTS</h1>

      {/* Filter Tags */}
      <div className="flex gap-2 mb-4 justify-center">
        {FILTER_TAGS.map((tag) => (
          <button
            key={tag}
            className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${
              activeFilters.includes(tag)
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"
            }`}
            onClick={() => toggleFilter(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

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
          {currentAnnouncements.length === 0 ? (
            <p className="text-center text-gray-500">No announcements found.</p>
          ) : (
            currentAnnouncements.map((user: Announcement, index: number) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg shadow-sm"
              >
                <h1 className="text-xl font-semibold">{user.title}</h1>
                <h2 className="text-gray-600">{formatDate(user.datePosted)}</h2>
                <h2 className="text-sm text-gray-500">{user.description}</h2>
                <div className="flex gap-2 mt-2">
                  {user.type.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs font-semibold bg-gray-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
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
          )}
        </>
      )}
    </div>
  );
}
