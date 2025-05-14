"use client"

import { useParams, useRouter } from "next/navigation"
import { useEvents } from "@/context/EventContext"
import type { Event } from "@/models/models"
import { useState, useEffect, useMemo } from "react"
import { useRsvpDetails } from "@/context/RSVPContext"
import { MoveLeft, Calendar, Clock, MapPin, Users, CheckCircle, X } from "lucide-react"
import { useAlums } from "@/context/AlumContext"
import Link from "next/link"
import ModalInput from "@/components/ModalInputForm"

const EventPageAdmin = () => 
{
  const 
  {
    events,
    setShowForm,
    showForm,
    handleSave,
    handleEdit,
    handleDelete,
    date,
    handleReject,
    addEvent,
    setEventDate,
    description,
    setEventDescription,
    title,
    setEventTitle,
    time,
    setEventTime,
    location,
    setEventLocation,
    image,
    setEventImage,
    fileName,
    setFileName,
    handleImageChange,
  } = useEvents()

  const params = useParams()
  const router = useRouter()

  const eventId = params?.eventId as string
  const event = events.find((e: Event) => e.eventId === eventId)

  const [isEditing, setEdit] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [visibility, setVisibility] = useState("all")
  const [selectedBatches, setSelectedBatches] = useState<any[]>([])
  const [selectedAlumni, setSelectedAlumni] = useState<any[]>([])

  const { rsvpDetails, alumniDetails } = useRsvpDetails()
  const [rsvpFilter, setRsvpFilter] = useState("All")
  const [rsvpSort, setRsvpSort] = useState<"asc" | "desc">("asc")

  const [errorMessage, setErrorMessage] = useState("")

  const { alums } = useAlums()

  useEffect(() => {
    // Properly show the selected filter when Editing the values
    if (isEditing && events) 
    {
      const eventToEdit = events.find((event : Event) => event.eventId === editingEventId)
      setVisibility("all")
      setSelectedAlumni([])
      setSelectedBatches([])

      if (eventToEdit) 
      {
        setEventTitle(eventToEdit.title)
        setEventLocation(eventToEdit.location)
        setEventTime(eventToEdit.time)
        setEventImage(eventToEdit.image)
        setEventDescription(eventToEdit.description)
        setEventDate(eventToEdit.date)
        setShowForm(true)

        // Properly check targetGuests for alumni and batches
        if (eventToEdit.targetGuests && eventToEdit.targetGuests.length > 0)
        {
          // Check if the first item is a batch (e.g., a string of length 4)
          if (eventToEdit.targetGuests[0].length === 4) 
          {
            setSelectedBatches(eventToEdit.targetGuests) // Set the batches
            setVisibility("batch") // Set visibility to batches
          } 
          
          else 
          {
            setSelectedAlumni(eventToEdit.targetGuests) // Set the alumni
            setVisibility("alumni") // Set visibility to alumni
          }
        }
      }
    }
  }, [isEditing, events, editingEventId])

  const filteredAndSortedRsvps = useMemo(() => 
  {
    if (!event) return []

    // Filter RSVPs
    const filteredRsvps = rsvpDetails
      .filter((rsvp) => rsvp.postId === event.eventId)
      .flatMap((rsvp) =>
        Object.entries(rsvp.alums || {}).map(([alumniId, alumData]) => {
          const { status } = alumData as { status: string }
          const alumni = alums.find((a) => a.alumniId === alumniId)

          return {
            alumniId,
            alumni,
            status,
            rsvpId: rsvp.rsvpId,
          }
        }),
      )
      // Apply status filter
      .filter((rsvpItem) => rsvpFilter === "All" || rsvpItem.status === rsvpFilter)
      // Sort by name
      .sort((a, b) => 
      {
        if (!a.alumni || !b.alumni) return 0
        const nameA = `${a.alumni.firstName} ${a.alumni.lastName}`.toLowerCase()
        const nameB = `${b.alumni.firstName} ${b.alumni.lastName}`.toLowerCase()
        return rsvpSort === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA)
      })

    return filteredRsvps
  }, [event, rsvpDetails, alums, rsvpFilter, rsvpSort])

  if (!eventId || events.length === 0) 
  {
    return <p>Loading...</p>
  }

  const formComplete =
    title.trim() !== "" &&
    description.trim() !== "" &&
    date.trim() !== "" &&
    time.trim() !== "" &&
    location.trim() !== ""

  const resetFormState = () => 
  {
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
  }

  // Count RSVPs by status
  const rsvpCounts = 
  {
    Going: filteredAndSortedRsvps.filter((item) => item.status === "Accepted").length,
    NotGoing: filteredAndSortedRsvps.filter((item) => item.status === "Rejected").length,
    Pending: filteredAndSortedRsvps.filter((item) => item.status === "Pending").length,
  }

  // Render the form modal
  return (
    <div className="w-full px-6 md:px-10 lg:px-20 pt-6 pb-10">
      <Link href="/admin-dashboard/organize-events" className="text-sm mb-4 inline-flex gap-2 items-center hover:underline">
        <MoveLeft className="size-[17px]" />
        Back to Manage Events
      </Link>

      {event ? (
<>
    {/* APPROVED EVENT LAYOUT */}
    {event.status === "Accepted" ? (
      <div>
        <h1 className="text-2xl font-bold mb-6">{event.title}</h1>

        {/* Grid for Proposal Status, RSVP Summary, and RSVP Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Proposal Status Card */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-md p-4 col-span-3">
            <span className="font-medium block mb-2">Proposal Status:</span>
            <span className="text-green-600 font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Approved
            </span>
          </div>

          {/* RSVP Summary Card */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-md p-4 col-span-3">
            <h3 className="font-medium mb-4">RSVPs:</h3>

            <div className="flex flex-wrap gap-4 mb-4">
              {/* Status Filter */}
              <select 
                value={rsvpFilter}
                onChange={(e) => setRsvpFilter(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="All">All Status</option>
                <option value="Accepted">Going</option>
                <option value="Rejected">Not Going</option>
                <option value="Pending">Pending</option>
              </select>

              {/* Name Sorting */}
              <button 
                onClick={() => setRsvpSort(rsvpSort === "asc" ? "desc" : "asc")}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Sort {rsvpSort === "asc" ? "A-Z" : "Z-A"}
              </button>
            </div>

            <div className="mb-4">
              <div className="text-sm mb-1">Alumni Responses:</div>
              <div className="flex items-center gap-1 mb-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Going: {rsvpCounts.Going}</span>
              </div>
              <div className="flex items-center gap-1 mb-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Not Going: {rsvpCounts.NotGoing}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Pending: {rsvpCounts.Pending}</span>
              </div>
            </div>
          </div>

          {/* RSVP Cards Grid - Each card in a column */}
          {filteredAndSortedRsvps.map((rsvpItem) => (
            <div
              key={`${rsvpItem.rsvpId}-${rsvpItem.alumniId}`}
              className="bg-white shadow-sm border border-gray-200 rounded-md p-4"
            >
              {rsvpItem.alumni ? (
                <>
                  <p className="font-medium">
                    {rsvpItem.alumni.firstName} {rsvpItem.alumni.lastName}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {rsvpItem.alumni.email || "No email provided"}
                  </p>
                  <div className="mt-2">
                    <span className="text-sm">Status: </span>
                    {rsvpItem.status === "Accepted" ? (
                      <span className="text-green-600 text-sm">Going</span>
                    ) : rsvpItem.status === "Rejected" ? (
                      <span className="text-red-600 text-sm">Not Going</span>
                    ) : (
                      <span className="text-yellow-600 text-sm">• Pending</span>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-gray-500">
                  Alumni details not found for ID: {rsvpItem.alumniId}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    ) : null}
  </>
          ) : /* REJECTED EVENT LAYOUT */
          event.status === "Rejected" ? (
            <div>
              <h1 className="text-2xl font-bold mb-6">{event.title}</h1>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <img
                    src={event.image || "/placeholder.svg?height=400&width=600"}
                    alt="Event"
                    className="w-full rounded-md mb-6"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm text-gray-700 mt-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#616161]" />
                      {event.date || "2025-05-16"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#616161]" />
                      {event.time || "12:52"}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[#616161]" />
                      {event.location || "In4"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-[#616161]" />
                      {event.numofAttendees || "100"}
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-gray-700">{event.description || "dfdfd"}</p>
                  </div>
                </div>

                <div className="w-full md:w-80">
                  <div className="bg-white shadow-sm border border-gray-200 rounded-md p-3 flex justify-between items-center">
                    <span className="font-medium">Proposal Status:</span>
                    <span className="text-red-600 font-medium flex items-center">
                      <X className="w-4 h-4 mr-1" />
                      Rejected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <p className="text-gray-600">Event not found.</p>
      )}
    </div>
  )
}

export default EventPageAdmin
