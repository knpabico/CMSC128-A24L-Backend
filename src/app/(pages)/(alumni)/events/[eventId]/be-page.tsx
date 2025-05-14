"use client";

import { useParams, useRouter } from "next/navigation";
import { useEvents } from "@/context/EventContext";
import { useRsvpDetails } from "@/context/RSVPContext";
import { Event, RSVP } from "@/models/models";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  MoveLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CircleCheck,
  X,
} from "lucide-react";
import { useFeatured } from "@/context/FeaturedStoryContext";
import ProposeEventForm from "../components/ProposeEventForm";
import Link from "next/link";

const EventPageAlumni = () => {
  const {
    events,
    setShowForm,
    showForm,
    handleSave,
    handleImageChange,
    date,
    setEventDate,
    description,
    setEventDescription,
    title,
    setEventTitle,
    location,
    setEventLocation,
    time,
    setEventTime,
    setEventImage,
    handleDelete,
  } = useEvents();

  const { rsvpDetails, isLoadingRsvp, handleAlumAccept, handleAlumReject } =
    useRsvpDetails();
  const { alumInfo } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { featuredItems, isLoading } = useFeatured();
  const [isEditing, setEdit] = useState<boolean>(false);
  const [isDetails, setDetailsPage] = useState<boolean>(false);

  const eventId = params?.eventId as string;
  const event = events.find((e: Event) => e.eventId === eventId);


  const rsvps = rsvpDetails as RSVP[];
  const matchingRSVP = rsvps.find((rsvp) => rsvp.postId === event?.eventId);

  const eventStories = featuredItems.filter((story) => story.type === "event");

  const sortedStories = [...eventStories].sort((a, b) => {
    const dateA =
      a.datePosted instanceof Date ? a.datePosted : new Date(a.datePosted);
    const dateB =
      b.datePosted instanceof Date ? b.datePosted : new Date(b.datePosted);
    return dateB.getTime() - dateA.getTime();
  });

  const formatDate = (date: any) => {
    if (!date) return "Unknown date";

    const dateObj = date instanceof Date ? date : new Date(date);

    if (isNaN(dateObj.getTime())) {
      if (date?.toDate && typeof date.toDate === "function") {
        return date.toDate().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
      return "Invalid date";
    }

    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!eventId || events.length === 0) return <p>Loading...</p>;

  console.log(matchingRSVP?.rsvpId);

  let alumniRsvpStatus: string | undefined = undefined;

  if (alumInfo?.alumniId && matchingRSVP?.alums) {
    alumniRsvpStatus = matchingRSVP.alums[alumInfo.alumniId]?.status;
  }

  return (
    <div className="w-full px-6 md:px-10 lg:px-20 pt-6 pb-10">
      <Link href="/events" className="text-sm mb-4 inline-flex gap-2 items-center hover:underline">
        <MoveLeft className='size-[17px]'/>
        Back to Events
      </Link>

      {event ? (
        <div className="space-y-4">
          {/* Event Info Card */}
          <div className="bg-white py-6 px-6 rounded-[10px] shadow-md border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <img
                  src={event.image}
                  alt="Event Poster"
                  className="w-64 h-auto"
                />
                <h1 className="text-2xl font-bold">{event.title}</h1>
                <p className="text-gray-500 mt-1">{event.description}</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                {event.status === "Accepted" && event.creatorType === "alumni" ? (
                  <span className="text-green-600 flex items-center gap-1">
                    Accepted <CircleCheck className="w-4 h-4" />
                  </span>
                ) : event.status === "Rejected" && event.creatorType === "alumni" ? (
                  <span className="text-red-600 flex items-center gap-1">
                    Rejected <X className="w-4 h-4" />
                  </span>
                ) : event.status === "Pending" && event.creatorType === "alumni"? (
                  <span className="text-yellow-600">Pending</span>
                ) : event.status === "Draft" && event.creatorType === "alumni"?(
                  <span className="text-gray-600">Draft</span>
                ) : alumniRsvpStatus === "Accepted" ? (
                  <span className="text-green-600 flex items-center gap-1">
                    Going <CircleCheck className="w-4 h-4" />
                  </span>
                ) : alumniRsvpStatus === "Rejected" ? (
                  <span className="text-red-600 flex items-center gap-1">
                    Not Going <X className="w-4 h-4" />
                  </span>
                ) : alumniRsvpStatus === "Pending" && (
                  <span className="text-yellow-600">Pending</span>
                )}
              </div>
            </div>

            {event.status !== "Pending" && matchingRSVP && (
              <div className="mb-3">
                <p className="text-sm text-gray-700">
                  Your RSVP: <strong>{alumniRsvpStatus}</strong>
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
          
          {event.status !== "Pending" && alumniRsvpStatus === "Pending" && (
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

          {event.status === "Draft" && (
            <div className="bg-white py-4 px-6 rounded-[10px] shadow-md border border-gray-200 flex gap-4">
              <>
                <button
                  onClick={() => {
                    setEdit(true); // Allow editing
                    setShowForm(true); // Show the form for editing
                  }}
                  className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    handleDelete(event.eventId);
                    router.back();
                  }}
                  className="w-full py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
              </>
              {/* Propose Event Form */}
              <ProposeEventForm
                isOpen={showForm}
                onClose={() => setShowForm(false)}
                isEditing={isEditing}
                isDetails={true}
                setDetailsPage={setDetailsPage}
                editingEventId={event.eventId}
                setEdit={setEdit}
              />
            </div>
          )}

          {/* View Donation Button */}
          {event.needSponsorship && event.status === "Accepted" && (
            <div className="bg-white py-4 px-6 rounded-[10px] shadow-md border border-gray-200">
              <p className="text-sm text-gray-700 mb-2">
                This event needs sponsorship.
              </p>
              <button
                onClick={() =>
                  router.push(
                    `/donationdrive-list/details?id=${event.donationDriveId}`
                  )
                }
                className="w-full py-2 text-sm bg-[#0856BA] text-white rounded-md hover:bg-[#064aa1]"
              >
                View Donation Drive
              </button>
            </div>
          )}

          {/* Featured Stories Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Featured Stories
            </h2>

            {isLoading ? (
              <p className="text-gray-500">Loading featured stories...</p>
            ) : sortedStories.length === 0 ? (
              <p className="text-gray-500">No featured stories found.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedStories.map((story) => (
                  <div
                    key={story.featuredId}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                    onClick={() =>
                      router.push(`/events/featured/${story.featuredId}`)
                    }
                  >
                    {story.image && (
                      <div
                        className="h-40 bg-cover bg-center"
                        style={{ backgroundImage: `url(${story.image})` }}
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-800 truncate">
                        {story.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDate(story.datePosted)}
                      </p>
                      <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                        {story.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="text-gray-600">Event not found.</p>
      )}
    </div>
  );
};

export default EventPageAlumni;
