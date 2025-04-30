"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEvents } from "@/context/EventContext";
import { useRsvpDetails } from "@/context/RSVPContext";  
import { Event, RSVP } from "@/models/models";
import { useAuth } from "@/context/AuthContext";

const EventPageAlumni = () => {
  const { events } = useEvents();
  const { rsvpDetails, isLoadingRsvp, handleAlumAccept, handleAlumReject } = useRsvpDetails(events);
  const { alumInfo } = useAuth();
  const params = useParams();
  const router = useRouter();

  const eventId = params?.eventId as string;
  const event = events.find((e: Event) => e.eventId === eventId);

  if (!eventId || events.length === 0) {
    return <p>Loading...</p>;
  }

  const rsvps = Object.values(rsvpDetails) as RSVP[];

  const matchingRSVP = rsvps.find(
    (rsvp) =>
      rsvp.postId === event.eventId
  );

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
          <h1 className="text-2xl font-bold">Your invite status: {matchingRSVP?.status}</h1>
          <p className="text-gray-700">{event.date}</p>
          <p className="mt-2">{event.time}</p>
          <p className="mt-2">{event.location}</p>
          <p className="mt-2">{event.numOfAttendees}</p>
          <p className="mt-2">{event.description}</p>
          {event.needSponsorship && event.status === "Accepted" && (
            <p className="text-gray-700">{event.donationDriveId}</p>
          )}
          <div className="flex gap-2 mt-4">
            {isLoadingRsvp ? (
              <div className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md">
                Loading...
              </div>
            ) : matchingRSVP?.status === "Pending" ? (
              <>
                <button
                  onClick={() => {
                    if (alumInfo?.alumniId) {
                      handleAlumAccept(event.eventId, alumInfo.alumniId);
                    } else {
                      console.log("Alumni ID is not available.");
                    }
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-md"
                >
                  Going
                </button>
                <button
                  onClick={() => {
                    if (alumInfo?.alumniId) {
                      handleAlumReject(event.eventId, alumInfo.alumniId);
                    } else {
                      console.log("Alumni ID is not available.");
                    }
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                >
                  Not Going
                </button>
              </>
            ) : null} {/* This ensures that when the RSVP is not "Pending", nothing is displayed */}
          </div>
        </div>
      ) : (
        <p>Event not found.</p>
      )}
    </div>
  );
};

export default EventPageAlumni;
