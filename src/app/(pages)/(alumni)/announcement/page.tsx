"use client";
import { useState } from "react";
import { useAnnouncement } from "@/context/AnnouncementContext";
import { Announcement } from "@/models/models";
import BookmarkButton from "@/components/ui/bookmark-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import { useFeatured } from "@/context/FeaturedStoryContext";
import CollapseText from "@/components/CollapseText";
import { useRouter } from "next/navigation";
import AnnouncementsSidebar from "./sidebar";
import { useBookmarks } from "@/context/BookmarkContext";
import Banner from "@/components/Banner";
import Image from "next/image";

function formatDate(timestamp: any) {
  if (!timestamp) return "Invalid Date";
  const date = new Date(timestamp?.seconds ? timestamp.seconds * 1000 : timestamp);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}


const FILTER_TAGS = ["Donation Update", "Event Update", "General Announcement"];
const SORT_TAGS = ["Earliest", "Latest"];

export default function Announcements() {
  const { announces, isLoading } = useAnnouncement();
  const { bookmarks } = useBookmarks();
  const [currentPage, setCurrentPage] = useState(1);
  const [latestFirst, setLatestFirst] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState("Latest");
  const { featuredItems } = useFeatured();
  const router = useRouter();

  const itemsPerPage = 6;

  // Set single filter option
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Sort announcements by date
  let filteredAnnounces = [...announces].sort((a, b) => {
    const dateA = new Date(a.datePosted?.seconds ? a.datePosted.seconds * 1000 : a.datePosted);
    const dateB = new Date(b.datePosted?.seconds ? b.datePosted.seconds * 1000 : b.datePosted);
    return latestFirst ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
  });


  // Apply active filter (if any)
  if (activeFilter === "Saved Announcements") {
    // For "Saved" filter - implementation depends on how you track saved items
    // This is a placeholder - modify based on your saved items tracking system
    filteredAnnounces = announces.filter((announce: Announcement) =>
      bookmarks.some((bookmark) => bookmark.entryId === announce.announcementId)
    );
  } else if (activeFilter) {
    filteredAnnounces = filteredAnnounces.filter((announcement) =>
      announcement.type.includes(activeFilter)
    );
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredAnnounces.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAnnouncements = filteredAnnounces.slice(startIndex, endIndex);

  return (
    <div>
      {/* Title */}
      <Banner 
        title="Announcements" 
        description="Stay connected with the ICS community through timely announcements, academic news, and upcoming events."
      />

      <div className="mx-[30px] xl:mx-[10%] lg:mx-[50px] my-[40px] static">
        <div className="flex flex-row gap-[40px] mt-6">
          {/* Sidebar */}
          <div className="bg-[#FFFFFF] flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max md:sticky md:top-1/7 ">
            <AnnouncementsSidebar
              activeFilter={activeFilter}
              setActiveFilter={handleFilterChange}
            />
          </div>

          {/* Main */}
          <div className="flex-1 flex-col">
            {/* Sort  */}
            <div className="bg-white rounded-lg px-5 py-1 flex justify-between items-center shadow-md mb-[10px]">
              <h2 className="text-md lg:text-lg font-semibold">
                {activeFilter || "All Announcements"}
              </h2>
              <div className="flex items-center">
                <label htmlFor="sort" className="mr-2 text-sm">
                  Sort by:
                </label>
                <select
                  defaultValue={selectedSort}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedSort(value);
                    setLatestFirst(value === "Latest");
                  }}
                  className="text-sm rounded py-1 px-2"
                >
                  {SORT_TAGS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!isLoading ? (
              <div className="flex-1">
                {currentAnnouncements.length === 0 ? (
                  <div className="text-center text-gray-500 mb-[100px] p-10 bg-white rounded-lg shadow-md">
                    No announcements found for the selected filters.
                  </div>
                ) : (
                  currentAnnouncements.map(
                    (user: Announcement, index: number) => (
                      <div
                        key={index}
                        className="h-auto relative mt-0 mb-8 bg-[#FFFFFF] rounded-lg shadow-sm"
                      >
                        <div>
                          {user.image ? (
                            <Image
                              width={0}
                              height={0}
                              alt={user.title}
                              sizes="100vw"
                              priority
                              src={user.image}
                              className="w-full rounded-t-lg"
                            />
                          ) : (
                            ""
                          )}
                          <div className="p-10">
                            <div className="flex flex-row justify-between w-full">
                              <p className="text-2xl md:text-4xl font-bold  uppercase">
                                {user.title}
                              </p>
                              {/* Bookmark Button */}
                              <div className="p-0 top-5">
                                <BookmarkButton
                                  entryId={user.announcementId}
                                  type="announcement"
                                  size="lg"
                                />
                              </div>
                            </div>

                            <p className="text-gray-400 text-sm mb-[20px]">
                              {formatDate(user.datePosted)}
                            </p>

                            {user.description.length > 700 ? (
                              <p className="text-justify">
                                {user.description.slice(0, 700) + "..."}
                              </p>
                            ) : (
                              <p className="text-justify">{user.description}</p>
                            )}
                            <div className="flex gap-2 my-6 mt-10 place-self-center items-center">
                              <span className="text-sm font-medium">Tags:</span>
                              {user.type.map((tag: string, i: number) => (
                                <span
                                  key={i}
                                  className="px-3 py-1 text-xs text-[#0856BA] font-semibold bg-[#FFFFFF] border border-[#0856BA] rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="text-right">
                              <button
                                onClick={() =>
                                  router.push(
                                    `/announcement/${user.announcementId}`
                                  )
                                }
                                className="text-blue-600 hover:font-semibold cursor-pointer transition-all"
                              >
                                Learn more &#8594;
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )
                )}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6 space-x-4 mb-10">
                    <Button
                      className="px-4 py-2 bg-white hover:bg-gray-300 rounded disabled:opacity-50 transition-all"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    <span className="flex items-center text-sm">
                      Page {currentPage} of {totalPages}
                    </span>

                    <Button
                      className="px-4 py-2 bg-white hover:bg-gray-300 rounded disabled:opacity-50 transition-all"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex justify-center items-center min-h-[400px]">
                <h1 className="text-2xl font-bold text-gray-600">Loading...</h1>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
