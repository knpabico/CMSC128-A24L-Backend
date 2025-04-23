"use client";

import { useEvents } from "@/context/EventContext";
import { Event, Alumnus } from "@/models/models";
import { useRsvpDetails } from "@/context/RSVPContext"; 
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { useState } from "react";

export default function Events() {
  const { events, isLoading, setShowForm, showForm, handleSave, handleEdit, handleDelete, date,
    handleReject, handleFinalize, handleViewEventAdmin, setEventDate, description, setEventDescription, 
    title, setEventTitle } = useEvents();
  const { rsvpDetails, alumniDetails, isLoadingRsvp } = useRsvpDetails(events);
  const [activeTab, setActiveTab] = useState("Pending");
  const [isEditing, setEdit] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [rsvpFilter, setRsvpFilter] = useState("All"); 
  const [sortAlphabetically, setSortAlphabetically] = useState(false);
  const [visibility, setVisibility] = useState("default");
  const [selectedBatches, setSelectedBatches] = useState<any[]>([]);
  const [selectedAlumni, setSelectedAlumni] = useState<any[]>([]);

  const filterEvents = (status: string) => {
    return events.filter((event: Event) => event.status === status);
  };

  // function to filter RSVPs based on status and sort
  const filterRsvps = (rsvps: string[] | undefined, event: Event) => {
    if (!rsvps || rsvps.length === 0) return [];

    let filteredRsvps = rsvps.filter(rsvpId => {
      const rsvpStatus = rsvpDetails[rsvpId]?.Status;
       
      if (rsvpFilter === "All") return true;
      return rsvpFilter === rsvpStatus;
    });

    // Alphabetical sorting logic
    if (sortAlphabetically) {
      filteredRsvps.sort((a, b) => {
        const alumniA = alumniDetails[rsvpDetails[a].alumni_id];
        const alumniB = alumniDetails[rsvpDetails[b].alumni_id];
        
        if (!alumniA || !alumniB) return 0;
        
        const nameA = `${alumniA.firstName} ${alumniA.lastName}`.toLowerCase();
        const nameB = `${alumniB.firstName} ${alumniB.lastName}`.toLowerCase();
        
        return nameA.localeCompare(nameB);
      });
    }

    return filteredRsvps;
  };

  return (
    <>
      <Breadcrumbs
        items={[
          { href: '/admin-dashboard', label: 'Admin Dashboard' },
          { label: 'Events' }
        ]}
      />

      <div>
        <h1>Events</h1>

        {/* will be used for the filter */}

        {/* {(() => {
          // Group alumni by their ID and compile the events they RSVPed to
          const grouped: Record<string, { alum: any; events: string[] }> = {};

          events.forEach(event => {
            event.rsvps.forEach(rsvpId => {
              const rsvp = rsvpDetails[rsvpId]; // RSVP Details
              const alum = alumniDetails[rsvp?.alumni_id]; // Alumni Details

              if (!rsvp || !alum) return;
              
              // Check if alumni is part of the selected batch or selected alumni
              const inBatch = selectedBatches.includes(alum.studentNumber?.slice(0, 4));
              const inAlumni = selectedAlumni.includes(alum.email);
              
              // Decide if this RSVP should be shown based on the current visibility setting
              const matchesFilter =
                visibility === "all" ||
                (visibility === "batch" && inBatch) ||
                (visibility === "alumni" && inAlumni);

              if (!matchesFilter) return;
              
              // If this alumni isn't already in the grouped object, add them
              if (!grouped[alum.alumniId]) {
                grouped[alum.alumniId] = { alum, events: [] };
              }

              // Add the current event 
              grouped[alum.alumniId].events.push(`${event.title} - ${rsvp.Status}`);
            });
          });

          return (
            <ul>
              {Object.values(grouped).map(({ alum, events }) => (
                <li key={alum.alumniId}>
                  <strong>{alum.firstName} ({alum.email}) - {alum.studentNumber}</strong>
                  <ul>
                    {events.map((event, i) => (
                      <li key={`${alum.alumniId}-${i}`}>{event}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          );
        })()} */}

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
            setEventDescription("");
            setEventDate("");
          }}  className="px-4 py-2 bg-blue-500 text-white rounded-md">
            Create Event
          </button>
          {showForm && (
            <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full z-10">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (isEditing && editingEventId) {
                  handleEdit(editingEventId, { title, description, date }); // Pass the current value if it will be edited
                } else {
                  handleSave(e); // Pass the value entered in the current form
                }
                setShowForm(false);
                setEdit(false);
              }} className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg w-[400px]">
                <h2 className="text-xl mb-4">{isEditing ? "Edit Event" : "Create Event"}</h2>

                <input
                  type="text"
                  placeholder="Event Title"
                  value={title}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full mb-4 p-2 border rounded"
                  required
                />

                <textarea
                  placeholder="Event Description (Format: online / F2F & Venue/Platform)"
                  value={description}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full mb-4 p-2 border rounded"  
                  required
                />

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full mb-4 p-2 border rounded"
                  required
                  min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Events must be scheduled 
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
                        </>
                      )}
                    </div>
                  </label>
                </div>
                <div className="flex justify-between">
                  <button type="button" onClick={() => setShowForm(false)} className="text-gray-500">
                    Cancel
                  </button>
                  <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                    {isEditing ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <div>
        {/* RSVP Filter and Sorting Div */}
        <div className="mb-4 flex items-center gap-4">
          <div>
            <label htmlFor="rsvp-filter" className="mr-2">Filter RSVPs:</label>
            <select 
              id="rsvp-filter"
              value={rsvpFilter}
              onChange={(e) => setRsvpFilter(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="All">All</option>
              <option value="Accepted">Accepted</option>
              <option value="Declined">Declined</option>
            </select>
          </div>

          {/* Alphabetical Sort Button */}
          <div>
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={sortAlphabetically}
              onChange={() => setSortAlphabetically(!sortAlphabetically)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
              Sort Alphabetically
            </span>
          </label>
        </div>
        </div>

        {filterEvents(activeTab).map((events: Event, index: number) => (
          <div key={index} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "15px" }}>
            <strong><h2>{events.title}</h2></strong>
            
            <p> <strong>Date:</strong> {events.date}</p>
            <p> <strong>Time:</strong>{events.time}</p>
            <p> <strong>Description:</strong>{events.description}</p>
            <p> <strong>Location:</strong>{events.location}</p>
            <p> <strong>Attendees:</strong>{events.numofAttendees}</p>
            {events.creatorType === "Alumni" && <p>Proposed by: {events.creatorName}</p>}
            
            <h3>RSVPs:</h3>
            {events.rsvps && events.rsvps.length > 0 ? (
              <div>
                {filterRsvps(events.rsvps, events).map((rsvpId, index) => (
                  <div key={index} style={{ border: "1px solid #eee", padding: "10px", marginBottom: "5px" }}>
                    {rsvpDetails[rsvpId] ? (
                      <>
                        {rsvpDetails[rsvpId].error ? (
                          <p>{rsvpDetails[rsvpId].error}</p>
                        ) : (
                          <div>
                            {rsvpDetails[rsvpId].alumni_id && alumniDetails[rsvpDetails[rsvpId].alumni_id] && (
                              <div>
                                <p>
                                  <strong>Name:</strong> {alumniDetails[rsvpDetails[rsvpId].alumni_id].firstName} {alumniDetails[rsvpDetails[rsvpId].alumni_id].lastName}
                                </p>
                                <p>
                                  <strong>Status:</strong> {rsvpDetails[rsvpId].Status}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <p>Loading RSVP details...</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No RSVPs yet.</p>
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
                    onClick={() =>
                      handleFinalize(
                        events.eventId,
                        visibility,
                        visibility === "batch"
                          ? selectedBatches
                          : visibility === "alumni"
                          ? selectedAlumni
                          : null
                      )
                    }
                    className="px-4 py-2 bg-green-500 text-white rounded-md"
                  >
                    Finalize
                  </button>
                  <button
                    onClick={() => {
                      setEdit(true);
                      setEditingEventId(events.eventId);
                      setEventTitle(events.title);
                      setEventDescription(events.description);
                      setEventDate(events.date);
                      setShowForm(true);
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleReject(events.eventId)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md"
                  >
                    Reject
                  </button>
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