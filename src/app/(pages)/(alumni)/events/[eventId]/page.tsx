"use client"

import { useParams, useRouter } from "next/navigation"
import { useEvents } from "@/context/EventContext"
import { useRsvpDetails } from "@/context/RSVPContext"
import type { Event, RSVP } from "@/models/models"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { MoveLeft, Calendar, Clock, MapPin, Users, CircleCheck, ImageOff, X, Clock2, CircleX,CircleAlert, Clock10 } from "lucide-react"
import { useFeatured } from "@/context/FeaturedStoryContext"
import ProposeEventForm from "../components/ProposeEventForm"
import Link from "next/link"
import BookmarkButton from "@/components/ui/bookmark-button"

const EventPageAlumni = () => 
{
  const 
  {
    events,
    setShowForm,
    showForm,
    handleDelete,
  } = useEvents()

  const { rsvpDetails,handleAlumAccept, handleAlumReject } = useRsvpDetails()
  const { alumInfo } = useAuth()
  const params = useParams()
  const router = useRouter()
  const { featuredItems, isLoading } = useFeatured()
  const [isEditing, setEdit] = useState<boolean>(false)
  const [isDetails, setDetailsPage] = useState<boolean>(false)

  const eventId = params?.eventId as string
  const event = events.find((e: Event) => e.eventId === eventId)

  const rsvps = rsvpDetails as RSVP[]
  const matchingRSVP = rsvps.find((rsvp) => rsvp.postId === event?.eventId)

  const eventStories = featuredItems.filter((story: { type: string }) => story.type === "event")

const [alumniRsvpStatus, setAlumniRsvpStatus] = useState<string | undefined>(undefined);

  useEffect(() => 
  {
    if (alumInfo?.alumniId && matchingRSVP?.alums) 
    {
      const status = matchingRSVP.alums[alumInfo.alumniId]?.status;
      setAlumniRsvpStatus(status);
    }
  }, [alumInfo?.alumniId, matchingRSVP]);

  const handleAccept = async () => 
  {
    if (event.eventId && alumInfo?.alumniId) 
    {
      try 
      {
        await handleAlumAccept(event.eventId, alumInfo.alumniId); // updates DB via hook
        setAlumniRsvpStatus('Accepted'); // immediately reflect in UI
      } 
      
      catch (error) 
      {
        console.error("RSVP accept failed", error);
      }
    }
  };

  const handleReject = async () => 
  {
    if (event.eventId && alumInfo?.alumniId) 
    {
      try 
      {
        await handleAlumReject(event.eventId, alumInfo.alumniId);
        setAlumniRsvpStatus('Rejected');
      } 
      
      catch (error) 
      {
        console.error("RSVP reject failed", error);
      }
    }
  };

  const sortedStories = [...eventStories].sort((a, b) => 
  {
    const dateA = a.datePosted instanceof Date ? a.datePosted : new Date(a.datePosted)
    const dateB = b.datePosted instanceof Date ? b.datePosted : new Date(b.datePosted)
    return dateB.getTime() - dateA.getTime()
  })

  const formatDate = (date: any) => 
  {
    if (!date) return "Unknown date"

    const dateObj = date instanceof Date ? date : new Date(date)

    if (isNaN(dateObj.getTime())) 
    {
      if (date?.toDate && typeof date.toDate === "function") 
      {
        return date.toDate().toLocaleDateString("en-US", 
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }
      return "Invalid date"
    }

    return dateObj.toLocaleDateString("en-US", 
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!eventId || events.length === 0) return <p>Loading...</p>  

  return (
    <div className="w-full px-6 md:px-10 lg:px-20 pt-6 pb-10">
      <Link href="/events" className="text-sm mb-4 inline-flex gap-2 items-center hover:underline">
        <MoveLeft className="size-[17px]" />
        Back to Events
      </Link>

      <div className="flex justify-between items-center p-3">
        <h1 className="text-3xl lg:text-5xl font-bold text-gray-800">{event?.title || "Event Details"}</h1>
        {event?.status === "Accepted" && (
         <BookmarkButton entryId={event.eventId} type="event" size="lg" />
        )}
      </div>

      {/* Event Body */}
      <div className='flex flex-col xl:flex-row xl:gap-10 w-full'>
        {/* Body */}
        <div className='flex flex-col gap-[10px] w-full'>
          {/* Image */}
          {event?.image ? (
            <div className="relative">
              {event ? (
                <img src={event.image} alt={event.title} className="object-fit w-full bg-center h-[230px] md:h-[350px] lg:h-[400px]" />
              ) : null}
            </div>
          ) : (
            <div className="relative flex items-center justify-center bg-blue-100 bg-cover bg-center h-[230px] md:h-[350px] lg:h-[400px]">
              <span className="text-blue-500 font-medium">
                <ImageOff className="size-[50px]" />
              </span>
            </div>
          )}
          {/* Accepted */}
          {event && event?.status === "Accepted" && (
            <div className='mt-5 px-5'>
              <div className=' flex justify-between items-center gap-4'>
                <div className='flex gap-1 items-center justify-center'>
                  <Calendar className='size-[20px]' />
                  <p className='text-sm'>{formatDate(event.datePosted)}</p>
                </div>
                <div className='flex gap-1 items-center justify-center'>
                  <Clock className='size-[20px]' />
                  <p className='text-sm'>{event.time}</p>
                </div>
                <div className='flex gap-1 items-center justify-center'>
                  <MapPin className='size-[20px]' />
                  <p className='text-sm'>{event.location}</p>
                </div>
                <div className='flex gap-1 items-center justify-center'>
                  <Users className='size-[20px]' />
                  <p className='text-sm'>{event.numofAttendees || 0} attendees</p>
                </div>
              </div>
            </div>
          )}
          {/* Pending */}
          {event && (event?.status === "Pending" || event?.status === "Draft" || event?.status === "Rejected") && (
            <div className='mt-5 px-5'>
              <div className=' flex justify-between items-center gap-4'>
                <div className='flex gap-1 items-center justify-center'>
                  <Calendar className='size-[20px]' />
                  <p className='text-sm'>{formatDate(event.datePosted)}</p>
                </div>
                <div className='flex gap-1 items-center justify-center'>
                  <Clock className='size-[20px]' />
                  <p className='text-sm'>{event.time}</p>
                </div>
                <div className='flex gap-1 items-center justify-center'>
                  <MapPin className='size-[20px]' />
                  <p className='text-sm'>{event.location}</p>
                </div>
              </div>
            </div>
          )}
          {/* Event description */}
          <p className="mb-6">{event ? event.description : "No description added."}</p>
        </div>

        {/* Action Bar */}
        <div className='self-start min-w-[390px] sticky top-1/8'>
          {/* Side bar */}
          <div className='flex flex-col gap-[10px] w-full'>
            {/* Invitation Status */}
            <div className='bg-[#FFFF] py-[10px] px-[20px] rounded-[10px] flex flex-col gap-2 w-full shadow-md border border-gray-200'>
              {event && event?.status === "Accepted" && (
                <>
                  {/* Event Status */}
                  <div>
                    <div className="w-full flex justify-between">
                      <div className="w-1/2">
                        <p>Event Status: </p>
                      </div>
                      <div className="flex items-center justify-end text-green-600 font-medium gap-2 w-full">
                        Approved
                        <CircleCheck />
                      </div>
                    </div>
                  </div>

                  {/* Registration Status */}
                  <div>
                    <div className="w-full flex justify-between">
                      <div className="w-1/2">
                        <p>Availability:</p>
                      </div>
                      <div className="flex items-center justify-end font-medium gap-2 w-full">
                        {event?.stillAccepting ? (
                          <>
                            <span className="text-green-600 flex items-center gap-2">
                              Still accepting guests
                              <CircleCheck />
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-red-600 flex items-center gap-2">
                              Registration closed
                              <X />
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RSVP status */}
                  <div className="w-full flex justify-between">
                    <div className="w-full">
                      <p>RSVP Status: </p>
                    </div>
                    {alumniRsvpStatus === "Pending" ? (
                      <div className="flex items-center justify-end text-yellow-600 font-medium gap-2 w-full">
                        Pending
                        <Clock2 />
                      </div>
                    ) : alumniRsvpStatus === "Accepted" ? (
                      <div className="flex items-center justify-end text-green-600 font-medium gap-2 w-full">
                        Going
                        <CircleCheck />
                      </div>
                    ) : alumniRsvpStatus === "Rejected" ? (
                      <div className="flex items-center justify-end text-red-600 font-medium gap-2 w-full">
                        Not Going
                        <CircleX />
                      </div>
                    ) : null}
                  </div>

                  {/* RSVP Buttons */}
                  {alumniRsvpStatus === "Pending" && (
                    <div className="flex gap-2 p-2">
                      <button
                        onClick={handleAccept}
                        className="text-sm bg-[#0856BA] w-1/2 px-1 py-[5px] rounded-full text-white font-semibold hover:bg-blue-400 hover:cursor-pointer"
                      >
                        Going
                      </button>

                      <button
                        className="text-sm bg-[#FFFF] w-1/2 px-1 py-[5px] rounded-full text-[#0856BA] font-semibold border-[#0856BA] border-2 hover:text-blue-300 hover:bg-white hover:cursor-pointer"
                        onClick={handleReject}
                      >
                        Not Going
                      </button>
                    </div>
                  )}
                </>
              )}

              {event && (event?.status === "Rejected") && (
                <>
                  {/* Event Status */}
                  <div>
                    <div className="w-full flex justify-between">
                      <div className="w-1/2">
                        <p>Event Status: </p>
                      </div>
                      <div className="flex items-center justify-end text-red-600 font-medium gap-2 w-full">
                        {event.status}
                        <CircleX />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {event && (event?.status === "Draft") && (
                <>
                  {/* Event Status */}
                  <div>
                    <div className="w-full flex justify-between">
                      <div className="w-1/2">
                        <p>Event Status: </p>
                      </div>
                      <div className="flex items-center justify-end text-grey-600 font-medium gap-2 w-full">
                        {event.status}
                        <CircleAlert />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 p-2">
                    <button
                      onClick={() => 
                      {
                        setEdit(true)
                        setShowForm(true)
                      }}
                      className="text-sm bg-[#0856BA] w-1/2 px-1 py-[5px] rounded-full text-white font-semibold hover:bg-blue-400 hover:cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => 
                      {
                        handleDelete(event.eventId)
                        router.back()
                      }}
                      className="text-sm bg-[#FFFF] w-1/2 px-1 py-[5px] rounded-full text-[#0856BA] font-semibold border-[#0856BA] border-2 hover:text-blue-300 hover:bg-white hover:cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
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
                </>
              )}

              {event && (event?.status === "Pending") && (
                <>
                  {/* Event Status */}
                  <div>
                    <div className="w-full flex justify-between">
                      <div className="w-1/2">
                        <p>Event Status: </p>
                      </div>
                      <div className="flex items-center justify-end text-yellow-600 font-medium gap-2 w-full">
                        {event.status}
                        <Clock10 />
                      </div>
                    </div>
                  </div>
                </>
              )}

            </div>
          </div>
          {/* Placeholder */}
          {event.needSponsorship && event?.status === "Accepted" && (
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
                className="text-sm mt-4 bg-[#FFFF] w-full px-1 py-[5px] rounded-full text-[#0856BA] font-semibold border-[#0856BA] border-2 hover:text-blue-300 hover:bg-white hover:cursor-pointer"
              >
                View Donation Drive
              </button>
            </div>
          )}
        </div>
      </div>
          {/* Featured Stories Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Featured Stories</h2>

            {isLoading ? (
              <p className="text-gray-500">Loading featured stories...</p>
            ) : sortedStories.length === 0 ? (
              <p className="text-gray-500">No featured stories found.</p>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {sortedStories.slice(0, 4).map((story) => (
                  <div
                    key={story.featuredId}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                    onClick={() => router.push(`/events/featured/${story.featuredId}`)}
                  >
                    {story.image && (
                      <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${story.image})` }} />
                    )}
                    <div className="p-4">
                      <p className="text-xs text-gray-500 mb-1">{formatDate(story.datePosted) || "01/31/2024"}</p>
                      <h3 className="font-semibold text-lg text-gray-800 truncate">
                        {story.title || "How to become a wizard and stop the time"}
                      </h3>
                      <div className="flex items-center mt-4">
                        <span className="text-sm text-gray-700">Read more</span>
                        <svg
                          className="w-4 h-4 ml-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M5 12H19M19 12L12 5M19 12L12 19"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
    </div>
  )
}

export default EventPageAlumni