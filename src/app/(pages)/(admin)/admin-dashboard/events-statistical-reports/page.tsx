"use client";
import BarGraph from "@/components/charts/BarGraph";
import DonutChart from "@/components/charts/DonutChart";
import EventCalendar from "@/components/EventCalendar";
import { useAlums } from "@/context/AlumContext";
import { useEvents } from "@/context/EventContext";
import { Event } from "@/models/models";
import { Typography } from "@mui/material";
import { useMemo } from "react";

const Page = () => {
  const { alums, isloading: alumloading } = useAlums();
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

  return (
    <div className="p-6">
      <Typography variant="h4" className="mb-4">
        Events Statistical Report
      </Typography>

      {/* <BarGraph /> */}
      <div className="mb-4">
        <div className="flex justify-between gap-6">
          <div className="flex-1 bg-white shadow-md rounded-lg p-4 pb-7">
            <Typography variant="h6" className="font-semibold mb-2 text-center">
              EventsCharts
            </Typography>
            <div className="flex items-center justify-around">
              <div className="flex-1 flex flex-col items-center">
                <Typography variant="subtitle2" className="text-center mb-2">
                  Events with Donation Drives
                </Typography>
                <div>
                  <DonutChart
                    labels={["With", "Without"]}
                    data={[
                      eventsWithDonations.length,
                      events.length - approvedEvents.length,
                    ]}
                  />
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <Typography variant="subtitle2" className="text-center mb-2">
                  Events&apos; RSVPs
                </Typography>
                <div>
                  <BarGraph
                    type="Number of RSVPs"
                    labels={rsvpLabels.slice(0, 5)}
                    data={rsvpData.slice(0, 5)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Mas maganda to I think if may dropdown na lang para puro graph makikita HAHAHAH pero nasa sau naman pano mapapaganda */}
      <div className="flex justify-between gap-6 mb-4">
        <div className="flex-1 bg-white shadow-md rounded-lg p-4">
          <Typography variant="h6" className="font-semibold mb-2">
            Events with Donations
          </Typography>
          {eventLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <Typography className="text-blue-600">
              Total: {eventsWithDonations.length}
            </Typography>
          )}
          <ul className="list-disc list-inside mt-2">
            {eventsWithDonations.map((event: Event, index: number) => (
              <li key={index} className="text-gray-700">
                {event.title}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 bg-white shadow-md rounded-lg p-4">
          <Typography variant="h6" className="font-semibold mb-2">
            Number of RSVPs per event
          </Typography>
          {eventLoading && <p className="text-gray-500">Loading...</p>}
          <ul className="list-disc list-inside mt-2">
            {eventsRSVPs.map((event: Event, index: number) => (
              <li key={index} className="text-gray-700">
                {`${event.title} - ${event.rsvps.length}`}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex justify-between gap-6 mb-4">
        <div className="flex-1 bg-white shadow-md rounded-lg p-4">
          <Typography variant="h6" className="font-semibold mb-2">
            Upcoming Events
          </Typography>
          {eventLoading && <p className="text-gray-500">Loading...</p>}
          <ul className="list-disc list-inside mt-2">
            {upcomingEvents.map((event: Event, index: number) => (
              <li key={index} className="text-gray-700">
                {`${event.title} - ${event.date}`}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex-1 bg-white shadow-md rounded-lg p-4">
          <Typography variant="h6" className="font-semibold mb-2">
            Past Events
          </Typography>
          {eventLoading && <p className="text-gray-500">Loading...</p>}
          <ul className="list-disc list-inside mt-2">
            {pastEvents.map((event: Event, index: number) => (
              <li key={index} className="text-gray-700">
                {`${event.title} - ${event.date}`}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <EventCalendar />
    </div>
  );
};

export default Page;
