"use client";

import { 
  CalendarDays, 
  Bookmark, 
  Heart, 
  Bell, 
  Megaphone 
} from "lucide-react";

type AnnouncementsSidebarProps = {
  activeFilter?: string;
  setActiveFilter?: (filter: string) => void;
};

const AnnouncementsSidebar = ({ activeFilter = "", setActiveFilter }: AnnouncementsSidebarProps) => {
  // Filter categories with their respective icons
  const sidebarItems = [
    { id: 'all', label: 'Announcements', filterValue: '', icon: Megaphone },
    { id: 'general', label: 'General', filterValue: 'General Announcement', icon: Bell },
    { id: 'donations', label: 'Donation Update', filterValue: 'Donation Update', icon: Heart },
    { id: 'event', label: 'Event Update', filterValue: 'Event Update', icon: CalendarDays },
    { id: 'saved', label: 'Saved Announcements', filterValue: 'Saved', icon: Bookmark },
  ];

  // Handle filter selection - only one at a time
  const handleFilterClick = (filterValue: string) => {
    if (setActiveFilter) {
      // If the current filter is already active, do nothing
      // Otherwise, set the new filter
      if (activeFilter !== filterValue) {
        setActiveFilter(filterValue);
      }
    }
  };

  return (
    <div className="w-[200px] h-max">
      <ul className="flex flex-col gap-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.filterValue === activeFilter;
          
          return (
            <li key={item.id}>
              <button
                onClick={() => handleFilterClick(item.filterValue)}
                className={`flex items-center gap-3 p-2 w-full text-left rounded-md transition-all ${
                  isActive 
                    ? 'font-medium' 
                    : 'text-gray-700'
                }`}
              >
                <Icon className={`size-6 ${isActive ? 'font-semibold' : 'text-gray-500'}`} />
                {!isActive ? <span className="relative group">
                  {item.label}
                  {!isActive && (
                    <span className="left-1/2 h-0.5 w-0 transition-all duration-300 group-hover:left-0 group-hover:w-full absolute -bottom-0.5 bg-[#0856BA]"></span>
                  )}
                </span> : 
                <span className="relative group font-semibold  border-b-3 border-blue-500">
                  {item.label}
                  {!isActive && (
                    <span className="left-1/2 h-0.5 w-0 transition-all duration-300 group-hover:left-0 group-hover:w-full absolute -bottom-0.5 bg-[#0856BA]"></span>
                  )}
                </span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AnnouncementsSidebar;