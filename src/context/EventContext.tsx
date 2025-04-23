"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { Event, Alumnus } from "@/models/models";
import { FirebaseError } from "firebase/app";
import { useRouter } from 'next/navigation';

const EventContext = createContext<any>(null);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState(false);

  // event form fields
  const [title, setEventTitle] = useState("");
  const [description, setEventDescription] = useState("");
  const [date, setEventDate] = useState("");
  const [time, setEventTime] = useState("");
  const [location, setEventLocation] = useState("");
  const [image, setEventImage] = useState("");
  const [numOfAttendees, setNumOfAttendees] = useState(0);
  const [targetGuests, setTargetGuests] = useState<string[]>([]);
  const [stillAccepting, setStillAccepting] = useState(false);
  const [needSponsorship, setNeedSponsorship] = useState(false);
  const router = useRouter();

  const { user } = useAuth();

  useEffect(() => {
    let unsubscribe: (() => void) | null;

    if (user) {
      unsubscribe = subscribeToEvents();
    } else {
      setEvents([]);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const subscribeToEvents = () => {
    setLoading(true);
    const q = query(collection(db, "event"));

    const unsubscribeEvents = onSnapshot(
      q,
      (querySnapshot: any) => {
        const eventList = querySnapshot.docs.map((doc: any) => doc.data() as Event);
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

    const [adminSnap, alumniSnap] = await Promise.all([
      getDoc(adminRef),
      getDoc(alumniRef),
    ]);

    if (adminSnap.exists()) {
      return { role: "Admin", name: null };
    } else {
      const alumnusData = alumniSnap.data();
      return { role: "Alumni", name: alumnusData?.name || "Unknown" };
    }
  };

  const addEvent = async (newEvent: Event) => {
    const { role, name } = await checkUserRole(user.uid);
    try {
      const docRef = doc(collection(db, "event"));
      newEvent.eventId = docRef.id;
      newEvent.status = role === "Alumni" ? "Pending" : "Accepted";
      newEvent.creatorId = user.uid;
      newEvent.creatorName = role === "Alumni" ? name : "Admin";
      newEvent.creatorType = role;

      await setDoc(doc(db, "event", docRef.id), newEvent);
      return { success: true, message: "Event added successfully" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const newEvent: Event = {
      datePosted: new Date(),
      title,
      description,
      date,
      time,
      location,
      image,
      numOfAttendees,
      targetGuests,
      stillAccepting,
      needSponsorship,
      rsvps: [],
      eventId: "",
      status: "Pending",
      creatorId: "",
      creatorName: "",
      creatorType: "",
    };

    const response = await addEvent(newEvent);

    if (response.success) {
      setShowForm(false);
      setEventTitle("");
      setEventDescription("");
      setEventDate("");
      setEventTime("");
      setEventLocation("");
      setEventImage("");
      setNumOfAttendees(0);
      setTargetGuests([]);
      setStillAccepting(false);
      setNeedSponsorship(false);
    } else {
      console.error("Error adding event:", response.message);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      await deleteDoc(doc(db, "event", eventId));
      setEvents((prev) => prev.filter((event) => event.eventId !== eventId));
      return { success: true, message: "Event successfully deleted" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleEdit = async (eventId: string, updatedData: Partial<Event>) => {
    try {
      await updateDoc(doc(db, "event", eventId), updatedData);
      setEvents((prev) =>
        prev.map((event) =>
          event.eventId === eventId ? { ...event, ...updatedData } : event
        )
      );
      return { success: true, message: "Event successfully updated" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleReject = async (eventId: string) => {
    try {
      const eventRef = doc(db, "event", eventId);
      await updateDoc(eventRef, { status: "Rejected" });
      return { success: true, message: "Event successfully rejected" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleFinalize = async (eventId: string) => {
    try {
      const eventRef = doc(db, "event", eventId);
      await updateDoc(eventRef, { status: "Accepted" });
      return { success: true, message: "Event successfully finalized" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleViewEventAdmin = (event: Event) => {
    router.push(`/admin-dashboard/organize-events/${event.eventId}`);
  };

  const handleViewEventAlumni = (event: Event) => {
    router.push(`/admin-dashboard/organize-events/${event.eventId}`);
  };

  return (
    <EventContext.Provider
      value={{
        events,
        isLoading,
        addEvent,
        setShowForm,
        showForm,
        handleSave,
        handleDelete,
        handleEdit,
        handleReject,
        handleFinalize,
        handleViewEventAdmin,
        handleViewEventAlumni,
        title,
        setEventTitle,
        description,
        setEventDescription,
        date,
        setEventDate,
        time,
        setEventTime,
        location,
        setEventLocation,
        image,
        setEventImage,
        numOfAttendees,
        setNumOfAttendees,
        targetGuests,
        setTargetGuests,
        stillAccepting,
        setStillAccepting,
        needSponsorship,
        setNeedSponsorship,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export const useEvents = () => useContext(EventContext);