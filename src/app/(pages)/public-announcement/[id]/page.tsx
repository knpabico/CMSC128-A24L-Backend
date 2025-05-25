"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useAnnouncement } from "@/context/AnnouncementContext";
import { Announcement } from "@/models/models";
import Image from "next/image";
import LoadingPage from "@/components/Loading";
const Page = () => {
  const { id } = useParams();
  const { announces, isLoading } = useAnnouncement();
  const announcement: Announcement = announces.find(
    (announcement: Announcement) => announcement.announcementId === id
  );
  if (isLoading || !announcement) {
    return <LoadingPage />;
  }
  return (
    <>
      <title>Announcement | ICS-ARMS</title>
      <div>{announcement.title}</div>
      <div>{announcement.description}</div>
      <Image
        src={
          announcement.image === "" ? "/default-image.jpg" : announcement.image
        }
        alt={announcement.title}
        width={100}
        height={100}
        priority
      />
      <div>
        {announcement.datePosted.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}{" "}
        at{" "}
        {announcement.datePosted.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </>
  );
};

export default Page;
