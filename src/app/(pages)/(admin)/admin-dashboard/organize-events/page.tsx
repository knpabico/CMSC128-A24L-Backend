"use client";

import { useEvents } from "@/context/EventContext";
import { Breadcrumbs } from "@/components/ui/breadcrumb";

export default function Events() {
  const { events, isLoading } = useEvents();


  return (
    <>
      <Breadcrumbs
        items={[
          { href: "/admin-dashboard", label: "Admin Dashboard" },
          { label: "Events" },
        ]}
      />

      <div>
        <h1 className="text-4xl font-bold mb-6">Events</h1>
        {isLoading && <h2 className="text-xl">Loading...</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {events.map((event, index) => (
            <div key={index} className="border p-6 rounded-2xl shadow-md">
              <h2 className="text-2xl font-semibold">{event.title}</h2>
              <p className="text-gray-600">{event.date}</p>
              <p className="text-gray-700 mt-2">{event.description}</p>
              
              {/* Display RSVP Array */}
              <h3 className="mt-4 font-semibold">RSVPS:</h3>
              {event.rsvp.length > 0 ? (
                <ul className="list-disc pl-4">
                  {event.rsvp.map((rsvpId, index) => (
                    <li key={index} className="text-gray-600">RSVP ID: {rsvpId}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No RSVPs yet.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
