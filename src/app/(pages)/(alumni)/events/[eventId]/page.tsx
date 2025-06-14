"use client";

import { useParams, useRouter } from "next/navigation";
import { useEvents } from "@/context/EventContext";
import { useRsvpDetails } from "@/context/RSVPContext";
import type { Event, RSVP } from "@/models/models";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  UserRoundPen,
} from "lucide-react";
import { useAlums } from "@/context/AlumContext";
import { useFeatured } from "@/context/FeaturedStoryContext";
import Link from "next/link";
import BookmarkButton from "@/components/ui/bookmark-button";
import Breadcrumb from "@/components/breadcrumb";
import Image from "next/image";
import ProposeEventForm from "../components/ProposeEventForm";

const EventPageAlumni = () => {
  const { events, setShowForm, showForm, handleDelete } = useEvents();

  const [isEditing, setEdit] = useState<boolean>(false);
  const [isDetails, setDetailsPage] = useState<boolean>(false);

  const { rsvpDetails, handleAlumAccept, handleAlumReject } = useRsvpDetails();
  const { alumInfo } = useAuth();
  const params = useParams();
  const router = useRouter();
  const { featuredItems, isLoading } = useFeatured();

  const eventId = params?.eventId as string;
  const event = events.find((e: Event) => e.eventId === eventId);
  const rsvps = rsvpDetails as RSVP[];
  const matchingRSVP = rsvps.find((rsvp) => rsvp.rsvpId === event?.rsvps);

  const { activeAlums, alums } = useAlums();

  // RSVPs
  const [rsvpFilter, setRsvpFilter] = useState("All");
  const [rsvpSort, setRsvpSort] = useState<"asc" | "desc">("asc");

  const eventStories = featuredItems.filter(
    (story: { type: string }) => story.type === "event"
  );

  const sortedStories = [...eventStories].sort((a, b) => {
    const dateA =
      a.datePosted instanceof Date ? a.datePosted : new Date(a.datePosted);
    const dateB =
      b.datePosted instanceof Date ? b.datePosted : new Date(b.datePosted);
    return dateB.getTime() - dateA.getTime();
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const maxIndex = Math.max(0, sortedStories.length - 3);
  const nextSlide = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  const visibleStories = sortedStories.slice(currentIndex, currentIndex + 3);

  const [alumniRsvpStatus, setAlumniRsvpStatus] = useState<string | undefined>(
    undefined
  );

  const filteredAndSortedRsvps = useMemo(() => {
    if (!event) return [];

    // Filter RSVPs
    const filteredRsvps = rsvpDetails
      .filter(
        (rsvp: { rsvpId: any; postId: any }) =>
          rsvp.postId === event.eventId && rsvp.rsvpId === event.rsvps
      )
      .flatMap((rsvp: { alums: any; rsvpId: any }) =>
        Object.entries(rsvp.alums || {}).map(([alumniId, alumData]) => {
          const { status } = alumData as { status: string };
          const alumni = alums.find(
            (a: { alumniId: string }) => a.alumniId === alumniId
          );

          return {
            alumniId,
            alumni,
            status,
            rsvpId: rsvp.rsvpId,
          };
        })
      )
      // Apply status filter
      .filter(
        (rsvpItem: { status: string }) =>
          rsvpFilter === "All" || rsvpItem.status === rsvpFilter
      )
      // Sort by name
      .sort(
        (
          a: { alumni: { firstName: any; lastName: any } },
          b: { alumni: { firstName: any; lastName: any } }
        ) => {
          if (!a.alumni || !b.alumni) return 0;
          const nameA =
            `${a.alumni.firstName} ${a.alumni.lastName}`.toLowerCase();
          const nameB =
            `${b.alumni.firstName} ${b.alumni.lastName}`.toLowerCase();
          return rsvpSort === "asc"
            ? nameA.localeCompare(nameB)
            : nameB.localeCompare(nameA);
        }
      );

    return filteredRsvps;
  }, [event, rsvpDetails, alums, rsvpFilter, rsvpSort]);

  useEffect(() => {
    if (alumInfo?.alumniId && matchingRSVP?.alums) {
      const status = matchingRSVP.alums[alumInfo.alumniId]?.status;
      setAlumniRsvpStatus(status);
    }
  }, [alumInfo?.alumniId, matchingRSVP]);

  const handleAccept = async () => {
    if (event.eventId && alumInfo?.alumniId) {
      try {
        await handleAlumAccept(event.eventId, alumInfo.alumniId); // updates DB via hook
        setAlumniRsvpStatus("Accepted"); // immediately reflect in UI
      } catch (error) {
        console.error("RSVP accept failed", error);
      }
    }
  };

  const handleReject = async () => {
    if (event.eventId && alumInfo?.alumniId) {
      try {
        await handleAlumReject(event.eventId, alumInfo.alumniId);
        setAlumniRsvpStatus("Rejected");
      } catch (error) {
        console.error("RSVP reject failed", error);
      }
    }
  };

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

  const breadcrumbItems = [
    { label: "Events", href: "/events" },
    { label: `${event?.title}`, href: "#", active: true },
  ];

  if (!eventId || events.length === 0) return <p>Loading...</p>;
  if (!event) {
    return (
      <div className="px-[10%] pt-10 pb-30">
        <div className="flex flex-col gap-3">
          <Breadcrumb items={breadcrumbItems} />
          <div className="text-center py-10 text-gray-500">
            This event has been deleted.
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <>
        <title>Event Details | ICS-ARMS</title>
        <div className="px-[10%] pt-10 pb-30">
          <div className="flex flex-col gap-3">
            <Breadcrumb items={breadcrumbItems} />

            {/* Main content area with relative positioning for proper layout */}
            <div className="w-full flex gap-5 relative">
              {/* Main content - reduced width to accommodate sidebar */}
              <div className="bg-white shadow-md w-2/3 h-full rounded-2xl flex flex-col gap-4 overflow-hidden">
                {/* Event image section */}
                <div className="w-full h-[50vh] overflow-hidden">
                  {event?.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="object-cover w-full h-full bg-center"
                    />
                  ) : (
                    <Image
                      src="/default-image.jpg"
                      alt={event.title}
                      width={800}
                      height={400}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>

                {/* Event Title */}
                <div className="w-full px-8 pt-3 flex flex-col gap-1">
                  <div className="flex items-start justify-between">
                    <h1 className="text-4xl font-bold">{event?.title}</h1>
                    <BookmarkButton
                      entryId={event.eventId}
                      type="event"
                      size="lg"
                      className="cursor-pointer"
                    />
                  </div>

                  <div className="text-[14px] text-gray-500">
                    Posted on {formatDate(event.datePosted)}
                  </div>

                  {/* Event Details */}
                  <div className="flex gap-5 text-sm pt-3 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar size={20} /> {formatDate(event.date)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={20} /> {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={20} /> {event.location}
                    </div>

                    <div className="flex items-center gap-2">
                      <UserRoundPen size={20} />{" "}
                      {event.creatorName !== "Admin"
                        ? "Proposed By " + event.creatorName
                        : "Created By Admin"}
                    </div>
                  </div>
                </div>

                {/* Event Description */}
                <div className="w-full px-8 pb-8">
                  <h1 className="text-sm whitespace-pre-wrap">
                    {event?.description}
                  </h1>
                </div>
                <div className="bg-white flex flex-col justify-between rounded-2xl w-full p-4 relative">
                  {event.creatorId === alumInfo?.alumniId &&
                  event.status === "Accepted" ? (
                    <div className="flex flex-col space-y-4 mb-4">
                      {/* Filter and Sort Options */}
                      <div className="flex items-center space-x-2">
                        <span className="text-[14px]">Filter by</span>
                        <select
                          value={rsvpFilter}
                          onChange={(e) => setRsvpFilter(e.target.value)}
                          className="text-[14px] px-2 py-1.5 bg-gray-200 rounded-lg cursor-pointer"
                        >
                          <option value="All">All Status</option>
                          <option value="Accepted">Going</option>
                          <option value="Pending">Pending</option>
                          <option value="Rejected">Not Going</option>
                        </select>

                        <button
                          onClick={() =>
                            setRsvpSort(rsvpSort === "asc" ? "desc" : "asc")
                          }
                          className="ml-2 text-[14px] px-2 py-1 bg-[var(--blue-300)] text-white rounded-lg"
                        >
                          Sort {rsvpSort === "asc" ? "A-Z" : "Z-A"}
                        </button>
                      </div>

                      {/* Attendees Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Attendees</h3>
                        {filteredAndSortedRsvps.filter(
                          (r) => r.status === "Accepted"
                        ).length > 0 && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {
                              filteredAndSortedRsvps.filter(
                                (r) => r.status === "Accepted"
                              ).length
                            }{" "}
                            {filteredAndSortedRsvps.filter(
                              (r) => r.status === "Accepted"
                            ).length === 1
                              ? "alumnus"
                              : "alumni"}{" "}
                            going
                          </span>
                        )}
                      </div>

                      {/* Table or Empty Message */}
                      {filteredAndSortedRsvps.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-blue-100">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                  Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                  Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredAndSortedRsvps.map((rsvpItem, index) => {
                                const isEven = index % 2 === 0;
                                const rowClass = isEven
                                  ? "bg-white"
                                  : "bg-gray-50";
                                const { alumni, status, alumniId, rsvpId } =
                                  rsvpItem;

                                return (
                                  <tr
                                    key={`${rsvpId}-${alumniId}`}
                                    className={rowClass}
                                  >
                                    {alumni ? (
                                      <>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                          {`${alumni.firstName} ${alumni.middleName} ${alumni.lastName}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                          {alumni.email || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                          {status === "Accepted" ? (
                                            <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">
                                              Going
                                            </span>
                                          ) : status === "Rejected" ? (
                                            <span className="px-2 py-1 rounded-full bg-red-100 text-red-800">
                                              Not Going
                                            </span>
                                          ) : status === "Pending" ? (
                                            <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                                              Pending
                                            </span>
                                          ) : (
                                            <span className="text-gray-500">
                                              {status || "N/A"}
                                            </span>
                                          )}
                                        </td>
                                      </>
                                    ) : (
                                      <td
                                        colSpan={3}
                                        className="px-6 py-4 text-sm text-red-500"
                                      >
                                        Alumni details not found for ID:{" "}
                                        {alumniId}
                                      </td>
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-500">No attendees yet</p>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Sidebar - now using sticky positioning instead of fixed */}
              <div className="w-1/3 sticky top-4 self-start flex flex-col gap-3 pl-5">
                {/* First sidebar card */}
                <div className="bg-white shadow-md rounded-2xl px-6 py-4 flex flex-col gap-3 text-sm">
                  <div className="flex gap-2 items-center">
                    <p className="font-semibold">Event Status:</p>
                    {event?.stillAccepting && event.status === "Accepted" ? (
                      <p className="bg-amber-200 px-3 py-1 rounded-full text-amber-900">
                        Still accepting guests
                      </p>
                    ) : !event?.stillAccepting &&
                      event.status === "Accepted" ? (
                      <p className="bg-red-200 px-3 py-1 rounded-full text-red-900">
                        Registration closed
                      </p>
                    ) : event.status === "Pending" ? (
                      <p className="bg-amber-200 px-3 py-1 rounded-full text-amber-900">
                        Waiting for approval
                      </p>
                    ) : event.status === "Rejected" ? (
                      <p className="bg-red-200 px-3 py-1 rounded-full text-red-900">
                        Proposal has been declined
                      </p>
                    ) : (
                      event.status === "Draft" && (
                        <p className="bg-gray-200 px-3 py-1 rounded-full text-gray-900">
                          Proposal not yet submitted
                        </p>
                      )
                    )}
                  </div>
                </div>

                {/* RSVP card */}
                {event.status === "Accepted" ? (
                  <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col gap-3 text-sm">
                    {event.inviteType === "all" ? (
                      <div className="flex flex-col items-center gap-1">
                        <h2 className="text-[18px] font-semibold text-[var(--blue-700)]">
                          This event is open to all.
                        </h2>
                        <p className="text-gray-500 text-center px-10">
                          Respond early if you’d like to secure your spot in
                          advance.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-center">
                          <Image
                            src="/rsvp-icon.png"
                            alt="RSVP"
                            width={60}
                            height={100}
                          />
                        </div>

                        <div className="flex flex-col items-center gap-1">
                          <h2 className="text-[18px] font-semibold text-[var(--blue-700)]">
                            You have been invited to this event.
                          </h2>
                          <p className="text-gray-500">
                            Please respond to the invitation.
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      {alumniRsvpStatus === "Pending" ? (
                        <div className="flex justify-between gap-2">
                          <button
                            onClick={handleAccept}
                            className="w-full bg-green-500 flex items-center justify-center p-2 rounded-full font-semibold text-white cursor-pointer"
                          >
                            {event.inviteType === "all" ? (
                              <p>Going</p>
                            ) : (
                              <p>Accept</p>
                            )}
                          </button>
                          <button
                            onClick={handleReject}
                            className="w-full bg-red-500 flex items-center justify-center p-2 rounded-full font-semibold text-white cursor-pointer"
                          >
                            {event.inviteType === "all" ? (
                              <p>Not Going</p>
                            ) : (
                              <p>Decline</p>
                            )}
                          </button>
                        </div>
                      ) : alumniRsvpStatus === "Accepted" ? (
                        <div className="w-full bg-green-300 text-green-600 flex items-center justify-center p-2 rounded-full font-semibold">
                          {event.inviteType === "all" ? (
                            <p>Going</p>
                          ) : (
                            <p>You accepted the invitation.</p>
                          )}
                        </div>
                      ) : alumniRsvpStatus === "Rejected" ? (
                        <div className="w-full bg-gray-300 text-gray-600 flex items-center justify-center p-2 rounded-full font-semibold">
                          {event.inviteType === "all" ? (
                            <p>Not Going</p>
                          ) : (
                            <p>You declined the invitation.</p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {/* Edit card */}
                {event.status === "Draft" ? (
                  <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col gap-3 text-sm">
                    <div>
                      <div className="flex justify-between gap-2">
                        <button
                          onClick={() => {
                            setEdit(true);
                            setShowForm(true);
                          }}
                          className="w-full bg-green-500 flex items-center justify-center p-2 rounded-full font-semibold text-white cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            handleDelete(event.eventId);
                            router.back();
                          }}
                          className="w-full bg-red-500 flex items-center justify-center p-2 rounded-full font-semibold text-white cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Donation card */}
                {event.needSponsorship && event?.status === "Accepted" && (
                  <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col gap-3 text-[14px]">
                    <div className="flex justify-center">
                      <Image
                        src="/donate-icon.png"
                        alt="RSVP"
                        width={60}
                        height={100}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <h2 className="text-lg font-semibold text-[var(--blue-700)]">
                        Support this event by donating.
                      </h2>
                      <p className="text-center text-gray-500 px-10">
                        Every contribution counts and helps us reach our goal.
                      </p>
                    </div>
                    <Link
                      href={`/donationdrive-list/details?id=${event?.donationDriveId}`}
                      className="w-full bg-[var(--primary-blue)] flex items-center justify-center p-2 rounded-full font-semibold text-white cursor-pointer"
                    >
                      Donate Here
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Featured Stories section - now will appear below main content properly */}
            <div className="mt-10">
              <div className="pt-5 pb-10 flex items-center justify-center text-2xl font-bold">
                Featured Stories
              </div>

              {isLoading ? (
                <p className="text-gray-500 text-center">
                  Loading featured stories...
                </p>
              ) : sortedStories.length === 0 ? (
                <p className="text-gray-500 text-center">
                  No featured stories found.
                </p>
              ) : (
                <div className="relative">
                  {/* Previous button */}
                  <button
                    onClick={prevSlide}
                    disabled={currentIndex === 0}
                    className={`absolute left-0 top-1/2 transform -translate-y-1/2 -ml-4 z-10 bg-white rounded-full p-2 shadow-md
                      ${
                        currentIndex === 0
                          ? "opacity-30 cursor-not-allowed"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    aria-label="Previous stories"
                  >
                    <ChevronLeft size={24} />
                  </button>

                  {/* Stories grid - always 3 columns on larger screens */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
                    {visibleStories.length === 0 && (
                      <div className="col-span-3 text-center text-gray-500">
                        No other stories available at this time.
                      </div>
                    )}
                    {visibleStories.map((story) => (
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

                  {/* Next button */}
                  <button
                    onClick={nextSlide}
                    disabled={currentIndex >= maxIndex}
                    className={`absolute right-0 top-1/2 transform -translate-y-1/2 -mr-4 z-10 bg-white rounded-full p-2 shadow-md
                      ${
                        currentIndex >= maxIndex
                          ? "opacity-30 cursor-not-allowed"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    aria-label="Next stories"
                  >
                    <ChevronRight size={24} />
                  </button>

                  {/* Pagination dots */}
                  {sortedStories.length > 3 && (
                    <div className="flex justify-center mt-6 gap-2">
                      {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentIndex(idx)}
                          className={`h-2 w-2 rounded-full ${
                            idx === currentIndex ? "bg-blue-500" : "bg-gray-300"
                          }`}
                          aria-label={`Go to slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
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
    );
  }

  // <>
  // <div className="w-full px-[10%] pt-10 pb-20">
  //   <Link href="/events" className="text-sm mb-4 inline-flex gap-2 items-center hover:underline">
  //     <MoveLeft className="size-[17px]" />
  //     Back to Events
  //   </Link>

  //   <div className="flex justify-between items-center">
  //     <h1 className="text-3xl lg:text-5xl font-bold text-gray-800">{event?.title || "Event Details"}</h1>
  //     {event?.status === "Accepted" && (
  //      <BookmarkButton entryId={event.eventId} type="event" size="lg" />
  //     )}
  //   </div>

  //   {/* Event Body */}
  //   <div className='flex flex-col xl:flex-row xl:gap-10 w-full'>
  //     {/* Body */}
  //     <div className='flex flex-col gap-[10px] w-full'>
  //       {/* Image */}
  //       {event?.image ? (
  //         <div className="relative">
  //           {event ? (
  //             <img src={event.image} alt={event.title} className="object-fit w-full bg-center h-[230px] md:h-[350px] lg:h-[400px]" />
  //           ) : null}
  //         </div>
  //       ) : (
  //         <div className="relative flex items-center justify-center bg-blue-100 bg-cover bg-center h-[230px] md:h-[350px] lg:h-[400px]">
  //           <span className="text-blue-500 font-medium">
  //             <ImageOff className="size-[50px]" />
  //           </span>
  //         </div>
  //       )}
  //       {/* Accepted */}
  //       {event && event?.status === "Accepted" && (
  //         <div className='mt-5 px-5'>
  //           <div className=' flex items-center gap-8'>
  //             <div className='flex gap-1 items-center justify-center'>
  //               <Calendar className='size-[20px]' />
  //               <p className='text-sm'>{formatDate(event.datePosted)}</p>
  //             </div>
  //             <div className='flex gap-1 items-center justify-center'>
  //               <Clock className='size-[20px]' />
  //               <p className='text-sm'>{event.time}</p>
  //             </div>
  //             <div className='flex gap-1 items-center justify-center'>
  //               <MapPin className='size-[20px]' />
  //               <p className='text-sm'>{event.location}</p>
  //             </div>
  //             <div className='flex gap-1 items-center justify-center'>
  //               <Users className='size-[20px]' />
  //               <p className='text-sm'>{event.numofAttendees || 0} attendees</p>
  //             </div>
  //           </div>
  //         </div>
  //       )}
  //       {/* Pending */}
  //       {event && (event?.status === "Pending" || event?.status === "Draft" || event?.status === "Rejected") && (
  //         <div className='mt-5 px-5'>
  //           <div className=' flex justify-between items-center gap-4'>
  //             <div className='flex gap-1 items-center justify-center'>
  //               <Calendar className='size-[20px]' />
  //               <p className='text-sm'>{formatDate(event.datePosted)}</p>
  //             </div>
  //             <div className='flex gap-1 items-center justify-center'>
  //               <Clock className='size-[20px]' />
  //               <p className='text-sm'>{event.time}</p>
  //             </div>
  //             <div className='flex gap-1 items-center justify-center'>
  //               <MapPin className='size-[20px]' />
  //               <p className='text-sm'>{event.location}</p>
  //             </div>
  //           </div>
  //         </div>
  //       )}
  //       {/* Event description */}
  //       <p className="mb-6">{event ? event.description : "No description added."}</p>
  //     </div>

  //     {/* Action Bar */}
  //     <div className='self-start min-w-[390px] sticky top-1/8'>
  //       {/* Side bar */}
  //       <div className='flex flex-col gap-[10px] w-full'>
  //         {/* Invitation Status */}
  //         <div className='bg-[#FFFF] py-[10px] px-[20px] rounded-[10px] flex flex-col gap-2 w-full shadow-md border border-gray-200'>
  //           {event && event?.status === "Accepted" && (
  //             <>
  //               {/* Event Status */}
  //               <div>
  //                 <div className="w-full flex justify-between">
  //                   <div className="w-1/2">
  //                     <p>Event Status: </p>
  //                   </div>
  //                   <div className="flex items-center justify-end text-green-600 font-medium gap-2 w-full">
  //                     Approved
  //                     <CircleCheck />
  //                   </div>
  //                 </div>
  //               </div>

  //               {/* Registration Status */}
  //               <div>
  //                 <div className="w-full flex justify-between">
  //                   <div className="w-1/2">
  //                     <p>Availability:</p>
  //                   </div>
  //                   <div className="flex items-center justify-end font-medium gap-2 w-full">
  //                     {event?.stillAccepting ? (
  //                       <>
  //                         <span className="text-green-600 flex items-center gap-2">
  //                           Still accepting guests
  //                           <CircleCheck />
  //                         </span>
  //                       </>
  //                     ) : (
  //                       <>
  //                         <span className="text-red-600 flex items-center gap-2">
  //                           Registration closed
  //                           <X />
  //                         </span>
  //                       </>
  //                     )}
  //                   </div>
  //                 </div>
  //               </div>

  //               {/* RSVP status */}
  //               <div className="w-full flex justify-between">
  //                 <div className="w-full">
  //                   <p>RSVP Status: </p>
  //                 </div>
  //                 {alumniRsvpStatus === "Pending" ? (
  //                   <div className="flex items-center justify-end text-yellow-600 font-medium gap-2 w-full">
  //                     Pending
  //                     <Clock2 />
  //                   </div>
  //                 ) : alumniRsvpStatus === "Accepted" ? (
  //                   <div className="flex items-center justify-end text-green-600 font-medium gap-2 w-full">
  //                     Going
  //                     <CircleCheck />
  //                   </div>
  //                 ) : alumniRsvpStatus === "Rejected" ? (
  //                   <div className="flex items-center justify-end text-red-600 font-medium gap-2 w-full">
  //                     Not Going
  //                     <CircleX />
  //                   </div>
  //                 ) : null}
  //               </div>

  //               {/* RSVP Buttons */}
  //               {alumniRsvpStatus === "Pending" && (
  //                 <div className="flex gap-2 p-2">
  //                   <button
  //                     onClick={handleAccept}
  //                     className="text-sm bg-[#0856BA] w-1/2 px-1 py-[5px] rounded-full text-white font-semibold hover:bg-blue-400 hover:cursor-pointer"
  //                   >
  //                     Going
  //                   </button>

  //                   <button
  //                     className="text-sm bg-[#FFFF] w-1/2 px-1 py-[5px] rounded-full text-[#0856BA] font-semibold border-[#0856BA] border-2 hover:text-blue-300 hover:bg-white hover:cursor-pointer"
  //                     onClick={handleReject}
  //                   >
  //                     Not Going
  //                   </button>
  //                 </div>
  //               )}
  //             </>
  //           )}

  //           {event && (event?.status === "Rejected") && (
  //             <>
  //               {/* Event Status */}
  //               <div>
  //                 <div className="w-full flex justify-between">
  //                   <div className="w-1/2">
  //                     <p>Event Status: </p>
  //                   </div>
  //                   <div className="flex items-center justify-end text-red-600 font-medium gap-2 w-full">
  //                     {event.status}
  //                     <CircleX />
  //                   </div>
  //                 </div>
  //               </div>
  //             </>
  //           )}

  //           {event && (event?.status === "Draft") && (
  //             <>
  //               {/* Event Status */}
  //               <div>
  //                 <div className="w-full flex justify-between">
  //                   <div className="w-1/2">
  //                     <p>Event Status: </p>
  //                   </div>
  //                   <div className="flex items-center justify-end text-grey-600 font-medium gap-2 w-full">
  //                     {event.status}
  //                     <CircleAlert />
  //                   </div>
  //                 </div>
  //               </div>
  //               <div className="flex gap-2 p-2">
  //                 <button
  //                   onClick={() =>
  //                   {
  //                     setEdit(true)
  //                     setShowForm(true)
  //                   }}
  //                   className="text-sm bg-[#0856BA] w-1/2 px-1 py-[5px] rounded-full text-white font-semibold hover:bg-blue-400 hover:cursor-pointer"
  //                 >
  //                   Edit
  //                 </button>
  //                 <button
  //                   onClick={() =>
  //                   {
  //                     handleDelete(event.eventId)
  //                     router.back()
  //                   }}
  //                   className="text-sm bg-[#FFFF] w-1/2 px-1 py-[5px] rounded-full text-[#0856BA] font-semibold border-[#0856BA] border-2 hover:text-blue-300 hover:bg-white hover:cursor-pointer"
  //                 >
  //                   Delete
  //                 </button>
  //               </div>
  //               {/* Propose Event Form */}
  //               <ProposeEventForm
  //                 isOpen={showForm}
  //                 onClose={() => setShowForm(false)}
  //                 isEditing={isEditing}
  //                 isDetails={true}
  //                 setDetailsPage={setDetailsPage}
  //                 editingEventId={event.eventId}
  //                 setEdit={setEdit}
  //               />
  //             </>
  //           )}

  //           {event && (event?.status === "Pending") && (
  //             <>
  //               {/* Event Status */}
  //               <div>
  //                 <div className="w-full flex justify-between">
  //                   <div className="w-1/2">
  //                     <p>Event Status: </p>
  //                   </div>
  //                   <div className="flex items-center justify-end text-yellow-600 font-medium gap-2 w-full">
  //                     {event.status}
  //                     <Clock10 />
  //                   </div>
  //                 </div>
  //               </div>
  //             </>
  //           )}

  //         </div>
  //       </div>
  //       {/* Placeholder */}
  //       {event.needSponsorship && event?.status === "Accepted" && (
  //         <div className="bg-white py-4 px-6 rounded-[10px] shadow-md border border-gray-200">
  //           <p className="text-sm text-gray-700 mb-2">
  //             This event needs sponsorship.
  //           </p>
  //           <button
  //             onClick={() =>
  //               router.push(
  //                 `/donationdrive-list/details?id=${event.donationDriveId}`
  //               )
  //             }
  //             className="text-sm mt-4 bg-[#FFFF] w-full px-1 py-[5px] rounded-full text-[#0856BA] font-semibold border-[#0856BA] border-2 hover:text-blue-300 hover:bg-white hover:cursor-pointer"
  //           >
  //             View Donation Drive
  //           </button>
  //         </div>
  //       )}
  //     </div>
  //   </div>
  //   {/* Featured Stories Section - Carousel */}
  //   <div className="mt-16">
  //     <h2 className="text-2xl text-center font-bold mb-6 text-gray-800">
  //       Featured Stories
  //     </h2>

  //     {isLoading ? (
  //       <p className="text-gray-500 text-center">
  //         Loading featured stories...
  //       </p>
  //     ) : sortedStories.length === 0 ? (
  //       <p className="text-gray-500 text-center">
  //         No featured stories found.
  //       </p>
  //     ) : (
  //       <div className="relative">
  //         {/* Previous button */}
  //         <button
  //           onClick={prevSlide}
  //           disabled={currentIndex === 0}
  //           className={`absolute left-0 top-1/2 transform -translate-y-1/2 -ml-4 z-10 bg-white rounded-full p-2 shadow-md
  //                 ${
  //                   currentIndex === 0
  //                     ? "opacity-30 cursor-not-allowed"
  //                     : "opacity-70 hover:opacity-100"
  //                 }`}
  //           aria-label="Previous stories"
  //         >
  //           <ChevronLeft size={24} />
  //         </button>

  //         {/* Stories grid - always 3 columns on larger screens */}
  //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
  //           {visibleStories.length === 0 && (
  //             <div className="col-span-3 text-center text-gray-500">
  //               No other stories available at this time.
  //             </div>
  //           )}
  //           {visibleStories.map((story) => (
  //             <div
  //               key={story.featuredId}
  //               className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
  //               onClick={() =>
  //                 router.push(`/scholarship/featured/${story.featuredId}`)
  //               }
  //             >
  //               {story.image && (
  //                 <div
  //                   className="h-40 bg-cover bg-center"
  //                   style={{ backgroundImage: `url(${story.image})` }}
  //                 />
  //               )}
  //               <div className="p-4">
  //                 <h3 className="font-semibold text-lg text-gray-800 truncate">
  //                   {story.title}
  //                 </h3>
  //                 <p className="text-sm text-gray-500 mt-1">
  //                   {formatDate(story.datePosted)}
  //                 </p>
  //                 <p className="text-sm text-gray-700 mt-2 line-clamp-3">
  //                   {story.text}
  //                 </p>
  //               </div>
  //             </div>
  //           ))}
  //         </div>

  //         {/* Next button */}
  //         <button
  //           onClick={nextSlide}
  //           disabled={currentIndex >= maxIndex}
  //           className={`absolute right-0 top-1/2 transform -translate-y-1/2 -mr-4 z-10 bg-white rounded-full p-2 shadow-md
  //                 ${
  //                   currentIndex >= maxIndex
  //                     ? "opacity-30 cursor-not-allowed"
  //                     : "opacity-70 hover:opacity-100"
  //                 }`}
  //           aria-label="Next stories"
  //         >
  //           <ChevronRight size={24} />
  //         </button>

  //         {/* Pagination dots */}
  //         {sortedStories.length > 3 && (
  //           <div className="flex justify-center mt-6 gap-2">
  //             {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
  //               <button
  //                 key={idx}
  //                 onClick={() => setCurrentIndex(idx)}
  //                 className={`h-2 w-2 rounded-full ${
  //                   idx === currentIndex ? "bg-blue-500" : "bg-gray-300"
  //                 }`}
  //                 aria-label={`Go to slide ${idx + 1}`}
  //               />
  //             ))}
  //           </div>
  //         )}
  //       </div>
  //     )}
  //   </div>
  // </div>
  // </>
};

export default EventPageAlumni;
