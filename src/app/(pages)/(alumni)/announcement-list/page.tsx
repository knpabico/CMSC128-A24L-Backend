"use client";
import { useAnnouncement } from "@/context/AnnouncementContext";
import { Announcement } from "@/models/models";
import { useState } from "react";

export default function Users() {
  const { announces, isLoading } = useAnnouncement();
  const [bookmarked, setBookmarked] = useState<number[]>([]);
  const [tab, setTab] = useState("all");

  const toggleBookmark = (index: number) => {
    setBookmarked((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const filteredAnnouncements = tab === "bookmarked"
    ? announces.filter((_, index) => bookmarked.includes(index))
    : announces;

  return (
    <div>
      <h1>ANNOUNCEMENTS</h1>
      <div className="flex gap-4 mb-4">
        <button onClick={() => setTab("all")} className={tab === "all" ? "font-bold" : ""}>All</button>
        <button onClick={() => setTab("bookmarked")} className={tab === "bookmarked" ? "font-bold" : ""}>Bookmarked</button>
      </div>
      {isLoading && <h1>Loading...</h1>}
      {filteredAnnouncements.map((user: Announcement, index: number) => (
        <div key={index} className="p-1 border-b">
          <h1>{user.title}</h1>
          <h2>{user.datePosted.toDate().toLocaleString()}</h2>
          <h2>{user.description}</h2>
          <h2>Announcement Type: {user.type.join(", ")}</h2>
          <button onClick={() => toggleBookmark(index)} className="mt-2 text-blue-500">
            {bookmarked.includes(index) ? "Unbookmark" : "Bookmark"}
          </button>
        </div>
      ))}
    </div>
  );
}
