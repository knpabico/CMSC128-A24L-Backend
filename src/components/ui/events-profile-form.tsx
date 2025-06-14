//propose event form

"use client";

import React, { useState, useEffect } from "react";
import ModalInput from "@/components/ModalInputForm";
import { useEvents } from "@/context/EventContext";
import { useRouter } from 'next/navigation';
import { useAuth } from "@/context/AuthContext";
import { X, XIcon } from "lucide-react";

interface ProposeEventProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  isDetails: boolean;
  editingEventId: string | null;
  setEdit: (isEditing: boolean) => void;
  setDetailsPage: (isDetails: boolean) => void;
}

const ProposeEventProfileForm: React.FC<ProposeEventProfileFormProps> = ({
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

  useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmForm, setConfirmForm] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [selectedBatches, setSelectedBatches] = useState<any[]>([]);
  const [selectedAlumni, setSelectedAlumni] = useState<any[]>([]);
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isEditing && events) {
      const eventToEdit = events.find((event: { eventId: string }) => event.eventId === editingEventId);
      
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
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <form className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md max-h-[90vh] overflow-auto space-y-5">

            <div className="bg-white z-30 w-full flex justify-between items-start">
                <h2 className="text-2xl font-semibold">
                Propose Event
                </h2>
                <button
                type="button"
                onClick={onClose}
                >
                <XIcon className="cursor-pointer hover:text-red-500"/>
                </button>
            </div>


            <div className="space-y-3">
                <div>
                    <p className="text-xs font-light">Title*</p>
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setEventTitle(e.target.value)}
                        className="w-full p-2 border border-gray-500 rounded"
                        required
                    />
                </div>
                <div>
                    <p className="text-xs font-light">Description*</p>
                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setEventDescription(e.target.value)}
                        className="w-full p-2 border border-gray-500 rounded"
                        required
                    />
                    <button onClick={() => setIsModalOpen(true)} className="text-[#0856BA] hover:underline text-xs cursor-pointer block -mt-1">
                        Need AI help for description?
                    </button>
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

                <div className="space-y-3">
                    {/* Date and Time Fields - Placed Side by Side */}
                    <div className="flex gap-3">
                        <div className="w-1/2">
                            <p className="text-xs font-light">Date*</p>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setEventDate(e.target.value)}
                                className="w-full p-2 border border-gray-500 rounded text-center"
                                required
                                min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                .toISOString()
                                .split("T")[0]}
                            />
                        </div>
                        <div className="w-1/2">
                            <p className="text-xs font-light">Time*</p>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setEventTime(e.target.value)}
                                className="w-full p-2 border border-gray-500 rounded text-center"
                                required
                                min="08:00"
                                max="22:00"
                            />
                        </div>
                    </div>

                    {/* Location Field */}
                    <div>
                        <p className="text-xs font-light">Location*</p>
                        <input
                            type="text"
                            placeholder="Location"
                            value={location}
                            onChange={(e) => setEventLocation(e.target.value)}
                            className="w-full p-2 border border-gray-500 rounded"
                            required
                        />
                    </div>
                </div>

                <div>
                    <p className="text-xs font-light">Visible to</p>
                    <div className="space-y-1 bg-gray-100 p-3 rounded-md">
                        {/* Open to All */}
                        <div className="flex items-center space-x-3">
                            <input
                                type="radio"
                                name="visibility"
                                value="all"
                                checked={visibility === "all"}
                                onChange={() => {
                                setVisibility("all");
                                // Clear both to properly show the RSVP
                                setSelectedAlumni([]);
                                setSelectedBatches([]);
                                }}
                            />
                            <span>All</span>
                        </div>

                        {/* Batch Option */}
                        <div>
                            <div className="flex items-start space-x-3">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="radio"
                                        name="visibility"
                                        value="batch"
                                        checked={visibility === "batch"}
                                        onChange={() => {
                                        setVisibility("batch");
                                        setSelectedAlumni([]); // Clear the Selected Batches List
                                        }}
                                    />
                                    <span>Batch</span>
                                </div>
                                {visibility === "batch" && (
                                    <div>
                                        <input
                                        type="text"
                                        className="border-b border-black focus:outline-none focus:border-b-2 bg-white rounded-t-md pl-1"
                                        placeholder="e.g. 2022"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                            e.preventDefault();
                                            const value = e.currentTarget.value.trim();
                                            // Check if the value is not empty and not already in the selectedBatches list
                                            if (value && !selectedBatches.includes(value)) {
                                                // Add the new value to the selectedBatches list
                                                setSelectedBatches([...selectedBatches, value]);
                                                e.currentTarget.value = "";
                                            }
                                            }
                                        }}
                                        />
                                        <p className="text-gray-400 text-xs">Press "Enter" to add the batch.</p>
                                    </div>
                                )}
                            </div>

                            {visibility === "batch" && (
                                <div className="ml-5 flex flex-wrap gap-2 py-2">
                                    {selectedBatches.map((batch, index) => (
                                        <span
                                        key={index}
                                        className="bg-blue-100 text-sm text-blue-800 px-3 py-1 rounded-full flex items-center"
                                        >
                                        {batch}
                                        {/* Remove Button */}
                                        <button 
                                            type="button"
                                            className="ml-2 text-gray-800 hover:text-red-500 font-bold"
                                            onClick={() =>
                                            setSelectedBatches((prev) =>
                                                prev.filter((_, i) => i !== index) // Filter out the item at the current index to remove it from selectedBatches
                                            )
                                            }
                                        >
                                            <X className="w-4 h-4"/>
                                        </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>


                        {/* Alumni Option */}
                        <div>
                            <div className="flex items-start space-x-3">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="radio"
                                        name="visibility"
                                        value="alumni"
                                        checked={visibility === "alumni"}
                                        onChange={() => {
                                        setVisibility("alumni");
                                        setSelectedBatches([]); // Clear the Selected Alumni List
                                        }}
                                    />
                                    <span>Alumni</span>
                                </div>
                                {visibility === "alumni" && (
                                    <div>
                                        <input
                                        type="text"
                                        className="border-b border-black focus:outline-none focus:border-b-2 bg-white rounded-t-md pl-1"
                                        placeholder="e.g. email1@up.edu.ph"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                            e.preventDefault();
                                            const value = e.currentTarget.value.trim();
                                            // Check if the value is not empty and not already in the selectedAlumni list
                                            if (value && !selectedAlumni.includes(value)) {
                                                // Add the new value to the selectedAlumni list
                                                setSelectedAlumni([...selectedAlumni, value]);
                                                e.currentTarget.value = "";
                                            }
                                            }
                                        }}
                                        />
                                        <p className="text-gray-400 text-xs">Press "Enter" to add the email.</p>
                                    </div>
                                )}
                            </div>

                            {visibility === "alumni" && (
                                <div className="ml-5 flex flex-wrap gap-2 pt-2">
                                    {selectedAlumni.map((email, index) => (
                                        <span
                                        key={index}
                                        className="bg-blue-100 text-sm text-blue-800 px-3 py-1 rounded-full flex items-center"
                                        >
                                        {email}
                                        <button
                                            type="button"
                                            className="ml-2 text-gray-800 hover:text-red-500 font-bold"
                                            onClick={() =>
                                            setSelectedAlumni((prev) =>
                                                prev.filter((_, i) => i !== index) // Filter out the item at the current index to remove it from selectedAlumni
                                            )
                                            }
                                        >
                                            <X className="w-4 h-4"/>
                                        </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-5">
                    <label htmlFor="image-upload" className="text-[14px] cursor-pointer px-3 py-2 border border-gray-200 rounded shadow-xs hover:bg-gray-200">
                        Upload Photo
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
                    <p className="mt-2 text-sm text-gray-600">Selected file: {fileName}</p>
                )}
                {preview && (
                    <div className="mt-2">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-md"
                    />
                    </div>
                )}



                {errorMessage && (
                        <p className="text-red-500 text-sm mt-4">{errorMessage}</p>
                        )}
            </div>


            <div className="flex justify-end gap-4">
                <button
                type="button"
                onClick={async (e) => {
                    e.preventDefault();

                    const targetGuests =
                    visibility === "batch"
                        ? selectedBatches
                        : visibility === "alumni"
                        ? selectedAlumni
                        : [];
                    
                    if(isEditing && editingEventId){
                    await handleEdit(editingEventId, {title, description, location, date, time, targetGuests, inviteType: visibility }, image);
                    } else {
                    await handleSave(e, image, targetGuests, visibility, "Draft");
                    } 

                    resetFormState();

                    onClose();
                }}
                className="h-10 px-5 flex items-center justify-center rounded-full bg-[#FFFFFF] border border-[#0856BA] text-sm font-semibold text-[#0856BA] shadow-inner shadow-white/10 transition-all duration-300 hover:bg-[#0856BA] hover:text-white hover:shadow-lg"
                >
                Save As Draft
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
                    Propose
                </button>
            </div>

        </form>
      </div>

      {/* Confirmation Modal */}
      {confirmForm && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full z-[1000]">
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              if (userInput !== requiredSentence) {
                alert("Please type the sentence exactly to confirm.");
                return;
              }

              const targetGuests =
                visibility === "batch" ? selectedBatches :
                visibility === "alumni" ? selectedAlumni :
                [];

              if(isDetails){
                await handleEdit(editingEventId, {title, description, location, date, time, targetGuests, status: "Pending", inviteType: visibility }, image);
              } else {
                await handleSave(e, image, targetGuests, visibility, "Pending");
              }
              
              
              router.push(`/events/proposed`)

              resetFormState();
              onClose();
              setDetailsPage(false);
              setConfirmForm(false);
            }}
              className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg w-[400px] z-40"
            >
                <h2 className="text-xl font-bold mb-4">Please certify on your honor that all the details are accurate, correct, and complete.</h2>

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
                Confirm
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ProposeEventProfileForm;
