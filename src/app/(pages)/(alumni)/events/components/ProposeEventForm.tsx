//propose event form

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import ModalInput from "@/components/ModalInputForm";
import { useEvents } from "@/context/EventContext";
import { useRouter } from 'next/navigation';

interface ProposeEventFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  setEventTitle: (title: string) => void;
  description: string;
  setEventDescription: (description: string) => void;
  date: string;
  setEventDate: (date: string) => void;
  time: string;
  setEventTime: (time: string) => void;
  location: string;
  setEventLocation: (location: string) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: (
    e: React.FormEvent,
    image: string,
    targetGuests: any[] | null,
    visibility: string,
    status: string
  ) => void;
  image: string;
  setEventImage: (image: string) => void;
  inviteType: string;
  targetGuests: any[] | null;
  alumInfo: any;
  isEditing: boolean;
  editingEventId: string | null;
  events: any[];
  setEdit: (isEditing: boolean) => void;
}

const ProposeEventForm: React.FC<ProposeEventFormProps> = ({
  isOpen,
  onClose,
  title,
  setEventTitle,
  description,
  setEventDescription,
  date,
  setEventDate,
  time,
  setEventTime,
  location,
  setEventLocation,
  handleImageChange,
  handleSave,
  inviteType,
  targetGuests,
  isEditing,
  editingEventId,
  setEdit,
  events,
  image,
  setEventImage,
  alumInfo,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmForm, setConfirmForm] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [visibility, setVisibility] = useState(inviteType || "all");
  const [selectedBatches, setSelectedBatches] = useState<any[]>(
    inviteType === "batch" && targetGuests ? targetGuests : []
  );
  const [selectedAlumni, setSelectedAlumni] = useState<any[]>(
    inviteType === "alumni" && targetGuests ? targetGuests : []
  );
  const router = useRouter();
  
  const {fileName, setFileName, handleEdit } = useEvents();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isEditing && events) {
      const eventToEdit = events.find(event => event.eventId === editingEventId);
  
      setVisibility("all");
      setSelectedAlumni([]);
      setSelectedBatches([]);
  
      if (eventToEdit) {
        setEventTitle(eventToEdit.title);
        setEventDescription(eventToEdit.description);
        setEventDate(eventToEdit.date);
        setEventLocation(eventToEdit.location);
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

  const resetFormState = () => {
    setEdit(false);
    setEventTitle(""); 
    setEventDescription("");
    setEventDate("");
    setEventLocation("");
    setEventImage("");
    setVisibility("all");
    setSelectedBatches([]);
    setSelectedAlumni([]);
    setFileName("");
    setUserInput("");
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
      <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full z-20">
        <form className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg w-[400px] z-30">
        <h2 className="text-xl font-bold mb-4">Propose Event</h2>
          <input
            type="text"
            placeholder="Event Title"
            value={title}
            onChange={(e) => setEventTitle(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
            required
          />
          <textarea
            placeholder="Event Description"
            value={description}
            onChange={(e) => setEventDescription(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
            required
          />
          <Button onClick={() => setIsModalOpen(true)}>
            Need AI help for description?
          </Button>
          <ModalInput
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={(response) => setEventDescription(response)}
            title="AI Assistance for Events"
            type="event"
            mainTitle={title}
            subtitle="Get AI-generated description for your event. Only fill in the applicable fields."
          />

          {/* Date and Time Fields - Placed Side by Side */}
          <div className="flex gap-4 mb-4">
            <div className="w-1/2">
              <input
                type="date"
                value={date}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full p-2 border rounded text-center"
                required
                min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0]}
              />
            </div>
            <div className="w-1/3">
              <input
                type="time"
                value={time}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full p-2 border rounded text-center"
                required
                min="08:00"
                max="22:00"
              />
            </div>
          </div>

          {/* Location Field */}
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setEventLocation(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
            required
          />

          <label htmlFor="image-upload" className="text-[14px] cursor-pointer px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Upload Photo
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />

          {fileName && (
            <p className="mt-2 text-sm text-gray-600">Selected file: {fileName}</p>
          )}

          <div className="space-y-4 bg-white-700 p-4 text-black rounded-md w-80">
            {/* Open to All */}
            <label className="flex items-center space-x-2">
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
              <span>Open to all</span>
            </label>

            {/* Batch Option */}
            <label className="flex items-start space-x-2">
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
              <div className="flex flex-col w-full">
                <span>Batch:</span>
                {visibility === "batch" && (
                  <>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedBatches.map((batch, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center"
                        >
                          {batch}
                          {/* Remove Button */}
                          <button 
                            type="button"
                            className="ml-2 text-red-500 font-bold"
                            onClick={() =>
                              setSelectedBatches((prev) =>
                                prev.filter((_, i) => i !== index) // Filter out the item at the current index to remove it from selectedBatches
                              )
                            }
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    {/* User Input */}
                    <input
                      type="text"
                      className="text-black mt-2 p-2 rounded-md w-full"
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
                    <p className="text-gray-500 text-sm mt-2">Press "Enter" to add the batch.</p>
                  </>
                )}
              </div>
            </label>

            {/* Alumni Option */}
            <label className="flex items-start space-x-2 mt-4">
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
              <div className="flex flex-col w-full">
                <span>Alumni:</span>
                {visibility === "alumni" && (
                  <>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedAlumni.map((email, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center"
                        >
                          {email}
                          <button
                            type="button"
                            className="ml-2 text-red-500 font-bold"
                            onClick={() =>
                              setSelectedAlumni((prev) =>
                                prev.filter((_, i) => i !== index) // Filter out the item at the current index to remove it from selectedAlumni
                              )
                            }
                          >
                            x
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      className="text-black mt-2 p-2 rounded-md w-full"
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
                    <p className="text-gray-500 text-sm mt-2">Press "Enter" to add the alumni.</p>
                  </>
                )}
              </div>
            </label>
          </div>

          {errorMessage && (
                  <p className="text-red-500 text-sm mt-4">{errorMessage}</p>
                )}

          <div className="flex justify-between mt-4">
            <button type="button" onClick={onClose} className="text-gray-500">
              Cancel
            </button>
            <div className="flex gap-2 my-5">
            <button
              type="button"
              onClick={(e) => {
                const targetGuests =
                  visibility === "batch"
                    ? selectedBatches
                    : visibility === "alumni"
                    ? selectedAlumni
                    : null;

                handleSave(e, image, targetGuests, visibility, "Draft");

                resetFormState();

                onClose();
              }}
              className="bg-[#BFBFBF] text-white p-2 rounded-[22px]"
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
                  className="bg-[#0856BA] text-white p-3 rounded-[25px]"
                >
                  Propose
                </button>
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {confirmForm && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full z-30">
          <form
            onSubmit={(e) => {
              resetFormState();

              e.preventDefault();
              if (userInput !== requiredSentence) {
                alert("Please type the sentence exactly to confirm.");
                return;
              }
              const targetGuests =
                visibility === "batch" ? selectedBatches :
                visibility === "alumni" ? selectedAlumni :
                null;

              if (isEditing && editingEventId) {
                handleEdit(editingEventId, {
                  title,
                  description,
                  location,
                  date,
                  image,
                  targetGuests,
                  status: "Pending",
                  inviteType: visibility,
                });
              } else {
                handleSave(e, image, targetGuests, visibility, "Pending");
              }
              
              router.push(`/events/proposed`)

              resetFormState();
              onClose();
              setEdit(false);
              setConfirmForm(false);
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
                onClick={() => setConfirmForm(false)}
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

export default ProposeEventForm;
