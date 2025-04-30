"use client";

import { ChevronDown, ChevronRight, Ellipsis, Trash2, Eye } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

export default function SampleAdminPage() {
  const [activeTab, setActiveTab] = useState("Posted");
  const tableRef = useRef(null);
  const [headerWidth, setHeaderWidth] = useState("100%");
  const [isSticky, setIsSticky] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const tabs = ["Posted", "Pending", "Rejected"];

  const donationDrives = [
    { title: "Donation Drive #1", details: "Donation Drive Details" },
    { title: "Donation Drive #2", details: "Donation Drive Details" },
    { title: "Donation Drive #3", details: "Donation Drive Details" },
    { title: "Donation Drive #4", details: "Donation Drive Details" },
    { title: "Donation Drive #5", details: "Donation Drive Details" },
    { title: "Donation Drive #6", details: "Donation Drive Details" },
    { title: "Donation Drive #7", details: "Donation Drive Details" },
    { title: "Donation Drive #8", details: "Donation Drive Details" },
    { title: "Donation Drive #9", details: "Donation Drive Details" },
    { title: "Donation Drive #10", details: "Donation Drive Details" },
    { title: "Donation Drive #11", details: "Donation Drive Details" },
    { title: "Donation Drive #12", details: "Donation Drive Details" },
    { title: "Donation Drive #13", details: "Donation Drive Details" },
    { title: "Donation Drive #14", details: "Donation Drive Details" },
    { title: "Donation Drive #15", details: "Donation Drive Details" },
  ];

  const [toggles, setToggles] = useState(
    donationDrives.map(() => false) // initialize all to false
  );

  // Sample announcement data
  const sampleAnnouncement = {
    date: "April 30, 2025",
    title: "Announcement Title Announcement Title Announcement Title Announcement Title Announcement Titleaaaaaaaaaaa",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc dolor mauris, scelerisque vel lobortis sit amet, iaculis ut odio. Duis id neque erat. Proin lacinia pretium lorem nec venenatis. Ut a dui at enim tincidunt vulputate eget at lorem. Donec molestie ut turpis ut ornare. Nam quam augue, convallis quis pharetra non, elementum vel erat. Suspendisse scelerisque nisl turpis, vitae consectetur ante vestibulum ac. Nullam nisl velit, semper vestibulum cursus sit amet, varius ac mauris. Duis lacinia tincidunt vehicula. Donec elementum suscipit nunc, vitae volutpat libero ultricies sit amet. Donec lacinia ex at blandit finibus. Cras vel viverra nulla. Pellentesque congue, erat eget feugiat eleifend, augue diam euismod urna, ac pulvinar dui nunc condimentum nulla. Fusce dapibus ac nisl sed posuere. Morbi faucibus odio magna, faucibus vehicula turpis pulvinar vel. Ut mattis ultricies luctus. Suspendisse lacinia eu magna posuere suscipit. Maecenas id libero rhoncus, consequat sem eget, ullamcorper augue. Mauris ut porta purus, quis varius erat. Etiam tortor lectus, eleifend in vehicula eu, sollicitudin sed erat. Nam vel rutrum leo. In hac habitasse platea dictumst. In enim ipsum, luctus et turpis non, feugiat pharetra erat. Nam posuere justo eget dui consectetur ullamcorper. Proin vel venenatis nisi. Morbi eu fringilla massa. Vivamus vel felis convallis, imperdiet velit iaculis, imperdiet nibh. Mauris ligula sapien, placerat eget efficitur ac, luctus eu erat. Suspendisse facilisis dolor risus, elementum pretium eros malesuada sit amet. Curabitur at eleifend lacus. Phasellus vitae vulputate tortor. Vestibulum ornare mattis magna sed blandit. Nullam et posuere ex, id accumsan ex. Maecenas sed nulla a elit accumsan faucibus ac quis elit. Suspendisse vel euismod arcu. Pellentesque interdum tellus tortor, ut porta turpis sagittis non. In hac habitasse platea dictumst. Maecenas id blandit justo. Donec ac hendrerit nisl, non porta justo. Vestibulum tempor urna vel justo pharetra vulputate. Sed vel nisl pretium, dignissim est vel, consectetur tortor. Curabitur vitae leo commodo, finibus urna eget, aliquam diam. Cras metus quam, sodales et vehicula vitae, ultricies eu est. Curabitur suscipit finibus urna, ac condimentum velit pretium eget. Etiam ut maximus lectus. Pellentesque in nulla elit. Nulla metus augue, bibendum nec condimentum quis, euismod congue eros. Etiam in bibendum metus. Nulla ornare odio non massa pellentesque porttitor. Phasellus a dolor at felis tempor hendrerit vel eget nunc. Nullam varius, nibh at ullamcorper rhoncus, turpis tellus cursus massa, non venenatis eros velit ut neque. Suspendisse vel justo rhoncus, ullamcorper metus eu, convallis urna. Duis sed tellus orci. Nam orci nunc, sodales a purus non, aliquet rhoncus ligula. Aliquam feugiat auctor consequat. Vivamus tellus neque, semper in finibus quis, ullamcorper commodo risus. Nulla laoreet quis odio non tempus. Vivamus finibus tellus arcu, a commodo enim maximus et. Sed maximus consectetur nulla, ut gravida diam pulvinar a. Nunc dapibus, magna vel mollis rhoncus, mi felis luctus odio, eu elementum nibh turpis eget ipsum."
  };

  const [showFullTitle, setShowFullTitle] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

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

  // Function to handle delete button click
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      alert("Announcement deleted");
    }
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
        <div>
          Home
        </div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div>
          Manage Donation Drives
        </div>
      </div>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">
            Manage Donation Drive
          </div>
          <div className="bg-[var(--primary-blue)] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-blue-600">
            + Create Donation Drive
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Tabs */}
        <div className="w-full flex gap-2">
          {tabs.map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex flex-col items-center justify-end rounded-t-2xl overflow-hidden pt-0.4 cursor-pointer ${
                activeTab === tab ? "bg-[var(--primary-blue)]" : "bg-white"
              }`}
            >
              {/* Blue bar above active tab */}
              <div
                className={`w-full h-1 transition-colors ${
                  activeTab === tab ? "bg-[var(--primary-blue)]" : "bg-transparent"
                }`}
              ></div>
              <div
                className={`w-full py-3 flex items-center justify-center gap-1 rounded-t-2xl font-semibold text-base ${
                  activeTab === tab
                    ? "text-[var(--primary-blue)] bg-white"
                    : "text-blue-200 bg-white"
                }`}
              >
                {tab} 
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-[13px] text-white ${
                    activeTab === tab
                      ? "bg-amber-400"
                      : "bg-blue-200"
                  }`}
                >
                  50
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl flex gap-3 p-2.5 pl-4 items-center">
          <div className="text-sm font-medium">Filter by:</div>
          <div className="bg-gray-300 pl-2 pr-1 py-1 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-400">
            <div className="text-xs">Any Date</div>
            <ChevronDown size={20} />
          </div>
          <div className="bg-gray-300 pl-2 pr-1 py-1 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-400">
            <div className="text-xs">Status</div>
            <ChevronDown size={20} />
          </div>
        </div>

        {/* Announcement Card with Truncation */}
        <div className="bg-white flex justify-between rounded-2xl overflow-hidden p-5">
          <div className="flex flex-col gap-1 pr-5 w-3/4">
            <div className="text-xs text-gray-500">
              Date Posted: {sampleAnnouncement.date}
            </div>
            
            {/* Title with truncation */}
            <div className="relative">
              <div className={`text-base font-bold ${!showFullTitle ? "line-clamp-2" : ""}`}>
                {showFullTitle ? sampleAnnouncement.title : sampleAnnouncement.title}
              </div>
            </div>
            
            {/* Content with truncation */}
            <div className="text-[12px] text-gray-600 overflow-hidden">
              <div className={`${!showFullContent ? "line-clamp-5" : ""}`}>
                {showFullContent ? sampleAnnouncement.content : sampleAnnouncement.content}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end justify-between gap-2 w-1/4">
            <div className="relative" ref={dropdownRef}>
              <div 
                className="cursor-pointer hover:bg-gray-100 p-1 rounded-full"
                onClick={toggleDropdown}
              >
                <Ellipsis size={18} />
              </div>
              
              {/* Dropdown menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                  <ul className="py-1">
                    <li 
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                      onClick={handleView}
                    >
                      <Eye size={16} />
                      <span>View</span>
                    </li>
                    <li 
                      className="px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2 cursor-pointer"
                      onClick={handleDelete}
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
            <div className="bg-amber-300 h-full aspect-square rounded-md">
              {/* Image placeholder */}
            </div>
          </div>
        </div>

        {/* Table Container with Fixed Height for Scrolling */}
        <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
          {/* This is the key: Adding a fixed height container with overflow */}
          <div className="rounded-xl overflow-hidden border border-gray-300 relative" ref={tableRef}>
            {/* Sticky header - will stick to top of viewport when scrolled */}
            <div 
              className={`bg-blue-100 w-full flex gap-4 p-4 text-xs z-10 shadow-sm ${
                isSticky ? 'fixed top-0' : ''
              }`}
              style={{ width: isSticky ? headerWidth : '100%' }}
            >
              <div className="w-1/2 flex items-center justify-baseline font-semibold">
                Donation Drive Info
              </div>
              <div className="w-1/2 flex justify-end items-center">
                <div className="w-1/6 flex items-center justify-center font-semibold">Active</div>
                <div className="w-1/6 flex items-center justify-center font-semibold">Actions</div>
                <div className="w-1/6 flex items-center justify-center"></div>
              </div>
            </div>
            
            {/* Spacer div to prevent content jump when header becomes fixed */}
            {isSticky && <div style={{ height: '56px' }}></div>}

            {/* Dynamic rows */}
            {donationDrives.map((drive, index) => (
              <div
                key={index}
                className={`w-full flex gap-4 border-t border-gray-300 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-blue-50`}
              >
                <div className="w-1/2 flex flex-col p-4 gap-1">
                  <div className="text-base font-bold">{drive.title}</div>
                  <div className="text-sm text-gray-600">{drive.details}</div>
                </div>
                <div className="w-1/2 flex items-center justify-end p-5">
                  <div className="w-1/6 flex items-center justify-center">
                    <div
                      onClick={() =>
                        setToggles((prev) =>
                          prev.map((val, i) => (i === index ? !val : val))
                        )
                      }
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                        toggles[index] ? "bg-[var(--primary-blue)]" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          toggles[index] ? "translate-x-6" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="w-1/6 flex items-center justify-center">
                    <div className="text-[var(--primary-blue)] hover:underline cursor-pointer">View Details</div>
                  </div>
                  <div className="w-1/6 flex items-center justify-center">
                    <Trash2 size={20} className="text-gray-500 hover:text-red-500 cursor-pointer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}