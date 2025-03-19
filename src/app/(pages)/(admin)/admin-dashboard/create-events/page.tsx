"use client";

import { useEvents } from "@/context/EventContext";
import { Event } from "@/models/models";
import { useRsvpDetails } from "@/context/RSVPContext"; // Adjust path as needed
import { Breadcrumbs } from "@/components/ui/breadcrumb";

export default function Events() {
  const { events, isLoading, setShowForm, showForm, handleSubmit, date,
     setEventDate, description, setEventDescription, title, setEventTitle } = useEvents();
  const { rsvpDetails, alumniDetails, isLoadingRsvp } = useRsvpDetails(events);

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
        {isLoading && <h1>Loading</h1>}
        <div>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-500 text-white rounded-md">
            Create Event
          </button>
          {showForm && (
            <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full">
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg w-[400px]">
                <h2 className="text-xl mb-4">Event Details</h2>

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
                    Finalize
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      <div>
          {events.map((events: Event, index: any) => (
            <div key={index} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "15px" }}>
              <strong><h2>{events.title}</h2></strong>
              <p>{events.date}</p>
              <p>{events.description}</p>
              
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
            </div>
          ))}
        </div> 
    </>
  );
}