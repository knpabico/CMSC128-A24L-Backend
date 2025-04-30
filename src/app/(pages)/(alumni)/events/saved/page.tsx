"use client";

import { useEffect, useState } from "react";
import { useEvents } from "@/context/EventContext";
import { useAuth } from "@/context/AuthContext";
import { useBookmarks } from "@/context/BookmarkContext";
import EventSidebar from "../components/Sidebar";
import EventsList from "../components/EventsList";
import { Event } from "@/models/models";

export default function SavedEventsPage()
{
    const { events, isLoading } = useEvents();
    const { user, alumInfo } = useAuth();
    const { bookmarks, entries, isLoading: isLoadingBookmarks } = useBookmarks();
    const [savedEvents, setSavedEvents] = useState<Event[]>([]);
    const [sortOption, setSortOption] = useState<string>('event-closest');

    useEffect(() =>
    {

        if (events.length > 0 && bookmarks.length > 0 && user)
        {
            const eventBookmarks = bookmarks.filter(bookmark =>
                bookmark.type === "event" &&
                bookmark.alumniId === alumInfo?.alumniId
            );

            console.log("Filtered Event Bookmarks:", eventBookmarks);

            const savedEventIds = eventBookmarks.map(bookmark => bookmark.entryId);
            console.log("Saved Event IDs:", savedEventIds);
    
            const filteredEvents = events.filter((e: { eventId: string }) =>
                savedEventIds.includes(e.eventId)
            );
    
            console.log("Filtered Events:", filteredEvents);
    

            // Sort events based on the selected sort option
            const sorted = [...filteredEvents].sort((x, y) =>
            {
                switch (sortOption)
                {
                    case 'event-closest':
                        return new Date(x.date).getTime() - new Date(y.date).getTime();

                    case 'event-farthest':
                        return new Date(y.date).getTime() - new Date(x.date).getTime();

                    case 'posted-newest':
                        const dateX = x.datePosted?.seconds ? new Date(x.datePosted.seconds * 1000) : new Date(0);
                        const dateY = y.datePosted?.seconds ? new Date(y.datePosted.seconds * 1000) : new Date(0);
                        return dateY.getTime() - dateX.getTime();

                    case 'posted-oldest':
                        const oldDateX = x.datePosted?.seconds ? new Date(x.datePosted.seconds * 1000) : new Date(0);
                        const oldDateY = y.datePosted?.seconds ? new Date(y.datePosted.seconds * 1000) : new Date(0);
                        return oldDateX.getTime() - oldDateY.getTime();

                    default:
                        return 0;
                }
            });

            console.log("Sorted Events:", sorted);
            setSavedEvents(sorted);
        } 
        
        else
        {
            setSavedEvents([]);
        }
    }, [events, bookmarks, sortOption]);

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
                        <h2 className="text-md lg:text-lg font-semibold">Saved Events</h2>
                        <div className="flex items-center">
                            <label htmlFor="sort" className="mr-2 text-sm">Sort by:</label>
                            <select id="sort" value={sortOption} onChange={handleSortChange} className="text-gray-600 flex items-center text-sm" >
                                <option value="event-closest">Upcoming Events (Soonest First)</option>
                                <option value="event-farthest">Upcoming Events (Furthest Ahead)</option>
                                <option value="posted-newest">Date Approved (Newest)</option>
                                <option value="post-oldest">Date Approved (Earliest)</option>
                            </select>
                        </div>
                    </div>
                    {savedEvents.length > 0 ? (
                        // event cards
                        <EventsList
                            events = {savedEvents}
                            isLoading = {isLoading}
                            emptyMessage = "You have not bookmarked any events have been created yet."
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

