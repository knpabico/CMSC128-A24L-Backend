"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { Event } from "@/models/models";
const EventContext = createContext<any>(null);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
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
  return (
    <EventContext.Provider value={{ events, isLoading }}>
      {children}
    </EventContext.Provider>
  );
}

export const useEvents = () => useContext(EventContext);
