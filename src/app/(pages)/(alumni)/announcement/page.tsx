"use client";
import { useState } from "react";
import { useAnnouncement } from "@/context/AnnouncementContext";
import { Announcement } from "@/models/models";
import BookmarkButton from "@/components/ui/bookmark-button";
import { Button } from "@/components/ui/button";
// import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react"


function formatDate(timestamp: any) {
  if (!timestamp || !timestamp.seconds) return "Invalid Date";
  const date = new Date(timestamp.seconds * 1000);
  return date.toISOString().split("T")[0];
}

const FILTER_TAGS = ["Donation Update", "Achievements", "Upcoming Event"];
const SORT_TAGS = ["Earliest", "Latest"];

export default function Announcements() {
  const { announces, isLoading } = useAnnouncement();

  const [currentPage, setCurrentPage] = useState(1);
  const [latestFirst, setLatestFirst] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState("Latest");

  const itemsPerPage = 6;

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
  let filteredAnnounces = [...announces].sort((Button, b) => {
    const dateA = Button.datePosted.seconds;
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
    <div>
      <div className="flex h-70 w-full bg-blue-600 justify-start pl-20 pr-20 items-center">
        <div className="flex flex-col">
          <p className="text-5xl font-bold text-white leading-tight m-0">News & Announcements</p>
          <p className="text-l text-white mt-1 m-0">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla porta, ligula non sagittis tempus, risus erat aliquam mi, nec vulputate dolor nunc et eros. Fusce fringilla, neque et ornare eleifend, enim turpis maximus quam, vitae luctus dui sapien in ipsum. Pellentesque mollis tempus nulla, sed ullamcorper quam hendrerit eget.</p>
        </div>
      </div>

      {/* Filter Button */}
      <div className="flex flex-row justify-end gap-5 mx-20 my-5">
        <div>
          <DropdownMenu>
          <DropdownMenuTrigger className="pl-5 h-10 w-30 items-center flex flex-row rounded-md bg-[#0856BA] text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-700 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white">
            Filter by
            <ChevronDownIcon className="size-4 fill-white/60 ml-5" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-auto bg-[#0856BA] border border-white/5 p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            {FILTER_TAGS.map((tag) => (
              // Prevent menu from closing using as div
              <DropdownMenuItem key={tag} className="flex justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent menu close
                    toggleFilter(tag);
                  }}
                  className={`group flex flex cursor-default items-center rounded py-1.5 px-3 ${
                    activeFilters.includes(tag) ? "flex bg-white/10 w-full" : ""}`}
                >
                  <span className="flex-1">{tag}</span>
                  {activeFilters.includes(tag) }
                </button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>

        {/* Sorting Button */}
        <div>
        <DropdownMenu>
        <DropdownMenuTrigger
          className="pl-5 h-10 w-30 items-center flex flex-row rounded-md bg-gray-800 text-sm/6 font-semibold text-white shadow-inner shadow-white/10 focus:outline-none data-[hover]:bg-gray-700 data-[open]:bg-gray-700 data-[focus]:outline-1 data-[focus]:outline-white"
        >
          {selectedSort === "Earliest" || selectedSort === null? "Earliest" : "Latest"}
          <ChevronDownIcon className="size-4 fill-white/60 ml-5" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-30 ml-0 bg-gray-600 border border-white/5 p-1 text-sm/6 text-white transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
        >
          {SORT_TAGS.map((tag) => (
            <DropdownMenuItem key={tag}>
              <button
                className={`flex w-full items-center rounded-md py-1.5 px-3 ${
                  selectedSort === tag ? "bg-white/10" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation(); // prevent menu close
                  setSelectedSort(tag);
                  setLatestFirst(tag === "Latest");
                }}
              >
                {tag}
              </button>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

        </div>
        </div>

        

      { !isLoading ? 
      (
        <>
          {currentAnnouncements.length === 0 ? (
            <p className="text-center text-gray-500">No announcements found.</p>
          ) : (
            currentAnnouncements.map((user: Announcement, index: number) => (
              <div
                key={index}
                className="h-full relative m-20 mt-0 border border-gray-200 rounded-lg shadow-sm"
              >
                <div>
                <img src="https://www.cdc.gov/healthy-pets/media/images/2024/04/Cat-on-couch.jpg"/>
                <div className="p-10">
                <div className="flex flex-row justify-between w-full">
                <p className="text-4xl font-bold uppercase">{user.title}</p>
                  {/* Bookmark Button */}
                <div className="p-0 top-5">
                    <BookmarkButton 
                      entryId={user.announcementId}  
                      type="announcement" 
                      size="lg"
                    />
                  </div>
                </div>
                  
                  <p className="text-gray-400 text-sm">{formatDate(user.datePosted)}</p>
                  <h3 className=" mt-10 text-gray-0 ">{user.description}</h3>
                  <h3 className=" mt-10 text-gray-0 flex text-justify">Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                    Nulla porta, ligula non sagittis tempus, risus erat aliquam mi, nec vulputate dolor nunc et eros. 
                    Fusce fringilla, neque et ornare eleifend, enim turpis maximus quam, vitae luctus dui sapien in ipsum. 
                    Pellentesque mollis tempus nulla, sed ullamcorper quam hendrerit eget. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                    Nulla porta, ligula non sagittis tempus, risus erat aliquam mi, nec vulputate dolor nunc et eros. 
                    Fusce fringilla, neque et ornare eleifend, enim turpis maximus quam, vitae luctus dui sapien in ipsum. 
                    Pellentesque mollis tempus nulla, sed ullamcorper quam hendrerit eget. 
                    </h3>
                  <div className="flex gap-2 my-10 place-self-center">Tags: 
                    {user.type.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs font-semibold bg-gray-300 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="place-self-center"> See more here <a href="./redirect">&#8594;</a></p>
                </div>
                </div>
              </div>
            ))
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-4">
              <Button
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <span className="text-lg font-semibold">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <h1 className="place-self-center text-4xl font-bold">Loading...</h1>
      )}
    </div>
  );
}
