"use client";

import { useState } from "react";
import { useEvents } from "@/context/EventContext";
import { useAuth } from "@/context/AuthContext";
import { useDonationDrives } from "@/context/DonationDriveContext";
import { Event } from "@/models/models";
import { Timestamp } from "firebase/firestore";
import BookmarkButton from "@/components/ui/bookmark-button";
import Link from "next/link";
import { Button } from "@mui/material";
import ModalInput from "@/components/ModalInputForm";

function formatPostedDate(timestamp: Timestamp | any) {
  if (!timestamp) return "Unknown Date";

  const date =
    timestamp instanceof Timestamp
      ? timestamp.toDate()
      : timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;

  return `${year}-${month}-${day}, ${formattedHours}:${minutes} ${ampm}`;
}

function formatEventDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getEventStatus(
  eventDateString: string
): "Upcoming" | "Ongoing" | "Done" {
  const eventDate = new Date(eventDateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  if (eventDate > today) return "Upcoming";
  if (eventDate.getTime() === today.getTime()) return "Ongoing";
  return "Done";
}

export default function Events() {
  const {
    events,
    isLoading,
    setShowForm,
    showForm,
    handleSave,
    handleViewEventAlumni,
    date,
    setEventDate,
    description,
    setEventDescription,
    title,
    needSponsorship,
    setNeedSponsorship,
    setEventTitle,
  } = useEvents();

  const { user } = useAuth();

  const [dateSortType, setDateSortType] = useState<
    "event-closest" | "event-farthest" | "posted-newest" | "posted-oldest"
  >("event-closest");
  const [dateFilterType, setDateFilterType] = useState<
    "All" | "Upcoming" | "Ongoing" | "Done"
  >("All");
  const [activeTab, setActiveTab] = useState<"all" | "invites">("all");

  const sortEvents = (events: Event[]) =>
    [...events].sort((a, b) => {
      switch (dateSortType) {
        case "event-closest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "event-farthest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "posted-newest":
          const dateA = a.datePosted?.seconds
            ? new Date(a.datePosted.seconds * 1000)
            : new Date(0);
          const dateB = b.datePosted?.seconds
            ? new Date(b.datePosted.seconds * 1000)
            : new Date(0);
          return dateB.getTime() - dateA.getTime();
        case "posted-oldest":
          const oldDateA = a.datePosted?.seconds
            ? new Date(a.datePosted.seconds * 1000)
            : new Date(0);
          const oldDateB = b.datePosted?.seconds
            ? new Date(b.datePosted.seconds * 1000)
            : new Date(0);
          return oldDateA.getTime() - oldDateB.getTime();
        default:
          return 0;
      }
    });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderFilterAndSortDropdowns = () => (
    <div className="flex items-center justify-end flex-wrap gap-4 w-full">
      {/* Move this to the top */}
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Propose an Event
      </button>

      {/* Filter Dropdown */}
      <div>
        <label htmlFor="filter-select" className="mr-2">
          Filter by:
        </label>
        <select
          id="filter-select"
          value={dateFilterType}
          onChange={(e) => setDateFilterType(e.target.value as any)}
          className="p-2 border rounded"
        >
          <option value="All">All Events</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Ongoing">Ongoing</option>
          <option value="Done">Done</option>
        </select>
      </div>

      {/* Sort Dropdown */}
      <div>
        <label htmlFor="sort-select" className="mr-2">
          Sort by:
        </label>
        <select
          id="sort-select"
          value={dateSortType}
          onChange={(e) => setDateSortType(e.target.value as any)}
          className="p-2 border rounded"
        >
          <option value="event-closest">Event Date (Closest First)</option>
          <option value="event-farthest">Event Date (Farthest First)</option>
          <option value="posted-newest">Date Posted (Newest First)</option>
          <option value="posted-oldest">Date Posted (Oldest First)</option>
        </select>
      </div>
    </div>
  );

  const renderEventList = (filteredEvents: Event[]) => {
    const dateFilteredEvents = filteredEvents.filter(
      (event) =>
        dateFilterType === "All" ||
        getEventStatus(event.date) === dateFilterType
    );

    const sortedEvents = sortEvents(dateFilteredEvents);
    if (sortedEvents.length === 0)
      return <p className="text-gray-500">No events found.</p>;

    return (
      <div className="flex flex-wrap gap-4">
        {sortedEvents.map((event, index) => (
          <div
            key={index}
            className="relative w-full sm:w-1/2 md:w-1/5 lg:w-1/5 xl:w-1/6 p-4 mb-4 rounded-lg shadow-sm border"
          >
            <h2 className="text-xl font-bold mb-2">{event.title}</h2>
            <div className="absolute top-0.5 right-0.5">
              <BookmarkButton entryId={event.eventId} type="event" size="lg" />
            </div>
            <div className="mb-2">
              <strong>Event Date:</strong> {formatEventDate(event.date)}
            </div>
            <div className="mb-2">
              <strong>Description:</strong> {event.description}
            </div>
            {event.datePosted && (
              <div className="text-sm text-gray-600">
                <strong>Posted on:</strong> {formatPostedDate(event.datePosted)}
              </div>
            )}
            <button
          onClick={() => handleViewEventAlumni(event)}
          className="px-4 py-2 bg-gray-500 text-white rounded-md"
        >
          View More
        </button>
      </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="w-full h-80 relative bg-[#0856BA] overflow-hidden">
        <div className="left-[200px] top-[109px] absolute text-[#FFFFFF] text-6xl font-semibold">
          Events
        </div>
        <div className="w-[971px] left-[200px] top-[200px] absolute text-[#FFFFFF] text-base font-normal">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla porta,
          ligula non sagittis tempus, risus erat aliquam mi, nec vulputate dolor
          nunc et eros. Fusce fringilla, neque et ornare eleifend, enim turpis
          maximus quam, vitae luctus dui sapien in ipsum. Pellentesque mollis
          tempus nulla, sed ullamcorper quam hendrerit eget.
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold">Events</h1>
          <span className="text-gray-400">|</span> 
          {/* para makita specific invitations sa user na galing kay admin */}
          <Link href="/invitations" className="text-blue-500 hover:text-blue-700 font-medium">
            Invitations
          </Link>
        </div>
        
        {isLoading && <h1>Loading</h1>}

        {/* BUTTON ROW */}
        <div className="flex flex-wrap justify-end mb-4 gap-4">
          {renderFilterAndSortDropdowns()}
        </div>

        {/* MODAL */}
        {showForm && (
          <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full z-20">
            <form
              onSubmit={(e) => handleSave(e, [])}
              className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg w-[400px] z-30"
            >
              <h2 className="text-xl bold mb-4">Propose Event</h2>
              <input
                type="text"
                placeholder="Event Title"
                value={title}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full mb-4 p-2 border rounded"
                required
              />
              <textarea
                placeholder="Event Description"
                value={description}
                onChange={(e) => setEventDescription(e.target.value)}
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
              <input
                type="date"
                value={date}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full mb-4 p-2 border rounded"
                required
                min={
                  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0]
                } // Events must be scheduled
                // at least one week in advance
              />

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-gray-500"
                >
                  Cancel
                </button>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-[#BFBFBF] text-white p-2 rounded-[22px]"
                  >
                    Save As Draft
                  </button>
                  <button
                    type="submit"
                    className="bg-[#0856BA] text-white p-2 rounded-[22px]"
                  >
                    Propose
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="mb-7 relative bg-[#D9D9D9] p-2 w-1/4 rounded-[5px] shadow-sm border">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`text-black mb-2 ${
              activeTab === "all" ? "underline font-semibold" : ""
            }`}
          >
            All Events
          </button>
          <br />
          <button
            type="button"
            onClick={() => setActiveTab("invites")}
            className={`text-black ${
              activeTab === "invites" ? "underline font-semibold" : ""
            }`}
          >
            Invitations
          </button>
        </div>

        {/* EVENTS SECTION */}
        <div className="mb-6 z-10">
          <h2 className="text-xl font-semibold mb-4">Approved</h2>
          {renderEventList(
            events.filter((event: Event) => event.status === "Accepted")
          )}
        </div>

        <div className="z-10">
          <h2 className="text-xl font-semibold mb-4">Pending</h2>
          {renderEventList(
            events.filter(
              (event: Event) =>
                event.status === "Pending" && event.creatorId == user.uid
            )
          )}
        </div>
      </div>
    </>
  );
}
