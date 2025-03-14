"use client";
import { useAnnouncement } from "@/context/AnnouncementContext";
import { Announcement } from "@/models/models";
import { Timestamp } from "firebase/firestore";

export default function Users() {
  const { announces, isLoading } = useAnnouncement();

  return (
    <div>
      <h1>ANNOUNCEMENTS</h1>
      {isLoading && <h1>Loading</h1>}
      {announces.map((user: Announcement, index: any) => (
        <div key={index} className="p-1">
          <h1>{user.title}</h1>
          <h2>{user.datePosted.toDate().toLocaleString()}</h2>
          <h2>{user.description}</h2>
          <h2>Announcement Type: {user.type[0]}, {user.type[1]}</h2>
        </div>
      ))}
    </div>
  );
}
