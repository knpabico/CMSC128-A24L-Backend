"use client";
import BarGraph from "@/components/charts/BarGraph";
import DonutChart from "@/components/charts/DonutChart";
import EventCalendar from "@/components/EventCalendar";
import ReportSummaryCard from "@/components/ReportSummaryCard";
import { useEvents } from "@/context/EventContext";
import { useRsvpDetails } from "@/context/RSVPContext";
import formatTimeString from "@/lib/timeFormatter";
import { Event } from "@/models/models";
import { Typography } from "@mui/material";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight } from "lucide-react";

const Page = () => {
  const { events, isLoading: eventLoading } = useEvents();
  const { rsvpDetails } = useRsvpDetails();

  const approvedEvents = useMemo(() => {
    return events.filter((event: Event) => event.status === "Accepted");
  }, [events]);

  const eventsWithDonations = useMemo(() => {
    return approvedEvents.filter(
      (event: Event) => event.donationDriveId !== ""
    );
  }, [approvedEvents]);

  const upcomingEvents = useMemo(() => {
    return approvedEvents
      .filter((event: Event) => {
        const eventDate = new Date(event.date);
        const today = new Date();
        return eventDate > today;
      })
      .sort((a: Event, b: Event) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  }, [approvedEvents]);

  const pastEvents = useMemo(() => {
    return approvedEvents
      .filter((event: Event) => {
        const eventDate = new Date(event.date);
        const today = new Date();
        return eventDate < today;
      })
      .sort((a: Event, b: Event) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [approvedEvents]);

  const eventsRSVPs = useMemo(() => {
    return approvedEvents
      .filter((event: Event) => {
        const rsvp = rsvpDetails.find((r: any) => r.postId === event.eventId);
        return rsvp?.alums && Object.keys(rsvp.alums).length > 0;
      })
      .sort((a: Event, b: Event) => {
        const rsvpA = rsvpDetails.find((r: any) => r.postId === a.eventId);
        const rsvpB = rsvpDetails.find((r: any) => r.postId === b.eventId);
        const countA = rsvpA?.alums ? Object.keys(rsvpA.alums).length : 0;
        const countB = rsvpB?.alums ? Object.keys(rsvpB.alums).length : 0;
        return countB - countA; // Descending
      });
  }, [approvedEvents, rsvpDetails]);

  const rsvpLabels = useMemo(() => {
    return eventsRSVPs.map((event: Event) => event.title);
  }, [eventsRSVPs]);

  const rsvpData = useMemo(() => {
    return eventsRSVPs.map((event: Event) => {
      const rsvp = rsvpDetails.find((r: any) => r.postId === event.eventId);
      return rsvp?.alums ? Object.keys(rsvp.alums).length : 0;
    });
  }, [eventsRSVPs, rsvpDetails]);

  const rsvpStats = eventsRSVPs
    .map((event: Event) => `${event.title} - ${event.rsvps.length} RSVP(s)`)
    .join("\n");

  const eventDates = approvedEvents
    .map((event: Event) => `${event.title} - ${event.date}`)
    .join("\n");

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2">
        <div className="hover:text-[#0856BA] cursor-pointer transition-colors">
          Home
        </div>
        <div>
          <ChevronRight size={15} />
        </div>
        <div className="font-medium text-[#0856BA]">
          Events Statistical Reports
        </div>
      </div>

      {/* Page Title */}
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl text-gray-800">
            Events Statistical Reports
          </div>
          <div className="text-sm bg-[#0856BA] text-white px-4 py-2 rounded-full font-medium">
            {!eventLoading && `Total Events: ${approvedEvents.length}`}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mb-2 space-y-8 bg-white rounded-xl shadow-sm p-8 border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2 border-gray-100">
          Events Charts
        </h2>

        <div className="flex flex-col lg:flex-row gap-6">
          <Card className="flex-1 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-lg font-semibold text-gray-700">
                Events with Donation Drives
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center pt-0">
              <DonutChart
                labels={["With", "Without"]}
                data={[
                  eventsWithDonations.length,
                  events.length - approvedEvents.length,
                ]}
              />
            </CardContent>
          </Card>

          <Card className="flex-1 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-lg font-semibold text-gray-700">
                Events&apos; RSVPs
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center pt-0">
              <BarGraph
                type="Number of RSVPs"
                labels={rsvpLabels.slice(0, 5)}
                data={rsvpData.slice(0, 5)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lists Section - First Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <Card className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all overflow-hidden">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Events with Donations
                </CardTitle>
                {!eventLoading && (
                  <div className="text-[#0856BA] font-medium text-sm mt-1">
                    Total: {eventsWithDonations.length}
                  </div>
                )}
              </div>
              <div className="bg-[#0856BA] text-white rounded-full h-10 w-10 flex items-center justify-center">
                {eventsWithDonations.length}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 max-h-[280px] overflow-y-auto">
            {eventLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <p>Loading events...</p>
              </div>
            ) : eventsWithDonations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <p>No events with donations found</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {eventsWithDonations.map((event: Event, index: number) => (
                  <li
                    key={index}
                    className="py-3 px-2 text-gray-700 flex items-center hover:bg-gray-50 transition-colors rounded-md"
                  >
                    <span className="w-2 h-2 bg-[#0856BA] rounded-full mr-3"></span>
                    <span className="font-medium">{event.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all overflow-hidden">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Number of RSVPs per event
                </CardTitle>
                {!eventLoading && (
                  <div className="text-[#0856BA] font-medium text-sm mt-1">
                    Events with RSVPs: {eventsRSVPs.length}
                  </div>
                )}
              </div>
              <div className="bg-[#0856BA] text-white rounded-full h-10 w-10 flex items-center justify-center">
                {eventsRSVPs.length}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 max-h-[280px] overflow-y-auto">
            {eventLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <p>Loading events...</p>
              </div>
            ) : eventsRSVPs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <p>No events with RSVPs found</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {eventsRSVPs.map((event: Event, index: number) => {
                  const rsvp = rsvpDetails.find((r: any) => r.postId === event.eventId);
                  const alumCount = rsvp?.alums ? Object.keys(rsvp.alums).length : 0;

                  return (
                    <li
                      key={event.eventId || index}
                      className="py-3 px-2 text-gray-700 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-md"
                    >
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-[#0856BA] rounded-full mr-3"></span>
                        <span className="font-medium">{event.title}</span>
                      </div>
                      <span className="text-white bg-[#0856BA] px-3 py-1 rounded-full text-xs font-bold">
                        {alumCount} RSVPs
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lists Section - Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all overflow-hidden">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Upcoming Events
                </CardTitle>
                {!eventLoading && (
                  <div className="text-[#0856BA] font-medium text-sm mt-1">
                    Total: {upcomingEvents.length}
                  </div>
                )}
              </div>
              <div className="bg-[#0856BA] text-white rounded-full h-10 w-10 flex items-center justify-center">
                {upcomingEvents.length}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 max-h-[280px] overflow-y-auto">
            {eventLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <p>Loading events...</p>
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <p>No upcoming events found</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {upcomingEvents.map((event: Event, index: number) => (
                  <li
                    key={index}
                    className="py-3 px-2 text-gray-700 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-md"
                  >
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-[#0856BA] rounded-full mr-3"></span>
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full text-xs">
                      <span className="text-gray-700">{event.date}</span>
                      <span className="mx-1">•</span>
                      <span className="text-[#0856BA] font-medium">
                        {formatTimeString(event.time)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all overflow-hidden">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-800">
                  Past Events
                </CardTitle>
                {!eventLoading && (
                  <div className="text-[#0856BA] font-medium text-sm mt-1">
                    Total: {pastEvents.length}
                  </div>
                )}
              </div>
              <div className="bg-[#0856BA] text-white rounded-full h-10 w-10 flex items-center justify-center">
                {pastEvents.length}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 max-h-[280px] overflow-y-auto">
            {eventLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <p>Loading events...</p>
              </div>
            ) : pastEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <p>No past events found</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {pastEvents.map((event: Event, index: number) => (
                  <li
                    key={index}
                    className="py-3 px-2 text-gray-700 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-md"
                  >
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-[#0856BA] rounded-full mr-3"></span>
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-700">
                      {event.date}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Calendar Section */}
      <Card className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all mb-2">
        <CardHeader className="pb-2 border-b border-gray-100">
          <CardTitle className="text-xl font-bold text-gray-800">
            Event Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <EventCalendar />
        </CardContent>
      </Card>

      {/* Report Summary */}
      <Card className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all mb-2">
        <CardHeader className="pb-2 border-b border-gray-100">
          <CardTitle className="text-xl font-bold text-gray-800">
            Report Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-gradient-to-r from-[#0856BA]/5 to-white p-6 rounded-lg">
            <ReportSummaryCard
              data={`
                  Total Number of events: ${approvedEvents.length} 
                  Number of events with donation drives: ${eventsWithDonations.length}
                  Number of RSVPs per event: ${rsvpStats} 
                  Number of upcoming events: ${upcomingEvents.length}
                  Number of past events: ${pastEvents.length}
                  Also please give number of events that will happen this week and this month based on the current actual date (in Philippine Standard Time). Here are the events' dates:
                  ${eventDates} 
                `}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
