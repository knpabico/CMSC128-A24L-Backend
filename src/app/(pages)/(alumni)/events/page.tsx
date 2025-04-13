"use client";

import { useState } from "react";
import { useEvents } from "@/context/EventContext";
import { Event } from "@/models/models";
import { Timestamp } from "firebase/firestore";
import BookmarkButton from "@/components/ui/bookmark-button";

function formatPostedDate(timestamp: Timestamp | any) {
  if (!timestamp) return "Unknown Date";

  // Handle Firebase Timestamp
  const date = timestamp instanceof Timestamp 
    ? timestamp.toDate() 
    : timestamp.seconds 
    ? new Date(timestamp.seconds * 1000) 
    : new Date(timestamp);

  // FORMAT:  Year-Month-Day, Time
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;

  return `${year}-${month}-${day}, ${formattedHours}:${minutes} ${ampm}`;
}

function formatEventDate(dateString: string) {
  const date = new Date(dateString);
  
  // FORMAT sample: March 22, 2025
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function getEventStatus(eventDateString: string): 'Upcoming' | 'Ongoing' | 'Done' {
  const eventDate = new Date(eventDateString);
  const today = new Date();
  
  // normalize today's date to ignore time differences
  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  if (eventDate > today) return 'Upcoming';
  if (eventDate.getTime() === today.getTime()) return 'Ongoing';
  
  return 'Done';
}


export default function Events() {
  const { 
    events, 
    isLoading, 
    setShowForm, 
    showForm, 
    handleSave, 
    date, 
    creatorId,
    setEventDate, 
    description, 
    setEventDescription, 
    title, 
    setEventTitle 
  } = useEvents();

  // Sorting states
  const [dateSortType, setDateSortType] = useState<'event-closest' | 'event-farthest' | 'posted-newest' | 'posted-oldest'>('event-closest');

  // New state for date filtering
  const [dateFilterType, setDateFilterType] = useState<'All' | 'Upcoming' | 'Ongoing' | 'Done'>('All');

  // Sorting function for events
  const sortEvents = (events: Event[]) => {
    return [...events].sort((a, b) => {
      switch (dateSortType) {
        case 'event-closest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'event-farthest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'posted-newest':
          const dateA = a.datePosted?.seconds ? new Date(a.datePosted.seconds * 1000) : new Date(0);
          const dateB = b.datePosted?.seconds ? new Date(b.datePosted.seconds * 1000) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        case 'posted-oldest':
          const oldDateA = a.datePosted?.seconds ? new Date(a.datePosted.seconds * 1000) : new Date(0);
          const oldDateB = b.datePosted?.seconds ? new Date(b.datePosted.seconds * 1000) : new Date(0);
          return oldDateA.getTime() - oldDateB.getTime();
        default:
          return 0;
      }
    });
  };

  // Sorting and filtering dropdown
  const renderFilterAndSortDropdowns = () => (
    <div className="flex space-x-4 mb-4">
      {/* Date Filter Dropdown */}
      <div>
        <label htmlFor="filter-select" className="mr-2">Filter by:</label>
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
        <label htmlFor="sort-select" className="mr-2">Sort by:</label>
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

  // Render event list with common structure and filtering
  const renderEventList = (filteredEvents: Event[]) => {
    // First, filter by date status
    const dateFilteredEvents = filteredEvents.filter(event => {
      if (dateFilterType === 'All') return true;
      return getEventStatus(event.date) === dateFilterType;
    });

    // Then sort the filtered events
    const sortedEvents = sortEvents(dateFilteredEvents);
    
    // If no events after filtering
    if (sortedEvents.length === 0) {
      return <p className="text-gray-500">No events found.</p>;
    }

    return sortedEvents.map((event, index) => (
      <div 
        key={index} 
        className="relative border p-4 mb-4 rounded-lg shadow-sm"
      >
        <h2 className="text-xl font-bold mb-2">{event.title}</h2>
        {/* Bookmark Button */}
        <div className="absolute top-3 right-3">
          <BookmarkButton 
            entryId={event.eventId}  
            type="event" 
            size="lg"
          />
        </div>
        <div className="mb-2">
          <strong>Event Date:</strong> {formatEventDate(event.date)}
          {/* <span className="ml-2 text-sm text-gray-600">
            ({getEventStatus(event.date)})
          </span> */}
        </div>
        <div className="mb-2">
          <strong>Description:</strong> {event.description}
        </div>
        {event.datePosted && (
          <div className="text-sm text-gray-600">
            <strong>Posted on:</strong> {formatPostedDate(event.datePosted)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Events</h1>
      
      {isLoading && <h1>Loading</h1>}
      
      <div className="mb-4">
        <button 
          onClick={() => setShowForm(true)}  
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Propose an Event
        </button>
        {showForm && (
          <div className="fixed inset-0 z-50 bg-white/30 backdrop-blur-md flex justify-center items-center">
            <form onSubmit={handleSave} className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg w-[400px]">
              <h2 className="text-xl mb-4">Event Details</h2>

              <input
                type="text"
                placeholder="Event Title"
                value={title}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full mb-4 p-2 border rounded"
                required
              />

              <textarea
                placeholder="Event Description (Format: online / F2F & Venue/Platform)"
                value={description}
                onChange={(e) => setEventDescription(e.target.value)}
                className="w-full mb-4 p-2 border rounded"  
                required
              />

              <input
                type="date"
                value={date}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full mb-4 p-2 border rounded"
                required
                min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Events must be scheduled 
                // at least one week in advance
              />

              <div className="flex justify-between">
                <button type="button" onClick={() => setShowForm(false)} className="text-gray-500">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                  Save
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {renderFilterAndSortDropdowns()}

      {/* Approved Events */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Approved</h2>
        {renderEventList(events.filter((event: Event) => event.status === "Accepted"))}
      </div>

      {/* Pending Events */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Pending</h2>
        {renderEventList(events.filter((event: Event) => event.status === "Pending" && event.creatorId == creatorId))}
      </div>
    </div>
  );
}