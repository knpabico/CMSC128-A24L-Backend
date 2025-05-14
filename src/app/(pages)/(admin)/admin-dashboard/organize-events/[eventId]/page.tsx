"use client"

import type React from "react"

import { useState, useEffect, useRef, useMemo } from "react"
import { useEvents } from "@/context/EventContext"
import { Asterisk, ChevronDown, Upload, X, Edit, Eye } from "lucide-react"
import type { Event } from "@/models/models"
import { useRouter, useParams } from "next/navigation"
import ModalInput from "@/components/ModalInputForm"
import { useAlums } from "@/context/AlumContext"
import { useRsvpDetails } from "@/context/RSVPContext"
import Breadcrumb from "@/components/breadcrumb"

export default function EventPageAdmin() {
  const {
    events,
    updateEvent,
    image,
    setEventImage,
    setEventTitle,
    setEventDescription,
    setEventLocation,
    setEventDate,
    setEventTime,
    setEventStatus,
    handleSave,
    title,
    description,
    date,
    time,
    location,
    status,
    fileName,
    setFileName,
    handleImageChange,
    preview,
    setPreview,
    addEvent,
    handleEdit,
  } = useEvents()

  const router = useRouter()
  const params = useParams()
  const eventId = params?.eventId as string
  const event = events.find((e: Event) => e.eventId === eventId)
  const { activeAlums, alums } = useAlums()
  
  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [visibility, setVisibility] = useState("all")
  const [selectedBatches, setSelectedBatches] = useState<string[]>([])
  const [selectedAlumni, setSelectedAlumni] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedButton, setButton] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [currentEvent, setCurrentEvent] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSticky, setIsSticky] = useState(false)

  // Refs
  const placeholderRef = useRef(null)
  const formContainerRef = useRef(null)
  const batchDropdownRef = useRef(null)
  const batchMainInputRef = useRef(null)
  const alumniDropdownRef = useRef(null)
  const alumniMainInputRef = useRef(null)

  // Dropdown state
  const [isBatchDropdownOpen, setIsBatchDropdownOpen] = useState(false)
  const [batchSearchTerm, setBatchSearchTerm] = useState("")
  const [batchInputValue, setBatchInputValue] = useState("")

  const [isAlumniDropdownOpen, setIsAlumniDropdownOpen] = useState(false)
  const [alumniSearchTerm, setAlumniSearchTerm] = useState("")
  const [alumniInputValue, setAlumniInputValue] = useState("")

  // RSVPs
  const { rsvpDetails, alumniDetails } = useRsvpDetails();
  const [rsvpFilter, setRsvpFilter] = useState("All");
  const [rsvpSort, setRsvpSort] = useState<"asc" | "desc">("asc");

  // Generate years from 1925 to current year
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1925 + 1 }, (_, i) => (currentYear - i).toString())

  // Sample alumni emails for display
  const alumniEmails = activeAlums
    ? activeAlums.filter((alum) => alum.email && alum.activeStatus === true).map((alum) => alum.email)
    : []

  // Filtered years based on search term
  const filteredBatchYears = years.filter((year) => year.toLowerCase().includes(batchSearchTerm.toLowerCase()))

  // Filtered alumni emails based on search term
  const filteredAlumniEmails = alumniEmails.filter((email) =>
    email.toLowerCase().includes(alumniSearchTerm.toLowerCase()),
  )

  const filteredAndSortedRsvps = useMemo(() => {
    if (!event) return [];

    // Filter RSVPs
    const filteredRsvps = rsvpDetails
      .filter((rsvp) => rsvp.postId === event.eventId)
      .flatMap((rsvp) =>
        Object.entries(rsvp.alums || {}).map(([alumniId, alumData]) => {
          const { status } = alumData as { status: string };
          const alumni = alums.find((a) => a.alumniId === alumniId);

          return {
            alumniId,
            alumni,
            status,
            rsvpId: rsvp.rsvpId,
          };
        })
      )
      // Apply status filter
      .filter((rsvpItem) => 
        rsvpFilter === "All" || rsvpItem.status === rsvpFilter
      )
      // Sort by name
      .sort((a, b) => {
        if (!a.alumni || !b.alumni) return 0;
        const nameA = `${a.alumni.firstName} ${a.alumni.lastName}`.toLowerCase();
        const nameB = `${b.alumni.firstName} ${b.alumni.lastName}`.toLowerCase();
        return rsvpSort === "asc" 
          ? nameA.localeCompare(nameB) 
          : nameB.localeCompare(nameA);
      });

    return filteredRsvps;
  }, [event, rsvpDetails, alums, rsvpFilter, rsvpSort]);

  // Breadcrumb configuration
  const breadcrumbItems = [
    { label: "Home", href: "/admin-dashboard" },
    { label: "Manage Events", href: "/admin-dashboard/organize-events" },
    { label: "Edit Event", href: "#", active: true },
  ]

  // Check if form is complete
  const formComplete =
    title.trim() !== "" &&
    description.trim() !== "" &&
    location.trim() !== "" &&
    date.trim() !== "" &&
    time.trim() !== "" &&
    image !== "" &&
    (visibility !== "batch" || selectedBatches.length > 0) &&
    (visibility !== "alumni" || selectedAlumni.length > 0)

  // Fetch event data on component mount
  useEffect(() => {
    const eventToEdit = events.find((g: Event) => g.eventId === eventId)
    setVisibility("all")
    setSelectedAlumni([])
    setSelectedBatches([])
    setErrorMessage("")

    if (eventToEdit) {
      setCurrentEvent(eventToEdit)
      setEventTitle(eventToEdit.title)
      setEventDescription(eventToEdit.description)
      setEventImage(eventToEdit.image)
      setEventDate(eventToEdit.date)
      setEventTime(eventToEdit.time)
      setEventStatus(eventToEdit.status)
      setEventLocation(eventToEdit.location)

      if (eventToEdit.image) {
        setEventImage(eventToEdit.image)
        setPreview(eventToEdit.image)
        // Extract filename from the image URL or path if possible
        const imageName = eventToEdit.image.split("/").pop()
        setFileName(imageName || "Current image")
      }

      // Properly check targetGuests for alumni and batches
      if (eventToEdit.targetGuests && eventToEdit.targetGuests.length > 0) {
        // Check if the first item is a batch (e.g., a string of length 4)
        if (eventToEdit.inviteType === "batch") {
          const selectedInfo = Array.from(new Set(
            alums
              .filter(alumni => eventToEdit.targetGuests.includes(alumni.alumniId))
              .map(alumni => alumni.studentNumber?.slice(0, 4))
          )) as string[];// Set the batches
          setSelectedBatches(selectedInfo)
          setVisibility("batch") // Set visibility to batches
        } else if (eventToEdit.inviteType === "alumni") {
          const selectedInfo = alums
            .filter(alumni => eventToEdit.targetGuests.includes(alumni.alumniId))
            .map(alumni => alumni.email);// Set the batches
          setSelectedAlumni(selectedInfo) // Set the alumni
          setVisibility("alumni") // Set visibility to alumni
        }
      }
      setIsLoading(false)
    } else {
      // Event not found
      setErrorMessage("Event not found")
      setIsLoading(false)
    }
  }, [events, eventId])

  // Effects for sticky footer
  useEffect(() => {
    if (!placeholderRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting)
      },
      {
        threshold: 0,
        rootMargin: "0px",
      },
    )

    observer.observe(placeholderRef.current)
    return () => observer.disconnect()
  }, [])

  // Effects for dropdowns
  useEffect(() => {
    if (isBatchDropdownOpen && batchMainInputRef.current) {
      batchMainInputRef.current.focus()
    }
  }, [isBatchDropdownOpen])

  useEffect(() => {
    if (isAlumniDropdownOpen && alumniMainInputRef.current) {
      alumniMainInputRef.current.focus()
    }
  }, [isAlumniDropdownOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (batchDropdownRef.current && !batchDropdownRef.current.contains(event.target)) {
        setIsBatchDropdownOpen(false)
        setBatchSearchTerm("")
        setBatchInputValue("")
      }
      if (alumniDropdownRef.current && !alumniDropdownRef.current.contains(event.target)) {
        setIsAlumniDropdownOpen(false)
        setAlumniSearchTerm("")
        setAlumniInputValue("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const resetFormState = () => {
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
    setPreview(null)
    setIsEditMode(false)
  }

  const handleSubmit = async (e: React.FormEvent, buttonType: "Update") => {
    e.preventDefault()

    if (buttonType === "Update") {
      setIsUpdating(true)
    }

    setErrorMessage("")

    // Validate form completion
    if (!formComplete) {
      setErrorMessage("Please fill out all required fields before updating the event.")
      setIsUpdating(false)
      return
    }

    // Prepare the targetGuests based on visibility
    const targetGuests = visibility === "batch" ? selectedBatches : visibility === "alumni" ? selectedAlumni : []

    // Validate batch inputs if batch visibility is selected
    if (visibility === "batch") {
      if (selectedBatches.length === 0) {
        setErrorMessage("Please add at least one batch.")
        setIsUpdating(false)
        return
      }
      if (selectedBatches.some((batch) => !/^\d+$/.test(batch))) {
        setErrorMessage("Batch inputs must contain only numbers.")
        setIsUpdating(false)
        return
      }
    }

    // Validate alumni inputs if alumni visibility is selected
    if (visibility === "alumni") {
      if (selectedAlumni.length === 0) {
        setErrorMessage("Please add at least one alumni email.")
        setIsUpdating(false)
        return
      }
      if (selectedAlumni.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
        setErrorMessage("Please ensure all alumni inputs are valid email addresses.")
        setIsUpdating(false)
        return
      }
    }

    try {
      if (buttonType === "Update") {
        const result = await handleEdit(
          eventId,
          {
            title,
            description,
            location,
            date,
            targetGuests,
            inviteType: visibility,
          },
          image,
        )

        if (result.success) {
          resetFormState()
          router.push("/admin-dashboard/organize-events")
        } else {
          setErrorMessage(result.message || "Failed to update event.")
        }
      }
    } catch (error) {
      console.error("Error updating event:", error)
      setErrorMessage("An error occurred while updating the event.")
    } finally {
      setIsUpdating(false)
    }
  }

  // Batch selection handlers
  const toggleBatchYear = (year) => {
    if (selectedBatches.includes(year)) {
      setSelectedBatches(selectedBatches.filter((item) => item !== year))
    } else {
      setSelectedBatches([...selectedBatches, year])
    }
  }

  const removeBatchYear = (year, e) => {
    e.stopPropagation()
    setSelectedBatches(selectedBatches.filter((item) => item !== year))
  }

  const addBatchInput = () => {
    if (batchInputValue.trim()) {
      const year = batchInputValue.trim()
      const yearNum = Number.parseInt(year)
      if (!isNaN(yearNum) && yearNum >= 1925 && yearNum <= currentYear) {
        if (!selectedBatches.includes(year)) {
          setSelectedBatches([...selectedBatches, year])
        }
        setBatchInputValue("")
        setBatchSearchTerm("")
      }
    }
  }

  // Alumni selection handlers
  const toggleAlumniEmail = (email) => {
    if (selectedAlumni.includes(email)) {
      setSelectedAlumni(selectedAlumni.filter((item) => item !== email))
    } else {
      setSelectedAlumni([...selectedAlumni, email])
    }
  }

  const removeAlumniEmail = (email, e) => {
    e.stopPropagation()
    setSelectedAlumni(selectedAlumni.filter((item) => item !== email))
  }

  const addAlumniInput = () => {
    if (alumniInputValue.trim()) {
      const email = alumniInputValue.trim()
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(email)) {
        if (!selectedAlumni.includes(email)) {
          setSelectedAlumni([...selectedAlumni, email])
        }
        setAlumniInputValue("")
        setAlumniSearchTerm("")
      }
    }
  }

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Set the file name in the context
      setFileName(file.name)

      // Call the context's image handler
      handleImageChange(e)
    }
  }

  // Show error message if event not found
  if (!currentEvent && !isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">
          Event not found. Please check the event ID or return to the events list.
          <div className="mt-4">
            <button
              onClick={() => router.push("/admin-dashboard/organize-events")}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render components
  const renderImageUpload = () => (
    <div className="space-y-2 w-100">
      <label htmlFor="image" className="block text-sm font-medium flex items-center">
        <Asterisk size={16} className="text-red-600" /> Upload Image
      </label>

      {!preview ? (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-2">
            <label htmlFor="image" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-700">Click to upload or drag and drop</span>
              <span className="mt-1 block text-xs text-gray-500">PNG, JPG, GIF, WEBP up to 10MB</span>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                className="sr-only"
                onChange={handleFileUpload}
                disabled={!isEditMode}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="relative mt-2">
          <div className="relative h-64 overflow-hidden rounded-lg">
            <img src={preview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
            {isEditMode && (
              <button
                type="button"
                className="absolute top-2 right-2 rounded-full bg-white p-1 text-gray-500 shadow-md hover:text-gray-700"
                onClick={() => {
                  setPreview(null)
                  setEventImage("")
                  setFileName("")
                }}
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-1">Accepted formats: JPG, JPEG, PNG, GIF, WEBP</p>
    </div>
  )

  const renderBatchSelector = () => (
    <div className="ml-6 relative text-sm" ref={batchDropdownRef}>
      <div className="flex flex-wrap items-center min-h-12 p-1 border border-gray-300 rounded-md">
        {selectedBatches.length > 0 && (
          <>
            {selectedBatches.map((year) => (
              <div key={year} className="flex items-center bg-blue-100 text-blue-800 rounded-md px-2 py-1 m-1">
                <span>{year}</span>
                {isEditMode && (
                  <X
                    size={16}
                    className="ml-1 cursor-pointer text-blue-600 hover:text-blue-800"
                    onClick={(e) => removeBatchYear(year, e)}
                  />
                )}
              </div>
            ))}
          </>
        )}
        {isEditMode && (
          <input
            ref={batchMainInputRef}
            type="text"
            value={batchInputValue}
            onChange={(e) => {
              setBatchInputValue(e.target.value)
              setBatchSearchTerm(e.target.value)
              if (!isBatchDropdownOpen) setIsBatchDropdownOpen(true)
            }}
            onFocus={() => setIsBatchDropdownOpen(true)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter" && batchInputValue.trim()) {
                e.preventDefault()
                addBatchInput()
              }
            }}
            placeholder={selectedBatches.length === 0 ? "Type or select graduation years" : ""}
            className="flex-grow outline-none text-sm min-w-20 px-2 py-1"
          />
        )}
        {isEditMode && (
          <div className="ml-auto cursor-pointer p-1" onClick={() => setIsBatchDropdownOpen(!isBatchDropdownOpen)}>
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-transform ${isBatchDropdownOpen ? "rotate-180" : ""}`}
            />
          </div>
        )}
      </div>

      {isEditMode && isBatchDropdownOpen && (
        <div className="w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
          <div className="overflow-y-auto max-h-72">
            {filteredBatchYears.length > 0 ? (
              filteredBatchYears.map((year) => (
                <div
                  key={year}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                    selectedBatches.includes(year) ? "bg-gray-50" : ""
                  }`}
                  onClick={() => toggleBatchYear(year)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 mr-2 border rounded-sm flex items-center justify-center ${
                        selectedBatches.includes(year) ? "bg-blue-500 border-blue-500" : "border-gray-300"
                      }`}
                    >
                      {selectedBatches.includes(year) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586l-2.293-2.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" />
                        </svg>
                      )}
                    </div>
                    {year}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )

  const renderAlumniSelector = () => (
    <div className="ml-6 relative" ref={alumniDropdownRef}>
      <div className="flex flex-wrap items-center min-h-12 p-1 border border-gray-300 rounded-md">
        {selectedAlumni.length > 0 && (
          <>
            {selectedAlumni.map((email) => (
              <div key={email} className="flex items-center bg-green-100 text-green-800 rounded-md px-2 py-1 m-1">
                <span className="text-xs">{email}</span>
                {isEditMode && (
                  <X
                    size={16}
                    className="ml-1 cursor-pointer text-green-600 hover:text-green-800"
                    onClick={(e) => removeAlumniEmail(email, e)}
                  />
                )}
              </div>
            ))}
          </>
        )}
        {isEditMode && (
          <input
            ref={alumniMainInputRef}
            type="text"
            value={alumniInputValue}
            onChange={(e) => {
              setAlumniInputValue(e.target.value)
              setAlumniSearchTerm(e.target.value)
              if (!isAlumniDropdownOpen) setIsAlumniDropdownOpen(true)
            }}
            onFocus={() => setIsAlumniDropdownOpen(true)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter" && alumniInputValue.trim()) {
                e.preventDefault()
                addAlumniInput()
              }
            }}
            placeholder={selectedAlumni.length === 0 ? "Type or select alumni emails" : ""}
            className="flex-grow outline-none text-sm min-w-20 px-2 py-1"
          />
        )}
        {isEditMode && (
          <div className="ml-auto cursor-pointer p-1" onClick={() => setIsAlumniDropdownOpen(!isAlumniDropdownOpen)}>
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-transform ${isAlumniDropdownOpen ? "rotate-180" : ""}`}
            />
          </div>
        )}
      </div>

      {isEditMode && isAlumniDropdownOpen && (
        <div className="w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
          <div className="overflow-y-auto max-h-72">
            {filteredAlumniEmails.length > 0 ? (
              filteredAlumniEmails.map((email) => (
                <div
                  key={email}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm ${
                    selectedAlumni.includes(email) ? "bg-gray-50" : ""
                  }`}
                  onClick={() => toggleAlumniEmail(email)}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-4 h-4 mr-2 border rounded-sm flex items-center justify-center ${
                        selectedAlumni.includes(email) ? "bg-green-500 border-green-500" : "border-gray-300"
                      }`}
                    >
                      {selectedAlumni.includes(email) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586l-2.293-2.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" />
                        </svg>
                      )}
                    </div>
                    {email}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )

  const renderActionButtons = () => (
    <>
      <button
        type="button"
        onClick={() => {
          resetFormState()
          router.push("/admin-dashboard/organize-events")
        }}
        className="w-30 flex items-center justify-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-200"
      >
        Cancel
      </button>

      <button
        type="submit"
        onClick={(e) => handleSubmit(e, "Update")}
        disabled={isUpdating || !formComplete || !isEditMode}
        className={`flex items-center justify-center gap-2 ${
          formComplete && isEditMode
            ? "bg-[var(--primary-blue)] text-[var(--primary-white)] hover:bg-[var(--blue-600)] hover:border-[var(--blue-600)]"
            : "bg-[var(--primary-blue)] text-[var(--primary-white)] opacity-50 cursor-not-allowed"
        } border-2 border-[var(--primary-blue)] px-4 py-2 rounded-full`}
      >
        {isUpdating ? "Updating..." : "Update"}
      </button>
    </>
  )

  return (
    <div className="flex flex-col gap-5">
      <Breadcrumb items={breadcrumbItems} />

      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">Event Details</div>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isEditMode ? "bg-blue-100 text-blue-700" : "bg-blue-500 text-white hover:bg-blue-600"}`}
          >
            {isEditMode ? <Eye size={20} /> : <Edit size={20} />}
            {isEditMode ? "View Mode" : "Edit Mode"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <form ref={formContainerRef} className="bg-white flex flex-col justify-between rounded-2xl w-full p-4 relative">
          <div className="flex flex-col gap-5">
            {/* Event Title */}
            <div className="space-y-2 text-[14px]">
              <label htmlFor="title" className="text-sm font-medium flex items-center">
                <Asterisk size={16} className="text-red-600" /> Event Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="Event Title"
                value={title}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
                disabled={!isEditMode}
              />
            </div>

            <div className="flex flex-col">
              {/* Description */}
              <div className="space-y-2 text-[14px]">
                <label htmlFor="description" className="text-sm font-medium flex items-center">
                  <Asterisk size={16} className="text-red-600" /> Description
                </label>
                <textarea
                  id="description"
                  className="w-full h-32 overflow-y-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setEventDescription(e.target.value)}
                  required
                  disabled={!isEditMode}
                />
              </div>

              {isEditMode && (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="mt-2 text-blue-600 hover:underline"
                >
                  Need AI help for description?
                </button>
              )}
              <ModalInput
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={(response) => setEventDescription(response)}
                title="AI Assistance for Events"
                type="event"
                mainTitle={title}
                subtitle="Get AI-generated description for your event. Only fill in the applicable fields."
              />
            </div>

            {/* Location */}
            <div className="space-y-2 text-[14px] w-1/2">
              <label htmlFor="location" className="text-sm font-medium flex items-center">
                <Asterisk size={16} className="text-red-600" /> Location
              </label>
              <input
                id="location"
                value={location}
                onChange={(e) => setEventLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Location"
                required
                disabled={!isEditMode}
              />
            </div>

            {/* Date and Time */}
            <div className="flex gap-4 text-[14px]">
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium flex items-center">
                  <Asterisk size={16} className="text-red-600" /> Date
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setEventDate(e.target.value)}
                  onKeyDown={(e) => e.preventDefault()} // prevent manual typing
                  className="cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min={
                    date
                      ? new Date(date).toISOString().split("T")[0]
                      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
                  }
                  disabled={!isEditMode}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="time" className="text-sm font-medium flex items-center">
                  <Asterisk size={16} className="text-red-600" /> Time
                </label>
                <input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="08:00"
                  max="22:00"
                  disabled={!isEditMode}
                />
              </div>
            </div>

            {/* Image Upload */}
            {renderImageUpload()}

            {/* Target Audience */}
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center">
                  <Asterisk size={16} className="text-red-600" /> Target Audience
                </p>

                <div className="flex flex-col gap-3">
                  {/* Option 1: Open to All */}
                  <div className="flex items-center">
                    <input
                      id="visibility-all"
                      type="radio"
                      name="visibility"
                      value="all"
                      checked={visibility === "all"}
                      onChange={() => {
                        if (isEditMode) {
                          setVisibility("all")
                          setSelectedAlumni([])
                          setSelectedBatches([])
                        }
                      }}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${isEditMode ? "cursor-pointer" : "cursor-not-allowed"}`}
                      disabled={!isEditMode}
                    />
                    <label
                      htmlFor="visibility-all"
                      className={`ml-2 text-sm ${isEditMode ? "cursor-pointer" : "cursor-not-allowed"}`}
                    >
                      Open to All
                    </label>
                  </div>

                  {/* Option 2: Batch */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                      <input
                        id="visibility-batch"
                        type="radio"
                        name="visibility"
                        value="batch"
                        checked={visibility === "batch"}
                        onChange={() => {
                          if (isEditMode) {
                            setVisibility("batch")
                            setSelectedAlumni([])
                          }
                        }}
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${isEditMode ? "cursor-pointer" : "cursor-not-allowed"}`}
                        disabled={!isEditMode}
                      />
                      <label
                        htmlFor="visibility-batch"
                        className={`ml-2 text-sm ${isEditMode ? "cursor-pointer" : "cursor-not-allowed"}`}
                      >
                        By Graduation Year
                      </label>
                    </div>

                    {visibility === "batch" && renderBatchSelector()}
                  </div>

                  {/* Option 3: Alumni */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center">
                      <input
                        id="visibility-alumni"
                        type="radio"
                        name="visibility"
                        value="alumni"
                        checked={visibility === "alumni"}
                        onChange={() => {
                          if (isEditMode) {
                            setVisibility("alumni")
                            setSelectedBatches([])
                          }
                        }}
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${isEditMode ? "cursor-pointer" : "cursor-not-allowed"}`}
                        disabled={!isEditMode}
                      />
                      <label
                        htmlFor="visibility-alumni"
                        className={`ml-2 text-sm ${isEditMode ? "cursor-pointer" : "cursor-not-allowed"}`}
                      >
                        Specific Alumni
                      </label>
                    </div>

                    {visibility === "alumni" && renderAlumniSelector()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Error Message Display */}
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{errorMessage}</p>
          </div>
        )}

        {}
        <div className="bg-white flex flex-col justify-between rounded-2xl w-full p-4 relative">
          <div className="flex space-x-4 mb-4">
            {/* Status Filter */}
            <select 
              value={rsvpFilter}
              onChange={(e) => setRsvpFilter(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="All">All Status</option>
              <option value="Accepted">Accepted</option>
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
          {/* Attendees Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Attendees</h3>
              {filteredAndSortedRsvps.filter(rsvpItem => rsvpItem.status === "Accepted").length > 0 && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {filteredAndSortedRsvps.filter(rsvpItem => rsvpItem.status === "Accepted").length} {filteredAndSortedRsvps.filter(rsvpItem => rsvpItem.status === "Accepted").length === 1 ? "alumnus" : "alumni"} going
                </span>
              )}
            </div>

            {filteredAndSortedRsvps.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-100">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedRsvps.map((rsvpItem, index) => {
                      const isEven = index % 2 === 0;

                      return (
                        <tr key={`${rsvpItem.rsvpId}-${rsvpItem.alumniId}`} className={isEven ? "bg-white" : "bg-gray-50"}>
                          {rsvpItem.alumni ? (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {`${rsvpItem.alumni.firstName} ${rsvpItem.alumni.middleName} ${rsvpItem.alumni.lastName}`}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {rsvpItem.alumni.email || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {rsvpItem.status || "N/A"}
                              </td>
                            </>
                          ) : (
                            <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-red-500">
                              Alumni details not found for ID: {rsvpItem.alumniId}
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
        </div>

        {/* Original buttons container */}
        <div ref={placeholderRef} className="text-sm bg-white rounded-2xl p-4 flex justify-end gap-2">
          {renderActionButtons()}
        </div>
      </div>

      {/* Fixed buttons container that appears when original is out of view */}
      {isSticky && (
        <div
          className="text-sm bg-[var(--primary-white)] fixed bottom-0 rounded-t-2xl gap-2 p-4 flex justify-end"
          style={{ width: "calc(96% - 256px)", boxShadow: "0 -4px 6px -1px rgba(0,0,0,0.1)" }}
        >
          {renderActionButtons()}
        </div>
      )}
    </div>
  )
}
