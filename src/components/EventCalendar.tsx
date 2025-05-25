import { useState, useMemo, useRef, useEffect } from "react";
import { useEvents } from "@/context/EventContext";
import { Event } from "@/models/models";
import { Calendar, ChevronLeft, ChevronRight, Users2 } from "lucide-react";
import formatTimeString from "@/lib/timeFormatter";

export default function EventCalendar() {
  const { events, isLoading } = useEvents();
  const [viewMode, setViewMode] = useState<"week" | "month">("week"); // "week" or "month"
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Get start and end dates for week/month view
  const dateRanges = useMemo(() => {
    const today = new Date(currentDate);
    // Week view
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    // Month view
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return {
      week: { start: startOfWeek, end: endOfWeek },
      month: { start: startOfMonth, end: endOfMonth },
    };
  }, [currentDate]);

  // Filter approved events
  const approvedEvents = useMemo(() => {
    return events.filter((event: Event) => event.status === "Accepted");
  }, [events]);

  // Get events for current view (week/month)
  const displayedEvents = useMemo(() => {
    const { start, end } = dateRanges[viewMode];
    return approvedEvents
      .filter((event: Event) => {
        const eventDate = new Date(event.date);
        return eventDate >= start && eventDate <= end;
      })
      .sort(
        (a: Event, b: Event) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );
  }, [approvedEvents, dateRanges, viewMode]);

  // Generate days for the current view
  const daysInView = useMemo(() => {
    const days = [];
    const { start, end } = dateRanges[viewMode];
    const current = new Date(start);
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [dateRanges, viewMode]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: { [key: string]: Event[] } = {};
    displayedEvents.forEach((event: Event) => {
      const dateKey = new Date(event.date).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [displayedEvents]);

  // Navigate previous/next week or month
  interface NavigateFunction {
    (direction: "prev" | "next"): void;
  }
  const navigate: NavigateFunction = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  // Check if a date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Format date range for display
  const formatDateRange = () => {
    const { start, end } = dateRanges[viewMode];
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
    };
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString(
        undefined,
        options
      )} - ${end.getDate()}, ${end.getFullYear()}`;
    } else {
      return `${start.toLocaleDateString(
        undefined,
        options
      )} - ${end.toLocaleDateString(undefined, {
        ...options,
        year: "numeric",
      })}`;
    }
  };

  // Handle event click
  const handleEventClick = (
    event: Event,
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    // If clicking the same event, toggle the tooltip off
    if (selectedEvent && selectedEvent === event) {
      setSelectedEvent(null);
      return;
    }

    setSelectedEvent(event);

    // Get the position of the event element
    const rect = e.currentTarget.getBoundingClientRect();

    // Position the tooltip near the clicked event
    const x = rect.left;
    const y = rect.bottom + 5; // Position below the event

    setTooltipPosition({ x, y });
  };

  // Close tooltip when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setSelectedEvent(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Format date for display
  const formatEventDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Adjust tooltip position if it goes off screen
  useEffect(() => {
    if (selectedEvent && tooltipRef.current) {
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let { x, y } = tooltipPosition;

      // Check if tooltip goes off the right edge
      if (x + tooltipRect.width > viewportWidth) {
        x = viewportWidth - tooltipRect.width - 10;
      }

      // Check if tooltip goes off the bottom edge
      if (y + tooltipRect.height > viewportHeight) {
        y = Math.max(5, y - tooltipRect.height - 30); // Position above the event
      }

      setTooltipPosition({ x, y });
    }
  }, [selectedEvent]);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 mb-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {viewMode === "week" ? "This Week's Events" : "This Month's Events"}
        </h2>
        <div className="flex items-center gap-2">
          <button
            className={`px-3 py-1 text-sm border rounded ${
              viewMode === "week"
                ? "bg-blue-50 border-blue-500"
                : "border-gray-300"
            }`}
            onClick={() => setViewMode("week")}
          >
            Week
          </button>
          <button
            className={`px-3 py-1 text-sm border rounded ${
              viewMode === "month"
                ? "bg-blue-50 border-blue-500"
                : "border-gray-300"
            }`}
            onClick={() => setViewMode("month")}
          >
            Month
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        {!(
          new Date(currentDate.toDateString()).getTime() ===
          new Date(new Date().toDateString()).getTime()
        ) ? (
          <button
            className="flex items-center px-3 py-1 rounded-full text-white bg-[#0856BA] hover:bg-[#0856BA]/90 transition-colors"
            onClick={() => navigate("prev")}
          >
            <ChevronLeft size={18} className="mr-1" />
            Prev
          </button>
        ) : (
          <div className="flex items-center text-transparent mr-1">Prev</div>
        )}
        <div className="flex items-center">
          <Calendar size={18} className="mr-2" />
          <span>{formatDateRange()}</span>
        </div>
        <button
          className="flex items-center px-3 py-1 rounded-full text-white bg-[#0856BA] hover:bg-[#0856BA]/90 transition-colors"
          onClick={() => navigate("next")}
        >
          Next
          <ChevronRight size={18} className="ml-1" />
        </button>
      </div>
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading events...</p>
        </div>
      ) : displayedEvents.length === 0 ? (
        <div className="text-center py-8 border border-gray-200 rounded-lg">
          <Calendar size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500">
            No events scheduled for this {viewMode}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div
            className={`grid ${
              viewMode === "week" ? "grid-cols-7" : "grid-cols-7"
            } gap-1`}
          >
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-2 text-center font-medium text-gray-600 bg-gray-100"
              >
                {day}
              </div>
            ))}
            {/* Add empty cells for month view */}
            {viewMode === "month" &&
              Array.from({ length: dateRanges.month.start.getDay() }).map(
                (_, i) => (
                  <div
                    key={`empty-start-${i}`}
                    className="h-24 p-1 border border-gray-200 bg-gray-50"
                  ></div>
                )
              )}
            {/* Calendar days with events */}
            {daysInView.map((date) => {
              const dateString = date.toDateString();
              const dayEvents = eventsByDate[dateString] || [];
              const isCurrentMonth = date.getMonth() === currentDate.getMonth();
              return (
                <div
                  key={dateString}
                  className={`min-h-36 p-1 border border-gray-200 ${
                    isToday(date)
                      ? "bg-blue-50"
                      : viewMode === "month" && !isCurrentMonth
                      ? "bg-gray-50"
                      : ""
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`font-medium w-6 h-6 flex items-center justify-center rounded-full text-sm ${
                        isToday(date) ? "bg-blue-500 text-white" : ""
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-[#0856BA] text-white">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>
                  <div className="overflow-y-auto max-h-16">
                    {dayEvents
                      .sort((a: Event, b: Event) => {
                        const normalize = (time: string | null | undefined) => {
                          if (!time) return null;
                          const [h, m] = time.split(":");
                          const hour = h.padStart(2, "0");
                          const minute = m.padStart(2, "0");
                          return `${hour}:${minute}`;
                        };

                        const timeA = normalize(a.time);
                        const timeB = normalize(b.time);

                        if (!timeA) return 1;
                        if (!timeB) return -1;

                        return timeA.localeCompare(timeB);
                      })
                      .map((event, idx) => (
                        <div
                          key={idx}
                          className="text-xs p-1 mb-1 rounded bg-blue-100 truncate cursor-pointer hover:bg-blue-200 transition-colors"
                          onClick={(e) => handleEventClick(event, e)}
                        >
                          {`${
                            formatTimeString(event.time).includes(
                              "No time indicated"
                            )
                              ? ""
                              : `${formatTimeString(event.time)}-`
                          } ${event.title}`}
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
            {/* Add empty cells to complete the month grid */}
            {viewMode === "month" &&
              (() => {
                const lastDay = dateRanges.month.end.getDay();
                const emptyCellsNeeded = lastDay < 6 ? 6 - lastDay : 0;
                return Array.from({ length: emptyCellsNeeded }).map((_, i) => (
                  <div
                    key={`empty-end-${i}`}
                    className="h-24 p-1 border border-gray-200 bg-gray-50"
                  ></div>
                ));
              })()}
          </div>
        </div>
      )}

      {/* Simplified Event details tooltip - only title and date */}
      {selectedEvent && (
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-white shadow-lg rounded-md p-3 border border-gray-200 w-64 tooltip-container"
          style={{
            top: `${tooltipPosition.y}px`,
            left: `${tooltipPosition.x}px`,
          }}
        >
          <div className="font-semibold text-blue-600 mb-2">
            {selectedEvent.title}
          </div>
          <div className="flex items-start pb-0.5">
            <Calendar size={14} className="text-gray-500 mr-2  flex-shrink-0" />
            <span className="text-xs text-gray-700">
              {formatEventDate(selectedEvent.date)}
            </span>
          </div>
          <div className="flex items-start text-xs text-gray-900">
            <Users2 size={14} className="text-gray-500 mr-2  flex-shrink-0" />
            {selectedEvent.rsvps.length}
          </div>
        </div>
      )}
    </div>
  );
}
