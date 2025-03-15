"use client";

import { useEvents } from "@/context/EventContext";
import { Event } from "@/models/models";

export default function Events() {
  const { events, isLoading } = useEvents();

  return (
    <div>
      <h1>Events</h1>
      {isLoading && <h1>Loading</h1>}
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
