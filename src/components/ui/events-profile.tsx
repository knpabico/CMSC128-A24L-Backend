"use client";

import React, { useEffect, useState } from "react";
import { useEvents } from "@/context/EventContext";
import { useAuth } from "@/context/AuthContext";
import EventsProfileList from "@/components/ui/events-profile-list";
import { Event } from "@/models/models";
import ProposeEventProfileForm from "@/components/ui/events-profile-form";
import { ChevronDown, FileText, Mails, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";


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


export default function EventsProfile()
  {
      const { 
          events, 
          isLoading, 
          setShowForm,
          showForm
      } = useEvents();
      const { user, alumInfo } = useAuth();
  
      const [proposedEvents, setProposedEvents] = useState<Event[]>([]);
      const [sortOption, setSortOption] = useState<string>('event-closest');
      const [statusFilter, setStatusFilter] = useState<string>('all');
      const [isEditing, setEdit] = useState<boolean>(false);
      const [isDetails, setDetailsPage] = useState<boolean>(false);
      
      useEffect(() =>
      {
          console.log("Events:", events);
  
          if (events.length > 0 && user)
          {
              const filteredEvents = events.filter(
                  (e: { status: string; creatorId: string; creatorType: string; }) =>
                  (statusFilter === 'all' || e.status === statusFilter) &&
                  e.creatorId === alumInfo?.alumniId &&
                  e.creatorType === 'alumni'
              );
  
              console.log("Filtered Events:", filteredEvents);
  
  
              // Sort events based on the selected sort option
              const sorted = [...filteredEvents].sort((x, y) =>
              {
                  switch (sortOption)
                  {
                      case 'newest':
                          const dateX = x.datePosted?.seconds ? new Date(x.datePosted.seconds * 1000) : new Date(0);
                          const dateY = y.datePosted?.seconds ? new Date(y.datePosted.seconds * 1000) : new Date(0);
                          return dateY.getTime() - dateX.getTime();
  
                      case 'oldest':
                          const oldDateX = x.datePosted?.seconds ? new Date(x.datePosted.seconds * 1000) : new Date(0);
                          const oldDateY = y.datePosted?.seconds ? new Date(y.datePosted.seconds * 1000) : new Date(0);
                          return oldDateX.getTime() - oldDateY.getTime();
                  
                      default:
                          return 0;
                  }
              });
  
              console.log("Proposed Events:", sorted);
              setProposedEvents(sorted);
          } 
          
          else
          {
              setProposedEvents([]);
          }
      }, [events, sortOption, statusFilter, user, alumInfo]);
  
      const handleSortChange = (f: React.ChangeEvent<HTMLSelectElement>) =>
      {
          setSortOption(f.target.value);
      }
  
      const handleStatusFilterChange = (f: React.ChangeEvent<HTMLSelectElement>) => 
      {
          setStatusFilter(f.target.value);
      };


  const [proposedView, setProposedView] = useState(true);
  const [invitationsView, setInvitationsView] = useState(false);

  const handleProposedView =() => {
    setProposedView(true);
    setInvitationsView(false);
  }
  const handleInvitationsView =() => {
    setProposedView(false);
    setInvitationsView(true);
  }


    // State for sorting and filtering
    const [invitationEvents, setInvitationEvents] = useState<Event[]>([]);
    const [sortOptionInv, setSortOptionInv] = useState<string>('event-closest');
    const [filterOption, setFilterOption] = useState<string>('All');
  
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
        switch (sortOptionInv)
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
    const handleSortChangeInv = (e: React.ChangeEvent<HTMLSelectElement>) =>
    {
      setSortOptionInv(e.target.value);
    };
  
    // Filter events based on filter option
    const filteredEvents = invitationEvents.filter(event =>
    {
      if (filterOption === 'All') return true;
      return getEventStatus(event.date) === filterOption;
    });
  
    const sortedEvents = sortEvents(filteredEvents);



    return(
    <div className="mx-50 mt-10 mb-15">
        {proposedView && (
            <div className="filter-controls flex space-x-5 mb-5 justify-end items-center text-sm">
                <label htmlFor="status" className="mr-2">Status:</label>
                <div className="relative">
                    <select 
                        id="status" 
                        value={statusFilter} 
                        onChange={handleStatusFilterChange} 
                        className="sort-select p-2 pl-5 pr-10 rounded-full bg-white shadow-sm appearance-none w-full focus:outline-none"
                    >
                        <option value="all">All</option>
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Draft">Draft</option>
                    </select>

                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="w-4 h-4" />
                    </div>
                </div>

                <label htmlFor="sort" className="mr-2">Order:</label>
                <div className="relative">
                    <select 
                        id="sort"
                        value={sortOption}
                        onChange={handleSortChange}
                        className="sort-select p-2 pl-5 pr-10 rounded-full bg-white shadow-sm appearance-none w-full focus:outline-none"
                    >
                        <option value="newest">Latest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>

                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
            </div>
        )}
        
        {invitationsView && (
            <div className="filter-controls flex space-x-5 mb-5 justify-end items-center text-sm">
                <label htmlFor="filter" className="mr-2">Filter by:</label>
                <div className="relative">
                    <select
                        id="filter"
                        value={filterOption}
                        onChange={(e) => setFilterOption(e.target.value)}
                        className="sort-select p-2 pl-5 pr-10 rounded-full bg-white shadow-sm appearance-none w-full"
                    >
                        <option value="All">All</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Done">Done</option>
                    </select>

                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="w-4 h-4" />
                    </div>
                </div>

                <label htmlFor="sort-inv" className="mr-2">Sort by:</label>
                <div className="relative">
                    <select 
                        id="sort-inv"
                        value={sortOptionInv}
                        onChange={handleSortChangeInv}
                        className="sort-select p-2 pl-5 pr-10 rounded-full bg-white shadow-sm appearance-none w-full"
                    >
                        <option value="event-closest">Event Date (Closest First)</option>
                        <option value="event-farthest">Event Date (Farthest First)</option>
                        <option value="posted-newest">Date Posted (Latest First)</option>
                        <option value="posted-oldest">Date Posted (Oldest First)</option>
                    </select>

                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="w-4 h-4" />
                    </div>
                </div>
            </div>
        )}

        <div className="flex space-x-7">
            {/* sidebar */} 
            <div className="mr-7 w-content h-max md:sticky md:top-1/7">
                <div className="bg-[#FFFFFF] flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max md:sticky md:top-1/7 ">
                    <div className="bg-white">
                    <ul className="flex flex-col p-1 gap-[10px] rounded-[10px] w-50 h-max">
                        <li className='flex gap-5 items-center justify-start cursor-pointer' onClick={handleProposedView}>
                            <FileText/>
                            <p className={`group w-max relative py-1 transition-all ${proposedView ? 'font-semibold  border-b-3 border-blue-500' : 'text-gray-700 group'}`}>
                                <span>Proposed Events</span>
                                {!proposedView && (<span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>)}
                            </p>
                        </li>
                        <li className='flex gap-5 items-center justify-start cursor-pointer' onClick={handleInvitationsView}>
                            <Mails/>
                            <p className={`group w-max relative py-1 transition-all ${invitationsView ? 'font-semibold  border-b-3 border-blue-500' : 'text-gray-700 group'}`}>
                                <span>Invitations</span>
                                {!invitationsView && (<span className="absolute -bottom-0 left-1/2 h-0.5 w-0 bg-blue-500 transition-all duration-300 group-hover:left-0 group-hover:w-full"></span>)}
                            </p>
                        </li>
                    </ul>
                    </div>
                </div>
                <Button
                    className="flex gap-3 items-center w-full px-3 py-2 mt-5 bg-[#0856BA] text-white rounded-[10px] hover:bg-[#063d8c] transition-all cursor-pointer"
                    onClick={() => {setShowForm(!showForm); document.body.style.overflow = 'hidden'}}
                >
                    <Pencil className="w-5 h-5" />
                    <p className="group w-max relative py-1 transition-all font-semibold">
                    Propose Event</p>
                </Button>
            </div>
        
            {/* main */}
            {proposedView && (
                <div className='flex flex-col gap-[10px] w-full'>
                    <ProposeEventProfileForm 
                        isOpen={showForm}
                        onClose={() => {setShowForm(false); document.body.style.overflow = 'auto'}}
                        isEditing={isEditing}
                        isDetails={false}
                        setDetailsPage={setDetailsPage}
                        editingEventId={""}
                        setEdit={setEdit}
                    />

                    {proposedEvents.length > 0 ? (
                        // event cards
                        <EventsProfileList
                            events = {proposedEvents}
                            isLoading = {isLoading}
                            type = {"Proposed Events"}
                            emptyMessage = "No events have been created yet."
                        />
                    ) : (
                        statusFilter !== "all" && statusFilter !== "Draft" ? (
                            <div className="flex flex-col p-5 max-h-fit space-y-1 w-full justify-center items-center">
                                <p className="text-gray-700">No {statusFilter.charAt(0).toLowerCase() + statusFilter.slice(1)} events found.</p>
                            </div>
                        ) : statusFilter === "all" ? (
                            <div className="flex flex-col p-5 max-h-fit space-y-1 w-full justify-center items-center">
                                <p className="text-gray-700">No proposed events found.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col p-5 max-h-fit space-y-1 w-full justify-center items-center">
                                <p className="text-gray-700">No drafts found.</p>
                            </div>
                        )
                    )}
                </div>
            )}

            {invitationsView && (
                <div className='flex flex-col gap-[10px] w-full'>
                    <ProposeEventProfileForm 
                        isOpen={showForm}
                        onClose={() => {setShowForm(false); document.body.style.overflow = 'auto'}}
                        isEditing={isEditing}
                        isDetails={false}
                        setDetailsPage={setDetailsPage}
                        editingEventId={""}
                        setEdit={setEdit}
                    />

                    {/* Event List */}
                    {sortedEvents.length > 0 ? (
                        <EventsProfileList events={sortedEvents} isLoading={isLoading} type = {"Invitations"} />
                    ) : (
                        filterOption !== "All" && filterOption !== "Done" ? (
                            <div className="flex flex-col p-5 max-h-fit space-y-1 w-full justify-center items-center">
                                <p className="text-gray-700">No {filterOption.charAt(0).toLowerCase() + filterOption.slice(1)} events found.</p>
                            </div>
                        ) : filterOption === "All" ? (
                            <div className="flex flex-col p-5 max-h-fit space-y-1 w-full justify-center items-center">
                                <p className="text-gray-700">No invitations found.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col p-5 max-h-fit space-y-1 w-full justify-center items-center">
                                <p className="text-gray-700">No finished events found.</p>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    </div>
    )
};