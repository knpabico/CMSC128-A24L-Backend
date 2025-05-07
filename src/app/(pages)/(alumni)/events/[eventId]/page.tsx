"use client";

import { useParams, useRouter } from "next/navigation";
import { useEvents } from "@/context/EventContext";
import { useRsvpDetails } from "@/context/RSVPContext";
import { useAuth } from "@/context/AuthContext";
import { useFeatured } from "@/context/FeaturedStoryContext";
import { useState } from "react";
import ProposeEventForm from "../components/ProposeEventForm";
import {
  MoveLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CircleCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { Event, RSVP } from "@/models/models";

const EventPageAlumni = () => {
  const { events, showForm, setShowForm, handleDelete } = useEvents();
  const { rsvpDetails, isLoadingRsvp, handleAlumAccept, handleAlumReject } = useRsvpDetails();
  const { alumInfo } = useAuth();
  const { featuredItems, isLoading } = useFeatured();

  const [isEditing, setEdit] = useState(false);
  const [isDetails, setDetailsPage] = useState(false);

  const router = useRouter();
  const params = useParams();
  const eventId = params?.eventId as string;

  const event = events.find((e) => e.eventId === eventId);
  const matchingRSVP = (rsvpDetails as RSVP[]).find((r) => r.postId === event?.eventId);

  const eventStories = featuredItems
    .filter((story) => story.type === "event")
    .sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime());

  const formatDate = (date: any) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  if (!eventId || !event) return <p className="px-6 py-10">Loading...</p>;

  return (
    <div className="w-full px-6 md:px-10 lg:px-20 pt-6 pb-10">
      <Link href="/events" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:underline mb-6">
        <MoveLeft className="w-4 h-4" />
        Back to Events
      </Link>

      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-6">
        {/* Image & Title */}
        <div className="flex flex-col md:flex-row gap-6">
          <img src={event.image} alt="Event" className="w-full md:w-64 h-auto rounded-lg object-cover" />
          <div className="flex-1 space-y-2">
            <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
            <p className="text-gray-600">{event.description}</p>

            <div className="flex flex-wrap gap-4 text-sm mt-4">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4" />
                {event.date}
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4" />
                {event.time}
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4" />
                {event.location}
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Users className="w-4 h-4" />
                {event.numofAttendees} Attendees
              </div>
            </div>

            <div className="text-sm mt-2">
              {event.status === "Accepted" ? (
                <span className="text-green-600 flex items-center gap-1">
                  <CircleCheck className="w-4 h-4" /> Accepted
                </span>
              ) : event.status === "Rejected" ? (
                <span className="text-red-600 flex items-center gap-1">
                  <X className="w-4 h-4" /> Rejected
                </span>
              ) : event.status === "Pending" ? (
                <span className="text-yellow-600">Pending</span>
              ) : (
                <span className="text-gray-500">Draft</span>
              )}
            </div>
          </div>
        </div>

        {/* RSVP Status */}
        {event.status !== "Pending" && matchingRSVP && (
          <p className="text-sm text-gray-700">
            Your RSVP: <strong>{matchingRSVP.status}</strong>
          </p>
        )}

        {/* RSVP Buttons */}
        {event.status !== "Pending" && matchingRSVP?.status === "Pending" && (
          <div className="flex gap-4">
            <button
              onClick={() => alumInfo?.alumniId && handleAlumAccept(event.eventId, alumInfo.alumniId)}
              className="w-full py-2 bg-green-500 text-white font-semibold rounded hover:bg-green-600"
            >
              Going
            </button>
            <button
              onClick={() => alumInfo?.alumniId && handleAlumReject(event.eventId, alumInfo.alumniId)}
              className="w-full py-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600"
            >
              Not Going
            </button>
          </div>
        )}

        {/* Edit & Delete for Drafts */}
        {event.status === "Draft" && (
          <>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setEdit(true);
                  setShowForm(true);
                }}
                className="w-full py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  handleDelete(event.eventId);
                  router.back();
                }}
                className="w-full py-2 bg-red-500 text-white font-semibold rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>

            <ProposeEventForm
              isOpen={showForm}
              onClose={() => setShowForm(false)}
              isEditing={isEditing}
              isDetails={true}
              setDetailsPage={setDetailsPage}
              editingEventId={event.eventId}
              setEdit={setEdit}
            />
          </>
        )}

        {/* View Donation Drive */}
        {event.needSponsorship && event.status === "Accepted" && (
          <div className="p-4 bg-blue-50 rounded-md border border-blue-200 mt-4">
            <p className="text-sm text-blue-700 mb-2">This event needs sponsorship.</p>
            <button
              onClick={() => router.push(`/donationdrive-list/details?id=${event.donationDriveId}`)}
              className="w-full py-2 text-sm bg-[#0856BA] text-white rounded-md hover:bg-[#064aa1]"
            >
              View Donation Drive
            </button>
          </div>
        )}
      </div>

      {/* Featured Stories */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Featured Stories</h2>

        {isLoading ? (
          <p className="text-gray-500">Loading featured stories...</p>
        ) : eventStories.length === 0 ? (
          <p className="text-gray-500">No featured stories available.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {eventStories.map((story) => (
              <div
                key={story.featuredId}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => router.push(`/events/featured/${story.featuredId}`)}
              >
                {story.image && (
                  <div
                    className="h-40 bg-cover bg-center"
                    style={{ backgroundImage: `url(${story.image})` }}
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">{story.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{formatDate(story.datePosted)}</p>
                  <p className="text-sm text-gray-700 mt-2 line-clamp-3">{story.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventPageAlumni;
