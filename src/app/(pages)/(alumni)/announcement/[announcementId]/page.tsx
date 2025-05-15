"use client";
import { useAnnouncement } from "@/context/AnnouncementContext";
import { Announcement } from "@/models/models";
import { MoveLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useMemo } from "react";
import BookmarkButton from "@/components/ui/bookmark-button";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import { useFeatured } from "@/context/FeaturedStoryContext";
import CollapseText from "@/components/CollapseText";
import { useRouter } from "next/navigation";
import { useBookmarks } from "@/context/BookmarkContext";

function formatDate(timestamp: any) {
  if (!timestamp || !timestamp.seconds) return "Invalid Date";
  const date = new Date(timestamp.seconds * 1000);
  return date.toISOString().split("T")[0];
}

const FILTER_TAGS = ["Donation Update", "Event Update", "General Announcement"];
const SORT_TAGS = ["Earliest", "Latest"];

const AnnouncementPage = () => {
  const { announces, isLoading } = useAnnouncement();
  const { bookmarks } = useBookmarks();
  const [currentPage, setCurrentPage] = useState(1);
  const [latestFirst, setLatestFirst] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState("Latest");
  const { featuredItems } = useFeatured();
  const router = useRouter();
  const params = useParams();
  const announcementId = params.announcementId;
  const announcement: Announcement = announces.find(
    (e: Announcement) => e.announcementId === announcementId
  );  

  const randomAnnouncements = useMemo(() => {
    const otherAnnouncements = announces.filter(
      (item: Announcement) => item.announcementId !== announcementId
    );
    
    const random = [...otherAnnouncements].sort(() => 0.5 - Math.random());
    
    return random.slice(0, 3);
  }, [announces, announcementId]);

  return (
    <div className="px-[10%] py-10 flex flex-col bg-[#eaeaea]">
      <Link href="/announcement" className="mb-4 items-center flex gap-2 text-blue-600 hover:underline cursor-pointer transition-all">
      <MoveLeft className='size-[17px]'/>
            Back to Announcements
        </Link>
      
      {/* Main */}
      <div className="rounded-[10px] bg-[#FFFFFF]">
        {announcement?.image === "" ? 
        ""
        : 
        <img
          src={announcement?.image}
          className="h-full w-full"
        />}
        <div className="p-10 flex flex-col gap-[20px] ">
          <div>
            <p className="text-2xl md:text-4xl font-bold uppercase">{announcement?.title}</p>
            <p className="text-gray-400 text-sm mb-[20px]">
              {announcement?.datePosted.toDateString()}{" "}
              {announcement?.datePosted.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>
          <p className="text-justify">{announcement?.description}</p>
        </div> 
      </div>
                          
      {/* More Announcements */}
      {randomAnnouncements.length > 0 && (
        <div className="flex flex-col gap-[10px] mb-[50px] mt-15">
          <p className="place-self-center text-[24px] font-semibold mt-8">See More Announcements</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {randomAnnouncements.map((item: Announcement, index: number) => (
              <div key={index} className="flex flex-wrap gap-[20px] justify-center rounded-[10px]">
                <div className="grid grid-col rounded-[5px] w-[200px] lg:w-[300px] h-[300px] bg-[#FFFFFF] gap-[10px] shadow-sm overflow-hidden transition-all hover:shadow-md">
                  <img 
                    src={item.image || "/ICS2.jpg"} 
                    className="w-full h-[150px] object-cover"
                  />
                  <div className="flex flex-col gap-1">
                    {item.title.length > 50 
                    ? <p className="font-semibold text-[15px] px-5 text-justify">{item.title.slice(0, 50) + "..."}</p> 
                    : 
                    <p className="font-semibold text-[15px] px-5 text-justify">{item.title}</p>}
                      
                    {item.description.length > 70 
                    ? <p className="text-xs px-5 text-justify">{item.description.slice(0, 70) + "..."}</p> 
                    : 
                    <p className="text-xs px-5 text-justify">{item.description}</p>}
                  </div>

                  <button 
                    onClick={() => router.push(`/announcement/${item.announcementId}`)}
                    className="text-[14px] mx-[20px] place-self-end mb-[20px] text-blue-600 hover:font-semibold transition-all"
                  >
                    Learn more &#8594;
                  </button>
                </div>                  
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementPage;