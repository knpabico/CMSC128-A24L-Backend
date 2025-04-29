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
import { useBookmarks } from "@/context/BookmarkContext";
import EventSidebar from "./components/Sidebar";

function formatPostedDate(timestamp: Timestamp | any)
{
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

function formatEventDate(dateString: string)
{
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US",
  {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getEventStatus(
  eventDateString: string
): "Upcoming" | "Ongoing" | "Done" 
{
  const eventDate = new Date(eventDateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  if (eventDate > today) return "Upcoming";
  if (eventDate.getTime() === today.getTime()) return "Ongoing";
  return "Done";
}

export default function Events()
{
  const
  {
    events,
    isLoading,
    setShowForm,
    showForm,
    handleSave,
    handleViewEventAlumni,
    handleImageChange,
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
  const { isBookmarked } = useBookmarks();
  const [confirmForm, setConfirmForm] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  const requiredSentence = "I certify on my honor that the proposed event details are accurate, correct, and complete.";
  const formComplete = title.trim() !== "" && description.trim() !== "" && date.trim() !== "";

  const [dateSortType, setDateSortType] = useState<
    "event-closest" | "event-farthest" | "posted-newest" | "posted-oldest"
  >("event-closest");
  const [dateFilterType, setDateFilterType] = useState<
    null | "Upcoming" | "Ongoing" | "Done"
  >(null);
  const [activeTab, setActiveTab] = useState<"all" | "invites" | "saved" | "proposed" | "featured">("all");

  const sortEvents = (events: Event[]) =>
    [...events].sort((a, b) => 
    {
      switch (dateSortType)
      {
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

  // Filter events based on active tab
  const filteredEvents = (() =>
  {
    switch(activeTab)
    {
      case "saved":
        return events.filter(event => isBookmarked(event.eventId, "event"));
      case "invites":
        // Keep existing logic for invites tab
        return events;
      default:
        return events;
    }
  })();

  const renderFilterAndSortDropdowns = () => (
    <div className="flex items-center justify-end flex-wrap gap-4 w-full">
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Propose an Event
      </button>

      {/* Filter Button */}
      <div className="relative">
        <button
          onClick={() => setShowFilterOptions(!showFilterOptions)}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md flex items-center"
        >
          Filter {dateFilterType ? `(${dateFilterType})` : ""}
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showFilterOptions && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
            <div className="py-1">
              <button 
                onClick={() =>
                {
                  setDateFilterType(null);
                  setShowFilterOptions(false);
                }}
                className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${dateFilterType === null ? 'font-bold bg-gray-100' : ''}`}
              >
                Clear Filter
              </button>
              <button 
                onClick={() =>
                {
                  setDateFilterType("Upcoming");
                  setShowFilterOptions(false);
                }}
                className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${dateFilterType === "Upcoming" ? 'font-bold bg-gray-100' : ''}`}
              >
                Upcoming
              </button>
              <button
                onClick={() =>
                {
                  setDateFilterType("Ongoing");
                  setShowFilterOptions(false);
                }}
                className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${dateFilterType === "Ongoing" ? 'font-bold bg-gray-100' : ''}`}
              >
                Ongoing
              </button>
              <button
                onClick={() =>
                {
                  setDateFilterType("Done");
                  setShowFilterOptions(false);
                }}
                className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left ${dateFilterType === "Done" ? 'font-bold bg-gray-100' : ''}`}
              >
                Done
              </button>
            </div>
          </div>
        )}
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

  const renderEventList = (filteredEvents: Event[]) =>
{
    // Apply the filter if one is selected
    const dateFilteredEvents = dateFilterType
      ? filteredEvents.filter(event => getEventStatus(event.date) === dateFilterType)
      : filteredEvents;

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

  // Close filter dropdown when clicking outside
  useState(() =>
  {
    const handleClickOutside = (event: MouseEvent) =>
    {
      const target = event.target as HTMLElement;
      if (showFilterOptions && !target.closest('.filter-dropdown'))
      {
        setShowFilterOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () =>
    {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  });

  return (
    <>
		{/*Page Title*/}
		<div className="relative bg-cover bg-center pt-20 pb-10 px-10 md:px-30 md:pt-30 md:pb-20 lg:px-50" style={{ backgroundImage: 'url("/ICS2.jpg")' }}>
			<div className="absolute inset-0 bg-blue-500/50" />
				<div className="relative z-10">
				<h1 className="text-5xl font-bold my-2 text-white">Events</h1>
				<p className='text-white text-sm md:text-base'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla porta, ligula non sagittis tempus, risus erat aliquam mi, nec vulputate dolor nunc et eros. Fusce fringilla, neque et ornare eleifend, enim turpis maximus quam, vitae luctus dui sapien in ipsum. Pellentesque mollis tempus nulla, sed ullamcorper quam hendrerit eget.</p>
			</div>
		</div>

      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold">Events</h1>
          <span className="text-gray-400">|</span> 
          <Link href="/invitations" className="text-blue-500 hover:text-blue-700 font-medium">
            Invitations
          </Link>
        </div>

        <div className='bg-[#FFFFFF] flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max md:sticky md:top-1/7'>
            <EventSidebar />
        </div>
        {isLoading && <h1>Loading</h1>}

        {/* BUTTON ROW */}
        <div className="flex flex-wrap justify-end mb-4 gap-4 filter-dropdown">
          {renderFilterAndSortDropdowns()}
        </div>

        {/* MODAL */}
        {showForm && (
          <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full z-20">
            <form
              onSubmit={(e) => handleSave(e, [], "all")}
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
                }
              />

              <label htmlFor="image-upload" className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Upload Photo
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
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
                    type="button"
                    onClick={() => setConfirmForm(true)}
                    className="bg-[#0856BA] text-white p-2 rounded-[22px]"
                    disabled={!formComplete}
                  >
                    Propose
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {confirmForm && (
          <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full z-30">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (userInput !== requiredSentence)
                {
                  alert("Please type the sentence exactly to confirm.");
                  return;
                }
                // Handle actual propose submit
                handleSave(e, [], "all");
                setShowForm(false);
                setConfirmForm(false);
              }}
              className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg w-[400px] z-40"
            >
              <h2 className="text-xl font-bold mb-4">Please certify on your honor that all the details are accurate, correct, and complete.</h2>

              <div className="mb-4">
                <p className="text-gray-700 text-sm">
                  As a sign of your confirmation, please type the following text in the text field below:
                </p>
                <p className="text-gray-900 italic text-center my-2">
                  I certify on my honor that the proposed event details are accurate, correct, and complete.
                </p>
              </div>

              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onPaste={(e) => e.preventDefault()} // Prevent paste
                placeholder="Type the sentence here"
                className="w-full mb-4 p-2 border rounded"
                required
              />

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setConfirmForm(false)}
                  className="text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#0856BA] text-white p-2 rounded-[22px]"
                >
                  Confirm
                </button>
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

          <br/>
          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className={`text-black mb-2 ${
              activeTab === "saved" ? "underline font-semibold" : ""
            }`}
          >
            Saved Events
          </button>

          <br/>
          <button
            type="button"
            onClick={() => setActiveTab("proposed")}
            className={`text-black mb-2 ${
              activeTab === "proposed" ? "underline font-semibold" : ""
            }`}
          >
            Proposed Events
          </button>

          <br/>
          <button
            type="button"
            onClick={() => setActiveTab("invites")}
            className={`text-black mb-2 ${
              activeTab === "invites" ? "underline font-semibold" : ""
            }`}
          >
            Invitations
          </button>

          <br/>
          <button
            type="button"
            onClick={() => setActiveTab("featured")}
            className={`text-black mb-2 ${
              activeTab === "featured" ? "underline font-semibold" : ""
            }`}
          >
            Featured Stories
          </button>
        </div>

        {/* EVENTS SECTION - Handle different tabs */}
        {activeTab === "saved" ? (
          <div className="mb-6 z-10">
            <h2 className="text-xl font-semibold mb-4">Saved Events</h2>
            {filteredEvents.length === 0 ? (
              <p className="text-gray-500">No saved events found.</p>
            ) : (
              renderEventList(filteredEvents)
            )}
          </div>
        ) : (
          <>
            <div className="mb-6 z-10">
              <h2 className="text-xl font-semibold mb-4">Approved</h2>
              {renderEventList(
                filteredEvents.filter((event: Event) => event.status === "Accepted")
              )}
            </div>

            <div className="z-10">
              <h2 className="text-xl font-semibold mb-4">Pending</h2>
              {renderEventList(
                filteredEvents.filter(
                  (event: Event) =>
                    event.status === "Pending" && event.creatorId == user.uid
                )
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}