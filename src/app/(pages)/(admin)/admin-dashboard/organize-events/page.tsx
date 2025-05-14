"use client"

import { useEffect, useState } from "react"
import { useEvents } from "@/context/EventContext"
import type { Event } from "@/models/models"
import Link from "next/link"
import { useMemo } from "react"
import { Calendar, ChevronRight, CircleCheck, CircleX, Clock, MapPin, Trash2, UserCheck } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useRsvpDetails } from "@/context/RSVPContext"
import { useDonationDrives } from "@/context/DonationDriveContext"

export default function EventPageAdmin() {
  const router = useRouter()
  const params = useParams()
  const {
    events,
    isLoading,
    setShowForm,
    showForm,
    handleSave,
    handleEdit,
    handleDelete,
    date,
    handleReject,
    addEvent,
    handleFinalize,
    handleViewEventAdmin,
    handleImageChange,
    setEventDate,
    image,
    setEventImage,
    description,
    setEventDescription,
    title,
    setEventTitle,
    location,
    setEventLocation,
    time,
    setEventTime,
    fileName,
    setFileName,
  } = useEvents()

  const { handleAddEventRelated } = useDonationDrives()

  const evId = params?.eventId as string
  const ev = events.find((e: Event) => e.eventId === evId)

  const [toggles, setToggles] = useState(events.map(() => false))
  const { rsvpDetails, alumniDetails, isLoadingRsvp } = useRsvpDetails()
  const [isEditing, setEdit] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [visibility, setVisibility] = useState("default")
  const [selectedBatches, setSelectedBatches] = useState<any[]>([])
  const [selectedAlumni, setSelectedAlumni] = useState<any[]>([])
  const [sortBy, setSortBy] = useState("posted-newest")
  const [statusFilter, setStatusFilter] = useState("Accepted")
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedButton, setButton] = useState("")
  const [activeTab, setActiveTab] = useState("Accepted")
  const tabs = ["Accepted", "Pending", "Rejected", "Draft"]

  if (!events) return <div>Loading Events...</div>

  const sortedEvents = [...events].sort((x, y) => {
    switch (sortBy) {
      case "posted-newest":
        const dateX = x.datePosted?.seconds ? new Date(x.datePosted.seconds * 1000) : new Date(0)
        const dateY = y.datePosted?.seconds ? new Date(y.datePosted.seconds * 1000) : new Date(0)
        return dateY.getTime() - dateX.getTime()

      case "posted-oldest":
        const oldDateX = x.datePosted?.seconds ? new Date(x.datePosted.seconds * 1000) : new Date(0)
        const oldDateY = y.datePosted?.seconds ? new Date(y.datePosted.seconds * 1000) : new Date(0)
        return oldDateX.getTime() - oldDateY.getTime()

      case "alphabetical": {
        return x.title.toLowerCase().localeCompare(y.title.toLowerCase())
      }

      default:
        return 0
    }
  })

  const getFilteredEvents = () => {
    return sortedEvents.filter((event) => {
      // Filter events based on the activeTab (status)
      if (activeTab === "Draft") {
        return event.status === "Draft" && event.creatorType === "admin" // Only show admin drafts
      }
      return event.status === activeTab // For other tabs, filter by status only
    })
  }

  const filteredEvents = useMemo(() => getFilteredEvents(), [sortedEvents, activeTab])

  const formatDate = (date: any) => {
    if (!date) return "N/A"
    const dateObj = typeof date === "object" && date.toDate ? date.toDate() : new Date(date)

    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  useEffect(() => {
    const eventToEdit = events.find((g: Event) => g.eventId === editingEventId)
    setVisibility("all")
    setSelectedAlumni([])
    setSelectedBatches([])

    if (eventToEdit) {
      setEventTitle(eventToEdit.title)
      setEventDescription(eventToEdit.description)
      setEventImage(eventToEdit.image)
      setEventDate(eventToEdit.date)
      setEventTime(eventToEdit.time)
      setEventLocation(eventToEdit.location)
      setShowForm(true)

      // Properly check targetGuests for alumni and batches
      if (eventToEdit.targetGuests && eventToEdit.targetGuests.length > 0) {
        // Check if the first item is a batch (e.g., a string of length 4)
        if (eventToEdit.targetGuests[0].length === 4) {
          setSelectedBatches(eventToEdit.targetGuests) // Set the batches
          setVisibility("batch") // Set visibility to batches
        } else {
          setSelectedAlumni(eventToEdit.targetGuests) // Set the alumni
          setVisibility("alumni") // Set visibility to alumni
        }
      }
    }
  }, [
    isEditing,
    events,
    editingEventId,
    setEventTitle,
    setEventDescription,
    setEventImage,
    setEventDate,
    setEventTime,
    setEventLocation,
    setShowForm,
  ])

  const formComplete =
    title.trim() !== "" &&
    description.trim() !== "" &&
    date.trim() !== "" &&
    time.trim() !== "" &&
    location.trim() !== ""

  const resetFormState = () => {
    setEdit(false)
    setEventTitle("")
    setEventDescription("")
    setEventDate("")
    setEventTime("")
    setEventLocation("")
    setEventImage("")
    setVisibility("all")
    setSelectedBatches([])
    setSelectedAlumni([])
    setFileName("")
    setErrorMessage("")
    setButton("")
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/admin-dashboard" className="hover:underline">
          Home
        </Link>
        <ChevronRight size={15} />
        <span className="text-[var(--primary-blue)] font-semibold">Manage Events</span>
      </div>
      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">Manage Events</div>
          <button
            onClick={() => router.push("/admin-dashboard/organize-events/add")}
            className="bg-[var(--primary-blue)] text-[14px] text-white px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--blue-600)]"
          >
            + Create Event
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {/* Tabs */}
        <div className="w-full flex gap-2">
          {tabs.map((tab) => {
            const eventCount = events.filter((event: Event) => {
              if (tab === "Draft") {
                return event.status === "Draft" && event.creatorType === "admin" // Only count admin drafts
              }
              return event.status === tab // Count all events matching the tab's status
            }).length
            const eventCountBgColor = "bg-[var(--primary-blue)]"

            return (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full flex flex-col items-center justify-end rounded-t-2xl overflow-hidden pt-0.4 cursor-pointer ${
                  activeTab === tab ? eventCountBgColor : "bg-white"
                }`}
              >
                {/* Blue bar above active tab */}
                <div
                  className={`w-full h-1 transition-colors ${activeTab === tab ? eventCountBgColor : "bg-transparent"}`}
                />
                <div
                  className={`w-full py-3 flex items-center justify-center gap-1 rounded-t-2xl font-semibold text-base ${
                    activeTab === tab ? "text-[var(--primary-blue)] bg-white" : "text-blue-200 bg-white"
                  }`}
                >
                  {tab}
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-[13px] text-white ${
                      activeTab === tab ? "bg-amber-400" : "bg-blue-200"
                    }`}
                  >
                    {eventCount}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl flex gap-3 p-2.5 pl-4 items-center">
          <div className="text-sm font-medium text-gray-600">Filter by:</div>
          <div className="relative">
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-300 px-3 py-1 rounded-md text-sm font-medium cursor-pointer hover:bg-gray-400 appearance-none pr-8"
            >
              <option value="posted-newest">Newest</option>
              <option value="posted-oldest">Earliest</option>
              <option value="alphabetical">A-Z</option>
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white flex flex-col justify-between rounded-2xl overflow-hidden w-full p-4">
          <div className="rounded-xl overflow-hidden border border-gray-300 relative">
            {/* Table with proper HTML table elements */}
            <table className="w-full border-collapse">
              {/* Table Header - Using position: sticky */}
              <thead className="sticky top-0 z-50 bg-blue-100 shadow-sm text-sm text-gray-600">
                <tr>
                  <th className="text-left p-4 font-semibold w-2/6">Event Title</th>
                  <th className="text-left p-4 font-semibold w-1/6">Details</th>
                  <th className="text-right p-4 font-semibold w-3/6">Actions</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-10 text-gray-500">
                      No {activeTab} events found.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((e: Event, index: number) => (
                    <tr
                      key={e.eventId}
                      className={`border-t border-gray-300 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}
                    >
                      {/* Title + description */}
                      <td className="p-4 w-2/5">
                        <div className="flex flex-col gap-1">
                          <div className="text-base font-bold">{e.title}</div>
                          <div className="text-sm text-gray-600">
                            <p className="text-xs font-light">Proposed by: {e.creatorName ?? "Admin"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Event Details */}
                      <td className="p-4  w-2/7">
                        <div className="flex gap-15 text-gray-600">
                          <div className="flex flex-col gap-5">
                            {/* Event Date */}
                            <div className="flex gap-1 items-center">
                              <Calendar size={16} />
                              <p className="text-xs">{e.date}</p>
                            </div>

                            {/* Event Time */}
                            <div className="flex gap-1 items-center">
                              <Clock size={16} />
                              <p className="text-xs">{e.time}</p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-5">
                            {/* Where */}
                            <div className="flex gap-1 items-center">
                              <MapPin size={16} />
                              <p className="text-xs truncate max-w-[150px]">{e.location}</p>
                            </div>

                            {/* Num of attendees */}
                            <div className="flex gap-1 items-center bg">
                              <UserCheck size={16} />
                              <p className="text-xs">{e.numofAttendees} Going</p>
                            </div>
                          </div>

                          
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right pr-5">
                        {e.status === "Pending" ? (
                          <div className="flex items-center justify-end gap-4">
                            <div className="flex items-center justify-end gap-10 pr-5">
                              <div className="flex items-center justify-end gap-10 text-[14px]">
                                <button
                                  onClick={() => router.push(`/admin-dashboard/organize-events/edit/${e.eventId}`)}
                                  className="text-[var(--primary-blue)] hover:underline cursor-pointer"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <button
                                onClick={() => addEvent(e, true)}
                                className="px-3 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 cursor-pointer flex gap-1 items-center"
                              >
                                <CircleCheck size={18} />Approve
                              </button>
                              <button
                                onClick={() => handleReject(e.eventId)}
                                className="px-3 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 cursor-pointer flex gap-1 items-center"
                              >
                                <CircleX size={18}/> Reject
                              </button>
                            </div>
                          </div>
                        ) : e.status === "Accepted" && e.donationDriveId === "" ? (
                          <div className="flex items-center justify-end gap-10 text-[14px]">
                            <button
                              onClick={() => handleAddEventRelated(e)}
                              className="text-gray-600 hover:underline cursor-pointer"
                            >
                              Create Donation Drive
                            </button>
                            <button
                              onClick={() => handleViewEventAdmin(e)}
                              className="text-[var(--primary-blue)] hover:underline cursor-pointer"
                            >
                              View Details
                            </button>
                            <Trash2
                              size={20}
                              onClick={() => handleDelete(e.eventId)}
                              className="text-gray-500 hover:text-red-400 cursor-pointer"
                            />
                          </div>
                        ) : e.status === "Accepted" || e.status === "Rejected" ? (
                          <div className="flex items-center justify-end gap-10 pr-5">
                            <div className="flex items-center justify-end gap-10 text-[14px]">
                              <button
                                onClick={() => handleViewEventAdmin(e)}
                                className="text-[var(--primary-blue)] hover:underline cursor-pointer"
                              >
                                View Details
                              </button>
                              <Trash2
                                size={20}
                                onClick={() => handleDelete(e.eventId)}
                                className="text-gray-500 hover:text-red-400 cursor-pointer"
                              />
                            </div>
                          </div>
                        ) : (
                          e.status === "Draft" &&
                          e.creatorType === "admin" && (
                            <div className="flex items-center justify-end gap-10 pr-5">
                              <div className="flex items-center justify-end gap-10 text-[14px]">
                                <button
                                  onClick={() => router.push(`/admin-dashboard/organize-events/edit/${e.eventId}`)}
                                  className="text-[var(--primary-blue)] hover:underline cursor-pointer"
                                >
                                  View Details
                                </button>
                                <Trash2
                                  size={20}
                                  onClick={() => handleDelete(e.eventId)}
                                  className="text-gray-500 hover:text-red-400 cursor-pointer"
                                />
                              </div>
                            </div>
                          )
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
