"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEvents } from "@/context/EventContext";
import { Event } from "@/models/models";

const EventPageAlumni = () => {
  const { events } = useEvents();
  const params = useParams();
  const router = useRouter();

  const eventId = params?.eventId as string;
  const event = events.find((e: Event) => e.eventId === eventId);

  if (!eventId || events.length === 0) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-4">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        ← Back
      </button>

      {event ? (
        <div>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <h1 className="text-2xl font-bold">{event.status}</h1>
          <p className="text-gray-700">{event.date}</p>
          <p className="mt-2">{event.time}</p>
          <p className="mt-2">{event.location}</p>
          <p className="mt-2">{event.numOfAttendees}</p>
          <p className="mt-2">{event.description}</p>
          {event.needSponsorship && event.status === "Accepted" && (
            <p className="text-gray-700">{event.donationDriveId}</p>
          )}
        </div>
      ) : (
        <p>Event not found.</p>
      )}
    </div>
  );
};

export default EventPageAlumni;
