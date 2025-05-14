"use client";

import { useRouter } from "next/navigation";
import { Event, RSVP } from "@/models/models";
import BookmarkButton from "@/components/ui/bookmark-button";
import { useEvents } from "@/context/EventContext";
import { useAuth } from "@/context/AuthContext";
import { useRsvpDetails } from "@/context/RSVPContext";
import { Users, Clock, MapPin, Calendar } from "lucide-react";
import Image from "next/image";

interface EventCardProps {
  event: Event;
  type: string;
  showBookmark?: boolean;
}

const EventCard = ({ event, type, showBookmark = false }: EventCardProps) => {
  const router = useRouter();
  const { user, alumInfo } = useAuth();
  const { rsvpDetails } = useRsvpDetails();
  const {} = useEvents();

  const formatDate = (timestamp: any) => {
    try {
      if (!timestamp) return "N/A";
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (err) {
      return "Invalid Date";
    }
  };

  const handleViewDetails = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const rsvps = rsvpDetails as RSVP[];

  const matchingRSVP = rsvps.find((rsvp) => rsvp.postId === event?.eventId);

  let alumniRsvpStatus: string | undefined = undefined;

  if (alumInfo?.alumniId && matchingRSVP?.alums) {
    alumniRsvpStatus = matchingRSVP.alums[alumInfo.alumniId]?.status;
  }

  return (
    <div>
      <div
        className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => handleViewDetails(event.eventId)}
      >
        {/* Image */}
        <div className="relative bg-cover bg-center rounded-t-[10px] h-[230px]">
          <Image
            src={event.image || "/default-image.jpg"}
            alt={event.title}
            priority
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
          {type === "Proposed Events" ? (
            <span
              className={`absolute bottom-2 right-2 px-3 py-1 text-sm rounded-full ${(() => {
                switch (event.status) {
                  case "Accepted":
                    return "bg-green-100 text-green-800 px-2 py-1 font-bold";
                  case "Pending":
                    return "bg-yellow-100 text-yellow-800 px-2 py-1 font-bold";
                  case "Rejected":
                    return "bg-red-100 text-red-800 px-2 py-1 font-bold";
                  default:
                    return "bg-gray-100 text-gray-800 px-2 py-1 font-bold";
                }
              })()}`}
            >
              {event.status === "Accepted" ? "Approved" : event.status}
            </span>
          ) : (
            type === "Invitations" && (
              <span
                className={`absolute bottom-2 right-2 px-3 py-1 text-sm rounded-full ${(() => {
                  switch (alumniRsvpStatus) {
                    case "Accepted":
                      return "bg-green-100 text-green-800 px-2 py-1 font-bold";
                    case "Pending":
                      return "bg-yellow-100 text-yellow-800 px-2 py-1 font-bold";
                    case "Rejected":
                      return "bg-red-100 text-red-800 px-2 py-1 font-bold";
                    default:
                      return "bg-gray-100 text-gray-800 px-2 py-1 font-bold";
                  }
                })()}`}
              >
                {alumniRsvpStatus === "Accepted"
                  ? "Going"
                  : alumniRsvpStatus === "Rejected"
                  ? "Not Going"
                  : alumniRsvpStatus}
              </span>
            )
          )}
        </div>
        {/* Content */}
        <div className="px-6 pt-3 pb-6">
          {/* Event Title */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold truncate">{event.title}</h2>
            <BookmarkButton entryId={event.eventId} type="event" size="md" />
          </div>
          {/* Details */}
          <div className="grid grid-cols-6 gap-6 text-xs text-gray-700 mb-3">
            <div className="flex items-center gap-1 col-span-2">
              <Calendar className="size-[16px]" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-1 col-span-2">
              <Clock className="size-[16px]" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-1 col-span-2">
              <MapPin className="size-[16px]" />
              <span>{event.location}</span>
            </div>
          </div>
          {/* Description with View More */}
          <div className="mb-3 text-sm text-start">
            <p
              className={`h-10 overflow-hidden text-clip ${
                event.description.length > 100 ? "mb-1" : ""
              }`}
            >
              {event.description.length > 100
                ? event.description.slice(0, 100) + "..."
                : event.description}
            </p>

            <button
              className="text-xs text-gray-600 hover:text-gray-800 pt-2"
              onClick={() => (eventId: string) => {
                router.push(`/events/${eventId}`);
              }}
            >
              View More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
