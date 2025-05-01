"use client";

import { useEffect, useRef, useState } from "react";
import { useEvents } from "@/context/EventContext";
import { Event } from "@/models/models";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Calendar, Clock, MapPin } from "lucide-react";
import ModalInput from "@/components/ModalInputForm";
import { useParams } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumb";

export default function EventPageAdmin()
{
    const router = useRouter();
    const params = useParams();
    const
    {
        events,
        isLoading,
        showForm,
        setShowForm,
        handleSave,
        handleEdit,
        handleDelete,
        handleReject,
        handleAccept,
        handleFinalize,
        title,
        setEventTitle,
        date,
        setEventDate,
        description,
        setEventDescription,
        status,
        setStatus,
        fetchAlumnusById,

    } = useEvents();

    const evId = params?.eventId as string;
    const ev = events.find((e: Event) => e.eventId === evId);

    const [isEditing, setEdit] = useState(false);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
  
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [visibility, setVisibility] = useState("default");
    const [selectedBatches, setSelectedBatches] = useState<any[]>([]);
    const [selectedAlumni, setSelectedAlumni] = useState<any[]>([]);

    const [creatorNames, setCreatorNames] = useState<{ [key: string]: string }>({});
    const [sortBy, setSortBy] = useState("latest");
    const [statusFilter, setStatusFilter] = useState("all");

    const tableRef = useRef<HTMLDivElement | null>(null);
    const [headerWidth, setHeaderWidth] = useState("100%");
    const [isSticky, setIsSticky] = useState(false);

    if(!events) return <div>Loading Events...</div>;

    const sortedEvents = [...events].sort((x, y) =>
    {
        switch(sortBy)
        {
            case 'posted-newest':
                const dateX = x.datePosted?.seconds ? new Date(x.datePosted.seconds * 1000) : new Date(0);
                const dateY = y.datePosted?.seconds ? new Date(y.datePosted.seconds * 1000) : new Date(0);
                return dateY.getTime() - dateX.getTime();

            case 'posted-oldest':
                const oldDateX = x.datePosted?.seconds ? new Date(x.datePosted.seconds * 1000) : new Date(0);
                const oldDateY = y.datePosted?.seconds ? new Date(y.datePosted.seconds * 1000) : new Date(0);
                return oldDateX.getTime() - oldDateY.getTime();
            
            case 'alphabetical':
            {
                const xName = events[x.eventId]!.title;
                const yName = events[y.eventId]!.title;

                return xName.toLowerCase().localeCompare(yName.toLowerCase());
            }

            default:
                return 0;
        }
    });

    const filteredEvents = statusFilter === "all"
        ? sortedEvents
        : sortedEvents.filter(event => event.status === statusFilter);
    
    const navigateToDetails = (eventId: string) => 
    {
        router.push(`organize-events/${eventId}`)
    };
    const formatDate = (date: any) =>
    {
        if (!date) return "N/A";
        const dateObj = typeof date === 'object' && date.toDate 
            ? date.toDate() 
            : new Date(date);
            
        return dateObj.toLocaleDateString("en-US", 
        {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    useEffect(() =>
    {
        let isMounted = true;
    
        const fetchCreators = async () =>
        {
            const eventsToFetch = filteredEvents.filter(
                (event) => event.creatorType === "alumni" && !creatorNames[event.eventId]
            );
    
            if (eventsToFetch.length === 0) return;
    
            const names = { ...creatorNames };
    
            await Promise.all(
                eventsToFetch.map(async (event) =>
                {
                    try 
                    {
                        const creator = await fetchAlumnusById(event.creatorId);
                        if (creator && isMounted) 
                        {
                            names[event.eventId] = `${creator.firstName} ${creator.lastName}`;
                        } 
                        
                        else if (isMounted)
                        {
                            names[event.eventId] = "Unknown";
                        }
                    } 
                    
                    catch (error) 
                    {
                        console.error("Error fetching creator: ", error);
                        if (isMounted) 
                        {
                            names[event.eventId] = "Unknown";
                        }
                    }
                })
            );
    
            if (isMounted) setCreatorNames(names);
        };
    
        fetchCreators();

        const handleScroll = () => 
        {
            if (!tableRef.current) return;
    
            const tableRect = tableRef.current.getBoundingClientRect();
    
            if (tableRect.top <= 0 && !isSticky)
            {
                setIsSticky(true);
                setHeaderWidth(tableRect.width.toString());
            } 
            
            else if (tableRect.top > 0 && isSticky)
            {
                setIsSticky(false);
            }
        };
    
        window.addEventListener("scroll", handleScroll);
    
        if (tableRef.current)
        {
            setHeaderWidth(tableRef.current.offsetWidth.toString());
        }
    
        return () =>
        {
            window.removeEventListener("scroll", handleScroll);
            isMounted = false;
        };
    
    }, [filteredEvents, creatorNames]);    

    return (
        <div>        
            <Breadcrumbs
            items=
            {[
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
                            onClick={() => setStatusFilter("all")}
                            className={`px-4 py-2 rounded-md font-medium transition-colors ${
                            statusFilter === "all" 
                                ? "bg-blue-600 text-white" 
                                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            }`}
                        >
                            All Upcoming Events
                        </button>
                        <button 
                            onClick={() => setStatusFilter("Accepted")}
                            className={`px-4 py-2 rounded-md font-medium transition-colors ${
                            statusFilter === "active" 
                                ? "bg-green-600 text-white" 
                                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            }`}
                        >
                            Approved
                        </button>
                        <button 
                            onClick={() => setStatusFilter("Pending")}
                            className={`px-4 py-2 rounded-md font-medium transition-colors ${
                            statusFilter === "pending" 
                                ? "bg-yellow-600 text-white" 
                                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            }`}
                        >
                            Pending
                        </button>
                        <button 
                            onClick={() => setStatusFilter("Rejected")}
                            className={`px-4 py-2 rounded-md font-medium transition-colors ${
                            statusFilter === "rejected" 
                                ? "bg-red-600 text-white" 
                                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                            }`}
                        >
                            Rejected
                        </button>
                        </div> 
                    </div>

                    {/* Sorting Dropdown */}
                    <div className="flex justify-start items-center">
                        <label htmlFor="sort" className="mr-2 font-medium text-gray-700">Sort by:</label>
                        <select
                            id="sort"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="p-2 border rounded-lg shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="posted-newest">Newest</option>
                            <option value="posted-oldest">Earliest</option>
                            <option value="alphabetical">Alphabetical</option>
                        </select>
                    </div>

                {isLoading && <div className="text-center text-lg">Loading...</div>}
                {/* Donation Drive List */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">
                        {statusFilter === "all" ? "All Events" :
                        statusFilter === "Accepted" ? "Approved Events" :
                        statusFilter === "Pending" ? "Pending Events" :
                        "Rejected Events"}
                    </h2>
                    {filteredEvents.length === 0 ? (
                        <p className="text-gray-500">No donation drives found.</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {filteredEvents.map((e: Event) => 
                                {
                                    return(
                                        <div
                                        key={ev.eventId}
                                        className="border rounded-lg shadow-sm hover:shadow-md bg-white overflow-hidden flex flex-row"
                                        >
                                            {/* Image Section */}
                                            <div
                                            className="cursor-pointer w-1/4 min-w-64 bg-gray-200"
                                            onClick={() => navigateToDetails(ev.eventId)}
                                            >
                                            {ev.image ? (
                                                <img
                                                src={ev.image}
                                                alt={ev.title}
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
                                                onClick={() => navigateToDetails(ev.eventId)}
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <h2 className="text-xl font-semibold truncate flex-1">
                                                        {ev.title}
                                                    </h2>
                                                    <span
                                                        className={`ml-4 px-2 py-0.5 text-xs font-medium rounded-full ${
                                                        ev.status === "Accepted"
                                                            ? "bg-green-100 text-green-800"
                                                            : ev.status === "Pending"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : ev.status === "Rejected"
                                                            ? "bg-red-100 text-red-800"
                                                            : "bg-gray-100 text-gray-800"
                                                        }`}
                                                    >
                                                        {ev.status.charAt(0).toUpperCase() + ev.status.slice(1)}
                                                    </span>
                                                </div>

                                                {/* Description */}
                                                <div className="mb-5 text-sm max-h-[40px] overflow-hidden text-clip">
                                                    <p className="text-start">
                                                        {ev.description}
                                                    </p>
                                                </div>

                                                {/* Event Details */}
                                                <div className="mt-5">
                                                    <div className="flex justify-between items-center gap-4">
                                                        {/* Event Date */}
                                                        <div className="flex gap-1 items-center w-1/3 justify-center">
                                                            <Calendar size={16} />
                                                            <p className="text-xs">{ev.date}</p>
                                                        </div>
                                                        
                                                        {/* Event Time */}
                                                        <div className="flex gap-1 items-center w-1/3 justify-center">
                                                            <Clock size={16} />
                                                            <p className="text-xs">{ev.time}</p>
                                                        </div>

                                                        {/* Where */}
                                                        <div className="flex gap-1 items-center w-1/3 justify-center">
                                                            <MapPin size={16} />
                                                            <p className="text-xs truncate">{ev.location}</p>
                                                        </div>

                                                        {/* Date of Post */}
                                                        <div className="flex gap-1 items-center w-1/3 justify-center">
                                                            <p className="text-xs truncate">Posted on {formatDate(ev.datePosted)}</p>
                                                        </div>
                                                        
                                                        {/* Creator */}
                                                        <div className="text-xs text-gray-700 mt-2">
                                                            <p> Created by: {creatorNames[ev.eventId] ?? "Admin"}</p>
                                                            <p>Creator Type: {ev.creatorType}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Action Buttons - R */}
                                        </div>
                                    )
                                })}
                            </div>
                    )}
                </div>

            </div>
        </div>  
    );
}