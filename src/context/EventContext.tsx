"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot, query, setDoc, updateDoc, deleteDoc, doc, getDoc} from "firebase/firestore";
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
  const [userType, setUserType] = useState("");
  const [creatorId, setCreatorId] = useState("");
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

  const checkUserRole = async (userId: string) => {
    const adminRef = doc(db, "admin", userId);
    const alumniRef = doc(db, "alumni", userId);
  
    const [adminSnap, alumniSnap] = await Promise.all([getDoc(adminRef), getDoc(alumniRef)]);
  
    if (adminSnap.exists()) {
      return { role: "Admin", name: null };
    } else {
      const alumnusData = alumniSnap.data();
      return { role: "Alumni", name: alumnusData?.name || "Unknown" };
    } 
  };
  
  const addEvent = async (newEvent: Event) => {
    try {
      const { role, name } = await checkUserRole(user.uid);
      const docRef = doc(collection(db, "event")); // Generate document reference
      newEvent.eventId = docRef.id; // Assign Firestore-generated ID
      newEvent.status = "Pending"; // Default status
      newEvent.creatorId = user.uid
      newEvent.creatorName = role === "Alumni" ? name : "Admin"; // Store alumni name
      newEvent.creatorType = role;
  
      console.log("Event to be added:", newEvent);
      
      await setDoc(doc(db, "event", docRef.id), newEvent); // Save event to Firestore
  
      return { success: true, message: "Event added successfully" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  // Save the form (currently not finalize)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const newEvent: Event = {
        datePosted: new Date(),
        title,
        description,
        date,
        rsvps: [],
        eventId: "",
        status: "Pending",
        creatorId: "", 
        creatorName: "",
        creatorType: ""
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

  // Function to be able to delete finalized events
  const handleDelete = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, "event", eventId));
      setEvents((prev) => prev.filter((event) => event.eventId !== eventId));
      return { success: true, message: "Event successfully deleted" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  // 
  const handleEdit = async (eventId: string, updatedData: Partial<Event>) => {
    try {
      await updateDoc(doc(db, "event", eventId), updatedData);
      setEvents((prev) =>
        prev.map((event) => (event.eventId === eventId ? { ...event, ...updatedData } : event))
      );
      return { success: true, message: "Event successfully updated" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  // Function to Reject the proposed / created Event
  const handleReject = async (eventId: string) => {
    try {
        const eventRef = doc(db, "event", eventId);
        await updateDoc(eventRef, { status: "Rejected" });
        return { success: true, message: "Event successfully rejected" };
    } catch (error) {
        return { success: false, message: (error as FirebaseError).message };
    }
  };

  // Function to Finalize the event to be posted
  const handleFinalize = async (eventId: string) => {
    try {
        const eventRef = doc(db, "event", eventId);
        await updateDoc(eventRef, { status: "Accepted" });
        return { success: true, message: "Event successfully finalized" };
    } catch (error) {
        return { success: false, message: (error as FirebaseError).message };
    }
  };

  return (
    <EventContext.Provider value={{ events, isLoading, userType, addEvent, setShowForm, showForm, handleSave, handleDelete, handleEdit, 
    handleReject, handleFinalize, creatorId, title, setEventTitle, description, setEventDescription, date, setEventDate }}>
      {children}
    </EventContext.Provider>
  );
}

export const useEvents = () => useContext(EventContext);
