"use client";

import React, { useEffect, useState } from "react";
import { useEvents } from "@/context/EventContext";
import EventSidebar from "./components/Sidebar";
import EventsList from "./components/EventsList";
import { Event } from "@/models/models";

export default function AllEventsPage()
{
    const { events, isLoading } = useEvents();
    const [sortedEvents, setSortedEvents] = useState<Event[]>([]);
    const [sortOption, setSortOption] = useState<string>('closest');

    useEffect(() => 
    {
        if(events.length > 0)
        {
            const filteredEvents = events.filter(
                (e : { status: string }) => (e.status === 'approved' || e.status === 'rejected')
            );
    
            const sorted = [...filteredEvents].sort((x, y) =>
            {
                switch (sortOption)
                {
                    case 'event-closest':
                        return new Date(x.date).getTime() - new Date(y.date).getTime();
    
                    case 'event-farthest':
                        return new Date(y.date).getTime() - new Date(x.date).getTime();
                    
                    case 'posted-newest':
                        const dateX = x.datePosted?.seconds
                        ? new Date(x.datePosted.seconds * 1000)
                        : new Date(0);
                        const dateY = y.datePosted?.seconds
                        ? new Date(y.datePosted.seconds * 1000)
                        : new Date(0);
                        return dateY.getTime() - dateX.getTime();
    
                    case 'posted-oldest':
                        const oldDateX = x.datePosted?.seconds
                        ? new Date(x.datePosted.seconds * 1000)
                        : new Date(0);
                        const oldDateY = y.datePosted?.seconds
                        ? new Date(y.datePosted.seconds * 1000)
                        : new Date(0);
                        return oldDateX.getTime() - oldDateY.getTime();
    
                    default:
                        return 0;
                }
            });

            setSortedEvents(sorted);
        }

        else
        {
            setSortedEvents([]);
        }
    }, [events, sortOption]);

    const handleSortChange = (f: React.ChangeEvent<HTMLSelectElement>) =>
    {
        setSortOption(f.target.value);
    }

    return(
        <div className="bg-[#EAEAEA]">
            {/* Page Title */}
            <div className="relative bg-cover bg-center pt-20 pb-10 px-10 md:px-30 md:pt-30 md:pb-20 lg:px-50" style={{ backgroundImage: 'url("/ICS2.jpg")' }}>
                <div className="absolute inset-0 bg-blue-500/50" />
                    <div className="relative z-10">
                    <h1 className="text-5xl font-bold my-2 text-white">Events</h1>
                    <p className='text-white text-sm md:text-base'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla porta, ligula non sagittis tempus, risus erat aliquam mi, nec vulputate dolor nunc et eros. Fusce fringilla, neque et ornare eleifend, enim turpis maximus quam, vitae luctus dui sapien in ipsum. Pellentesque mollis tempus nulla, sed ullamcorper quam hendrerit eget.</p>
                </div>
            </div>
            {/* Body */}
            <div className='my-[40px] mx-[30px] h-fit flex flex-col gap-[40px] md:flex-row lg:mx-[50px] xl:mx-[200px] static'>
                {/* Sidebar */}
                <div className='bg-[#FFFFFF] flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max md:sticky md:top-1/7 '>
                <EventSidebar />
                </div>
                {/* Main content */}
                <div className='flex flex-col gap-[10px] w-full mb-10'>
                    {/* Filter tabs */}
                    <div className="bg-[#FFFFFF] rounded-[10px] px-5 py-1 flex justify-between items-center shadow-md border border-gray-200">
                        <h2 className="text-md lg:text-lg font-semibold">All Events</h2>
                        <div className="flex items-center">
                            <label htmlFor="sort" className="mr-2 text-sm">Sort by:</label>
                            <select id="sort" value={sortOption} onChange={handleSortChange} className="flex items-center text-sm" >
                                <option value="event-closest">Upcoming Events (Soonest First)</option>
                                <option value="event-farthest">Upcoming Events (Furthest Ahead)</option>
                                <option value="posted-newest">Newest Post</option>
                                <option value="post-oldest">Oldest Post</option>
                            </select>
                        </div>
                    </div>
                    {sortedEvents.length > 0 ? (
                        // event cards
                        <EventsList
                            events = {events}
                            isLoading = {isLoading}
                            emptyMessage = "No Events have been created yet."
                        />
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg w-full">
                            <h3 className="text-xl font-medium text-gray-600">No events found</h3>
                            <p className="text-gray-500 mt-2">There are no events with the selected filter.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}