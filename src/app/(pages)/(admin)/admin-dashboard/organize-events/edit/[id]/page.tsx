"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useEvents } from "@/context/EventContext";
import {
  Asterisk,
  ChevronDown,
  Upload,
  X,
  Edit,
  Eye,
  Pencil,
} from "lucide-react";
import type { Event } from "@/models/models";
import { useRouter, useParams } from "next/navigation";
import ModalInput from "@/components/ModalInputForm";
import { useAlums } from "@/context/AlumContext";
import Breadcrumb from "@/components/breadcrumb";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id;
  const { activeAlums } = useAlums();

  const {
    events,
    image,
    setEventImage,
    setEventTitle,
    setEventDescription,
    setEventLocation,
    setEventDate,
    setEventTime,
    title,
    description,
    date,
    time,
    location,
    setFileName,
    handleImageChange,
    preview,
    setPreview,
    addEvent,
    handleEdit,
  } = useEvents();

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibility, setVisibility] = useState("all");
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [selectedAlumni, setSelectedAlumni] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedButton, setButton] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [isSticky, setIsSticky] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Refs
  const placeholderRef = useRef(null);
  const formContainerRef = useRef(null);
  const batchDropdownRef = useRef<HTMLDivElement | null>(null);
  const batchMainInputRef = useRef<HTMLInputElement | null>(null);
  const alumniDropdownRef = useRef<HTMLDivElement | null>(null);
  const alumniMainInputRef = useRef<HTMLInputElement | null>(null);

  // Dropdown state
  const [isBatchDropdownOpen, setIsBatchDropdownOpen] = useState(false);
  const [batchSearchTerm, setBatchSearchTerm] = useState("");
  const [batchInputValue, setBatchInputValue] = useState("");

  const [isAlumniDropdownOpen, setIsAlumniDropdownOpen] = useState(false);
  const [alumniSearchTerm, setAlumniSearchTerm] = useState("");
  const [alumniInputValue, setAlumniInputValue] = useState("");

  // Generate years from 1925 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    new Set(
      activeAlums
        .map((alum) => alum.studentNumber?.slice(0, 4))
        .filter((year): year is string => !!year) // filter out undefined/null
    )
  );

  // Sample alumni emails for display
  const alumniEmails = activeAlums
    ? activeAlums
        .filter(
          (alum: { email: string; activeStatus: boolean }) =>
            alum.email && alum.activeStatus === true
        )
        .map((alum: { email: any }) => alum.email)
    : [];

  // Filtered years based on search term
  const filteredBatchYears = years.filter((year) =>
    year.toLowerCase().includes(batchSearchTerm.toLowerCase())
  );

  // Filtered alumni emails based on search term
  const filteredAlumniEmails = alumniEmails.filter((email: string) =>
    email.toLowerCase().includes(alumniSearchTerm.toLowerCase())
  );

  // Breadcrumb configuration
  const breadcrumbItems = [
    { label: "Home", href: "/admin-dashboard" },
    { label: "Manage Events", href: "/admin-dashboard/organize-events" },
    { label: `Pending: ${title}`, href: "#", active: true },
  ];

  // Check if form is complete
  const formComplete =
    title.trim() !== "" &&
    description.trim() !== "" &&
    location.trim() !== "" &&
    date.trim() !== "" &&
    time.trim() !== "" &&
    image !== "" &&
    (visibility !== "batch" || selectedBatches.length > 0) &&
    (visibility !== "alumni" || selectedAlumni.length > 0);

  // Fetch event data on component mount
  useEffect(() => {
    const eventToEdit = events.find((g: Event) => g.eventId === eventId);
    setVisibility("all");
    setSelectedAlumni([]);
    setSelectedBatches([]);
    setErrorMessage("");

    if (eventToEdit) {
      setCurrentEvent(eventToEdit);
      setEventTitle(eventToEdit.title);
      setEventDescription(eventToEdit.description);
      setEventImage(eventToEdit.image);
      setEventDate(eventToEdit.date);
      setEventTime(eventToEdit.time);
      setEventLocation(eventToEdit.location);

      if (eventToEdit.image) {
        setEventImage(eventToEdit.image);
        setPreview(eventToEdit.image);
        // Extract filename from the image URL or path if possible
        const imageName = eventToEdit.image.split("/").pop();
        setFileName(imageName || "Current image");
      }

      // Properly check targetGuests for alumni and batches
      if (eventToEdit.targetGuests && eventToEdit.targetGuests.length > 0) {
        // Check if the first item is a batch (e.g., a string of length 4)
        if (eventToEdit.targetGuests[0].length === 4) {
          setSelectedBatches(eventToEdit.targetGuests); // Set the batches
          setVisibility("batch"); // Set visibility to batches
        } else {
          setSelectedAlumni(eventToEdit.targetGuests); // Set the alumni
          setVisibility("alumni"); // Set visibility to alumni
        }
      }
      setIsLoading(false);
    } else {
      // Event not found
      setErrorMessage("Event not found");
      setIsLoading(false);
    }
  }, [events, eventId]);

  // Effects for sticky footer
  useEffect(() => {
    if (!placeholderRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: "0px",
      }
    );

    observer.observe(placeholderRef.current);
    return () => observer.disconnect();
  }, []);

  // Effects for dropdowns
  useEffect(() => {
    if (isBatchDropdownOpen && batchMainInputRef.current) {
      batchMainInputRef.current.focus();
    }
  }, [isBatchDropdownOpen]);

  useEffect(() => {
    if (isAlumniDropdownOpen && alumniMainInputRef.current) {
      alumniMainInputRef.current.focus();
    }
  }, [isAlumniDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: { target: any }) => {
      if (
        batchDropdownRef.current &&
        !batchDropdownRef.current.contains(event.target)
      ) {
        setIsBatchDropdownOpen(false);
        setBatchSearchTerm("");
        setBatchInputValue("");
      }
      if (
        alumniDropdownRef.current &&
        !alumniDropdownRef.current.contains(event.target)
      ) {
        setIsAlumniDropdownOpen(false);
        setAlumniSearchTerm("");
        setAlumniInputValue("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const resetFormState = () => {
    setEventTitle("");
    setEventDescription("");
    setEventDate("");
    setEventTime("");
    setEventLocation("");
    setEventImage("");
    setVisibility("all");
    setSelectedBatches([]);
    setSelectedAlumni([]);
    setFileName("");
    setErrorMessage("");
    setButton("");
    setPreview(null);
  };

  const handleSubmit = async (
    e: React.FormEvent,
    buttonType: "Update" | "Finalize"
  ) => {
    e.preventDefault();

    if (buttonType === "Update") {
      setIsUpdating(true);
    } else {
      setIsSubmitting(true);
    }

    setErrorMessage("");

    // Validate form completion
    if (!formComplete) {
      setErrorMessage(
        "Please fill out all required fields before updating the event."
      );
      setIsSubmitting(false);
      setIsUpdating(false);
      return;
    }

    // Prepare the targetGuests based on visibility
    const targetGuests =
      visibility === "batch"
        ? selectedBatches
        : visibility === "alumni"
        ? selectedAlumni
        : [];

    // Validate batch inputs if batch visibility is selected
    if (visibility === "batch") {
      if (selectedBatches.length === 0) {
        setErrorMessage("Please add at least one batch.");
        setIsSubmitting(false);
        setIsUpdating(false);
        return;
      }
      if (selectedBatches.some((batch) => !/^\d+$/.test(batch))) {
        setErrorMessage("Batch inputs must contain only numbers.");
        setIsSubmitting(false);
        setIsUpdating(false);
        return;
      }
    }

    // Validate alumni inputs if alumni visibility is selected
    if (visibility === "alumni") {
      if (selectedAlumni.length === 0) {
        setErrorMessage("Please add at least one alumni email.");
        setIsSubmitting(false);
        setIsUpdating(false);
        return;
      }
      if (
        selectedAlumni.some(
          (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        )
      ) {
        setErrorMessage(
          "Please ensure all alumni inputs are valid email addresses."
        );
        setIsSubmitting(false);
        setIsUpdating(false);
        return;
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
          image
        );

        if (result.success) {
          resetFormState();
          router.push("/admin-dashboard/organize-events");
        } else {
          setErrorMessage(result.message || "Failed to update event.");
        }
      } else if (buttonType === "Finalize") {
        const updatedEvent = {
          eventId: currentEvent.eventId,
          title,
          description,
          image,
          date,
          time,
          location,
          rsvps: currentEvent.rsvps,
          inviteType: visibility,
          targetGuests,
        };
        // Finalize the event (set status to Accepted)
        addEvent(updatedEvent, true);
        resetFormState();
        router.push("/admin-dashboard/organize-events");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      setErrorMessage("An error occurred while updating the event.");
    } finally {
      setIsSubmitting(false);
      setIsUpdating(false);
    }
  };

  // Batch selection handlers
  const toggleBatchYear = (year: string) => {
    if (selectedBatches.includes(year)) {
      setSelectedBatches(selectedBatches.filter((item) => item !== year));
    } else {
      setSelectedBatches([...selectedBatches, year]);
    }
  };

  const removeBatchYear = (
    year: string,
    e: React.MouseEvent<SVGSVGElement, MouseEvent>
  ) => {
    e.stopPropagation();
    setSelectedBatches(selectedBatches.filter((item) => item !== year));
  };

  const addBatchInput = () => {
    if (batchInputValue.trim()) {
      const year = batchInputValue.trim();
      const yearNum = Number.parseInt(year);
      if (!isNaN(yearNum) && yearNum >= 1925 && yearNum <= currentYear) {
        if (!selectedBatches.includes(year)) {
          setSelectedBatches([...selectedBatches, year]);
        }
        setBatchInputValue("");
        setBatchSearchTerm("");
      }
    }
  };

  // Alumni selection handlers
  const toggleAlumniEmail = (email: string) => {
    if (selectedAlumni.includes(email)) {
      setSelectedAlumni(selectedAlumni.filter((item) => item !== email));
    } else {
      setSelectedAlumni([...selectedAlumni, email]);
    }
  };

  const removeAlumniEmail = (
    email: string,
    e: React.MouseEvent<SVGSVGElement, MouseEvent>
  ) => {
    e.stopPropagation();
    setSelectedAlumni(selectedAlumni.filter((item) => item !== email));
  };

  const addAlumniInput = () => {
    if (alumniInputValue.trim()) {
      const email = alumniInputValue.trim();
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(email)) {
        if (!selectedAlumni.includes(email)) {
          setSelectedAlumni([...selectedAlumni, email]);
        }
        setAlumniInputValue("");
        setAlumniSearchTerm("");
      }
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // Set the file name in the context
      setFileName(file.name);

      // Call the context's image handler
      handleImageChange(e);
    }
  };

  // Show error message if event not found
  if (!currentEvent && !isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">
          Event not found. Please check the event ID or return to the events
          list.
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
    );
  }

  // Render components
  const renderImageUpload = () => (
    <div className="space-y-2 w-100">
      <label htmlFor="image" className="text-sm font-medium flex items-center">
        <Asterisk size={16} className="text-red-600" /> Upload Image
      </label>

      {!preview ? (
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-2">
            <label htmlFor="image" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-700">
                Click to upload or drag and drop
              </span>
              <span className="mt-1 block text-xs text-gray-500">
                PNG, JPG, GIF, WEBP up to 10MB
              </span>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                className="sr-only"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="relative mt-2">
          <div className="relative h-64 overflow-hidden rounded-lg">
            <img
              src={preview || "/placeholder.svg"}
              alt="Preview"
              className="h-full w-full object-cover"
            />
            {
              <button
                type="button"
                className="absolute top-2 right-2 rounded-full bg-white p-1 text-gray-500 shadow-md hover:text-gray-700"
                onClick={() => {
                  setPreview(null);
                  setEventImage("");
                  setFileName("");
                }}
              >
                <X className="h-5 w-5" />
              </button>
            }
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-1">
        Accepted formats: JPG, JPEG, PNG, GIF, WEBP
      </p>
    </div>
  );

  const renderBatchSelector = () => (
    <div className="ml-6 relative text-sm" ref={batchDropdownRef}>
      <div className="flex flex-wrap items-center min-h-12 p-1 border border-gray-300 rounded-md">
        {selectedBatches.length > 0 && (
          <>
            {selectedBatches.map((year) => (
              <div
                key={year}
                className="flex items-center bg-blue-100 text-blue-800 rounded-md px-2 py-1 m-1"
              >
                <span>{year}</span>
                {
                  <X
                    size={16}
                    className="ml-1 cursor-pointer text-blue-600 hover:text-blue-800"
                    onClick={(e) => removeBatchYear(year, e)}
                  />
                }
              </div>
            ))}
          </>
        )}
        {
          <input
            ref={batchMainInputRef}
            type="text"
            value={batchInputValue}
            onChange={(e) => {
              setBatchInputValue(e.target.value);
              setBatchSearchTerm(e.target.value);
              if (!isBatchDropdownOpen) setIsBatchDropdownOpen(true);
            }}
            onFocus={() => setIsBatchDropdownOpen(true)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter" && batchInputValue.trim()) {
                e.preventDefault();
                addBatchInput();
              }
            }}
            placeholder={
              selectedBatches.length === 0
                ? "Type or select graduation years"
                : ""
            }
            className="flex-grow outline-none text-sm min-w-20 px-2 py-1"
          />
        }
        {
          <div
            className="ml-auto cursor-pointer p-1"
            onClick={() => setIsBatchDropdownOpen(!isBatchDropdownOpen)}
          >
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-transform ${
                isBatchDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        }
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
                        selectedBatches.includes(year)
                          ? "bg-blue-500 border-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedBatches.includes(year) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586l-2.293-2.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" />
                        </svg>
                      )}
                    </div>
                    {year}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderAlumniSelector = () => (
    <div className="ml-6 relative" ref={alumniDropdownRef}>
      <div className="flex flex-wrap items-center min-h-12 p-1 border border-gray-300 rounded-md">
        {selectedAlumni.length > 0 && (
          <>
            {selectedAlumni.map((email) => (
              <div
                key={email}
                className="flex items-center bg-green-100 text-green-800 rounded-md px-2 py-1 m-1"
              >
                <span className="text-xs">{email}</span>
                {
                  <X
                    size={16}
                    className="ml-1 cursor-pointer text-green-600 hover:text-green-800"
                    onClick={(e) => removeAlumniEmail(email, e)}
                  />
                }
              </div>
            ))}
          </>
        )}
        {
          <input
            ref={alumniMainInputRef}
            type="text"
            value={alumniInputValue}
            onChange={(e) => {
              setAlumniInputValue(e.target.value);
              setAlumniSearchTerm(e.target.value);
              if (!isAlumniDropdownOpen) setIsAlumniDropdownOpen(true);
            }}
            onFocus={() => setIsAlumniDropdownOpen(true)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter" && alumniInputValue.trim()) {
                e.preventDefault();
                addAlumniInput();
              }
            }}
            placeholder={
              selectedAlumni.length === 0 ? "Type or select alumni emails" : ""
            }
            className="flex-grow outline-none text-sm min-w-20 px-2 py-1"
          />
        }
        {
          <div
            className="ml-auto cursor-pointer p-1"
            onClick={() => setIsAlumniDropdownOpen(!isAlumniDropdownOpen)}
          >
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-transform ${
                isAlumniDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        }
      </div>

      {isAlumniDropdownOpen && (
        <div className="w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
          <div className="overflow-y-auto max-h-72">
            {filteredAlumniEmails.length > 0 ? (
              filteredAlumniEmails
                .filter(
                  (email: string): email is string => typeof email === "string"
                )
                .map((email: string) => (
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
                          selectedAlumni.includes(email)
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedAlumni.includes(email) && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586l-2.293-2.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" />
                          </svg>
                        )}
                      </div>
                      {email}
                    </div>
                  </div>
                ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderActionButtons = () => (
    <>
      <button
        type="button"
        onClick={() => {
          setIsSticky(false);
          router.push("/admin-dashboard/organize-events");
        }}
        className="w-30 flex items-center justify-center gap-2 text-[var(--primary-blue)] border-2 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-200"
      >
        Cancel
      </button>

      <button
        type="submit"
        onClick={async (e) => await handleSubmit(e, "Update")}
        disabled={isUpdating}
        className={`w-30 flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-200 ${"bg-[var(--primary-white)] text-[var(--primary-blue)] hover:bg-[var(--gray-600)] hover:border-[var(--gray-600)]"} border-2 border-[var(--primary-gray)] px-4 py-2 rounded-full `}
      >
        {isUpdating ? "Updating..." : "Update"}
      </button>

      <button
        type="submit"
        onClick={async (e: React.MouseEvent<HTMLButtonElement>) => {
          await handleSubmit(e, "Finalize");
        }}
        disabled={isSubmitting || !formComplete}
        className={`w-30 flex items-center justify-center gap-2 ${
          formComplete
            ? "bg-[var(--primary-blue)] text-[var(--primary-white)] hover:bg-[var(--blue-600)] hover:border-[var(--blue-600)]"
            : "bg-[var(--primary-blue)] text-[var(--primary-white)] opacity-50 cursor-not-allowed"
        } border-2 border-[var(--primary-blue)] px-4 py-2 rounded-full`}
      >
        {isSubmitting ? "Finalizing..." : "Finalize"}
      </button>
    </>
  );

  return (
    <div className="flex flex-col gap-5">
      <title>Edit Event | ICS-ARMS</title>
      <Breadcrumb items={breadcrumbItems} />

      <div className="w-full">
        <div className="flex items-center justify-between">
          <div className="font-bold text-3xl">Pending: {title}</div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <form
          ref={formContainerRef}
          className="bg-white flex flex-col justify-between rounded-2xl w-full p-4 relative"
        >
          <div className="flex flex-col gap-5">
            {/* Event Title */}
            <div className="space-y-2 text-[14px]">
              <label
                htmlFor="title"
                className="text-sm font-medium flex items-center"
              >
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
                maxLength={100}
              />
            </div>

            <div className="flex flex-col">
              {/* Description */}
              <div className="space-y-2 text-[14px]">
                <label
                  htmlFor="description"
                  className="text-sm font-medium flex items-center"
                >
                  <Asterisk size={16} className="text-red-600" /> Description
                </label>
                <textarea
                  id="description"
                  className="w-full h-32 overflow-y-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setEventDescription(e.target.value)}
                  required
                  maxLength={2000}
                  rows={showFullDescription ? 6 : 3}
                />
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{description.length}/2000</span>
                {description.length > 200 && (
                  <button
                    type="button"
                    className="text-blue-600 underline ml-2"
                    onClick={() => setShowFullDescription((prev) => !prev)}
                  >
                    {showFullDescription ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
              {
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="mt-2 text-blue-600 hover:underline"
                >
                  Need AI help for description?
                </button>
              }
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
              <label
                htmlFor="location"
                className="text-sm font-medium flex items-center"
              >
                <Asterisk size={16} className="text-red-600" /> Location
              </label>
              <input
                id="location"
                value={location}
                onChange={(e) => setEventLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Location"
                required
                maxLength={200}
              />
            </div>

            {/* Date and Time */}
            <div className="flex gap-4 text-[14px]">
              <div className="space-y-2">
                <label
                  htmlFor="date"
                  className="text-sm font-medium flex items-center"
                >
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
                      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                          .toISOString()
                          .split("T")[0]
                  }
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="time"
                  className="text-sm font-medium flex items-center"
                >
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
                />
              </div>
            </div>

            {/* Image Upload */}
            {renderImageUpload()}

            {/* Target Audience */}
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center">
                  <Asterisk size={16} className="text-red-600" /> Target
                  Audience
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
                        setVisibility("all");
                        setSelectedAlumni([]);
                        setSelectedBatches([]);
                      }}
                      className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 "cursor-pointer"`}
                    />
                    <label
                      htmlFor="visibility-all"
                      className={`ml-2 text-sm "cursor-pointer"`}
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
                          setVisibility("batch");
                          setSelectedAlumni([]);
                        }}
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 "cursor-pointer"`}
                      />
                      <label
                        htmlFor="visibility-batch"
                        className={`ml-2 text-sm "cursor-pointer"`}
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
                          setVisibility("alumni");
                          setSelectedBatches([]);
                        }}
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 "cursor-pointer"`}
                      />
                      <label
                        htmlFor="visibility-alumni"
                        className={`ml-2 text-sm "cursor-pointer"`}
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

        {/* Original buttons container */}
        <div
          ref={placeholderRef}
          className="text-sm bg-white rounded-2xl p-4 flex justify-end gap-2"
        >
          {renderActionButtons()}
        </div>
      </div>

      {/* Fixed buttons container that appears when original is out of view */}
      {isSticky && (
        <div
          className="text-sm bg-[var(--primary-white)] fixed bottom-0 rounded-t-2xl gap-2 p-4 flex justify-end"
          style={{
            width: "calc(96% - 256px)",
            boxShadow: "0 -4px 6px -1px rgba(0,0,0,0.1)",
          }}
        >
          {renderActionButtons()}
        </div>
      )}
    </div>
  );
}
