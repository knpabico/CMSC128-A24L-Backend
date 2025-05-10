"use client";
import BarGraph from "@/components/charts/BarGraph";
import DonutChart from "@/components/charts/DonutChart";
import EventCalendar from "@/components/EventCalendar";
import ReportSummaryCard from "@/components/ReportSummaryCard";
import { useEvents } from "@/context/EventContext";
import formatTimeString from "@/lib/timeFormatter";
import { Event } from "@/models/models";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, BarChart } from "lucide-react";

const Page = () => {
  const { events, isLoading: eventLoading } = useEvents();

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
      .filter((event: Event) => event.rsvps.length > 0)
      .sort((a: Event, b: Event) => b.rsvps.length - a.rsvps.length);
  }, [approvedEvents]);

  const rsvpLabels = useMemo(() => {
    return eventsRSVPs.map((event: Event) => event.title);
  }, [eventsRSVPs]);

  const rsvpData = useMemo(() => {
    return eventsRSVPs.map((event: Event) => event.rsvps.length);
  }, [eventsRSVPs]);

  const rsvpStats = eventsRSVPs
    .map((event: Event) => `${event.title} - ${event.rsvps.length} RSVP(s)`)
    .join("\n");

  const eventDates = approvedEvents
    .map((event: Event) => `${event.title} - ${event.date}`)
    .join("\n");

    return (
      <div className="flex flex-col gap-5">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2">
          <div className="hover:text-[#0856BA] cursor-pointer transition-colors">Home</div>
          <div>
            <ChevronRight size={15} />
          </div>
          <div className="font-medium text-[#0856BA]">Events Statistical Reports</div>
        </div>
  
        {/* Page Title */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BarChart className="w-8 h-8 text-[#0856BA]" />
            <h1 className="font-bold text-3xl text-gray-800">
              Events Statistical Reports
            </h1>
          </div>
            <div className="text-sm bg-[#0856BA] text-white px-4 py-2 rounded-full font-medium">
              {!eventLoading && `Total Events: ${approvedEvents.length}`}
            </div>
          </div>
        </div>
  
        {/* Charts Section */}
        <div className="bg-white rounded-xl shadow-sm p-10 border border-gray-100">
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-2 flex items-center">
            <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
            Events Overview
          </h2>
          <div className="flex flex-col lg:flex-row gap-4">
            <Card className="flex-1 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-lg font-semibold text-gray-700">
                  Events with Donation Drives
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center pt-0 h-[300px]">
                <DonutChart
                  labels={["With", "Without"]}
                  data={[eventsWithDonations.length, events.length - approvedEvents.length]}
                />
              </CardContent>
            </Card>
  
            <Card className="flex-1 bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-lg font-semibold text-gray-700">Events&apos; RSVPs</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center pt-0 h-[300px]">
                <BarGraph type="Number of RSVPs" labels={rsvpLabels.slice(0, 5)} data={rsvpData.slice(0, 5)} />
              </CardContent>
            </Card>
          </div>
        </div>
  
        {/* Middle Section - Cards Grid and Report Summary */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Events Grid */}
          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all overflow-hidden">
              <CardHeader className="pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
                      Events with Donations
                      </CardTitle>
                    {!eventLoading && (
                      <div className="text-[#0856BA] font-medium text-sm mt-1">Total: {eventsWithDonations.length}</div>
                    )}
                  </div>
                  <div className="bg-[#0856BA] text-white rounded-full h-12 w-12 flex items-center justify-center">
                    {eventsWithDonations.length}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 h-[300px] overflow-y-auto">
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
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
                      RSVPs per Event
                      </CardTitle>
                    {!eventLoading && (
                      <div className="text-[#0856BA] font-medium text-sm mt-1">
                        Events with RSVPs: {eventsRSVPs.length}
                      </div>
                    )}
                  </div>
                  <div className="bg-[#0856BA] text-white rounded-full h-12 w-12 flex items-center justify-center">
                    {eventsRSVPs.length}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 h-[300px] overflow-y-auto">
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
                    {eventsRSVPs.map((event: Event, index: number) => (
                      <li
                        key={index}
                        className="py-3 px-2 text-gray-700 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-md"
                      >
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-[#0856BA] rounded-full mr-3"></span>
                          <span className="font-medium">{event.title}</span>
                        </div>
                        <span className="text-white bg-[#0856BA] px-3 py-1 rounded-full text-xs font-bold">
                          {event.rsvps.length} RSVPs
                        </span>
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
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
                  Upcoming Events
                  </CardTitle>
                    {!eventLoading && (
                      <div className="text-[#0856BA] font-medium text-sm mt-1">Total: {upcomingEvents.length}</div>
                    )}
                  </div>
                  <div className="bg-[#0856BA] text-white rounded-full h-12 w-12 flex items-center justify-center">
                    {upcomingEvents.length}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 h-[300px] overflow-y-auto">
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
                          <span className="text-[#0856BA] font-medium">{formatTimeString(event.time)}</span>
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
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                  <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
                      Past Events
                      </CardTitle>
                    {!eventLoading && (
                      <div className="text-[#0856BA] font-medium text-sm mt-1">Total: {pastEvents.length}</div>
                    )}
                  </div>
                  <div className="bg-[#0856BA] text-white rounded-full h-12 w-12 flex items-center justify-center">
                    {pastEvents.length}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 h-[300px] overflow-y-auto">
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
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-700">{event.date}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
  
          {/* Report Summary - Right Side */}
          <div className="lg:w-1/3 lg:min-w-[320px]">
            <Card className="bg-white rounded-xl shadow-sm border-none ring-1 ring-gray-100 h-full">
              <CardHeader className="pb-1 border-b border-gray-100">
                <CardTitle className="flex items-center text-xl font-bold text-gray-800">
                  <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
                  Report Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-y-auto h-195">
                <div className="p-2 rounded-lg">
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
        </div>
  
        {/* Calendar Section - Full Width at Bottom */}
        <Card className="bg-white h-full rounded-xl shadow-sm border-none ring-1 ring-gray-100 hover:ring-[#0856BA]/20 transition-all mb-2">
          <CardHeader className="pb-2 border-b border-gray-100">
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <span className="w-1 h-5 bg-[#0856BA] rounded mr-2"></span>
              Event Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <EventCalendar />
          </CardContent>
        </Card>
      </div>
    );
  };

export default Page;
