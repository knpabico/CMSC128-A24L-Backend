"use client";

import React, { useEffect, useState } from "react";
import { useEvents } from "@/context/EventContext";
import { useAuth } from "@/context/AuthContext";
import EventSidebar from "../components/Sidebar";
import EventsList from "../components/EventsList";
import { Event } from "@/models/models";
import ProposeEventForm from "../components/ProposeEventForm";
import { FilePlus2 } from "lucide-react";


export default function ProposedEventsPage()
{
    const { 
        events, 
        isLoading, 
        setShowForm,
        showForm,
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

    const getStatusDisplayTitle = () =>
    {
        switch (statusFilter)
        {
          case 'Accepted': return 'Approved Proposals';
          case 'Pending': return 'Pending Proposals';
          case 'Rejected': return 'Rejected Proposals';
          case 'all': return 'All Proposals';
          case 'Draft': return 'Draft Proposals';
          default: return 'Proposed Events';
        }
    };
    
 
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
                    <div className="bg-[#FFFFFF] rounded-[10px] px-5 py-3 flex flex-col md:flex-row md:justify-between md:items-center gap-2 shadow-md border border-gray-200">
                        <h2 className="text-lg font-semibold">{getStatusDisplayTitle()}</h2>
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">

                            {/* Status filter */}
                            <div className="flex items-center">
                                <label htmlFor="status" className="mr-2 text-sm">Status:</label>
                                <select id="status" value={statusFilter} onChange={handleStatusFilterChange} className="text-gray-600 flex items-center text-sm" >
                                    <option value="all">All</option>
                                    <option value="Accepted">Approved</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Draft">Draft</option>
                                </select>
                            </div>
                            <div> | </div>
                            {/* Sort by */}
                            <div className="flex items-center">
                                <label htmlFor="sort" className="mr-2 text-sm">Sort by:</label>
                                <select id="sort" value={sortOption} onChange={handleSortChange} className="text-gray-600 flex items-center text-sm" >
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Earliest</option>
                                </select>
                            </div>

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

                    {proposedEvents.length > 0 ? (
                        // event cards
                        <EventsList
                            events = {proposedEvents}
                            isLoading = {isLoading}
                            type = {"Proposed Events"}
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