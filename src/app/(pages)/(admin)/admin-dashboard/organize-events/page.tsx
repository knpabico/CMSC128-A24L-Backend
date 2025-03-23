"use client";

import { useEvents } from "@/context/EventContext";
import { Event } from "@/models/models";
import { useRsvpDetails } from "@/context/RSVPContext"; // Adjust path as needed
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { useState } from "react";

export default function Events() {
  const { events, isLoading, userType, setShowForm, showForm, handleSave, handleEdit, handleDelete, date,
    handleReject, handleFinalize, setEventDate, description, setEventDescription, title, setEventTitle } = useEvents();
  const { rsvpDetails, alumniDetails, isLoadingRsvp } = useRsvpDetails(events);
  const [activeTab, setActiveTab] = useState("Pending");
  const [isEditing, setEdit] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const filterEvents = (status: string) => {
    return events.filter((event: Event) => event.status === status);
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
            setEdit(false); // Set the edit flag to false (create event)
            setShowForm(true); // Show the form 
            // Reset form fields
            setEventTitle(""); 
            setEventDescription("");
            setEventDate("");
          }}  className="px-4 py-2 bg-blue-500 text-white rounded-md">
            Create Event
          </button>
          {showForm && (
            <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full">
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
          {filterEvents(activeTab).map((events: Event, index: number) => ( // Filter the events to be shown in the screen
            <div key={index} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "15px" }}>
              <strong><h2>{events.title}</h2></strong>
              <p>{events.date}</p>
              <p>{events.description}</p>
              <p>{events.id}</p>
              {events.creatorType === "Alumni" && <p>Proposed by: {events.creatorName}</p>}
              
              {/* Display RSVP Details */}
              <h3>RSVPs:</h3>
              {events.rsvp && events.rsvp.length > 0 ? (
                <div>
                  {events.rsvp.map((rsvpId, index) => (
                    <div key={index} style={{ border: "1px solid #eee", padding: "10px", marginBottom: "5px" }}>
                      {rsvpDetails[rsvpId] ? (
                        <>
                          {rsvpDetails[rsvpId].error ? (
                            <p>{rsvpDetails[rsvpId].error}</p>
                          ) : (
                            <>
                              <div>
                                {/* Display alumni information if available */}
                                {rsvpDetails[rsvpId].alumni_id && alumniDetails[rsvpDetails[rsvpId].alumni_id] && (
                                  <p>
                                    <strong>Name:</strong> {alumniDetails[rsvpDetails[rsvpId].alumni_id].name || "Alumni"}
                                  </p>
                                )}
                                <p>
                                  <strong>Status:</strong> {rsvpDetails[rsvpId].Status || "Pending"}
                                </p>
                              </div>
                            </>
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
                <button
                  onClick={() => handleDelete(events.eventId)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                >
                  Delete
                </button>
              )}
    
              {activeTab === "Pending" && (
                <div className="flex gap-3 mt-2">
                  <button 
                    onClick={() => handleFinalize(events.eventId)}
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
                </div>
              )}
            </div>
          ))}
        </div> 
    </>
  );
}