"use client";

import React, { useEffect, useState } from "react";
import { useEvents } from "@/context/EventContext";
import { useAuth } from "@/context/AuthContext";
import EventSidebar from "../components/Sidebar";
import EventsList from "../components/EventsList";
import { Event } from "@/models/models";
import ProposeEventForm from "../components/ProposeEventForm";
import { ChevronDown, FilePlus2 } from "lucide-react";
import Banner from "@/components/Banner";


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
            <Banner title="Events" description="Reconnect through ICS and alumni events that nurture unity, inspire growth, and strengthen our sense of community."/>
            {/* Body */}
            <div className='my-[40px] mx-[10%] h-fit flex flex-col gap-[40px] md:flex-row static'>
                {/* Sidebar */}
                <div className="flex flex-col gap-3">
                    <button 
                        className="bg-[var(--primary-blue)] text-white text-sm font-semibold rounded-full shadow-md hover:bg-[var(--blue-600)] hover:text-white flex items-center justify-center py-2 gap-2 w-full cursor-pointer"
                        onClick={() => setShowForm(true)}
                    >
                        <FilePlus2 className="w-5 h-5" />
                        Propose Event 
                    </button>
                    <div className='bg-[#FFFFFF] shadow-md flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max md:sticky md:top-1/7 '>
                        <EventSidebar />
                    </div>
                </div>
                {/* Main content */}
                <div className='flex flex-col gap-[10px] w-full mb-10'>
                    {/* Filter tabs */}
                    <div className="bg-[#FFFFFF] rounded-[10px] px-5 py-3 flex justify-between items-center shadow-md border border-gray-200">
                        <h2 className="text-md lg:text-lg font-semibold">{getStatusDisplayTitle()}</h2>
                        <div className="flex justify-between items-center gap-2">
                            <div className="flex items-center relative">
                                <label htmlFor="sort" className="mr-3 text-sm" style={{color: '#0856BA'}}>Status:</label>
                                <select id="sort" value={statusFilter} onChange={handleStatusFilterChange} className="text-sm rounded-full py-2 pr-10 px-4 border-[2px] appearance-none" style={{borderColor: '#0856BA', color: '#0856BA'}} >
                                    <option value="all">All</option>
                                    <option value="Accepted">Approved</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Draft">Draft</option>
                                </select>

                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style={{color: '#0856BA'}}>
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>
                            <div className='w-1'></div>
                            <div className="flex items-center relative">
                                <label htmlFor="sort" className="mr-3 text-sm" style={{color: '#0856BA'}}>Sort by:</label>
                                <select id="sort" value={sortOption} onChange={handleSortChange} className="text-sm rounded-full py-2 pr-10 px-4 border-[2px] appearance-none" style={{borderColor: '#0856BA', color: '#0856BA'}} >
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Earliest</option>
                                </select>

                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none" style={{color: '#0856BA'}}>
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>						
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