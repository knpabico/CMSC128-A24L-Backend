"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEvents } from "@/context/EventContext";
import { Event } from "@/models/models";
import { useState, useEffect } from "react";
import { useRsvpDetails } from "@/context/RSVPContext";
import { Button } from "@mui/material";
import ModalInput from "@/components/ModalInputForm";

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
  } = useEvents();

  const params = useParams();
  const router = useRouter();

  const eventId = params?.eventId as string;
  const event = events.find((e: Event) => e.eventId === eventId);

  const [isEditing, setEdit] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibility, setVisibility] = useState("default");
  const [selectedBatches, setSelectedBatches] = useState<any[]>([]);
  const [selectedAlumni, setSelectedAlumni] = useState<any[]>([]);

  const { rsvpDetails, alumniDetails, isLoadingRsvp } = useRsvpDetails(events);
  const [rsvpFilter, setRsvpFilter] = useState("All");

  useEffect(() => 
  { // Properly show the selected filter when Editing the values
    if (isEditing && events)
    {
      const eventToEdit = events.find(event => event.eventId === editingEventId);
      setVisibility("default");
      setSelectedAlumni([]);
      setSelectedBatches([]);

      if (eventToEdit)
      {
        setEventTitle(eventToEdit.title);
        setEventDescription(eventToEdit.description);
        setEventDate(eventToEdit.date);
        setShowForm(true);
  
        // Properly check targetGuests for alumni and batches
        if (eventToEdit.targetGuests && eventToEdit.targetGuests.length > 0)
        {
          // Check if the first item is a batch (e.g., a string of length 4)
          if (eventToEdit.targetGuests[0].length === 4)
          {
            setSelectedBatches(eventToEdit.targetGuests); // Set the batches
            setVisibility("batch"); // Set visibility to batches
          } 
          
          else
          {
            setSelectedAlumni(eventToEdit.targetGuests); // Set the alumni
            setVisibility("alumni"); // Set visibility to alumni
          }
        }
      }
    }
  }, [isEditing, events, editingEventId]);

  if (!eventId || events.length === 0)
  {
    return <p>Loading...</p>;
  }

  const filterRsvps = (rsvps: string[] | undefined, event: Event) => {
    if (!rsvps || rsvps.length === 0) return [];

    let filteredRsvps = rsvps.filter((rsvpId) => {
      const rsvpStatus = rsvpDetails[rsvpId]?.status;
 
      if (rsvpFilter === "All") return true;
      return rsvpFilter === rsvpStatus;
    });

    // Alphabetical sorting logic
    if (sortAlphabetically) {
      filteredRsvps.sort((a, b) => {
        const alumniA = alumniDetails[rsvpDetails[a].alumniId];
        const alumniB = alumniDetails[rsvpDetails[b].alumniId];

        if (!alumniA || !alumniB) return 0;

        const nameA = `${alumniA.firstName} ${alumniA.lastName}`.toLowerCase();
        const nameB = `${alumniB.firstName} ${alumniB.lastName}`.toLowerCase();

        return nameA.localeCompare(nameB);
      });
    }

    return filteredRsvps;
  };

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
            onSubmit={(e) =>
            {
              e.preventDefault();
              
            // store the selected guests
            const targetGuests =
              visibility === "batch"
                ? selectedBatches
                : visibility === "alumni"
                ? selectedAlumni
                : [];

              if (isEditing && editingEventId)
              {
                handleEdit(editingEventId, { title, description, date, targetGuests, inviteType: visibility }); // Pass the current value if it will be edited
              } 
              
              else
              {
                handleSave(e, targetGuests, visibility, "Pending"); // Pass the value entered in the current form
              }
              setShowForm(false);
              setEdit(false);
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

            <input
              type="date"
              value={date}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
              required
              min=
              {
                new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0]
              } // Events must be scheduled
              // at least one week in advance
            />

            <div className="space-y-4 bg-white-700 p-4 text-black rounded-md w-80">
              {/* Open to All */}
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="visibility"
                  value="all"
                  checked={visibility === "all"}
                  onChange={() => 
                  {
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
                  onChange={() =>
                  {
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
                        onKeyDown={(e) =>
                        {
                          if (e.key === "Enter") 
                          {
                            e.preventDefault();
                            const value = e.currentTarget.value.trim();
                            // Check if the value is not empty and not already in the selectedBatches list
                            if (value && !selectedBatches.includes(value)) 
                            {
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
                  onChange={() => 
                  {
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
                        onKeyDown={(e) => 
                        {
                          if (e.key === "Enter") 
                          {
                            e.preventDefault();
                            const value = e.currentTarget.value.trim();
                            // Check if the value is not empty and not already in the selectedAlumni list
                            if (value && !selectedAlumni.includes(value)) 
                            {
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
          {event.rsvps?.length > 0 ? (
            <div>
              {event.rsvps.map((rsvpId, index) => {
                const rsvp = rsvpDetails[rsvpId];
                const alumni = rsvp?.alumniId ? alumniDetails[rsvp.alumniId] : null;

                return (
                  <div
                    key={index}
                    style={{
                      border: "1px solid #eee",
                      padding: "10px",
                      marginBottom: "5px",
                    }}
                  >
                    {rsvp ? (
                      rsvp.error ? (
                        <p>{rsvp.error}</p>
                      ) : alumni ? (
                        <>
                          <p>
                            <strong>Name:</strong> {alumni.firstName} {alumni.lastName}
                          </p>
                          <p>
                            <strong>Status:</strong> {rsvp.status}
                          </p>
                        </>
                      ) : (
                        <p>Alumni details not found.</p>
                      )
                    ) : (
                      <p>Loading RSVP details...</p>
                    )}
                  </div>
                );
              })}
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
                  onClick={() => 
                  {
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
                  onClick={() => 
                  {
                    setEdit(true);
                    setEditingEventId(event.eventId);
                    setShowForm(true);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                >
                  Edit
                </button>
                <button
                  onClick={() => 
                  {
                    handleDelete(event.eventId);  // Deletes the event
                    router.back();  // Navigates back after the delete
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
                onClick={() => 
                {
                  handleDelete(event.eventId);  // Deletes the event
                  router.back();  // Navigates back after the delete
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
