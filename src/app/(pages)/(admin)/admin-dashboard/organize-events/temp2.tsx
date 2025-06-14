"use client";

import { useEffect, useRef, useState } from "react";
import { useEvents } from "@/context/EventContext";
import { Event } from "@/models/models";
import Link from "next/link";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Calendar, Clock, FilePlus2, MapPin, UserCheck } from "lucide-react";
import ModalInput from "@/components/ModalInputForm";
import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { Button } from "@mui/material";
import { useRsvpDetails } from "@/context/RSVPContext";
import { useRouter } from "next/navigation";
import { useDonationDrives } from "@/context/DonationDriveContext"


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
  //const defaultImageUrl = "https://firebasestorage.googleapis.com/v0/b/cmsc-128-a24l.firebasestorage.app/o/default%2Fdefault-image.jpg?alt=media&token=5835562a-d7a0-48a0-9b07-0b2151c949fb"

  const { handleAddEventRelated } = useDonationDrives()

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
    <div>
      {/* will be used for the filter */}
      {/* {(() => {
        // Group alumni by their ID and compile the events they RSVPed to
        const grouped: Record<string, { alum: any; events: string[] }> = {};

        events.forEach((f: Event) => {
          f.rsvps.forEach((rsvpId) => {
            const rsvp = rsvpDetails[rsvpId]; // RSVP Details
            const alum = alumniDetails[rsvp?.alumniId]; // Alumni Details

            if (!rsvp || !alum) return;

            // Check if alumni is part of the selected batch or selected alumni
            const inBatch = searchBatches.includes(
              alum.studentNumber?.slice(0, 4)
            );
            const inAlumni = searchAlumni.includes(alum.email);

            // Decide if this RSVP should be shown based on the current visibility setting
            const matchesFilter =
              filterSearch === "all" ||
              (filterSearch === "batch" && inBatch) ||
              (filterSearch === "alumni" && inAlumni);

            if (!matchesFilter) return;

            // If this alumni isn't already in the grouped object, add them
            if (!grouped[alum.alumniId]) {
              grouped[alum.alumniId] = { alum, events: [] };
            }

            // Add the current event
            grouped[alum.alumniId].events.push(`${f.title} - ${rsvp.status}`);
          });
        });

        return (
          <ul>
            {Object.values(grouped).map(({ alum, events }) => (
              <li key={alum.alumniId}>
                <strong>{alum.firstName} ({alum.email}) - {alum.studentNumber}</strong>
                <ul>
                  {events.map((event, i) => (
                    <li key={`${alum.alumniId}-${i}`}>{event}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        );
      })()} */}
      <Breadcrumbs
        items={[
          { href: "/admin-dashboard", label: "Admin Dashboard" },
          { label: "Events" },
        ]}
      />
      {/* Head & Body */}
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Events</h1>
        {/* Filter Buttons */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setStatusFilter("Accepted")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                statusFilter === "Accepted"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter("Pending")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                statusFilter === "Pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter("Rejected")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                statusFilter === "Rejected"
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setStatusFilter("Draft")}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                statusFilter === "Draft"
                  ? "bg-gray-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              Draft
            </button>
          </div>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex justify-start items-center">
          <label htmlFor="sort" className="mr-2 font-medium text-gray-700">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="posted-newest">Newest</option>
            <option value="posted-oldest">Earliest</option>
            <option value="alphabetical">A-Z</option>
          </select>
          <button
            // onClick={() => {
            //   resetFormState();
            //   setShowForm(true);
            // }}
            onClick={() => router.push("/admin-dashboard/organize-events/add")}

            className="bg-[#D9D9D9] text-black py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 hover:text-white flex items-center gap-2 mx-4"
          >
            <FilePlus2 className="w-5 h-5" /> Create Event
          </button>
        </div>

        {isLoading && <div className="text-center text-lg">Loading...</div>}
        {/* Event List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            {statusFilter === "Accepted"
              ? "Approved Events"
              : statusFilter === "Pending"
              ? "Pending Events"
              : statusFilter === "Rejected"
              ? "Rejected Events"
              : "Events Draft"}
          </h2>
          {filteredEvents.length === 0 ? (
            <p className="text-gray-500">No Events found.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredEvents.map((e: Event) => {
                return (
                  <div
                    key={e.eventId}
                    className="border rounded-lg shadow-sm hover:shadow-md bg-white overflow-hidden flex flex-row"
                  >
                    {/* Image Section */}
                    <div
                      className="cursor-pointer w-1/4 min-w-64 bg-gray-200"
                      onClick={() => handleViewEventAdmin(events)}
                    >
                      {e.image ? (
                        <img
                          src={e.image}
                          alt={e.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div
                      className="p-4 flex-grow cursor-pointer"
                      onClick={() => handleViewEventAdmin(events)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-semibold truncate flex-1">
                          {e.title}
                        </h2>
                        <span
                          className={`ml-4 px-2 py-0.5 text-xs font-medium rounded-full ${
                            e.status === "Accepted"
                              ? "bg-green-100 text-green-800"
                              : e.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : e.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {e.status === "Accepted"
                            ? "Approved"
                            : e.status.charAt(0).toUpperCase() +
                              e.status.slice(1)}
                        </span>
                      </div>

                      {/* Description */}
                      <div className="mb-5 text-sm max-h-[40px] overflow-hidden text-clip">
                        <p className="text-start">{e.description}</p>
                      </div>

                      {/* Event Details */}
                      <div className="mt-5">
                        <div className="flex justify-between items-center gap-4">
                          {/* Event Date */}
                          <div className="flex gap-1 items-center w-1/3 justify-center">
                            <Calendar size={16} />
                            <p className="text-xs">{e.date}</p>
                          </div>

                          {/* Event Time */}
                          <div className="flex gap-1 items-center w-1/3 justify-center">
                            <Clock size={16} />
                            <p className="text-xs">{e.time}</p>
                          </div>

                          {/* Where */}
                          <div className="flex gap-1 items-center w-1/3 justify-center">
                            <MapPin size={16} />
                            <p className="text-xs truncate">{e.location}</p>
                          </div>

                          {/* num of attendees */}
                          <div className="flex gap-1 items-center w-1/3 justify-center">
                            <UserCheck size={16} />
                            <p className="text-xs truncate">
                              {e.numofAttendees} Going
                            </p>
                          </div>

                          <p
                            onClick={() =>
                              alert(
                                `Placeholder: Create donation drive for event ID ${events.eventId}`
                              )
                            }
                          >
                            Create Donation Drive
                          </p>

                          {/* Date of Post */}
                          <div className="flex gap-1 items-center w-1/3 justify-center">
                            <p className="text-xs truncate">
                              Posted on {formatDate(e.datePosted)}
                            </p>
                          </div>

                          {/* Creator */}
                          <div className="text-xs text-gray-700 mt-2">
                            <p> Proposed by: {e.creatorName ?? "Admin"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons - Right Side */}
                    <div className="p-4 bg-gray-50 border-l flex flex-col justify-center gap-2 min-w-32">
                    {e.status === "Pending" && e.creatorType === "alumni" ? (
                      <div className="flex flex-col gap-2 mt-4">
                        <button
                          onClick={() => addEvent(e, true)}
                          className="px-4 py-2 bg-green-500 text-white rounded-md"
                        >
                          Accept Proposal
                        </button>
                        <button
                          onClick={() => {
                            resetFormState();
                            setEdit(true);
                            setEditingEventId(e.eventId);
                            setShowForm(true);
                          }}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleReject(e.eventId)}
                          className="px-4 py-2 bg-red-500 text-white rounded-md"
                        >
                          Reject Proposal
                        </button>
                        <button
                          onClick={() => handleViewEventAdmin(e)}
                          className="px-3 py-1.5 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-300 hover:text-black transition w-full"
                        >
                          View More
                        </button>
                      </div>
                    ) : e.status === "Pending" && e.creatorType === "admin" ? (
                      <div className="flex flex-col gap-2 mt-4">
                        <button
                          onClick={() => addEvent(e, true)}
                          className="px-4 py-2 bg-green-500 text-white rounded-md"
                        >
                          Finalize
                        </button>
                        <button
                          onClick={() => {
                            resetFormState();
                            setEdit(true);
                            setEditingEventId(e.eventId);
                            setShowForm(true);
                          }}
                          className="px-4 py-2 bg-blue-500 text-white rounded-md"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(e.eventId)}
                          className="px-4 py-2 bg-red-500 text-white rounded-md"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleViewEventAdmin(e)}
                          className="px-3 py-1.5 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-300 hover:text-black transition w-full"
                        >
                          View More
                        </button>
                      </div>
                    ) : e.status === "Accepted" && e.donationDriveId === "" ? (
                          <div className="flex items-center justify-end gap-4">
                            <button
                              onClick={() => handleAddEventRelated(e)}
                              className="text-gray-600 hover:underline cursor-pointer"
                            >
                              Create Donation Drive
                            </button>
                            <button
                              onClick={() => handleViewEventAdmin(e)}
                              className="text-[var(--primary-blue)] hover:underline cursor-pointer"
                            >
                              View Details
                            </button>
                          </div>
                    ): e.status === "Accepted" || e.status === "Rejected" ? (
                      <div className="flex flex-col gap-2 mt-4">
                        <button
                          onClick={() => handleViewEventAdmin(e)}
                          className="px-3 py-1.5 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-300 hover:text-black transition w-full"
                        >
                          View More
                        </button>
                      </div>
                    ) : e.status === "Draft" && e.creatorType === "admin" && (
                      <div className="flex flex-col gap-2 mt-4">
                        <button
                          onClick={() => {
                            resetFormState();
                            setEdit(true);
                            setEditingEventId(e.eventId);
                            setShowForm(true);
                          }}
                          className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-300 hover:text-black transition w-full"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(e.eventId)}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-md text-sm font-medium hover:bg-red-300 hover:text-black transition w-full"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleViewEventAdmin(e)}
                          className="px-3 py-1.5 bg-gray-500 text-white rounded-md text-sm font-medium hover:bg-gray-300 hover:text-black transition w-full"
                        >
                          View More
                        </button>
                      </div>
                    )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {showForm && (
            <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full z-10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  
                  // Reset error message at the beginning of submission
                  setErrorMessage("");
                  
                  // Check form completion first
                  if (!formComplete) {
                    setErrorMessage("Please fill out all required fields before proposing the event.");
                    return; // Stop further processing
                  }
                  
                  // store the selected guests
                  const targetGuests =
                    visibility === "batch"
                      ? selectedBatches
                      : visibility === "alumni"
                      ? selectedAlumni
                      : [];
                  
                  // Validate batch inputs if batch visibility is selected
                  if (visibility === "batch") {
                    if (selectedBatches.length === 0) {
                      setErrorMessage("Please add at least one batch.");
                      return;
                    }
                    if (selectedBatches.some(batch => !/^\d+$/.test(batch))) {
                      setErrorMessage("Batch inputs must contain only numbers.");
                      return;
                    }
                  }
                  
                  // Validate alumni inputs if alumni visibility is selected
                  if (visibility === "alumni") {
                    if (selectedAlumni.length === 0) {
                      setErrorMessage("Please add at least one alumni email.");
                      return;
                    }
                    if (selectedAlumni.some(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
                      setErrorMessage("Please ensure all alumni inputs are valid email addresses.");
                      return;
                    }
                  }

                  // If we're editing an event
                  if (isEditing && editingEventId) {
                    handleEdit(editingEventId, { 
                      title, 
                      description, 
                      location, 
                      date,  
                      targetGuests, 
                      inviteType: visibility 
                    }, image);
                    setShowForm(false);
                    setEdit(false);
                    setButton("");
                    return;
                  }
                  
                  // Handle creation based on selected button
                  if (selectedButton === "Create") {
                    const form = document.querySelector("form");
                    if (!form || !form.checkValidity()) {
                      form?.reportValidity();
                      return;
                    }

                    
            
                    const newEvent = {
                      datePosted: new Date(),
                      title,
                      description,
                      date,
                      time,
                      location,
                      image: image,
                      inviteType: visibility,
                      numofAttendees: 0,
                      targetGuests,
                      stillAccepting: true,
                      needSponsorship: false,
                      rsvps: "",
                      eventId: "",
                      status: "Accepted",
                      creatorId: "",
                      creatorName: "",
                      creatorType: "",
                      donationDriveId: ""
                    };

                    //console.log("Image being used:", image || defaultImageUrl);
                    
                    addEvent(newEvent, true);
                  } else {
                    // If button is not "Create", just save
                    handleSave(e, image, targetGuests, visibility, "Draft");
                  }
                  
                  // Only close the form if we've reached this point without errors
                  resetFormState();
                  setShowForm(false);
                }}
                className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg w-[400px]"
              >
                <h2 className="text-xl mb-4">
                  {isEditing ? "Edit Event" : "Create Event"}
                </h2>

                {/* Form fields remain the same... */}
                <input
                  type="text"
                  placeholder="Event Title"
                  value={title}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full mb-4 p-2 border rounded"
                  required
                />

                <textarea
                  rows={6}
                  placeholder="Event Description (Format: online / F2F & Venue/Platform)"
                  value={description}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full mb-4 p-2 border rounded"
                  required
                />

                <textarea
                  placeholder="Event Location"
                  value={location}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full mb-4 p-2 border rounded"
                  required
                />

                <Button onClick={() => setIsModalOpen(true)}>
                  Need AI help for description?
                </Button>
                <ModalInput
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  onSubmit={(response) => setEventDescription(response)}
                  title="AI Assistance for Events"
                  type="event"
                  mainTitle={title}
                  subtitle="Get AI-generated description for your event. Only fill in the applicable fields."
                />
                <div className="flex gap-4 mb-4">
                  <div className="w-1/2">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setEventDate(e.target.value)}
                      onKeyDown={(e) => e.preventDefault()} // prevent manual typing
                      className="w-full mb-4 p-2 border rounded"
                      required
                      min={
                        date
                          ? new Date(date).toISOString().split("T")[0]
                          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                              .toISOString()
                              .split("T")[0]
                      }
                    />
                  </div>
                  <div className="w-1/3">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full p-2 border rounded text-center"
                      required
                      min="08:00"
                      max="22:00"
                    />
                  </div>
                </div>

                <label
                  htmlFor="image-upload"
                  className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Upload Photo
                </label>

                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {fileName && (
                  <p className="mt-2 text-sm text-gray-600">Selected file: {fileName}</p>
                )}

                <div className="space-y-4 bg-white-700 p-4 text-black rounded-md w-80">
                  {/* Visibility options remain the same... */}
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="visibility"
                      value="all"
                      checked={visibility === "all"}
                      onChange={() => {
                        setVisibility("all");
                        // Clear both to properly show the RSVP
                        setSelectedAlumni([]);
                        setSelectedBatches([]);
                      }}
                    />
                    <span>Open to all</span>
                  </label>

                  {/* Batch Option */}
                  <label className="flex items-start space-x-2">
                    <input
                      type="radio"
                      name="visibility"
                      value="batch"
                      checked={visibility === "batch"}
                      onChange={() => {
                        setVisibility("batch");
                        setSelectedAlumni([]); // Clear the Selected Batches List
                      }}
                    />
                    <div className="flex flex-col w-full">
                      <span>Batch:</span>
                      {visibility === "batch" && (
                        <>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedBatches.map((batch, index) => (
                              <span
                                key={index}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center"
                              >
                                {batch}
                                {/* Remove Button */}
                                <button 
                                  type="button"
                                  className="ml-2 text-red-500 font-bold"
                                  onClick={() =>
                                    setSelectedBatches((prev) =>
                                      prev.filter((_, i) => i !== index) // Filter out the item at the current index to remove it from selectedBatches
                                    )
                                  }
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          {/* User Input */}
                          <input
                            type="text"
                            className="text-black mt-2 p-2 rounded-md w-full"
                            placeholder="e.g. 2022"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const value = e.currentTarget.value.trim();
                                // Check if the value is not empty and not already in the selectedBatches list
                                if (value && !selectedBatches.includes(value)) {
                                  // Add the new value to the selectedBatches list
                                  setSelectedBatches([...selectedBatches, value]);
                                  e.currentTarget.value = "";
                                }
                              }
                            }}
                          />
                          <p className="text-gray-500 text-sm mt-2">Press "Enter" to add the batch.</p>
                        </>
                      )}
                    </div>
                  </label>

                  {/* Alumni Option */}
                  <label className="flex items-start space-x-2 mt-4">
                    <input
                      type="radio"
                      name="visibility"
                      value="alumni"
                      checked={visibility === "alumni"}
                      onChange={() => {
                        setVisibility("alumni");
                        setSelectedBatches([]); // Clear the Selected Alumni List
                      }}
                    />
                    <div className="flex flex-col w-full">
                      <span>Alumni:</span>
                      {visibility === "alumni" && (
                        <>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {selectedAlumni.map((email, index) => (
                              <span
                                key={index}
                                className="bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center"
                              >
                                {email}
                                <button
                                  type="button"
                                  className="ml-2 text-red-500 font-bold"
                                  onClick={() =>
                                    setSelectedAlumni((prev) =>
                                      prev.filter((_, i) => i !== index) // Filter out the item at the current index to remove it from selectedAlumni
                                    )
                                  }
                                >
                                  x
                                </button>
                              </span>
                            ))}
                          </div>
                          <input
                            type="text"
                            className="text-black mt-2 p-2 rounded-md w-full"
                            placeholder="e.g. email1@up.edu.ph"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const value = e.currentTarget.value.trim();
                                // Check if the value is not empty and not already in the selectedAlumni list
                                if (value && !selectedAlumni.includes(value)) {
                                  // Add the new value to the selectedAlumni list
                                  setSelectedAlumni([...selectedAlumni, value]);
                                  e.currentTarget.value = "";
                                }
                              }
                            }}
                          />
                          <p className="text-gray-500 text-sm mt-2">Press "Enter" to add the alumni.</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
                
                {/* Error message display - now prominently displayed */}
                {errorMessage && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4 mb-4">
                    <p>{errorMessage}</p>
                  </div>
                )}
                <div className="flex justify-between mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      resetFormState();
                      setShowForm(false);
                    }}
                    className="text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white p-2 rounded"
                  >
                    {isEditing ? "Update Event" : "Save As Draft" }
                  </button>
                  <button 
                    type="submit"
                    onClick={() => setButton("Create")}
                    className="px-4 py-2 bg-green-500 text-white rounded-md"
                  >
                    Create
                  </button>
                </div>
              </form>
        </div>
      )}
    </div>
  );
}