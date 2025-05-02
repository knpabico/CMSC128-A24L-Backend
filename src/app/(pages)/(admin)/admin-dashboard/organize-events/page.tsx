"use client";

import { useEvents } from "@/context/EventContext";
import { Event, Alumnus } from "@/models/models";
import { useRsvpDetails } from "@/context/RSVPContext";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { useState, useEffect } from "react";
import { Button } from "@mui/material";
import ModalInput from "@/components/ModalInputForm";

export default function Events() {
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
  } = useEvents();
  const { rsvpDetails, alumniDetails, isLoadingRsvp } = useRsvpDetails(events);
  const [activeTab, setActiveTab] = useState("Pending");
  const [isEditing, setEdit] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [rsvpFilter, setRsvpFilter] = useState("All");
  const [sortAlphabetically, setSortAlphabetically] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibility, setVisibility] = useState("all");
  const [selectedBatches, setSelectedBatches] = useState<any[]>([]);
  const [selectedAlumni, setSelectedAlumni] = useState<any[]>([]);

  const [filterSearch, setFilterSearch] = useState("all");
  const [searchBatches, setSearchBatches] = useState<any[]>([]);
  const [searchAlumni, setSearchAlumni] = useState<any[]>([]);

  const [errorMessage, setErrorMessage] = useState("");
  const [selectedButton, setButton] = useState("");



  useEffect(() => { // Properly show the selected filter when Editing the values
    if (isEditing && events) {
      const eventToEdit = events.find(event => event.eventId === editingEventId);
      setVisibility("all");
      setSelectedAlumni([]);
      setSelectedBatches([]);

      if (eventToEdit) {
        setEventTitle(eventToEdit.title);
        setEventDescription(eventToEdit.description);
        setEventImage(eventToEdit.image);
        setEventDate(eventToEdit.date);
        setEventTime(eventToEdit.time);
        setEventLocation(eventToEdit.location);
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
  
  const filterEvents = (status: string) => {
    console.log(`events length is ${events.length}`);
    return events.filter((event: Event) => event.status === status);
  };

  const formComplete =
    title.trim() !== "" &&
    description.trim() !== "" &&
    date.trim() !== "" &&
    time.trim() !== "" &&
    location.trim() !== "";

  return (
    <>
      <Breadcrumbs
        items={[
          { href: "/admin-dashboard", label: "Admin Dashboard" },
          { label: "Events" },
        ]}
      />


      <div>

        {/* will be used for the filter */}

        {(() => {
          // Group alumni by their ID and compile the events they RSVPed to
          const grouped: Record<string, { alum: any; events: string[] }> = {};

          events.forEach(event => {
            event.rsvps.forEach(rsvpId => {
              const rsvp = rsvpDetails[rsvpId]; // RSVP Details
              const alum = alumniDetails[rsvp?.alumniId]; // Alumni Details

              if (!rsvp || !alum) return;
              
              // Check if alumni is part of the selected batch or selected alumni
              const inBatch = searchBatches.includes(alum.studentNumber?.slice(0, 4));
              const inAlumni = searchAlumni.includes(alum.email);
              
              // Decide if this RSVP should be shown based on the current visibility setting
              const matchesFilter =
                filterSearch === "all" ||
                (filterSearch === "batch" && inBatch) ||
                (filterSearch === "alumni" && inAlumni);

              if (!matchesFilter) return;
              
              // If this alumni isn't already in the grouped object, add them
              if (!grouped[alum.alumniId]) {
                grouped[alum.alumniId] = { alum, events: [] };
              }

              // Add the current event 
              grouped[alum.alumniId].events.push(`${event.title} - ${rsvp.status}`);
            });
          });

          // return (
          //   <ul>
          //     {Object.values(grouped).map(({ alum, events }) => (
          //       <li key={alum.alumniId}>
          //         <strong>{alum.firstName} ({alum.email}) - {alum.studentNumber}</strong>
          //         <ul>
          //           {events.map((event, i) => (
          //             <li key={`${alum.alumniId}-${i}`}>{event}</li>
          //           ))}
          //         </ul>
          //       </li>
          //     ))}
          //   </ul>
          // );
        })()}

              
        {/* Sort Buttons for different status*/}
        <div className="flex gap-5 mb-5">
          {["Accepted", "Pending", "Rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`px-4 py-2 rounded-md ${
                activeTab === status ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      
        {isLoading && <h1>Loading</h1>}

        <div>
          <button onClick={() => {
            setEdit(false);
            setShowForm(true);
            setEventTitle(""); 
            setEventTime("");
            setEventDescription("");
            setEventDate("");
            setEventLocation("");
            setFileName("");
            setEventImage(null);
            setSelectedAlumni([]);
            setSelectedBatches([]);
            setVisibility("all");
            setButton("");
          }}  className="px-4 py-2 bg-blue-500 text-white rounded-md">
            Create Event
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
                  handleEdit(editingEventId, { title, description, location, date, image, targetGuests, inviteType: visibility }); // Pass the current value if it will be edited
                }
                
                if (selectedButton === "Create") {
                  setErrorMessage(""); // Clear errors first
            
                  if (!formComplete) {
                    setErrorMessage("Please fill out all required fields before proposing the event.");
                    return;
                  }
            
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
                  if (!form || !form.checkValidity()) {
                    form?.reportValidity();
                    return;
                  }
            
                  const newEvent: Event = {
                    datePosted: new Date(),
                    title,
                    description,
                    date,
                    time,
                    location,
                    image: "", // will be set inside addEvent after upload
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
                    donationDriveId: ""
                  };
                
                  addEvent(newEvent, true, true);
            
                } else {
                  // If button is not "Create", just save
                  handleSave(e, image, targetGuests, visibility, "Pending");
                }
                
                setShowForm(false);
                setEdit(false);
                setButton("");
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
                  <button 
                    type="submit"
                    onClick={() => setButton("Create")}
                    className="px-4 py-2 bg-green-500 text-white rounded-md"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <div>

        {filterEvents(activeTab).map((events: Event, index: number) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "15px",
            }}
          >
            <strong>
              <h2>{events.title}</h2>
            </strong>
            <p>
            <img src={events.image} alt="Event Poster" className="w-64 h-auto" />
            </p>
            <p>
              {" "}
              <strong>Date:</strong> {events.date}
            </p>
            <p>
              {" "}
              <strong>Time:</strong>
              {events.time}
            </p>
            <p>
              {" "}
              <strong>Description:</strong>
              {events.description}
            </p>
            <p>
              {" "}
              <strong>Location:</strong>
              {events.location}
            </p>
            <p>
              {" "}
              <strong>Attendees:</strong>
              {events.numofAttendees}
            </p>

            <p     
              onClick={() => alert(`Placeholder: Create donation drive for event ID ${events.eventId}`)}
            >
             Create Donation Drive
            </p>
            {events.creatorType === "alumni" && (
              <p>Proposed by: {events.creatorName}</p>
            )}

            {/* Status Filter */}
              {activeTab === "Accepted" && (
                <>
                  <button
                    onClick={() => handleDelete(events.eventId)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleViewEventAdmin(events)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md"
                  >
                    View More
                  </button>
                </>
              )}
    
              {activeTab === "Pending" && (
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => {
                      addEvent(events, true, false);
                      setShowForm(false);
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-md"
                  >
                    {events.creatorType === "admin" ? "Finalize" : "Accept Proposal"}
                  </button>
                  <button
                    onClick={() => {
                      setEdit(true);
                      setEditingEventId(events.eventId);
                      setShowForm(true);
                    }}

                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                  >
                    Edit
                  </button>
                  {events.creatorType === "admin" ? (
                    <>                      
                      <button
                        onClick={() => handleDelete(events.eventId)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleReject(events.eventId)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md"
                      >
                        Reject Proposal
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleViewEventAdmin(events)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md"
                  >
                    View More
                  </button>
                </div>
              )}
              {activeTab === "Rejected" && (
                <div className="mt-2">
                  <button
                    onClick={() => handleViewEventAdmin(events)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md"
                  >
                    View More
                  </button>
                </div>
              )}
            </div>
          ))}
        </div> 
    </>
  );
}