"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEvents } from "@/context/EventContext";
import { useRsvpDetails } from "@/context/RSVPContext";  
import { Event, RSVP } from "@/models/models";
import { useAuth } from "@/context/AuthContext";
import { MoveLeft, Calendar, Clock, MapPin, Users, CircleCheck, X } from 'lucide-react';

const EventPageAlumni = () => {
  const { events } = useEvents();
  const { rsvpDetails, isLoadingRsvp, handleAlumAccept, handleAlumReject } = useRsvpDetails(events);
  const { alumInfo } = useAuth();
  const params = useParams();
  const router = useRouter();

  const eventId = params?.eventId as string;
  const event = events.find((e: Event) => e.eventId === eventId);

  if (!eventId || events.length === 0) return <p>Loading...</p>;

  const rsvps = Object.values(rsvpDetails) as RSVP[];
  const matchingRSVP = rsvps.find((rsvp) => rsvp.postId === event?.eventId);

  return (
    <div className="w-full px-6 md:px-10 lg:px-20 pt-6 pb-10">
      <div className="flex items-center gap-2 mb-6">
        <MoveLeft className="cursor-pointer" onClick={() => router.back()} />
        <h2 className="text-lg font-semibold">Back</h2>
      </div>

      {event ? (
        <div className="space-y-4">
          {/* Event Info Card */}
          <div className="bg-white py-6 px-6 rounded-[10px] shadow-md border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <img src={event.image} alt="Event Poster" className="w-64 h-auto" />
                <h1 className="text-2xl font-bold">{event.title}</h1>
                <p className="text-gray-500 mt-1">{event.description}</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                {event.status === "Accepted" ? (
                  <span className="text-green-600 flex items-center gap-1">
                    Accepted <CircleCheck className="w-4 h-4" />
                  </span>
                ) : event.status === "Rejected" ? (
                  <span className="text-red-600 flex items-center gap-1">
                    Rejected <X className="w-4 h-4" />
                  </span>
                ) : (
                  <span className="text-yellow-600">Pending</span>
                )}
              </div>
            </div>

            {event.status !== "Pending" && matchingRSVP && (
              <div className="mb-3">
                <p className="text-sm text-gray-700">
                  Your RSVP: <strong>{matchingRSVP.status}</strong>
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm text-gray-700 mt-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#616161]" />
                {event.date}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#616161]" />
                {event.time}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#616161]" />
                {event.location}
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#616161]" />
                {event.numofAttendees} Attendees
              </div>
            </div>
          </div>

          {/* RSVP Buttons */}
          {event.status !== "Pending" && matchingRSVP?.status === "Pending" && (
            <div className="bg-white py-4 px-6 rounded-[10px] shadow-md border border-gray-200 flex gap-4">
              {isLoadingRsvp ? (
                <div className="text-gray-500">Loading...</div>
              ) : (
                <>
                  <button
                    onClick={() =>
                      alumInfo?.alumniId &&
                      handleAlumAccept(event.eventId, alumInfo.alumniId)
                    }
                    className="w-full py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600"
                  >
                    Going
                  </button>
                  <button
                    onClick={() =>
                      alumInfo?.alumniId &&
                      handleAlumReject(event.eventId, alumInfo.alumniId)
                    }
                    className="w-full py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600"
                  >
                    Not Going
                  </button>
                </>
              )}
            </div>
          )}

          {/* View Donation Button */}
          {event.needSponsorship && event.status === "Accepted" && (
            <div className="bg-white py-4 px-6 rounded-[10px] shadow-md border border-gray-200">
              <p className="text-sm text-gray-700 mb-2">This event needs sponsorship.</p>
              <button
                onClick={() =>
                  router.push(`/donationdrive-list/details?id=${event.donationDriveId}`)
                }
                className="w-full py-2 text-sm bg-[#0856BA] text-white rounded-md hover:bg-[#064aa1]"
              >
                View Donation Drive
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-600">Event not found.</p>
      )}
    </div>
  );
};

export default EventPageAlumni;
