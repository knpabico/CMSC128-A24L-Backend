"use client";

import React, { useEffect, useState } from "react";
import { useEvents } from "@/context/EventContext";
import EventSidebar from "./components/Sidebar";
import EventsList from "./components/EventsList";
import { Event } from "@/models/models";
import Banner from "@/components/Banner";
import ProposeEventForm from "./components/ProposeEventForm";
import { ChevronDown, FilePlus2 } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function AllEventsPage() {
  const { events, isLoading, setShowForm, showForm } = useEvents();
  const [sortedEvents, setSortedEvents] = useState<Event[]>([]);
  const [sortOption, setSortOption] = useState<string>("event-closest");
  const [isEditing, setEdit] = useState<boolean>(false);
  const [isDetails, setDetailsPage] = useState<boolean>(false);
  const pathname = usePathname();

  // Close modal when navigating on other pages
  useEffect(() => {
    return () => {
      setShowForm(false);
    };
  }, [pathname, setShowForm]);

  useEffect(() => {
    console.log("Events:", events);

    if (events.length > 0) {
      const filteredEvents = events.filter(
        (e: Event) => e.status === "Accepted" && new Date(e.date) > new Date()
      );

      console.log("Filtered Events:", filteredEvents);

      // Sort events based on the selected sort option
      const sorted = [...filteredEvents].sort((x, y) => {
        switch (sortOption) {
          case "event-closest":
            return new Date(x.date).getTime() - new Date(y.date).getTime();

          case "event-farthest":
            return new Date(y.date).getTime() - new Date(x.date).getTime();

          case "posted-newest":
            const dateX = x.datePosted?.seconds
              ? new Date(x.datePosted.seconds * 1000)
              : new Date(0);
            const dateY = y.datePosted?.seconds
              ? new Date(y.datePosted.seconds * 1000)
              : new Date(0);
            return dateY.getTime() - dateX.getTime();

          case "posted-oldest":
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

      console.log("Sorted Events:", sorted);
      setSortedEvents(sorted);
    } else {
      setSortedEvents([]);
    }
  }, [events, sortOption]);

  const handleSortChange = (f: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(f.target.value);
  };

  return (
    <div className="bg-[#EAEAEA]">
      <title>Events | ICS-ARMS</title>
      {/* Page Title */}
      <Banner
        title="Events"
        description="Reconnect through ICS and alumni events that nurture unity, inspire growth, and strengthen our sense of community."
      />
      {/* Body */}
      <div className="my-[40px] mx-[10%] h-fit flex flex-col gap-[40px] md:flex-row static">
        {/* Sidebar */}
        <div className="flex flex-col gap-3">
          <div className="bg-[#FFFFFF] shadow-md flex flex-col p-7 gap-[10px] rounded-[10px] w-content h-max md:sticky md:top-1/7 ">
            <EventSidebar />
          </div>
          <button
            className="bg-[var(--primary-blue)] text-white text-sm font-semibold rounded-full shadow-md hover:bg-[var(--blue-600)] hover:text-white flex items-center justify-center py-2 gap-2 w-full cursor-pointer"
            onClick={() => setShowForm(true)}
          >
            <FilePlus2 className="w-5 h-5" />
            Propose Event
          </button>
        </div>

        {/* Main content */}
        <div className="flex flex-col gap-[10px] w-full mb-10">
          {/* Filter tabs */}
          <div className="bg-[#FFFFFF] rounded-[10px] px-5 py-3 flex justify-between items-center shadow-md border border-gray-200">
            <h2 className="text-md lg:text-lg font-semibold">
              All Upcoming Events
            </h2>
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center relative">
                <label
                  htmlFor="sort"
                  className="mr-3 text-sm"
                  style={{ color: "#0856BA" }}
                >
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={sortOption}
                  onChange={handleSortChange}
                  className="text-sm rounded-full py-2 pr-10 px-4 border-[2px] appearance-none"
                  style={{ borderColor: "#0856BA", color: "#0856BA" }}
                >
                  <option value="event-closest">
                    Upcoming Events (Soonest First)
                  </option>
                  <option value="event-farthest">
                    Upcoming Events (Furthest Ahead)
                  </option>
                  <option value="posted-newest">Date Approved (Newest)</option>
                  <option value="post-oldest">Date Approved (Earliest)</option>
                </select>

                <div
                  className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                  style={{ color: "#0856BA" }}
                >
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

          {sortedEvents.length > 0 ? (
            // event cards
            <EventsList
              events={sortedEvents}
              isLoading={isLoading}
              type={"All Events"}
              emptyMessage="No Events have been created yet."
            />
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg w-full">
              <h3 className="text-xl font-medium text-gray-600">
                No events found
              </h3>
              <p className="text-gray-500 mt-2">
                There are no events with the selected filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
