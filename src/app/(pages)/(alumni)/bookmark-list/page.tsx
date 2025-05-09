"use client";

import { useState } from "react";
import { useBookmarks } from "@/context/BookmarkContext";
import BookmarkButton from "@/components/ui/bookmark-button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function BookmarksPage() {
  const { isLoading, entries, filteredBookmarks, sortedBookmarks, removeBookmark } = useBookmarks();
  const [filterType, setFilterType] = useState("all");
  const [sortOption, setSortOption] = useState("latest");
  const router=useRouter();
  

  if (isLoading) return <h1 className="text-xl font-semibold p-4">Loading bookmarks...</h1>;

  // Get filtered bookmarks
  const filtered = filteredBookmarks(filterType);
  
  // Get sorted bookmarks
  const displayedBookmarks = sortedBookmarks(filtered, sortOption);

  const getTypeDisplayText = (type: string) => {
    switch (type) {
      case "donation_drive":
        return "Donation Drive";
      case "announcement":
        return "Announcement";
      case "job_offering":
        return "Job Offering";
      case "event":
        return "Event";
      default:
        return "Unknown Type";
    }
  };

  const handleRemoveBookmark = async (bookmarkId: string) => {
    try {
      const result = await removeBookmark(bookmarkId);
      if (result.success) {
        toast.success("Bookmark removed");
      } else {
        toast.error(`Error: ${result.message}`);
      }
    } catch (error) {
      toast.error("Failed to remove bookmark");
      console.error("Error removing bookmark:", error);
    }
  };

  // Render type-specific details based on bookmark type
  const renderTypeSpecificDetails = (bookmark, entry) => {
    if (!entry) return null;

    switch (bookmark.type) {
      case "donation_drive":
        return (
          <>
            <h3 className="text-lg font-semibold pr-8">{entry.campaignName}</h3>
            <p className="text-gray-600 line-clamp-2 my-2">{entry.description}</p>
            {entry.totalAmount && (
              <div className="mt-2 font-medium">Total Amount: ${entry.totalAmount.toLocaleString()}</div>
            )}
            {entry.datePosted.toDate().toLocaleString() && (
              <p className="text-sm font-medium mt-1">Date Posted: {entry.datePosted.toDate().toLocaleString()}</p>
            )}
          </>
        );
      case "event":
        return (
          <>
            <h3 className="text-lg font-semibold pr-8">{entry.title}</h3>
            <p className="text-gray-600 line-clamp-2 my-2">{entry.description}</p>
            {entry.date && <p className="text-sm font-medium mt-1">Date: {entry.date}</p>}
            {entry.creatorName && <p className="text-sm text-gray-700 mt-1">Organizer: {entry.creatorName}</p>}
            {entry.rsvps && <p className="text-sm text-gray-700 mt-1">RSVPs: {entry.rsvps.length}</p>}
            {entry.datePosted.toDate().toLocaleString() && (
              <p className="text-sm font-medium mt-1">Date Posted: {entry.datePosted.toDate().toLocaleString()}</p>
            )}
          </>
        );
      case "job_offering":
        return (
          <>
            <h3 className="text-lg font-semibold pr-8">{entry.position}</h3>
            <p className="text-gray-600 line-clamp-2 my-2">{entry.jobDescription}</p>
            <div className="mt-2">
              {entry.company && <p className="text-sm font-medium mt-1">Company: {entry.company}</p>}
              {entry.salaryRange && <p className="text-sm text-gray-700 mt-1">Salary: {entry.salaryRange}</p>}
              {entry.employmentType && <p className="text-sm text-gray-700 mt-1">Type: {entry.employmentType}</p>}
              {entry.experienceLevel && <p className="text-sm text-gray-700 mt-1">Experience: {entry.experienceLevel}</p>}
              {entry.datePosted.toDate().toLocaleString() && (
                <p className="text-sm font-medium mt-1">Date Posted: {entry.datePosted.toDate().toLocaleString()}</p>
              )}
            </div>
          </>
        );
      case "announcement":
      case "newsletter":
        return (
          <>
            <h3 className="text-lg font-semibold pr-8">{entry.title}</h3>
            <p className="text-gray-600 line-clamp-2 my-2">{entry.description}</p>
            {entry.datePosted.toDate().toLocaleString() && (
              <p className="text-sm font-medium mt-1">Date Posted: {entry.datePosted.toDate().toLocaleString()}</p>
            )}
          </>
        );
      default:
        return <p className="text-gray-600 line-clamp-2 my-2">{entry.description || entry.content}</p>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Bookmarks</h1>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Filter</label>
          <select 
            className="p-2 border rounded-md"
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All</option>
            <option value="events">Events</option>
            <option value="donation_drive">Donation Drives</option>
            <option value="announcements">Announcements</option>
            <option value="job_offer">Job Offers</option>
          </select>
        </div>
        
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Sort By</label>
          <select 
            className="p-2 border rounded-md"
            value={sortOption} 
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>
      </div>

      {displayedBookmarks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No bookmarks match your filter.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedBookmarks.map((bookmark) => {
          const entry = entries[bookmark.entryId];
          
          return (
            <div key={bookmark.id} className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow relative">
              <div className="absolute top-2 right-2">
                <BookmarkButton 
                  entryId={bookmark.entryId} 
                  type={bookmark.type} 
                  size="lg"
                />
              </div>
              
              <div className="bg-gray-100 text-gray-600 text-sm rounded px-2 py-1 inline-block mb-2">
                {getTypeDisplayText(bookmark.type)}
              </div>
              
              {entry ? (
                <>
                  {renderTypeSpecificDetails(bookmark, entry)}
                </>
              ) : (
                <p>Loading entry details...</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}