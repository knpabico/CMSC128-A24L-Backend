"use client";

import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

export default function SampleAdminPage() {
  const [activeTab, setActiveTab] = useState("Posted");
  const tableRef = useRef(null);
  const [headerWidth, setHeaderWidth] = useState("100%");
  const [isSticky, setIsSticky] = useState(false);

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
                className={`w-full py-3 flex items-center justify-center rounded-t-2xl font-semibold text-base ${
                  activeTab === tab
                    ? "text-[var(--primary-blue)] bg-white"
                    : "text-blue-200 bg-white"
                }`}
              >
                {tab}
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