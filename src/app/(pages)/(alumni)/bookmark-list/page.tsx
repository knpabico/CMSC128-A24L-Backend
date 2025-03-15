"use client";

import { useBookmarks } from "@/context/BookmarkContext";
import { Bookmark } from "@/models/models";

export default function BookmarksPage() {
  const { bookmarks, entries } = useBookmarks();

  if (!bookmarks) return <h1>Loading bookmarks...</h1>;

  return (
    <div>
      <h1>Bookmarked Items</h1>
      {bookmarks.length === 0 && <p>No bookmarks yet.</p>}

      {bookmarks.map((bookmark: Bookmark, index: number) => {
        const entry = entries[bookmark.entryId]; // Fetch the entry details
        const getTypeDisplayText = (type: any) => {
          switch (type) {
            case "donation_drive":
              return "Donation Drive";
            case "announcement":
              return "Announcement";
            case "job_offering":
              return "Job Offering";
            default:
              return "Unknown Type";
          }
        };

        return (
          <div key={bookmark.id || index} className="p-4 border rounded-lg">
            <h2>Type: {getTypeDisplayText(bookmark.type)}</h2>
            <p>Entry ID: {bookmark.entryId}</p>
            <h1>DETAILS</h1>
            {entry ? (
              <>
                <h3>{entry.campaignName || entry.title}</h3>
                <p>{entry.description || entry.content}</p>
                <p>Posted on: {entry.datePosted?.toDate().toLocaleString()}</p>
              </>
            ) : (
              <p>Loading entry details...</p>
            )}
          </div>
        );
      })}
    </div>
  );
}