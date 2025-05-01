"use client";

import { useState, useRef, useEffect } from "react";
import { useEvents } from "@/context/EventContext"; // Replace with your Event Context
import { Event } from "@/models/models"; // Replace with your Event model
import { Card } from "@/components/ui/card"; // If needed for layout
import { Button } from "@/components/ui/button"; // If needed for buttons
import { ChevronRight, Trash2, Edit, Calendar, Clock } from "lucide-react"; // Icons for events

export default function Events() {
  const { events, isLoading, handleView, handleDelete, handleEdit, selectedEvent, closeModal } = useEvents();
  const [activeTab, setActiveTab] = useState("Pending");
  const tableRef = useRef<HTMLDivElement | null>(null);
  const [headerWidth, setHeaderWidth] = useState("100%");
  const [isSticky, setIsSticky] = useState(false);

  console.log("Events:", events);

  const filterEvents = (status: string) => {
    return events.filter((event: Event) => event.status === status);
  };

  const tabs = ["Approved", "Pending", "Rejected"];

  const stats = {
    accepted: events.filter((e: Event) => e.status === "Accepted").length,
    pending: events.filter((e: Event) => e.status === "Pending").length,
    reject: events.filter((e: Event) => e.status === "Rejected").length,
    total: events.length
  };

  // Sticky header on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!tableRef.current) return;

      const tableRect = tableRef.current.getBoundingClientRect();

      if (tableRect.top <= 0 && !isSticky) {
        setIsSticky(true);
        setHeaderWidth(tableRect.width.toString());
      } else if (tableRect.top > 0 && isSticky) {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Set initial width
    if (tableRef.current) {
      setHeaderWidth(tableRef.current.offsetWidth.toString());
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isSticky]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <div>Home</div>
        <div><ChevronRight size={15} /></div>
        <div>Events</div>
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">Manage Events</div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* Tabs */}
        <div className="w-full flex gap-2">
          {tabs.map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full flex flex-col items-center justify-end rounded-t-2xl overflow-hidden pt-0.4 cursor-pointer ${
                activeTab === tab ? "bg-[var(--primary-blue)]" : "bg-white"
              }`}
            >
              <div
                className={`w-full h-1 transition-colors ${
                  activeTab === tab ? "bg-[var(--primary-blue)]" : "bg-transparent"
                }`}
              ></div>
              <div
                className={`w-full py-3 flex items-center justify-center gap-1 rounded-t-2xl font-semibold text-base ${
                  activeTab === tab
                    ? "text-[var(--primary-blue)] bg-white"
                    : "text-blue-200 bg-white"
                }`}
              >
                {tab} 
                <div
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-[13px] text-white ${
                    activeTab === tab
                      ? "bg-amber-400"
                      : "bg-blue-200"
                  }`}
                >
                  {tab === "Approved" ? stats.accepted : tab === "Pending" ? stats.pending : stats.reject}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
          <div className="rounded-xl overflow-hidden border border-gray-300 relative" ref={tableRef}>
            <div 
              className={`bg-blue-100 w-full flex gap-4 p-4 text-xs z-10 shadow-sm ${
                isSticky ? 'fixed top-0' : ''
              }`}
              style={{ width: isSticky ? headerWidth : '100%' }}
            >
              <div className="w-1/2 flex items-center justify-baseline font-semibold">
                Event Info
              </div>
              <div className="w-1/2 flex justify-end items-center">
                <div className="w-1/6 flex items-center justify-center font-semibold">Status</div>
                <div className="w-1/6 flex items-center justify-center font-semibold">Actions</div>
                <div className="w-1/6 flex items-center justify-center"></div>
              </div>
            </div>

            {isSticky && <div style={{ height: '56px' }}></div>}

            {/* Dynamic rows */}
            {filterEvents(activeTab).map((event: Event, index: number) => (
              <div
                key={index}
                className={`w-full flex gap-4 border-t border-gray-300 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-blue-50`}
              >
                <div className="w-1/2 flex flex-col p-4 gap-1">
                  <div className="text-base font-bold">{event.title}</div>
                  <div className="text-sm text-gray-600">{event.location}</div>
                  <div className="text-sm text-gray-500">
                    {event.date} • {event.time}
                  </div>
                </div>
                <div className="w-1/2 flex items-center justify-end p-5">
                  <div className="w-1/6 flex items-center justify-center">
                    <div className={`px-2 py-1 text-xs rounded ${
                      event.status === "Upcoming" ? "bg-blue-100 text-blue-800" : 
                      event.status === "Ongoing" ? "bg-yellow-100 text-yellow-800" : 
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {event.status}
                    </div>
                  </div>

                  <div className="w-1/6 flex items-center justify-center">
                    <div 
                      className="text-[var(--primary-blue)] hover:underline cursor-pointer"
                      onClick={() => handleView(event.eventId)}
                    >View Details</div>
                  </div>
                  <div className="w-1/6 flex items-center justify-center">
                    <div className="flex gap-2 items-center justify-center">
                      <button
                        className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                        onClick={() => handleEdit(event.eventId)}
                      >
                        <Edit size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                        onClick={() => handleDelete(event.eventId)}
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full">
          <div className="bg-white border-0 p-8 rounded-lg border-gray shadow-lg w-3/4 max-w-4xl">
            <h1 className="text-3xl mb-6 font-semibold border-b pb-4">Event Details</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <p><strong>Title:</strong> {selectedEvent.title}</p>
              <p><strong>Date:</strong> {selectedEvent.date}</p>
              <p><strong>Time:</strong> {selectedEvent.time}</p>
              <p><strong>Location:</strong> {selectedEvent.location}</p>
            </div>
            <div className="mb-4">
              <p><strong>Description:</strong> {selectedEvent.description}</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
