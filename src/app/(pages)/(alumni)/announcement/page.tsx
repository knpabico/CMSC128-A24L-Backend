"use client";
import { useState } from "react";
import { useAnnouncement } from "@/context/AnnouncementContext";
import { Announcement } from "@/models/models";
import BookmarkButton from "@/components/ui/bookmark-button";
import { Button } from "@/components/ui/button";
// import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react"
import { CheckboxItem, DropdownMenuCheckboxItem } from "@radix-ui/react-dropdown-menu";
import { useRadioGroup } from "@mui/material";
import { useFeatured } from "@/context/FeaturedStoryContext";



function formatDate(timestamp: any) {
  if (!timestamp || !timestamp.seconds) return "Invalid Date";
  const date = new Date(timestamp.seconds * 1000);
  return date.toISOString().split("T")[0];
}

const FILTER_TAGS = ["Update", "Announcement", "Upcoming Event"];
const SORT_TAGS = ["Earliest", "Latest"];

export default function Announcements() {
  const { announces, isLoading } = useAnnouncement();

  const [currentPage, setCurrentPage] = useState(1);
  const [latestFirst, setLatestFirst] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState("Latest");
  const { featuredItems } = useFeatured();

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
      {/* Page Title */}
			<div className="relative bg-cover bg-center pt-20 pb-10 px-10 md:px-30 md:pt-30 md:pb-20 lg:px-50" style={{ backgroundImage: 'url("/ICS2.jpg")' }}>
				<div className="absolute inset-0 bg-blue-500/50" />
				<div className="relative z-10">
					<h1 className="text-3xl font-bold my-2 text-white">Announcements</h1>
					<p className='text-white text-sm md:text-base'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla porta, ligula non sagittis tempus, risus erat aliquam mi, nec vulputate dolor nunc et eros. Fusce fringilla, neque et ornare eleifend, enim turpis maximus quam, vitae luctus dui sapien in ipsum. Pellentesque mollis tempus nulla, sed ullamcorper quam hendrerit eget.</p>
				</div>
			</div>

      {/* Filter Button */}
      <div className="flex flex-row justify-end gap-5 mx-20 my-5">
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger className="pl-5 h-10 w-30 items-center flex flex-row rounded-full bg-[#FFFFFF] border border-[#0856BA] text-sm/6 font-semibold text-[#0856BA] shadow-inner shadow-white/10">
              Filter by
              <ChevronDownIcon className="size-4 fill-white/60 ml-5" />
            </DropdownMenuTrigger>

            <DropdownMenuPortal>
              <DropdownMenuContent className="w-full bg-[#0856BA] text-[#FFFFFF] border border-[#0856BA] p-1 rounded-md space-y-1">
                {FILTER_TAGS.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center h-10 gap-2 px-2 cursor-default"
                  >
                    <input
                      type="checkbox"
                      checked={activeFilters.includes(tag)}
                      onChange={() => toggleFilter(tag)}
                      className="form-checkbox h-4 w-4 text-blue-600 bg-white rounded"
                    />
                    <label className="text-sm select-none">{tag}</label>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenuPortal>
          </DropdownMenu>
        </div>

        {/* Sorting Button */}
        <div>
          <DropdownMenu>
              <DropdownMenuTrigger className="pl-5 h-10 w-30 items-center flex flex-row rounded-full bg-[#FFFFFF] border border-[#0856BA] text-sm/6 font-semibold text-[#0856BA] shadow-inner shadow-white/10">
              {selectedSort === "Earliest" || selectedSort === null? "Earliest" : "Latest"}
              <ChevronDownIcon className="size-4 fill-white/60 ml-5" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-30 ml-0 bg-[#0856BA] text-[#FFFFFF] text-white border border-[#0856BA] transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
            >
              {SORT_TAGS.map((tag) => (
                <DropdownMenuItem key={tag}>
                  <button
                    className={`flex w-full items-center rounded-md py-1.5 px-3 ${
                      selectedSort === tag ? "bg-[#FFFFFF] text-[#0856BA] font-semibold" : ""
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
            <div className="text-center text-gray-500 mb-[100px]">No announcements found.</div>
          ) : (
            currentAnnouncements.map((user: Announcement, index: number) => (
              <div
                key={index}
                className="h-full relative m-20 mt-0 bg-[#FFFFFF] rounded-lg shadow-sm"
              >
                <div>
                {user.image === "" ? "" : 
                  <img src={user.image} className="w-full object-cover"/>
                  }
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
                    <div className="flex gap-2 my-10 place-self-center">Tags: 
                      {user.type.map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-1 text-xs text-[#0856BA] font-semibold bg-[#FFFFFF] border border-[#0856BA] rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="place-self-center"><a href="./redirect" className="hover:font-semibold">Learn more &#8594;</a></div>
                  </div>
                </div>
              </div>
            ))
          )}

            <div className="flex flex-col gap-[30px] mb-[50px]">
            <p className="place-self-center text-[24px] font-semibold">See More Announcements</p>
            <div className="flex flex-row gap-[20px] place-self-center rounded-[10px]">
              {featuredItems.map((item, index) => (
              <div key={index} className="flex flex-col rounded-[5px] h-full bg-[#FFFFFF] gap-[10px]">
                <img 
                src={item.image || "/ICS2.jpg"} 
                className="w-[300px] h-[150px] object-cover mb-[10px]"
                alt={item.title}
                />
                <p className="text-[20px] font-semibold text-justify mx-[20px]">{item.title}</p>
                <a href="./redirect" className="text-[14px] mx-[20px] mb-[20px] hover:font-semibold">
                Read more &#8594;
                </a>
              </div>
              ))}
            </div>
            </div>
          

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
