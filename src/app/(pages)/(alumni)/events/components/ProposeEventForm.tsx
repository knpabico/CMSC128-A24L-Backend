//propose event form

"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@mui/material";
import ModalInput from "@/components/ModalInputForm";
import { useEvents } from "@/context/EventContext";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import { Asterisk, ChevronDown, Upload, X, XIcon } from "lucide-react";
import { useAlums } from "@/context/AlumContext";

interface ProposeEventFormProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  isDetails: boolean;
  editingEventId: string | null;
  setEdit: (isEditing: boolean) => void;
  setDetailsPage: (isDetails: boolean) => void;
}

const ProposeEventForm: React.FC<ProposeEventFormProps> = ({
  isOpen,
  onClose,
  isEditing,
  editingEventId,
  setEdit,
  isDetails,
  setDetailsPage
}) => {
  const { 
      events, 
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
      image,
      setEventImage,
      fileName, 
      setFileName, 
      handleEdit,
      preview,
      setPreview
      } = useEvents();
  const { user, alumInfo } = useAuth();
  const { alums } = useAlums();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmForm, setConfirmForm] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [selectedBatches, setSelectedBatches] = useState<any[]>([]);
  const [selectedAlumni, setSelectedAlumni] = useState<any[]>([]);
  const [isSticky, setIsSticky] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refs
  const placeholderRef = useRef(null);
  const formContainerRef = useRef(null);
  const batchDropdownRef = useRef<HTMLDivElement>(null);
  const batchMainInputRef = useRef<HTMLInputElement>(null);
  const alumniDropdownRef = useRef<HTMLDivElement>(null);
  const alumniMainInputRef = useRef<HTMLInputElement>(null);

  // Dropdown state
  const [isBatchDropdownOpen, setIsBatchDropdownOpen] = useState(false);
  const [batchSearchTerm, setBatchSearchTerm] = useState("");
  const [batchInputValue, setBatchInputValue] = useState("");

  const [isAlumniDropdownOpen, setIsAlumniDropdownOpen] = useState(false);
  const [alumniSearchTerm, setAlumniSearchTerm] = useState("");
  const [alumniInputValue, setAlumniInputValue] = useState("");

  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    if (isEditing && events) {
      const eventToEdit = events.find((event: { eventId: string | null; }) => event.eventId === editingEventId);
      
      setVisibility("all");
      setSelectedAlumni([]);
      setSelectedBatches([]);
  
      if (eventToEdit) {
        setEventTitle(eventToEdit.title);
        setEventDescription(eventToEdit.description);
        setEventTime(eventToEdit.time);
        setEventImage(eventToEdit.image);
        setEventDate(eventToEdit.date);
        setEventLocation(eventToEdit.location);
        setPreview(eventToEdit.image);
        // Optional: handle image if you prefill it somehow
  
        // Properly set visibility and guests
        if (eventToEdit.targetGuests && eventToEdit.targetGuests.length > 0) {
          if (eventToEdit.targetGuests[0].length === 4) {
            setSelectedBatches(eventToEdit.targetGuests);
            setVisibility("batch");
          } else {
            setSelectedAlumni(eventToEdit.targetGuests);
            setVisibility("alumni");
          }
        }
      }
    }
  }, [isEditing, events, editingEventId]);

  useEffect(() => {
    if (isOpen && !isEditing) {
      resetFormState();
    }
  }, [isOpen, isEditing]);

  const resetFormState = () => {
    setEdit(false);
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
    setUserInput("");
    setPreview(null);
  };

  // Generate years from 1925 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    new Set(
      alums
        .filter(alum => alum.activeStatus === true)
        .map(alum => alum.studentNumber?.slice(0, 4))
        .filter((year): year is string => !!year) // filter out undefined/null
    )
  );

   // Sample alumni emails for display
  const alumniEmails = alums
    ? alums
        .filter((alum: { email: string; activeStatus: boolean; }) => alum.email && alum.activeStatus === true)
        .map((alum: { email: string; }) => alum.email)
    : [];

  // Filtered years based on search term
  const filteredBatchYears = years.filter((year) => year.toLowerCase().includes(batchSearchTerm.toLowerCase()));

  // Filtered alumni emails based on search term
  const filteredAlumniEmails = alumniEmails.filter((email: string) =>
    email.toLowerCase().includes(alumniSearchTerm.toLowerCase()),
  );

  // Effects
  useEffect(() => {
    // Update visibility-dependent UI
    const showBatchSelect = visibility === "batch"
    const showAlumniSelect = visibility === "alumni"

    // Sync selected batches and alumni with the context when visibility changes
    if (visibility === "batch" && selectedBatches.length > 0) {
      setSelectedBatches(selectedBatches);
    } else if (visibility === "alumni" && selectedAlumni.length > 0) {
      setSelectedAlumni(selectedAlumni);
    }
  }, [visibility, selectedBatches, selectedAlumni]);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (batchDropdownRef.current && !batchDropdownRef.current.contains(event.target as Node)) {
        setIsBatchDropdownOpen(false);
        setBatchSearchTerm("");
        setBatchInputValue("");
      }
      if (alumniDropdownRef.current && !alumniDropdownRef.current.contains(event.target as Node)) {
        setIsAlumniDropdownOpen(false);
        setAlumniSearchTerm("");
        setAlumniInputValue("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [])

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
    );

    observer.observe(placeholderRef.current);
    return () => observer.disconnect();
  }, [])

  // Batch selection handlers
  const toggleBatchYear = (year: string) => {
    if (selectedBatches.includes(year)) {
      setSelectedBatches(selectedBatches.filter((item) => item !== year));
    } else {
      setSelectedBatches([...selectedBatches, year]);
    }
  };

  const removeBatchYear = (year: string, e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
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

  const removeAlumniEmail = (email: string, e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation()
    setSelectedAlumni(selectedAlumni.filter((item) => item !== email));
  };

  const addAlumniInput = () => {
    if (alumniInputValue.trim()) {
      const email = alumniInputValue.trim();
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (emailRegex.test(email)) {
        if (!selectedAlumni.includes(email)) {
          setSelectedAlumni([...selectedAlumni, email])
        }
        setAlumniInputValue("");
        setAlumniSearchTerm("");
      }
    }
  };

  const renderBatchSelector = () => (
    <div className="ml-6 relative text-sm" ref={batchDropdownRef}>
      <div className="flex flex-wrap items-center min-h-12 p-1 border border-gray-300 rounded-md">
        {selectedBatches.length > 0 && (
          <>
            {selectedBatches.map((year) => (
              <div key={year} className="flex items-center bg-blue-100 text-blue-800 rounded-md px-2 py-1 m-1">
                <span>{year}</span>
                <X
                  size={16}
                  className="ml-1 cursor-pointer text-blue-600 hover:text-blue-800"
                  onClick={(e) => removeBatchYear(year, e)}
                />
              </div>
            ))}
          </>
        )}
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
        <div className="ml-auto cursor-pointer p-1" onClick={() => setIsBatchDropdownOpen(!isBatchDropdownOpen)}>
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform ${isBatchDropdownOpen ? "rotate-180" : ""}`}
          />
        </div>
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
  );

  const renderAlumniSelector = () => (
    <div className="ml-6 relative" ref={alumniDropdownRef}>
      <div className="flex flex-wrap items-center min-h-12 p-1 border border-gray-300 rounded-md">
        {selectedAlumni.length > 0 && (
          <>
            {selectedAlumni.map((email) => (
              <div key={email} className="flex items-center bg-green-100 text-green-800 rounded-md px-2 py-1 m-1">
                <span className="text-xs">{email}</span>
                <X
                  size={16}
                  className="ml-1 cursor-pointer text-green-600 hover:text-green-800"
                  onClick={(e) => removeAlumniEmail(email, e)}
                />
              </div>
            ))}
          </>
        )}
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
        <div className="ml-auto cursor-pointer p-1" onClick={() => setIsAlumniDropdownOpen(!isAlumniDropdownOpen)}>
          <ChevronDown
            size={20}
            className={`text-gray-400 transition-transform ${isAlumniDropdownOpen ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {isAlumniDropdownOpen && (
        <div className="w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1">
          <div className="overflow-y-auto max-h-72">
            {filteredAlumniEmails.length > 0 ? (
              filteredAlumniEmails.map((email: string) => (
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
  );

  const requiredSentence =
    "I certify on my honor that the proposed event details are accurate, correct, and complete.";

  const formComplete =
    title.trim() !== "" &&
    description.trim() !== "" &&
    date.trim() !== "" &&
    time.trim() !== "" &&
    location.trim() !== "";

  if (!isOpen) return null;
  
  return (
    <>
      {/* Event Proposal Modal */}
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-100">
        <form className="text-sm bg-white p-6 rounded-2xl shadow-lg w-11/12 max-w-[50vw] max-h-[90vh] overflow-auto space-y-5">
          <div className="bg-white z-30 w-full flex justify-between items-start">
              <h2 className="text-2xl font-semibold">
              Propose Event
              </h2>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium flex items-center">
              <Asterisk size={16} className="text-red-600"/> Title
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Title"
              value={title}
              required
              maxLength={100}
              onChange={(e) => setEventTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium flex items-center">
              <Asterisk size={16} className="text-red-600"/> Description
            </label>
            <textarea
              className="resize-none w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Description"
              value={description}
              required
              maxLength={2000}
              onChange={(e) => setEventDescription(e.target.value)}
              rows={10}
            />
            <div className="text-xs text-gray-500">{description.length}/2000</div>
            <Button onClick={() => setIsModalOpen(true)}>
              Need AI help for description?
            </Button>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium flex items-center">
              <Asterisk size={16} className="text-red-600"/> Location
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Location"
              value={location}
              required
              maxLength={200}
              onChange={(e) => setEventLocation(e.target.value)}
            />
          </div>

          {/* Date and Time */}
            <div className="flex gap-4 text-[14px]">
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium flex items-center">
                  <Asterisk size={16} className="text-red-600" /> Date
                </label>
                <input
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
                <label htmlFor="time" className="text-sm font-medium flex items-center">
                  <Asterisk size={16} className="text-red-600" /> Time
                </label>
                <input
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
          

          <ModalInput
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={(response) => setEventDescription(response)}
            title="AI Assistance for Events"
            type="event"
            mainTitle={title}
            subtitle="Get AI-generated description for your event. Only fill in the applicable fields."
          />

        
          <div className="mt-10">
              <label htmlFor="image-upload" className="text-[14px] flex items-center gap-2 w-35 cursor-pointer px-3 py-2 border border-gray-300 rounded-md shadow-xs hover:bg-gray-200">
                  <Upload size={14} /> Upload Photo
              </label>
              <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
              />
          </div>

          
          {fileName && (
            <p className="text-sm text-gray-600">
              Selected file: {
                fileName.length > 100
                  ? fileName.slice(0, 97) + "..."
                  : fileName
              }
            </p>
          )}
          {preview && (
            <div className="">
              <div style={{ width: 80, height: 80, overflow: "hidden", borderRadius: 8, border: "1px solid #ccc" }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </div>
          )}
          {/* Target Audience */}
          <div className="my-[20px] space-y-4">
            <div className="space-y-2 p-3 rounded-md">
              <p className="text-sm font-medium flex items-center">
                <Asterisk size={16} className="text-red-600" /> Visible to
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
                      setVisibility("all")
                      setSelectedAlumni([])
                      setSelectedBatches([])
                    }}
                    className="cursor-pointer h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="visibility-all" className="ml-2 text-sm cursor-pointer">
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
                        setVisibility("batch")
                        setSelectedAlumni([])
                      }}
                      className="cursor-pointer h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="visibility-batch" className="ml-2 text-sm cursor-pointer">
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
                        setVisibility("alumni")
                        setSelectedBatches([])
                      }}
                      className="cursor-pointer h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <label htmlFor="visibility-alumni" className="ml-2 text-sm cursor-pointer">
                      Specific Alumni
                    </label>
                  </div>

                  {visibility === "alumni" && renderAlumniSelector()}
                </div>
              </div>
            </div>
          </div>

          {errorMessage && (
                  <p className="text-red-500 text-sm mt-4">{errorMessage}</p>
                )}

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-5 flex items-center justify-center rounded-full bg-[#FFFFFF] border border-gray-400 text-sm font-semibold text-gray-700 shadow-inner shadow-white/10 transition-all  hover:bg-red-700 hover:text-white hover:shadow-lg cursor-pointer"
            >
              Cancel
            </button>
            <div className="flex gap-2">
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault();

                if (isSaving) return; // Prevent double submission
                setIsSaving(true);

                const targetGuests =
                  visibility === "batch"
                    ? selectedBatches
                    : visibility === "alumni"
                    ? selectedAlumni
                    : [];
                try{
                  if(isEditing && editingEventId){
                    await handleEdit(editingEventId, {title, description, location, date, time, targetGuests, inviteType: visibility }, image);
                  } else {
                    await handleSave(e, image, targetGuests, visibility, "Draft");
                  } 

                  resetFormState();

                  onClose();
                } finally {
                  setIsSaving(false)
                }
              }}
              className="h-10 px-5 flex items-center justify-center rounded-full bg-[#FFFFFF] border border-[#0856BA] text-sm font-semibold text-[#0856BA] shadow-inner shadow-white/10 transition-all duration-300 hover:bg-[#0856BA] hover:text-white hover:shadow-lg"
            >
              {isSaving ? "Saving..." : "Save as Draft"}
            </button>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(""); // Clear previous error messages

                  if (!formComplete) {
                    setErrorMessage("Please fill out all required fields before proposing the event.");
                    return;
                  }

                    // Validate batch inputs (only numbers and not empty)
                    if (visibility === "batch") {
                      if (selectedBatches.length === 0) {
                        setErrorMessage("Please add at least one batch.");
                        return;
                      }
                      if (selectedBatches.some(batch => !/^\d+$/.test(batch))) {
                        setErrorMessage("Batch inputs must contain only numbers.");
                        return;
                      }
                    }

                    // Validate alumni inputs (valid email format and not empty)
                    if (visibility === "alumni") {
                      if (selectedAlumni.length === 0) {
                        setErrorMessage("Please add at least one alumni email.");
                        return;
                      }
                      if (selectedAlumni.some(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
                        setErrorMessage("Please ensure all alumni inputs are valid email addresses.");
                        return;
                      }
                    }

                    const form = document.querySelector("form");
                    if (form && form.checkValidity()) {
                      setConfirmForm(true);
                    } else {
                      form?.reportValidity(); // Show browser's validation tooltips
                    }
                  }}
                  className="h-10 px-5 flex items-center justify-center rounded-full bg-[#0856BA] border border-[#0856BA] text-sm font-semibold text-white shadow-inner shadow-white/10 transition-all duration-300 hover:bg-[#063d8c] hover:shadow-lg"
                >
                  Submit
                </button>
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {confirmForm && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full z-30">
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              if (isConfirming) return; // Prevent double submission
              setIsConfirming(true);

              if (userInput !== requiredSentence) {
                alert("Please type the sentence exactly to confirm.");
                return;
              }

              const targetGuests =
                visibility === "batch" ? selectedBatches :
                visibility === "alumni" ? selectedAlumni :
                [];

              try {
                if (isDetails) {
                  await handleEdit(editingEventId, {
                    title, description, location, date, time,
                    targetGuests,
                    status: "Pending",
                    inviteType: visibility
                  }, image);
                } else {
                  await handleSave(e, image, targetGuests, visibility, "Pending");
                }

                router.push(`/events/proposed`);
                resetFormState();
                onClose();
                setDetailsPage(false);
                setConfirmForm(false);
              } finally {
                setIsConfirming(false);
              }
            }}
              className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg w-[400px] z-40"
            >
                <h2 className="text-xl text-justify font-bold mb-4">Please certify on your honor that all the details are accurate, correct, and complete.</h2>

          <div className="mb-4">
            <p className="text-[16px] text-gray-900 font-semibold">
              As a sign of your confirmation, please type the following text in the text field below:
            </p>
          </div>
          <div className="border-l-4 border-[#0856BA] pl-4">
            <p className="text-[14px] text-gray-700 text-left my-4">
                I certify on my honor that the proposed event details are accurate, correct, and complete.
            </p>
            </div>

            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onPaste={(e) => e.preventDefault()} // Prevent paste
              placeholder="Type the sentence here"
              className="w-full mb-4 p-2 border rounded"
              required
            />

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => {
                  setConfirmForm(false);
                  setUserInput("");
                }}
                className="text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#0856BA] text-white p-2 w-1/3 rounded-[30px]"
                >
                {isConfirming ? "Confirming..." : "Confirm"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ProposeEventForm;
