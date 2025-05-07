"use client";

import { useEffect, useRef, useState } from "react";
import { useEvents } from "@/context/EventContext";
import { Event } from "@/models/models";
import Link from "next/link";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Calendar, ChevronDown, ChevronRight, Clock, FilePlus2, MapPin, Trash2, UserCheck } from "lucide-react";
import ModalInput from "@/components/ModalInputForm";
import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { Button } from "@mui/material";
import { useRsvpDetails } from "@/context/RSVPContext";
import { useRouter } from "next/navigation";



export default function EventPageAdmin() {
  const params = useParams();
  const {
    events,
    isLoading,
    setShowForm,
    showForm,
    handleSave,
    handleEdit,
    handleDelete,
    date,
    handleReject,
    addEvent,
    handleFinalize,
    handleViewEventAdmin,
    handleImageChange,
    setEventDate,
    image,
    setEventImage,
    description,
    setEventDescription,
    title,
    setEventTitle,
    location,
    setEventLocation,
    time,
    setEventTime,
    fileName,
    setFileName,
  } = useEvents();

  const evId = params?.eventId as string;
  const ev = events.find((e: Event) => e.eventId === evId);
  //const defaultImageUrl = "https://firebasestorage.googleapis.com/v0/b/cmsc-128-a24l.firebasestorage.app/o/default%2Ftemp_event_image.jpg?alt=media&token=49ed44c0-225c-45d3-9bd2-e7e44d0fb2d0"


  const { rsvpDetails, alumniDetails, isLoadingRsvp } = useRsvpDetails();
  const [isEditing, setEdit] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibility, setVisibility] = useState("default");
  const [selectedBatches, setSelectedBatches] = useState<any[]>([]);
  const [selectedAlumni, setSelectedAlumni] = useState<any[]>([]);

  const [sortBy, setSortBy] = useState("latest");
  const [statusFilter, setStatusFilter] = useState("Accepted");

  const tableRef = useRef<HTMLDivElement | null>(null);
  const [headerWidth, setHeaderWidth] = useState("100%");
  const [isSticky, setIsSticky] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [selectedButton, setButton] = useState("");

  const [filterSearch, setFilterSearch] = useState("all");
  const [searchBatches, setSearchBatches] = useState<any[]>([]);
  const [searchAlumni, setSearchAlumni] = useState<any[]>([]);

  const [rsvpFilter, setRsvpFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("Posted");
  const tabs = ["Posted", "Pending", "Rejected"];
  
  const sortedEvents = [...events].sort((x, y) => {
    switch (sortBy) {
      case "posted-newest":
        const dateX = x.datePosted?.seconds
          ? new Date(x.datePosted.seconds * 1000)
          : new Date(0);
        const dateY = y.datePosted?.seconds
          ? new Date(y.datePosted.seconds * 1000)
          : new Date(0);
        return dateY.getTime() - dateX.getTime();

      case "posted-oldest":
        const oldDateX = x.datePosted?.seconds
          ? new Date(x.datePosted.seconds * 1000)
          : new Date(0);
        const oldDateY = y.datePosted?.seconds
          ? new Date(y.datePosted.seconds * 1000)
          : new Date(0);
        return oldDateX.getTime() - oldDateY.getTime();

      case "alphabetical": {
          return x.title.toLowerCase().localeCompare(y.title.toLowerCase());
        }

      default:
        return 0;
    }
  });

  const filteredEvents =
    statusFilter === "all"
      ? sortedEvents
      : sortedEvents.filter((event) => event.status === statusFilter);

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    const dateObj =
      typeof date === "object" && date.toDate ? date.toDate() : new Date(date);

    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    const eventToEdit = events.find((g: Event) => g.eventId === editingEventId);
    setVisibility("all");
    setSelectedAlumni([]);
    setSelectedBatches([]);

    if (eventToEdit) {
      setEventTitle(eventToEdit.title);
      setEventDescription(eventToEdit.description);
      setEventImage(eventToEdit.image);
      setEventDate(eventToEdit.date);
      setEventTime(eventToEdit.time);
      setEventLocation(eventToEdit.location);
      setShowForm(true);

      // Properly check targetGuests for alumni and batches
      if (eventToEdit.targetGuests && eventToEdit.targetGuests.length > 0) {
        // Check if the first item is a batch (e.g., a string of length 4)
        if (eventToEdit.targetGuests[0].length === 4) {
          setSelectedBatches(eventToEdit.targetGuests); // Set the batches
          setVisibility("batch"); // Set visibility to batches
        } else {
          setSelectedAlumni(eventToEdit.targetGuests); // Set the alumni
          setVisibility("alumni"); // Set visibility to alumni
        }
      }
    }

    const handleScroll = () => 
    {
      if (!tableRef.current) return;

      const tableRect = tableRef.current.getBoundingClientRect();

      if (tableRect.top <= 0 && !isSticky) 
      {
        setIsSticky(true);
        setHeaderWidth(tableRect.width.toString());
      } else if (tableRect.top > 0 && isSticky) {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    if (tableRef.current) 
    {
      setHeaderWidth(tableRef.current.offsetWidth.toString());
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isSticky, isEditing, events, editingEventId]);

  const formComplete =
    title.trim() !== "" &&
    description.trim() !== "" &&
    date.trim() !== "" &&
    time.trim() !== "" &&
    location.trim() !== "";

    const resetFormState = () => {
      setEdit(false);
      setEventTitle(""); 
      setEventDescription("");
      setEventDate("");
      setEventTime("");
      setEventLocation("");
      setEventImage("");
      setVisibility("all");
      setSelectedBatches([]);
      setSelectedAlumni([]);
      setFileName("");
      setErrorMessage("");
              setEdit(false);
              setEventTitle("");
              setEventTime("");
              setEventDescription("");
              setEventDate("");
              setEventLocation("");
              setFileName("");
              setEventImage(null);
              setSelectedAlumni([]);
              setSelectedBatches([]);
              setVisibility("all");
              setButton("");
    };  
    
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/admin-dashboard" className="hover:underline">
          Admin Dashboard
        </Link>
        <ChevronRight size={15} />
        <span>Manage Events</span>
      </div>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">
            Manage Events
          </div>
          <button
            onClick={() => {
              resetFormState();
              setShowForm(true);
            }}
            className="bg-[var(--primary-blue)] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-blue-600"
          > 
          + Create Event
          </button>
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