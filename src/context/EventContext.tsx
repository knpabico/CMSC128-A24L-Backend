"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot, query, addDoc} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { Event } from "@/models/models";
import { FirebaseError } from "firebase/app";
const EventContext = createContext<any>(null);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setEventTitle] = useState("");
  const [description, setEventDescription] = useState("");
  const [date, setEventDate] = useState("");
  const { user } = useAuth();
  useEffect(() => {
    let unsubscribe: (() => void) | null;

    if (user) {
      unsubscribe = subscribeToEvents(); //maglilisten sa firestore
    } else {
      setEvents([]); //reset once logged out
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe(); //stops listening after logg out
      }
    };
  }, [user]);

  const subscribeToEvents = () => {
    setLoading(true);
    const q = query(collection(db, "event"));

    //listener for any changes
    const unsubscribeEvents = onSnapshot(
      q,
      (querySnapshot: any) => {
        const eventList = querySnapshot.docs.map(
          (doc: any) => doc.data() as Event
        );
        setEvents(eventList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    );
    return unsubscribeEvents;
  };

  const addEvent = async (newEvent: Event) => {
    try {
      const eventRef = collection(db, "event");
      const docRef = await addDoc(eventRef, newEvent);
      newEvent.eventId = docRef.id;
      console.log('Event successfully added:', newEvent);
      return { success: true, message: 'Event added successfully' };
    } catch (error) {
      console.error('Error adding event:', (error as FirebaseError).message);
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newEvent: Event = {
        datePosted: new Date(),
        title,
        description,
        date,
        rsvps: [],
        eventId: ""
    };

    const response = await addEvent(newEvent);

    if (response.success) {
      setShowForm(false);
      setEventTitle("");
      setEventDescription("");
      setEventDate("");
    } else {
      console.error("Error adding event:", response.message);
    }
  };


  return (
    <EventContext.Provider value={{ events, isLoading, addEvent, setShowForm, showForm, handleSubmit, 
    title, setEventTitle, description, setEventDescription, date, setEventDate }}>
      {children}
    </EventContext.Provider>
  );
}

export const useEvents = () => useContext(EventContext);
