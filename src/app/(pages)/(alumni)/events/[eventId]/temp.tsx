"use client"

import { useParams, useRouter } from "next/navigation"
import { useEvents } from "@/context/EventContext"
import { useRsvpDetails } from "@/context/RSVPContext"
import type { Event, RSVP } from "@/models/models"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { MoveLeft, Calendar, Clock, MapPin, Users, CircleCheck, HandHeart, ImageOff, X } from "lucide-react"
import { useFeatured } from "@/context/FeaturedStoryContext"
import ProposeEventForm from "../components/ProposeEventForm"
import Link from "next/link"
import BookmarkButton from "@/components/ui/bookmark-button"
import { ThankYouDialog } from "@/components/ThankYouDialog"
import { DonateDialog } from "../../donationdrive-list/DonateDialog"

const EventPageAlumni = () => 
{
  const 
  {
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
  } = useEvents()

  const { rsvpDetails, isLoadingRsvp, handleAlumAccept, handleAlumReject } = useRsvpDetails()
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

  const sortedStories = [...eventStories].sort((a, b) => {
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

  let alumniRsvpStatus: string | undefined = undefined

  if (alumInfo?.alumniId && matchingRSVP?.alums)
  {
    alumniRsvpStatus = matchingRSVP.alums[alumInfo.alumniId]?.status
  }

  return (
    <div className="w-full px-6 md:px-10 lg:px-20 pt-6 pb-10">
      <Link href="/events" className="text-sm mb-4 inline-flex gap-2 items-center hover:underline">
        <MoveLeft className="size-[17px]" />
        Back to Events
      </Link>

      <div className="flex justify-between items-center">
				<h1 className="text-3xl lg:text-5xl font-bold text-gray-800">{event?.title || "Event Details"}</h1>
				<BookmarkButton entryId={event.eventId} type="events" size="lg" />
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
					{/* Event details */}
					{event && (
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
					{/* Event description */}
					<p className="mb-6">{event ? event.description : "No description added."}</p>
					<div>
						{/* Target guests */}
						{/* {event?.targetGuests && event.targetGuests.length > 0 && (
							<div>
							<p className="text-sm text-gray-600 mb-2">Target audience:</p>
							<div className="flex flex-wrap gap-2">
								{event.targetGuests.map((guest, index) => (
								<span 
									key={index} 
									className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
								>
									{guest}
								</span>
								))}
							</div>
							</div>
						)} */}
					</div>
				</div>
				{/* Action Bar */}
				<div className='self-start min-w-[390px] sticky top-1/8'>
					{/* Side bar */}
					<div className='flex flex-col gap-[10px] w-full'>
						{/* Invitation Status */}
						<div className='bg-[#FFFF] py-[10px] px-[20px] rounded-[10px] flex flex-col gap-2 w-full shadow-md border border-gray-200'>
							{ event && (
								<div >
									<div className='w-full flex justify-between'>
										<div className='w-1/2'>
											<p>Event Status: </p>
										</div>
										<div className='w-full flex'>
											{event?.stillAccepting ? (
												<div className="flex items-center justify-end  text-green-600 font-medium gap-2 w-full">
													Still accepting guests
													<CircleCheck />
												</div>
											) : (
												<div className="flex items-center justify-end  text-red-600 font-medium gap-2 w-full">
													<X />
													Registration closed
												</div>
											)}
										</div>
									</div>
								</div>
							)}
							{/* <div className='w-full flex justify-between'>
								<div className='w-full'>
									<p>Donation Status: </p>
								</div>
								<div className='w-full flex'>
									{donationDrive.status == 'active' ? (
										<div className="flex items-center justify-end  text-green-600 font-medium gap-2 w-full">
											Active
											<CircleCheck />
										</div>
									) : (
										<div className="flex items-center justify-end  text-red-600 font-medium gap-2 w-full">
											Closed
											<X />
										</div>
									)}
								</div>
							</div> */}
						</div>
						{/* Donation Bar */}
						<div className='bg-[#FFFF] py-[30px] px-[20px] rounded-[10px] flex flex-col gap-3 shadow-md border border-gray-200'>
							{/* Progress bar */}
							<div className="">
								<div className="flex justify-between mb-1">
									<div className='flex gap-2'>
										<Users className='size-[20px] text-[#616161]'/>
										<span className="text-sm text-gray-500"> {donationDrive.donorList.length ?? '0'} Patrons</span>
									</div>
									<div className='flex gap-2'>
										<Clock className='size-[17px] text-[#616161]'/>
										<span className="text-sm text-gray-500">{getRemainingDays(donationDrive.endDate)}</span>
									</div>
								</div>
								<div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
									<div 
										className="h-full bg-blue-500 rounded-full" 
										style={{ width: `${calculateProgress(donationDrive.currentAmount, donationDrive.targetAmount)}%` }}
									></div>
								</div>
								<div className="flex justify-between my-1 text-sm">
									<span className="font-medium">₱ {donationDrive.currentAmount.toLocaleString()}</span>
									<span className="text-gray-500"> ₱ {donationDrive.targetAmount.toLocaleString()}</span>
								</div>
							</div>
							{donationDrive.donorList.length > 0 && recentDonation && highestDonation &&(
								<>
									{/* Recent Donation */}
									{/* <div className='flex items-center justify-between'>
										<div className='flex items-center gap-3'>
											<HandHeart className='size-[17px]' />
											<div>
												<p className='text-sm'>
													{recentDonation.isAnonymous ? 'Anonymous' : recentDonation.displayName || 'Unknown'}
												</p>
												<p className='text-xs'>
													₱{recentDonation.amount?.toLocaleString() || '0'}
												</p>
											</div>
										</div>
										<div>
											<p className='text-xs'>Recent Donation</p>
										</div>
									</div> */}

									{/* Top Donation */}
									<div className='flex items-center justify-between'>
										<div className='flex items-center gap-3'>
											<HandHeart className='size-[17px]' />
											<div>
												<p className='text-sm'>
													{highestDonation.isAnonymous ? 'Anonymous' : highestDonation.displayName || 'Unknown'}
												</p>
												<p className='text-xs'>
													₱{highestDonation.amount?.toLocaleString() || '0'}
												</p>
											</div>
										</div>
										<div>
											<p className='text-xs'>Major Donation</p>
										</div>
									</div>
								</>
							)}
							{/* Buttons */}
							<div className='flex gap-[10px] w-full'>
								<div className='w-full'> 
									<DonateDialog drive={donationDrive} onDonationSuccess={handleDonationSuccess}/> 
								</div>
								<button className='text-sm bg-[#FFFF] w-full px-1 py-[5px] rounded-full text-[#0856BA] font-semibold border-[#0856BA] border-2 hover:bg-gray-100 hover:cursor-pointer'
									onClick={() => setShowDonors(true)}> 
									View All Donations
								</button>
							</div>
						</div>
					</div>
					{showDonors && (
						<div className="bg-[#FFFF] py-[30px] px-[30px] rounded-[10px] mt-3 shadow-md border border-gray-200">
							<div className='flex justify-between items-start'>
								<h3 className="font-semibold text-l mb-4">Donation History</h3>
								<button onClick={() => setShowDonors(false)}>
									<X className='size-[17px] hover:cursor-pointer hover:text-gray-600'/>
								</button>
							</div>
							<div className="bg-gray-50 rounded-lg h-[25svh]">
								{donationsLoading ? (
									<div className="flex justify-center py-4">
										<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
									</div>
								) : donations.length > 0 ? (
									<div className="overflow-y-auto h-full">
										<table className="min-w-full divide-y divide-gray-200">
											<thead className="bg-gray-100">
												<tr>
													<th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Donor
													</th>
													<th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Amount
													</th>
													{/* <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Date
													</th> */}
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{donations.map((donation) => (
													<tr key={donation.donationId} className="hover:bg-gray-50">
														<td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
															{donation.isAnonymous ? 'Anonymous' : donation.displayName || 'Unknown'}
														</td>
														<td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
															${donation.amount?.toLocaleString() || '0'}
														</td>
														{/* <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
															{formatDate(donation.date)}
														</td> */}
													</tr>
												))}
											</tbody>
										</table>
									</div>
								) : (
									<p className="text-gray-500 py-4 text-center">No donations have been made for this sponsorship yet.</p>
								)}
							</div>
						</div>
					)}
				</div>
				{isThankYouOpen && (<ThankYouDialog />)}
					{/* Donors */}
			</div>

      {event ? (
        <div className="space-y-4">
          {/* Main content area with two columns */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left column - Event image and details */}
            <div className="flex-1">
              <img
                src={event.image || "/placeholder.svg?height=400&width=600"}
                alt="Event"
                className="w-full rounded-md mb-6"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm text-gray-700 mt-4">
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

              <div className="mt-6 space-y-4">
                <p className="text-gray-700">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Right column - Status and actions */}
            <div className="w-full md:w-80 space-y-4">
              {/* Status box - only show for relevant statuses */}
              {event.status === "Rejected" && event.creatorType === "alumni" && (
                <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Proposal Status:</span>
                    <span className="text-red-600 font-medium flex items-center">
                      <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Rejected
                    </span>
                  </div>
                </div>
              )}

              {/* Invitation Status - only show for approved events with RSVP */}
              {event.status === "Accepted" && matchingRSVP && (
                <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">Invitation Status:</span>
                    <span className="text-yellow-600 font-medium flex items-center">
                      <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="12" cy="16" r="1" fill="currentColor" />
                      </svg>
                      Pending
                    </span>
                  </div>

                  {/* RSVP Buttons */}
                  {alumniRsvpStatus === "Pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => alumInfo?.alumniId && handleAlumAccept(event.eventId, alumInfo.alumniId)}
                        className="flex-1 py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition"
                      >
                        Going
                      </button>
                      <button
                        onClick={() => alumInfo?.alumniId && handleAlumReject(event.eventId, alumInfo.alumniId)}
                        className="flex-1 py-2 bg-white text-blue-600 text-center border border-blue-600 rounded-md hover:bg-blue-50 transition"
                      >
                        Not Going
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Edit/Delete Buttons - only show for draft events */}
              {event.status === "Draft" && event.creatorType === "alumni" && (
                <div className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setEdit(true)
                        setShowForm(true)
                      }}
                      className="w-full py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDelete(event.eventId)
                        router.back()
                      }}
                      className="w-full py-2 bg-white text-red-600 text-center border border-red-600 rounded-md hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* View Donation Button - only show for approved events with sponsorship */}
              {event.status === "Accepted" && event.needSponsorship && (
                <div className="mt-4">
                  <button
                    onClick={() =>
                      router.push(`/donationdrive-list/details?id=${event.donationDriveId || "vlJhDwj4np86XBz543BT"}`)
                    }
                    className="w-full py-2 bg-blue-600 text-white text-center rounded-md hover:bg-blue-700 transition"
                  >
                    View Donation Drive
                  </button>
                </div>
              )}
            </div>
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
      ) : (
        <p className="text-gray-600">Event not found.</p>
      )}
    </div>
  )
}

export default EventPageAlumni

