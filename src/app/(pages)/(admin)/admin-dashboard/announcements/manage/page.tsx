"use client";
import CollapseText from "@/components/CollapseText";
import { useAnnouncement } from "@/context/AnnouncementContext";
import { Announcement } from "@/models/models";
import { ChevronDown, ChevronRight, CirclePlus, Ellipsis, EllipsisVertical, Eye, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toastSuccess } from "@/components/ui/sonner";

function formatDate(timestamp: any) {
    if (!timestamp || !timestamp.seconds) return "Invalid Date";
    const date = new Date(timestamp.seconds * 1000);
    return date.toISOString().split("T")[0];
};

export default function ManageAnnouncements() {
  const {
    announces,
    isLoading,
    setCurrentAnnouncementId,
    setTitle,
    setDescription,
    setType,
    setAnnounceImage,
    setIsEdit,
    handleDelete,
    togglePublic
  } = useAnnouncement();


  const router = useRouter();
  const tableRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Filtering states
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  
  // Dropdown states
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [showFullTitle, setShowFullTitle] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [activeTab, setActiveTab] = useState("Posted");
  const [headerWidth, setHeaderWidth] = useState("100%");
  const [isSticky, setIsSticky] = useState(false);
  
  // Date filter dropdown ref
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  // Type filter dropdown ref
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  const handleAddClick = () => {
    setTitle("");
    setDescription("");
    setAnnounceImage(null);
    setType([]);
    setIsEdit(false);
    router.push("/admin-dashboard/announcements/add");
  };

  const handleEditClick = (announcement: Announcement) => {
    setTitle(announcement.title);
    setDescription(announcement.description);
    setIsEdit(true);
    setCurrentAnnouncementId(announcement.announcementId);
    setAnnounceImage(announcement.image ?? null);
    setType(announcement.type || []);
    setShowDropdown(null);
    
    // Navigate to edit announcement page
    router.push("/admin-dashboard/announcements/manage/edit");
  };

  // Apply filters to announcements
  useEffect(() => {
    if (!announces) return;

    let filtered = [...announces];

    // Apply date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (dateFilter === "week") {
        // Filter for this week (last 7 days)
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        filtered = filtered.filter(announcement => {
          const postDate = new Date(announcement.datePosted);
          return postDate >= weekAgo;
        });
      } else if (dateFilter === "month") {
        // Filter for this month
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        filtered = filtered.filter(announcement => {
          const postDate = new Date(announcement.datePosted);
          return postDate >= monthAgo;
        });
      }
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(announcement => {
        if (!announcement.type || !Array.isArray(announcement.type)) return false;
        
        // Map filter values to expected type values
        const filterTypeMap: Record<string, string[]> = {
          "general": ["General Announcement", "general", "General announcement"],
          "event": ["Event Update", "event", "Event update"],
          "donation": ["Donation Update", "donation", "Donation update"]
        };
        
        // Check if announcement type includes any of the matching types
        const matchingTypes = filterTypeMap[typeFilter] || [];
        return announcement.type.some(type => 
          matchingTypes.some(matchType => 
            type.toLowerCase() === matchType.toLowerCase()
          )
        );
      });
    }

    setFilteredAnnouncements(filtered);
  }, [announces, dateFilter, typeFilter]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // For announcement action dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(null);
      }
      
      // For date filter dropdown
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node) && 
          event.target !== document.getElementById('date-filter-button')) {
        setShowDateDropdown(false);
      }
      
      // For type filter dropdown
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node) && 
          event.target !== document.getElementById('type-filter-button')) {
        setShowTypeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Track scroll position and update header state
  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current) return;
      
      const tableRect = tableRef.current.getBoundingClientRect();
      
      if (tableRect.top <= 0 && !isSticky) {
        setIsSticky(true);
        setHeaderWidth(`${tableRect.width}px`);
      } else if (tableRect.top > 0 && isSticky) {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Set initial width
    if (tableRef.current) {
      setHeaderWidth(`${tableRef.current.offsetWidth}px`);
    }
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isSticky]);

  // Get display text for filters
  const getDateFilterText = () => {
    switch(dateFilter) {
      case "week": return "This Week";
      case "month": return "This Month";
      default: return "All Time";
    }
  };

  const getTypeFilterText = () => {
    switch(typeFilter) {
      case "general": return "General Announcement";
      case "event": return "Event Update";
      case "donation": return "Donation Update";
      default: return "Type";
    }
  };

  return (
    <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
            <button 
                onClick={() => router.push("/admin-dashboard")}
                className="cursor-pointer rounded-full transition"
            >
                Home
            </button>
            <div>
                <ChevronRight size={15} />
            </div>
            <div className="font-bold text-[var(--primary-blue)]">
                Manage Announcements
            </div>
        </div>

        <div className="w-full">
            <div className="flex items-center justify-between">
                <div className="font-bold text-3xl">
                    Manage Announcements
                </div>
                <button 
                    type="button"
                    onClick={() => 
                        {router.push("/admin-dashboard/announcements/add"); 
                        handleAddClick();}
                    }
                      className="bg-[var(--primary-blue)] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-blue-600"
                >
                    + Add Announcement
                </button>
            </div>
        </div>
    
        {/* Filter Bar */}
        <div className="bg-white rounded-xl flex gap-3 p-2.5 pl-4 items-center">
          <div className="text-sm font-medium">Filter by:</div>
          
          {/* Date Filter */}
          <div className="relative">
            <div 
              id="date-filter-button"
              className={`bg-gray-300 pl-2 pr-1 py-1 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-400 ${dateFilter !== 'all' ? 'bg-blue-100 text-blue-700' : ''}`}
              onClick={() => setShowDateDropdown(!showDateDropdown)}
            >
              <div className="text-xs">{getDateFilterText()}</div>
              <ChevronDown size={20} />
            </div>
            
            {showDateDropdown && (
              <div 
                ref={dateDropdownRef}
                className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg z-20 border border-gray-200 w-40"
              >
                <div 
                  className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  onClick={() => {
                    setDateFilter("all");
                    setShowDateDropdown(false);
                  }}
                >
                  <span>All Time</span>
                  {dateFilter === "all" && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                </div>
                <div 
                  className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  onClick={() => {
                    setDateFilter("week");
                    setShowDateDropdown(false);
                  }}
                >
                  <span>This Week</span>
                  {dateFilter === "week" && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                </div>
                <div 
                  className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  onClick={() => {
                    setDateFilter("month");
                    setShowDateDropdown(false);
                  }}
                >
                  <span>This Month</span>
                  {dateFilter === "month" && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                </div>
              </div>
            )}
          </div>
          
          {/* Type Filter */}
          <div className="relative">
            <div 
              id="type-filter-button"
              className={`bg-gray-300 pl-2 pr-1 py-1 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-400 ${typeFilter !== 'all' ? 'bg-blue-100 text-blue-700' : ''}`}
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            >
              <div className="text-xs">{getTypeFilterText()}</div>
              <ChevronDown size={20} />
            </div>
            
            {showTypeDropdown && (
              <div 
                ref={typeDropdownRef}
                className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg z-20 border border-gray-200 w-48"
              >
                <div 
                  className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  onClick={() => {
                    setTypeFilter("all");
                    setShowTypeDropdown(false);
                  }}
                >
                  <span>All Types</span>
                  {typeFilter === "all" && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                </div>
                <div 
                  className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  onClick={() => {
                    setTypeFilter("general");
                    setShowTypeDropdown(false);
                  }}
                >
                  <span>General Announcement</span>
                  {typeFilter === "general" && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                </div>
                <div 
                  className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  onClick={() => {
                    setTypeFilter("event");
                    setShowTypeDropdown(false);
                  }}
                >
                  <span>Event Update</span>
                  {typeFilter === "event" && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                </div>
                <div 
                  className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  onClick={() => {
                    setTypeFilter("donation");
                    setShowTypeDropdown(false);
                  }}
                >
                  <span>Donation Update</span>
                  {typeFilter === "donation" && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                </div>
              </div>
            )}
          </div>
          
          {/* Display active filters */}
          {(dateFilter !== 'all' || typeFilter !== 'all') && (
            <div className="flex items-center gap-2 ml-auto">
              <button 
                className="text-blue-600 text-xs hover:underline"
                onClick={() => {
                  setDateFilter('all');
                  setTypeFilter('all');
                }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
        
        {/* Loading state */}
        {isLoading && <h1>Loading...</h1>}
        
        {/* Empty state */}
        {/* {filteredAnnouncements.length === 0 && !isLoading && (
          <div className="text-center py-10 text-gray-500">
            {announces.length === 0 
              ? "No announcements found. Create your first announcement!"
              : "No announcements match your current filters."}
          </div>
        )} */}
        
      <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
        <div
          className="rounded-xl overflow-hidden border border-gray-300 relative"
          ref={tableRef}
        >
        <div
            className={`bg-blue-100 w-full flex gap-4 p-4 text-xs z-10 shadow-sm ${
              isSticky ? "fixed top-0" : ""
            }`}
            style={{ width: isSticky ? headerWidth : "100%" }}
          >
            <div className="w-1/2 flex items-center justify-baseline font-semibold">
              Announcement Info
            </div>
            <div className="w-1/2 flex justify-end items-center">
              <div className="w-1/6 flex items-center justify-center font-semibold">
                Public
              </div>
              <div className="w-1/6 flex items-center justify-center font-semibold">
                Actions
              </div>
              <div className="w-1/6 flex items-center justify-center"></div>
            </div>
          </div>

          {isSticky && <div style={{ height: "56px" }}></div>}


        {/* Announcements list */}
        {filteredAnnouncements.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow p-8">
              'No scholarships available.'
            </div>
          ) : (
        <div className="">
          {filteredAnnouncements.map((announcement: Announcement, index: number) => (
          <div
            key={announcement.announcementId}
            className={`w-full flex gap-4 border-t border-gray-300 ${
            index % 2 === 0 ? "bg-white" : "bg-gray-50"
            } hover:bg-blue-50`}
          >


            {/* Announcement Card with Truncation */}
            <div className="bg-white w-full flex justify-between rounded-2xl overflow-hidden p-5 gap-5">
              <div className="w-1/2 flex flex-row p-4 gap-15">              
                <div className="flex flex-col min-w-full max-w-full gap-3 pr-5">
                {/* Title */}
                <div className="relative">
                  <div className={`text-lg font-bold ${!showFullTitle ? "line-clamp-2" : ""}`}>
                    {showFullTitle ? announcement.title : announcement.title}
                  </div>
                </div>
                
                {/* Content */}
                <div className="text-sm text-gray-600 text-justify overflow-hidden">
                  <div className={`${!showFullContent ? "line-clamp-5" : ""}`}>
                    {showFullContent ? announcement.description : announcement.description}
                  </div>
                </div>
                <div className="flex flex-row gap-5 text-sm text-gray-600">
                  Date Posted: {(announcement.datePosted.toDateString())}
                  {announcement.type && announcement.type.length > 0 && (
                    <p> Type: {announcement.type.join(", ")} </p>
                  )} 
                </div>
                </div>
                {announcement.image ? (
                  <div
                    className="h-32 w-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500"
                    style={{ minWidth: "130px" }}
                  >
                    <img
                      src={announcement.image}
                      alt="Announcement"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="bg-amber-300 h-32 w-32 aspect-square rounded-md flex items-center justify-center">
                    <p className="text-center">No image</p>
                  </div>
                )} 

              </div>
                  <div className="w-1/2 flex items-center justify-end pr-1 p-5">
                    <div className="w-1/6 flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <button
                          onClick={async () => {
                            const result = await togglePublic(announcement.announcementId, announcement.isPublic);
                            if (result.success) {
                              toastSuccess(`Announcement is now ${!announcement.isPublic ? 'public' : 'private'}`);
                            }
                          }}
                          className={`relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none 
                            ${announcement.isPublic ? "bg-blue-500" : "bg-gray-300"}`}
                        >
                          <span className="sr-only">Toggle public status</span>
                          <span
                            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                              announcement.isPublic ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <div className="w-1/6 flex items-center gap-5 justify-center">
                      <button
                        className="text-[var(--primary-blue)] hover:underline cursor-pointer text-sm"
                        onClick={() => handleEditClick(announcement)}
                      >
                        View Details
                      </button>
                    </div>
                    <div className="w-1/6 flex items-center justify-center">
                      <button
                        className="px-4 py-2 text-sm w-full text-red-600 flex items-center gap-2 cursor-pointer"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this announcement?")) {
                              toastSuccess(`You have successfully deleted announcement.`);
                              handleDelete(announcement.announcementId);
                              setShowDropdown(null);
                            } 
                            else {return};
                          }}                     >
                        <Trash2 className="size-6" />
                      </button>
                    </div>
                  </div>
            </div>
          </div>
        ))}  
        </div>)}
        </div>
        
    </div>
    </div>
  );
}