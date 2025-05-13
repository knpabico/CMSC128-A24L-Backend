"use client";
import CollapseText from "@/components/CollapseText";
import { useAnnouncement } from "@/context/AnnouncementContext";
import { Announcement } from "@/models/models";
import { ChevronDown, ChevronRight, Ellipsis, EllipsisVertical, Eye, Pencil, Plus, Trash2 } from "lucide-react";
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
    handleDelete
  } = useAnnouncement();

//   const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const router = useRouter();

  const handleAddClick = () => {
    setTitle("");
    setDescription("");
    setAnnounceImage(null);
    setType([]);
    setIsEdit(false);
    router.push("/admin-dashboard/add-announcement");
  };

  const handleEditClick = (announcement) => {
    setTitle(announcement.title);
    setDescription(announcement.description);
    setIsEdit(true);
    setCurrentAnnouncementId(announcement.announcementId);
    setAnnounceImage(announcement.image ?? null);
    setType(announcement.type || []);
    setShowDropdown(null);
    
    // Navigate to edit announcement page
    router.push("/admin-dashboard/manage-announcements/edit-announcement");
  };

  const [showFullTitle, setShowFullTitle] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const tableRef = useRef(null);
  const [activeTab, setActiveTab] = useState("Posted");
  const [headerWidth, setHeaderWidth] = useState("100%");
  const [isSticky, setIsSticky] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);


  // Function to truncate text with "See more" button
  const truncateText = (text, limit) => {
    if (!text) return "";
    if (text.length <= limit) return text;
    return text.substring(0, limit) + "...";
  };

  // Handle dropdown toggle
  const toggleDropdown = () => {
    setShowDropdown(prev => !prev);
  };

  // Function to handle view button click
  const handleView = () => {
    alert("View details clicked");
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
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
        setHeaderWidth(tableRect.width);
      } else if (tableRect.top > 0 && isSticky) {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    
    
    // Set initial width
    if (tableRef.current) {
      setHeaderWidth(tableRef.current.offsetWidth);
    }
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isSticky]);

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
                        {router.push("/admin-dashboard/add-announcement"); 
                        handleAddClick();}
                    }
                    className="flex items-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-300"
                >
                    <Pencil size={18} /> Add Announcement
                </button>
            </div>
        </div>
    
        {/* Filter Bar */}
        <div className="bg-white rounded-xl flex gap-3 p-2.5 pl-4 items-center">
          <div className="text-sm font-medium">Filter by:</div>
            <div className="bg-gray-300 pl-2 pr-1 py-1 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-400">
                <div className="text-xs">Any Date</div>
                <ChevronDown size={20} />
            </div>
            <div className="bg-gray-300 pl-2 pr-1 py-1 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-400">
                <div className="text-xs">Type</div>
                <ChevronDown size={20} />
            </div>
        </div>
        
      {isLoading && <h1>Loading...</h1>}
      {announces.length === 0 && !isLoading && (
        <div className="text-center py-10 text-gray-500">
          No announcements found. Create your first announcement!
        </div>
      )}
      {announces.map((announcement : Announcement, index : any) => (
        <div
          key={index}
          className="bg-white p-6 flex flex-col rounded-lg border border-gray-300 flex justify-between items-start"
        >

        {/* Announcement Card with Truncation */}
        <div className="bg-white w-full flex justify-between rounded-2xl overflow-hidden p-5">
          <div className="flex flex-col gap-1 pr-5 w-3/4">
            <div className="text-xs text-gray-500 flex gap-10 mb-5">
                Date Posted: {(announcement.datePosted.toDateString())}
                {announcement.type && announcement.type.length > 0 && (
                <p> Type: {announcement.type.join(", ")} </p>
            )} 
            </div>
            
            
            {/* Title with truncation */}
            <div className="relative">
              <div className={`text-lg font-bold ${!showFullTitle ? "line-clamp-2" : ""}`}>
                {showFullTitle ? announcement.title : announcement.title}
              </div>
            </div>
            
            {/* Content with truncation */}
            <div className="text-sm text-gray-600 text-justify overflow-hidden">
              <div className={`${!showFullContent ? "line-clamp-5" : ""}`}>
                {showFullContent ? announcement.description : announcement.description}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end justify-between gap-2 w-1/4">
            <div className="relative">
                
                <div className="relative">
                <button
                className="text-gray-700 px-3 py-1 rounded-full cursor-pointer"
                onClick={() =>
                    setShowDropdown(showDropdown === index ? null : index)
                }
                >
                <Ellipsis size={18} />
                </button>

                {showDropdown === index && (
                    <div className="absolute right-0 mt-1 w-auto bg-white rounded-md shadow-lg z-20 border border-gray-200">
                        <button
                        className="px-4 py-2 text-sm w-full text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                        onClick={() => handleEditClick(announcement)}
                        >
                            <Eye size={16} />
                            <span>View</span>
                        </button>
                    
                        <button
                            className="px-4 py-2 text-sm w-full text-red-600 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                            onClick={() => {
                                if (confirm("Are you sure you want to delete this announcement?")) {
                                    toastSuccess(`You have successfully deleted announcement.`);
                                    handleDelete(announcement.announcementId);
                                    setShowDropdown(null);
                                } 
                                else {return};
                            }}
                        >
                            <Trash2 size={16} />
                            <span>Delete</span>
                        </button>
                    </div>
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
            ) : <div className="bg-amber-300 h-32 w-32 aspect-square rounded-md place-content-center">
                    <p className="place-self-center">No image</p>
                </div>} 
          </div>
        </div>
        </div>
      ))}
    </div>
  );
}