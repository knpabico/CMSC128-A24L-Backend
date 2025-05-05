"use client";
import { useAnnouncement } from "@/context/AnnouncementContext";
import { Announcement } from "@/models/models";
import Image from "next/image";
import { useParams } from "next/navigation";

const AnnouncementPage = () => {
  const params = useParams();
  const { announces } = useAnnouncement();
  const announcementId = params.announcementId;
  const announcement: Announcement = announces.find(
    (e: Announcement) => e.announcementId === announcementId
  );
  return (
    <div>
      <Image
        src={announcement.image == "" ? "/ICS2.jpg" : announcement.image}
        alt={announcement.title}
        width={200}
        height={200}
      />
      <h1>{announcement.title}</h1>
      <h1>{announcement.description}</h1>
      <h1>
        {announcement.datePosted.toDateString()}{" "}
        {announcement.datePosted.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}
      </h1>
      <ul>Type</ul>
      {announcement.type.map((type: string, index: number) => (
        <li key={index}>{type}</li>
      ))}
    </div>
  );
};

export default AnnouncementPage;