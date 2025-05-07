"use client";

import { useParams, useRouter } from "next/navigation";
import { useEvents } from "@/context/EventContext";
import { Event } from "@/models/models";
import { useState, useEffect } from "react";
import { useRsvpDetails } from "@/context/RSVPContext";
import { Button } from "@mui/material";
import ModalInput from "@/components/ModalInputForm";
import { useAlums } from "@/context/AlumContext";

const EventPageAdmin = () => {
  const {
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
  } = useEvents();

  const params = useParams();
  const router = useRouter();

  const eventId = params?.eventId as string;
  const event = events.find((e: Event) => e.eventId === eventId);

  const [isEditing, setEdit] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibility, setVisibility] = useState("all");
  const [selectedBatches, setSelectedBatches] = useState<any[]>([]);
  const [selectedAlumni, setSelectedAlumni] = useState<any[]>([]);

  const { rsvpDetails, alumniDetails } = useRsvpDetails();
  const [rsvpFilter, setRsvpFilter] = useState("All");

  const [errorMessage, setErrorMessage] = useState("");

  const { alums } = useAlums();

  useEffect(() => {
    // Properly show the selected filter when Editing the values
    if (isEditing && events) {
      const eventToEdit = events.find(
        (event) => event.eventId === editingEventId
      );
      setVisibility("all");
      setSelectedAlumni([]);
      setSelectedBatches([]);

      if (eventToEdit) {
        setEventTitle(eventToEdit.title);
        setEventLocation(eventToEdit.location);
        setEventTime(eventToEdit.time);
        setEventImage(eventToEdit.image);
        setEventDescription(eventToEdit.description);
        setEventDate(eventToEdit.date);
        setShowForm(true);

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
      }
    }
  }, [isEditing, events, editingEventId]);

  if (!eventId || events.length === 0) {
    return <p>Loading...</p>;
  }

  const formComplete =
    title.trim() !== "" &&
    description.trim() !== "" &&
    date.trim() !== "" &&
    time.trim() !== "" &&
    location.trim() !== "";

  return (
    <div className="p-4">
      <button
        onClick={() => router.back()}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        ← Back
      </button>
      {showForm && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full z-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();

              // store the selected guests
              const targetGuests =
                visibility === "batch"
                  ? selectedBatches
                  : visibility === "alumni"
                  ? selectedAlumni
                  : [];

              if (isEditing && editingEventId) {
                handleEdit(editingEventId, {
                  title,
                  description,
                  date,
                  targetGuests,
                  inviteType: visibility,
                }); // Pass the current value if it will be edited
              }

              setErrorMessage(""); // Clear previous error messages

              if (!formComplete) {
                setErrorMessage(
                  "Please fill out all required fields before proposing the event."
                );
                return;
              }

              // Validate batch inputs (only numbers and not empty)
              if (visibility === "batch") {
                if (selectedBatches.length === 0) {
                  setErrorMessage("Please add at least one batch.");
                  return;
                }
                if (selectedBatches.some((batch) => !/^\d+$/.test(batch))) {
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
                if (
                  selectedAlumni.some(
                    (email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                  )
                ) {
                  setErrorMessage(
                    "Please ensure all alumni inputs are valid email addresses."
                  );
                  return;
                }
              }

              const form = document.querySelector("form");
              if (form && form.checkValidity()) {
                handleSave(e, targetGuests, visibility, "Pending"); // Pass the value entered in the current form
              } else {
                form?.reportValidity(); // Show browser's validation tooltips
              }
            }}
            className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg w-[400px]"
          >
            <h2 className="text-xl mb-4">
              {isEditing ? "Edit Event" : "Create Event"}
            </h2>

            <input
              type="text"
              placeholder="Event Title"
              value={title}
              onChange={(e) => setEventTitle(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
              required
            />

            <textarea
              rows={6}
              placeholder="Event Description (Format: online / F2F & Venue/Platform)"
              value={description}
              onChange={(e) => setEventDescription(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
              required
            />

            <textarea
              placeholder="Event Location"
              value={location}
              onChange={(e) => setEventLocation(e.target.value)}
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

            <div className="flex gap-4 mb-4">
              <div className="w-1/2">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setEventDate(e.target.value)}
                  onKeyDown={(e) => e.preventDefault()} // prevent manual typing
                  className="w-full mb-4 p-2 border rounded"
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

            <label
              htmlFor="image-upload"
              className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Upload Photo
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              required
            />

            {fileName && (
              <p className="mt-2 text-sm text-gray-600">
                Selected file: {fileName}
              </p>
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
                                setSelectedBatches(
                                  (prev) => prev.filter((_, i) => i !== index) // Filter out the item at the current index to remove it from selectedBatches
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
                                setSelectedAlumni(
                                  (prev) => prev.filter((_, i) => i !== index) // Filter out the item at the current index to remove it from selectedAlumni
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
                    </>
                  )}
                </div>
              </label>
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded"
              >
                {isEditing ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {event ? (
        <div>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <h1 className="text-2xl font-bold">Status: {event.status}</h1>
          <p className="text-gray-700">{event.date}</p>
          <p className="mt-2">{event.time}</p>
          <p className="mt-2">{event.location}</p>
          <p className="mt-2">{event.numOfAttendees}</p>
          <p className="mt-2">{event.description}</p>
          {event.needSponsorship && event.status === "Accepted" && (
            <p className="text-gray-700">{event.donationDriveId}</p>
          )}
          <h3>RSVPs:</h3>
          {event.rsvps && event.rsvps.length > 0 ? (
            <div>
              {rsvpDetails
                .filter((rsvp) => rsvp.postId === event.eventId)
                .flatMap((rsvp) =>
                  Object.entries(rsvp.alums || {}).map(([alumniId, alumData]) => {
                    const { status } = alumData as { status: string };
                    const alumni = alums.find((a) => a.alumniId === alumniId);

                    return (
                      <div
                        key={`${rsvp.rsvpId}-${alumniId}`}
                        style={{
                          border: "1px solid #eee",
                          padding: "10px",
                          marginBottom: "5px",
                        }}
                      >
                        {alumni ? (
                          <>
                            <p>
                              <strong>Name:</strong> {alumni.firstName} {alumni.lastName}
                            </p>
                            <p>
                              <strong>Status:</strong> {status}
                            </p>
                          </>
                        ) : (
                          <p>Alumni details not found for ID: {alumniId}</p>
                        )}
                      </div>
                    );
                  })
                )}
            </div>
          ) : (
            <p>No RSVPs yet.</p>
          )}
          {/* Buttons */}
          {event.status === "Pending" ? (
            event.creatorType === "alumni" ? (
              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={() => addEvent(event, true, false)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md"
                >
                  Accept Proposal
                </button>
                <button
                  onClick={() => {
                    setEdit(true);
                    setEditingEventId(event.eventId);
                    setShowForm(true);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleReject(event.eventId)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                >
                  Reject Proposal
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={() => addEvent(event, true, false)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md"
                >
                  Finalize
                </button>
                <button
                  onClick={() => {
                    setEdit(true);
                    setEditingEventId(event.eventId);
                    setShowForm(true);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    handleDelete(event.eventId); // Deletes the event
                    router.back(); // Navigates back after the delete
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                >
                  Delete
                </button>
              </div>
            )
          ) : event.status === "Accepted" ? (
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={() => {
                  handleDelete(event.eventId); // Deletes the event
                  router.back(); // Navigates back after the delete
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
              >
                Delete
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <p>Event not found.</p>
      )}
    </div>
  );
};

export default EventPageAdmin;
