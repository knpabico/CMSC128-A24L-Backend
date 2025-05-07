"use client";

import { useEffect, useRef, useState } from "react";
import { useEvents } from "@/context/EventContext";
import { Event } from "@/models/models";
import Link from "next/link";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Calendar, CheckCircle, ChevronDown, ChevronRight, Clock, SquarePen, Eye, FilePlus2, MapPin, Trash2, UserCheck } from "lucide-react";
import ModalInput from "@/components/ModalInputForm";
import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { Button } from "@mui/material";
import { useRsvpDetails } from "@/context/RSVPContext";
import { useRouter } from "next/navigation";
import { useMemo } from "react";


export default function EventPageAdmin() {
  const router = useRouter();
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

  const [toggles, setToggles] = useState(
    events.map(() => false) // initialize all to false
  );

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

;
  const [activeTab, setActiveTab] = useState("Accepted");
  const tabs = ["Accepted", "Draft", "Pending", "Rejected"];
  
  if (!events) return <div>Loading Events...</div>;

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


  const filteredEvents = useMemo(() => {
    return sortedEvents.filter((event) => {
      // Filter events based on the activeTab (status)
      if (activeTab === "Draft") {
        return event.status === "Draft" && event.creatorType === "admin"; // Only show admin drafts
      }
      return event.status === activeTab; // For other tabs, filter by status only
    });
  }, [sortedEvents, activeTab]);

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

    const handleScroll = () => {
      if (!tableRef.current) return;

      const tableRect = tableRef.current.getBoundingClientRect();

      if (tableRect.top <= 0 && !isSticky) {
        setIsSticky(true);
        setHeaderWidth(tableRect.width.toString());
      } else if (tableRect.top > 0 && isSticky) {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    if (tableRef.current) {
      setHeaderWidth(tableRef.current.offsetWidth.toString());
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isEditing, events, editingEventId]);

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
      setButton("");
    };  
    
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/admin-dashboard" className="hover:underline">
            Home
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
              onClick={() => router.push("/admin-dashboard/organize-events/add")}
              className="bg-[var(--primary-blue)] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-blue-600"
            > 
            + Create Event
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-3">
  
        <div className="w-full flex gap-2">
          {tabs.map((tab) => {
            const eventCount = events.filter((event: Event) => {
              if (tab === "Draft") {
                return event.status === "Draft" && event.creatorType === "admin"; // Only count admin drafts
              }
              return event.status === tab; // Count all events matching the tab's status
            }).length;;
            const eventCountBgColor = "bg-[var(--primary-blue)]";

            const tabClass = `w-full flex flex-col items-center justify-end rounded-t-2xl overflow-hidden pt-0.4 cursor-pointer ${
              activeTab === tab ? eventCountBgColor : "bg-white"
            }`;

            const barClass = `w-full h-1 transition-colors ${
              activeTab === tab ? eventCountBgColor : "bg-transparent"
            }`;

            const tabTextClass = `w-full py-3 flex items-center justify-center gap-1 rounded-t-2xl font-semibold text-base ${
              activeTab === tab
                ? "text-[var(--primary-blue)] bg-white"
                : "text-blue-200 bg-white"
            }`;

            const eventCountClass = `h-6 w-6 rounded-full flex items-center justify-center text-[13px] text-white ${
              activeTab === tab? "bg-amber-400" : "bg-blue-200"
            }`;

            return (
              <div key={tab} onClick={() => setActiveTab(tab)} className={tabClass}>
                {/* Blue bar above active tab */}
                <div className={barClass} />
                <div className={tabTextClass}>
                  {tab}
                  <div className={eventCountClass}>{eventCount}</div>
                </div>
              </div>
            );
          })}
        </div>
  
          {/* Filter Bar */}
          <div className="bg-white rounded-xl flex gap-3 p-2.5 pl-4 items-center">
            <div className="text-sm font-medium">Filter by:</div>
  
            <div className="relative"> {/* Added a wrapper for positioning */}
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}            
                className="bg-gray-300 pl-2 pr-1 py-1 rounded-md flex gap-1 items-center justify-between text-sm font-medium cursor-pointer hover:bg-gray-400"
              >
                <option value="posted-newest">Newest</option>
                <option value="posted-oldest">Earliest</option>
                <option value="alphabetical">A-Z</option>
              </select>
            </div>
          </div>
  
          <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
            <div className="rounded-xl overflow-hidden border border-gray-300 relative" ref={tableRef}>
            {/* Sticky header - will stick to top of viewport when scrolled */}
            <div
              className={`bg-blue-100 w-full flex gap-4 p-4 text-xs z-10 shadow-sm ${isSticky ? "fixed top-0" : ""}`}
              style={{ width: isSticky ? headerWidth : "100%" }}
            >
              <div className="w-1/2 flex items-center justify-baseline font-semibold">
                Event Title
              </div>
              <div className="w-[450px]"></div>
              <div className="w-1/8 flex justify-left items-center font-semibold"> Details </div>
              <div className="w-[2000px]"></div>
              <div className="w-1/2 flex justify-left items-center font-semibold"> Status </div>
              <div className="w-1/2 flex justify-end items-center">
                <div className="w-[450px] flex items-center justify-center font-semibold">Actions</div>
                <div className="w-1/6 flex items-center justify-center font-semibold"></div>
                <div className="w-1/6 flex items-center justify-center"></div>
              </div>
            </div>
  
            {/* Spacer div to prevent content jump when header becomes fixed */}
            {filteredEvents.length === 0 ? (
              <p className="w-full flex justify-center p-10 text-gray-500">No {activeTab} events found.</p>
            ) : (
              <>
                {isSticky && <div style={{ height: "56px" }}></div>}
                {/* Loop over filtered events */}
                {filteredEvents.map((e: Event, index: number) => (
                  <div
                    key={e.eventId}
                    className={`w-full flex gap-4 border-t border-gray-300 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50`}
                  >
                    {/* title + description */}
                    <div className="w-1/2 flex flex-col p-4 gap-1">
                      <div className="text-base font-bold">{e.title}</div>
                      <div className="text-sm text-gray-600">
                        <p className="font-normal">{e.description.split(' ').slice(0, 5).join(' ')}{e.description.split(' ').length > 4 ? '...' : ''}</p>
                        <p className="text-xs font-light"> Proposed by: {e.creatorName ?? "Admin"}</p>
                      </div>
                    </div>
  
                    {/* Other components for event info */}
                    <div className="w-full flex justify-between items-center p-5 text-gray-600">
                      {/* Event Details beside buttons */}
                      <div className="flex items-center gap-4 justify-start w-1/2">
                        {/* Event Date */}
                        <div className="flex gap-1 items-center justify-center">
                          <Calendar size={16} />
                          <p className="text-xs">{e.date}</p>
                        </div>
  
                        {/* Event Time */}
                        <div className="flex gap-1 items-center justify-center">
                          <Clock size={16} />
                          <p className="text-xs">{e.time}</p>
                        </div>
  
                        {/* Where */}
                        <div className="flex gap-1 items-center justify-center">
                          <MapPin size={16} />
                          <p className="text-xs truncate">{e.location}</p>
                        </div>
  
                        {/* num of attendees */}
                        <div className="flex gap-1 items-center justify-center">
                          <UserCheck size={16} />
                          <p className="text-xs truncate">{e.numofAttendees} Going</p>
                        </div>
                      </div>
                    </div>
  
                    {/* Other components for event info */}
                    <div className="w-full flex justify-between items-center p-5">
                      {/* Status Badge */}
                      <span
                        className={`ml-4 px-5 py-2 text-xs font-medium border rounded-full ${
                          e.status === "Accepted"
                            ? "mx-[180px] bg-green-100 text-green-800 border-green-600"
                            : e.status === "Pending"
                            ? "mx-[250px] bg-yellow-100 text-yellow-800 border-yellow-600"
                            : e.status === "Rejected"
                            ? "bg-red-100 text-red-800 border-red-600"
                            : "mx-[260px] bg-gray-100 text-gray-800 border-gray-600"
                        }`}
                      >
                        {e.status === "Accepted"
                          ? "Approved"
                          : e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                      </span>
  
                      {/* Buttons */}
                      <div className="flex items-center gap-x-5">
                        {e.status === "Pending" ? (
                          <>
                            <div className="flex items-center gap-x-4">
                              <div
                                onClick={() => handleViewEventAdmin(e)}
                                className="w-3/2 flex items-center justify-center cursor-pointer hover:text-black"
                              >
                                <Eye size={20} className="text-gray-500 hover:text-yellow-400" />
                              </div>
                              <div
                                onClick={() => {
                                  resetFormState();
                                  setEdit(true);
                                  setEditingEventId(e.eventId);
                                  setShowForm(true);
                                }}
                                className="w-3/2 flex items-center justify-center cursor-pointer hover:text-black"
                              >
                                <SquarePen size={20} className="text-gray-500 hover:text-blue-400" />
                              </div>
                              <div
                                onClick={() => handleDelete(e.eventId)}
                                className="w-3/2 flex items-center justify-center cursor-pointer hover:text-black"
                              >
                                <Trash2 size={20} className="text-gray-500 hover:text-red-400" />
                              </div>
                            </div>
                            <div className="flex items-center gap-x-2 ml-5">
                              <button
                                onClick={() => addEvent(e, true, false)}
                                className="px-4 py-2 bg-green-500 text-white rounded-md text-black hover:bg-green-300"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(e.eventId)}
                                className="px-4 py-2 bg-red-500 text-white rounded-md text-black hover:bg-red-300"
                              >
                                Reject
                              </button>
                            </div>
                          </>
                        ) : e.status === "Accepted" ? (
                          <>
                            <div className="w-[380px] flex items-center justify-center gap-x-4">
  
                              <button
                                onClick={() => alert(
                                  `Placeholder: Create donation drive for event ID ${events.eventId}`
                                )}
                                className="text-gray-600 hover:underline cursor-pointer"
                              >
                                Create Donation Drive
                              </button>
                              
                              <div
                              onClick={() => handleViewEventAdmin(e)}
                              className="text-[var(--primary-blue)] hover:underline cursor-pointer"
                              >
                              View Details
                              </div>
                            
                            </div>
                          </>
                        ) : e.status === "Rejected" ? (
                          <div className="w-[550px] flex items-center justify-center">
                            <div
                              onClick={() => handleViewEventAdmin(e)}
                              className="text-[var(--primary-blue)] hover:underline cursor-pointer"
                            >
                              View Details
                            </div>
                          </div>
                        ) : e.status === "Draft" && e.creatorType === "admin" && (
                          <>
                            <div className="flex items-center gap-x-4">
                              <div
                                onClick={() => handleViewEventAdmin(e)}
                                className="w-3/2 flex items-center justify-center cursor-pointer hover:text-black"
                              >
                                <Eye size={20} className="text-gray-500 hover:text-yellow-400" />
                              </div>
                              <div
                                onClick={() => {
                                  resetFormState();
                                  setEdit(true);
                                  setEditingEventId(e.eventId);
                                  setShowForm(true);
                                }}
                                className="w-3/2 flex items-center justify-center cursor-pointer hover:text-black"
                              >
                                <SquarePen size={20} className="text-gray-500 hover:text-blue-400" />
                              </div>
                              <div
                                onClick={() => handleDelete(e.eventId)}
                                className="w-3/2 flex items-center justify-center cursor-pointer hover:text-black"
                              >
                                <Trash2 size={20} className="text-gray-500 hover:text-red-400" />
                              </div>
                            </div>
                            <div className="flex items-center gap-x-2 ml-5">
                              <button
                                disabled
                                className="px-4 py-2 text-white"
                              >
                                Approve
                              </button>
                              <button
                                disabled
                                className="px-4 py-2 text-white"
                              >
                                Reject
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
            </div>
          </div>
        </div>
      
      </div>
    );
  }