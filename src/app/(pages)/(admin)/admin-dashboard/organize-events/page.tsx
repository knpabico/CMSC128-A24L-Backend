"use client";

import { useEvents } from "@/context/EventContext";
import { useRsvpDetails } from "@/context/RSVPContext"; // Adjust path as needed
import { Breadcrumbs } from "@/components/ui/breadcrumb";

export default function Events() {
  const { events, isLoading } = useEvents();
  const { rsvpDetails, alumniDetails, isLoadingRsvp } = useRsvpDetails(events);

  return (
    <>
      <Breadcrumbs
        items={[
          { href: "/admin-dashboard", label: "Admin Dashboard" },
          { label: "Events" },
        ]}
      />

      <div>
        <h1>Events</h1>
        {(isLoading || isLoadingRsvp) && <h2>Loading...</h2>}
        <div>
          {events.map((event, index) => (
            <div key={index} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "15px" }}>
              <strong><h2>{event.title}</h2></strong>
              <p>{event.date}</p>
              <p>{event.description}</p>
              
              {/* Display RSVP Details */}
              <h3>RSVPs:</h3>
              {event.rsvp && event.rsvp.length > 0 ? (
                <div>
                  {event.rsvp.map((rsvpId, index) => (
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
      </div>
    </>
  );
}