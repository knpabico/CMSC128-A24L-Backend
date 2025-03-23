"use client";

import { useEvents } from "@/context/EventContext";
import { Event } from "@/models/models";


export default function Events() {
  const { events, isLoading, setShowForm, showForm, handleSave, handleEdit, handleDelete, date,
    handleReject, handleFinalize, setEventDate, description, setEventDescription, title, setEventTitle } = useEvents();

  return (
    <div>
      <h1>Events</h1>
      {isLoading && <h1>Loading</h1>}
      <div>
        <button onClick={() => setShowForm(true)}  className="px-4 py-2 bg-blue-500 text-white rounded-md">
          Propose an Event
        </button>
        {showForm && (
          <div className="fixed inset-0 bg-opacity-30 backdrop-blur-md flex justify-center items-center w-full h-full">
            <form onSubmit={handleSave} className="bg-white p-8 rounded-lg border-2 border-gray-300 shadow-lg w-[400px]">
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
                  Save
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      {events.map((event: Event, index) => (
        <div key={index}>
          <h1>{event.title}</h1>
          <h2>{event.date}</h2>
          <h2>{event.description}</h2>
        </div>
      ))}
    </div>
  );
}
