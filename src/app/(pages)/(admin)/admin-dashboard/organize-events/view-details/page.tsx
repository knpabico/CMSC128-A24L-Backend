"use client"

import type React from "react"

import { ChevronDown, Upload, X, Pencil, ChevronRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useEvents } from "@/context/EventContext"
import { Button } from "@mui/material"
import ModalInput from "@/components/ModalInputForm"
import Breadcrumb from "@/components/breadcrumb"

export default function EventPage() {
  const router = useRouter()

  // Get event context values
  const {
    addEvent,
    image,
    setEventImage,
    setEventTitle,
    setEventDescription,
    setEventLocation,
    setEventDate,
    setEventTime,
    handleSave,
    title,
    description,
    date,
    time,
    location,
    fileName,
    setFileName,
    handleImageChange,
    preview,
    setPreview,
  } = useEvents()

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [visibility, setVisibility] = useState("all")
  const [selectedBatches, setSelectedBatches] = useState<string[]>([])
  const [selectedAlumni, setSelectedAlumni] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedButton, setButton] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSticky, setIsSticky] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

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

  // Check if form is complete
  const formComplete =
    title.trim() !== "" &&
    description.trim() !== "" &&
    location.trim() !== "" &&
    date.trim() !== "" &&
    time.trim() !== "" &&
    preview !== null &&
    (visibility !== "batch" || selectedBatches.length > 0) &&
    (visibility !== "alumni" || selectedAlumni.length > 0)

  // Generate years from 1925 to current year
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1925 + 1 }, (_, i) => (currentYear - i).toString())

  // Sample alumni emails for display
  const alumniEmails = [
    "johndoe@example.com",
    "janedoe@example.com",
    "robertsmith@example.com",
    "sarahparker@example.com",
    "michaeljohnson@example.com",
    "emilywilson@example.com",
    "jameslee@example.com",
    "elizabethmiller@example.com",
    "davidbrown@example.com",
    "jenniferdavis@example.com",
  ]

  const sampleAttendees = [
    { name: "John Doe", email: "john.doe@example.com" },
    { name: "Jane Smith", email: "jane.smith@example.com" },
    { name: "Robert Johnson", email: "robert.johnson@example.com" },
    { name: "Emily Davis", email: "emily.davis@example.com" },
    { name: "Michael Wilson", email: "michael.wilson@example.com" },
  ]

  // Filtered years based on search term
  const filteredBatchYears = years.filter((year) => year.toLowerCase().includes(batchSearchTerm.toLowerCase()))

  // Filtered alumni emails based on search term
  const filteredAlumniEmails = alumniEmails.filter((email) =>
    email.toLowerCase().includes(alumniSearchTerm.toLowerCase()),
  )

  // Breadcrumb configuration
  const breadcrumbItems = [
    { label: "Home", href: "/admin-dashboard" },
    { label: "Manage Events", href: "/admin-dashboard/organize-events" },
    { label: "Event Name", href: "#", active: true },
  ]

  // Reset form state
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
    setIsEditing(false)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")

    // Check form completion first
    if (!formComplete) {
      setErrorMessage("Please fill out all required fields before proposing the event.")
      setIsSubmitting(false)
      return
    }

    // Store the selected guests
    const targetGuests = visibility === "batch" ? selectedBatches : visibility === "alumni" ? selectedAlumni : []

    // Validate batch inputs if batch visibility is selected
    if (visibility === "batch") {
      if (selectedBatches.length === 0) {
        setErrorMessage("Please add at least one batch.")
        setIsSubmitting(false)
        return
      }
      if (selectedBatches.some((batch) => !/^\d+$/.test(batch))) {
        setErrorMessage("Batch inputs must contain only numbers.")
        setIsSubmitting(false)
        return
      }
    }

    // Validate alumni inputs if alumni visibility is selected
    if (visibility === "alumni") {
      if (selectedAlumni.length === 0) {
        setErrorMessage("Please add at least one alumni email.")
        setIsSubmitting(false)
        return
      }
      if (selectedAlumni.some((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
        setErrorMessage("Please ensure all alumni inputs are valid email addresses.")
        setIsSubmitting(false)
        return
      }
    }

    // Handle creation based on selected button
    if (selectedButton === "Create") {
      const form = document.querySelector("form")
      if (!form || !form.checkValidity()) {
        form?.reportValidity()
        setIsSubmitting(false)
        return
      }

      const newEvent = {
        datePosted: new Date(),
        title,
        description,
        date,
        time,
        location,
        image,
        inviteType: visibility,
        numofAttendees: 0,
        targetGuests,
        stillAccepting: true,
        needSponsorship: false,
        rsvps: [],
        eventId: "",
        status: "Accepted",
        creatorId: "",
        creatorName: "",
        creatorType: "",
        donationDriveId: "",
      }

      addEvent(newEvent, true)
    } else {
      // If button is not "Create", save as draft
      handleSave(e, image, targetGuests, visibility, "Draft")
    }

    setIsEditing(false)
    setIsSubmitting(false)
    router.push("/admin-dashboard/organize-events")
  }

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleCancelClick = () => {
    setIsEditing(false)
    setIsSticky(false)
  }

  // Effects
  useEffect(() => {
    // Update visibility-dependent UI
    const showBatchSelect = visibility === "batch"
    const showAlumniSelect = visibility === "alumni"

    // Sync selected batches and alumni with the context when visibility changes
    if (visibility === "batch" && selectedBatches.length > 0) {
      setSelectedBatches(selectedBatches)
    } else if (visibility === "alumni" && selectedAlumni.length > 0) {
      setSelectedAlumni(selectedAlumni)
    }
  }, [visibility, selectedBatches, selectedAlumni])

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

  useEffect(() => {
    if (!placeholderRef.current || !isEditing) return

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
  }, [isEditing])

  // Batch selection handlers
  const toggleBatchYear = (year) => {
    if (!isEditing) return

    if (selectedBatches.includes(year)) {
      setSelectedBatches(selectedBatches.filter((item) => item !== year))
    } else {
      setSelectedBatches([...selectedBatches, year])
    }
  }

  const removeBatchYear = (year, e) => {
    if (!isEditing) return

    e.stopPropagation()
    setSelectedBatches(selectedBatches.filter((item) => item !== year))
  }

  const addBatchInput = () => {
    if (!isEditing) return

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
    if (!isEditing) return

    if (selectedAlumni.includes(email)) {
      setSelectedAlumni(selectedAlumni.filter((item) => item !== email))
    } else {
      setSelectedAlumni([...selectedAlumni, email])
    }
  }

  const removeAlumniEmail = (email, e) => {
    if (!isEditing) return

    e.stopPropagation()
    setSelectedAlumni(selectedAlumni.filter((item) => item !== email))
  }

  const addAlumniInput = () => {
    if (!isEditing) return

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
    if (!isEditing) return

    const file = e.target.files[0]
    if (file) {
      // Set the file name in the context
      setFileName(file.name)

      // Call the context's image handler
      handleImageChange(e)
    }
  }

  // Render components
  const renderImageUpload = () => (
    <div className="space-y-2 w-100">
      <label htmlFor="image" className="block text-sm font-medium flex items-center">
        Upload Image
      </label>

      {!preview ? (
        <div
          className={`border-2 border-dashed border-gray-300 rounded-md p-6 text-center ${!isEditing ? "opacity-70" : ""}`}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-2">
            <label htmlFor="image" className={`${isEditing ? "cursor-pointer" : "cursor-not-allowed"}`}>
              <span className="mt-2 block text-sm font-medium text-gray-700">Click to upload or drag and drop</span>
              <span className="mt-1 block text-xs text-gray-500">PNG, JPG, GIF, WEBP up to 10MB</span>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                className="sr-only"
                onChange={handleFileUpload}
                required
                disabled={!isEditing}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="relative mt-2">
          <div className="relative h-64 overflow-hidden rounded-lg">
            <img src={preview || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
            {(
              <button
                type="button"
                className="absolute top-2 right-2 rounded-full bg-white p-1 text-gray-500 shadow-md hover:text-gray-700"
                onClick={() => {
                  setPreview(null)
                  setEventImage("")
                  setFileName("")
                  document.getElementById("image").value = ""
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
      <div
        className={`flex flex-wrap items-center min-h-12 p-1 border border-gray-300 rounded-md ${!isEditing ? "bg-gray-100" : ""}`}
      >
        {selectedBatches.length > 0 && (
          <>
            {selectedBatches.map((year) => (
              <div key={year} className="flex items-center bg-blue-100 text-blue-800 rounded-md px-2 py-1 m-1">
                <span>{year}</span>
                {(
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
        {(
          <>
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
              disabled={!isEditing}
            />
            <div
              className="ml-auto cursor-pointer p-1"
              onClick={() => setIsBatchDropdownOpen(!isBatchDropdownOpen)}
            >
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform ${isBatchDropdownOpen ? "rotate-180" : ""}`}
              />
            </div>
          </>
        )}
      </div>

      {isBatchDropdownOpen && (
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
      <div
        className={`flex flex-wrap items-center min-h-12 p-1 border border-gray-300 rounded-md ${!isEditing ? "bg-gray-100" : ""}`}
      >
        {selectedAlumni.length > 0 && (
          <>
            {selectedAlumni.map((email) => (
              <div key={email} className="flex items-center bg-green-100 text-green-800 rounded-md px-2 py-1 m-1">
                <span className="text-xs">{email}</span>
                {(
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
        {(
          <>
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
              disabled={!isEditing}
            />
            <div
              className="ml-auto cursor-pointer p-1"
              onClick={() => setIsAlumniDropdownOpen(!isAlumniDropdownOpen)}
            >
              <ChevronDown
                size={20}
                className={`text-gray-400 transition-transform ${isAlumniDropdownOpen ? "rotate-180" : ""}`}
              />
            </div>
          </>
        )}
      </div>

      {isAlumniDropdownOpen && (
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

  return (
    <div className="flex flex-col gap-5">
      <Breadcrumb items={breadcrumbItems} />

      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">Event Name</div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <form
          ref={formContainerRef}
          className="bg-white flex flex-col justify-between rounded-2xl w-full p-4 relative"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-5">
            {/* Event Title */}
            <div className="space-y-2 text-[14px]">
              <label htmlFor="title" className="text-sm font-medium flex items-center">
                Event Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="Event Title"
                value={title}
                onChange={(e) => setEventTitle(e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${!isEditing ? "bg-gray-100" : ""}`}
                required
                disabled={!isEditing}
              />
            </div>

            <div className="flex flex-col">
              {/* Description */}
              <div className="space-y-2 text-[14px]">
                <label htmlFor="description" className="text-sm font-medium flex items-center">
                  Description
                </label>
                <textarea
                  id="description"
                  className={`w-full h-32 overflow-y-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${!isEditing ? "bg-gray-100" : ""}`}
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setEventDescription(e.target.value)}
                  required
                  disabled={!isEditing}
                />
              </div>

              {(
                <Button onClick={() => setIsModalOpen(true)} className="mt-2">
                  Need AI help for description?
                </Button>
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
                Location
              </label>
              <input
                id="location"
                value={location}
                onChange={(e) => setEventLocation(e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${!isEditing ? "bg-gray-100" : ""}`}
                placeholder="Location"
                required
                disabled={!isEditing}
              />
            </div>

            {/* Date and Time */}
            <div className="flex gap-4 text-[14px]">
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium flex items-center">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setEventDate(e.target.value)}
                  onKeyDown={(e) => e.preventDefault()} // prevent manual typing
                  className={`cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="time" className="text-sm font-medium flex items-center">
                  Time
                </label>
                <input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setEventTime(e.target.value)}
                  className={`cursor-pointer w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isEditing ? "bg-gray-100 cursor-not-allowed" : ""}`}
                  required
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Image Upload */}
            {renderImageUpload()}

            {/* Target Audience */}
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center">
                  Target Audience
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
                        if (isEditing) {
                          setVisibility("all")
                          setSelectedAlumni([])
                          setSelectedBatches([])
                        }
                      }}
                      className={`cursor-pointer h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${!isEditing ? "cursor-not-allowed" : ""}`}
                      disabled={!isEditing}
                    />
                    <label
                      htmlFor="visibility-all"
                      className={`ml-2 text-sm ${isEditing ? "cursor-pointer" : "cursor-not-allowed"}`}
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
                          if (isEditing) {
                            setVisibility("batch")
                            setSelectedAlumni([])
                          }
                        }}
                        className={`cursor-pointer h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${!isEditing ? "cursor-not-allowed" : ""}`}
                        disabled={!isEditing}
                      />
                      <label
                        htmlFor="visibility-batch"
                        className={`ml-2 text-sm ${isEditing ? "cursor-pointer" : "cursor-not-allowed"}`}
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
                          if (isEditing) {
                            setVisibility("alumni")
                            setSelectedBatches([])
                          }
                        }}
                        className={`cursor-pointer h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 ${!isEditing ? "cursor-not-allowed" : ""}`}
                        disabled={!isEditing}
                      />
                      <label
                        htmlFor="visibility-alumni"
                        className={`ml-2 text-sm ${isEditing ? "cursor-pointer" : "cursor-not-allowed"}`}
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

        <div className="bg-white flex flex-col justify-between rounded-2xl w-full p-4 relative">
          {/* Attendees Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Attendees</h3>
              {sampleAttendees.length > 0 && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {sampleAttendees.length} {sampleAttendees.length === 1 ? "alumnus" : "alumni"} going
                </span>
              )}
            </div>

            {sampleAttendees.length > 0 ? (
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sampleAttendees.map((attendee, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {attendee.name || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendee.email || "N/A"}</td>
                      </tr>
                    ))}
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
      </div>
    </div>
  )
}