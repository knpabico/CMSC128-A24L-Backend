"use client";

import React, { useState, useEffect } from "react";
import { useEvents } from "@/context/EventContext";
import { Event } from "@/models/models";
import { useAuth } from "@/context/AuthContext";
import EventSidebar from "../components/Sidebar";
import EventsList from "../components/EventsList";

import ProposeEventForm from "../components/ProposeEventForm";
import { FilePlus2 } from "lucide-react";
import Banner from "@/components/Banner";

// Function to format the event date
function formatEventDate(dateString: string)
{
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

// Function to get the event status based on the date
function getEventStatus(eventDateString: string): 'Upcoming' | 'Ongoing' | 'Done'
{
  const eventDate = new Date(eventDateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize the date
  
  if (eventDate > today) return 'Upcoming';
  if (eventDate.getTime() === today.getTime()) return 'Ongoing';
  return 'Done';
}

export default function Invitations()
{
  const { events, isLoading, showForm, setShowForm } = useEvents();
  const { alumInfo } = useAuth();

  // State for sorting and filtering
  const [invitationEvents, setInvitationEvents] = useState<Event[]>([]);
  const [sortOption, setSortOption] = useState<string>('event-closest');
  const [filterOption, setFilterOption] = useState<string>('All');
  const [isEditing, setEdit] = useState<boolean>(false);
  const [isDetails, setDetailsPage] = useState<boolean>(false);

  // Filter the events based on the user's info and RSVP status
  useEffect(() =>
  {
    if (events.length > 0 && alumInfo?.alumniId)
    {
      const filtered = events.filter((event: Event) =>
      {
        return (
          event.status === "Accepted" &&
          event.targetGuests &&
          ((Array.isArray(event.targetGuests) && event.targetGuests.includes(alumInfo.alumniId)) ||
            (typeof event.targetGuests === 'string' && event.targetGuests === alumInfo.alumniId))
        );
      });
      setInvitationEvents(filtered);
    }
  }, [events, alumInfo]);

  // Sort events based on the selected sort option
  const sortEvents = (events: Event[]) =>
  {
    return [...events].sort((a, b) =>
    {
      switch (sortOption)
      {
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

  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
  {
    setSortOption(e.target.value);
  };

  // Filter events based on filter option
  const filteredEvents = invitationEvents.filter(event =>
  {
    if (filterOption === 'All') return true;
    return getEventStatus(event.date) === filterOption;
  });

  const sortedEvents = sortEvents(filteredEvents);

  return (
    <div className="bg-[#EAEAEA]">
      {/* Page Title */}
      <Banner title="Events" description="Reconnect through ICS and alumni events that nurture unity, inspire growth, and strengthen our sense of community."/>
      {/* Main Content */}
      <div className='my-[40px] mx-[30px] h-fit flex flex-col gap-[40px] md:flex-row lg:mx-[50px] xl:mx-[200px] static'>
        {/* Sidebar */}
        <div className='bg-[#FFFFFF] flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max md:sticky md:top-1/7 '>
          <EventSidebar />
        </div>
        
        {/* Main content */}
        <div className='flex flex-col gap-[10px] w-full mb-10'>
          {/* Filter and Sort Controls */}
          <div className="bg-[#FFFFFF] rounded-[10px] px-5 py-1 flex justify-between items-center shadow-md border border-gray-200">
            <h2 className="text-md lg:text-lg font-semibold">Invitations</h2>
            <div className="flex items-center">
              <label htmlFor="filter" className="mr-2 text-sm">Filter by:</label>
              <select
                id="filter"
                value={filterOption}
                onChange={(e) => setFilterOption(e.target.value)}
                className="text-gray-600 flex items-center text-sm"
              >
                <option value="All">All Events</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Done">Done</option>
              </select>
              <div className="mx-2"> |</div>
              <label htmlFor="sort" className="ml-4 mr-2 text-sm">Sort by:</label>
              <select id="sort" value={sortOption} onChange={handleSortChange} className="text-gray-600 flex items-center text-sm">
                <option value="event-closest">Event Date (Closest First)</option>
                <option value="event-farthest">Event Date (Farthest First)</option>
                <option value="posted-newest">Date Posted (Newest First)</option>
                <option value="posted-oldest">Date Posted (Oldest First)</option>
              </select>
              {/* Propose Event */}
              <button 
                  className="bg-[#D9D9D9] text-black py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 hover:text-white flex items-center gap-2 mx-4"
                  onClick={() => setShowForm(true)}
              >
                  <FilePlus2 className="w-5 h-5" />
                  Propose Event
              </button>
            </div>
          </div>

          <ProposeEventForm 
              isOpen={showForm}
              onClose={() => setShowForm(false)}
              isEditing={isEditing}
              isDetails={false}
              setDetailsPage={setDetailsPage}
              editingEventId={""}
              setEdit={setEdit}
          />

          {/* Event List */}
          {sortedEvents.length > 0 ? (
            <EventsList events={sortedEvents} isLoading={isLoading} type = {"Invitations"} />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg w-full">
              <h3 className="text-xl font-medium text-gray-600">No current invites</h3>
              <p className="text-gray-500 mt-2">There are no invites matching your selected filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
