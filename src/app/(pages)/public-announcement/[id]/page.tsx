"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useAnnouncement } from "@/context/AnnouncementContext";
import { Announcement } from "@/models/models";
import Image from "next/image";
import LoadingPage from "@/components/Loading";
import ICSARMSLogo from "@/app/images/ICS_ARMS_logo_white.png";
import { Oswald } from "next/font/google";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});
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
      <div className="bg-[var(--primary-blue)] h-20 flex px-[10%] fixed top-0 w-full z-100 shadow-lg items-center justify-between">
        <div className="text-[var(--primary-blue)] flex justify-center items-center gap-3">
          <div>
            <Image
              src={ICSARMSLogo}
              alt="ICS-ARMS Logo"
              width={40}
              height={40}
            />
          </div>
          <div>
            <div
              className={`${oswald.className} text-[14px] font-light text-white`}
            >
              Institute of Computer Science
            </div>
            <div
              className={`${oswald.className} text-[18px] mt-[-3px] text-white`}
            >
              Alumni Relations Management System
            </div>
          </div>
        </div>
        <Link href="/login">
          {/* <Button className="border-2 border-[var(--primary-blue)] hover:border-[var(--blue-600)] text-[var(--primary-blue)] font-bold py-2 px-4 rounded-full cursor-pointer"> */}
          <Button className="bg-white  text-[var(--primary-blue)] font-semibold py-2 px-4 rounded-full cursor-pointer">
            Log In
          </Button>
        </Link>
      </div>
      <div className=" p-10 px-[25vw] mt-20">
        <div className="flex items-center justify-center ">
          <div>
            <Image
              src="/network-bg.png"
              alt="Background Image"
              width={1000}
              height={1000}
              className="fixed z-0 top-5 left-0 w-full h-full object-cover opacity-10 "
            />
          </div>
          <div className="z-98 bg-white  rounded-2xl shadow-md overflow-hidden">
            <div className="bg-white h-100">
              <Image
                src={
                  announcement.image === ""
                    ? "/default-image.jpg"
                    : announcement.image
                }
                alt={announcement.title}
                width={1000}
                height={1000}
                priority
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8 flex flex-col gap-2">
              <div className="font-bold text-3xl">{announcement.title}</div>
              <div className="text-gray-500 text-[15px]">
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
              <div className="text-[15px]">{announcement.description}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
