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
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { Event, RSVP, Alumnus } from "@/models/models";
import { useRsvpDetails } from "@/context/RSVPContext"; 
import { NewsLetterProvider, useNewsLetters } from "./NewsLetterContext";
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
  const [numofAttendees, setnumofAttendees] = useState(0);
  const [targetGuests, setTargetGuests] = useState<string[]>([]);
  const [stillAccepting, setStillAccepting] = useState(false);
  const [needSponsorship, setNeedSponsorship] = useState(false);
  const router = useRouter();

  const { rsvpDetails, alumniDetails} = useRsvpDetails(events);
  const { user, alumInfo, isAdmin } = useAuth();
  const { addNewsLetter, deleteNewsLetter } = useNewsLetters();

  useEffect(() => {
    let unsubscribe: (() => void) | null;

    if (user || isAdmin) {
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
  }, [user, isAdmin]);

  const subscribeToEvents = () => {
    setLoading(true);
    const q = query(collection(db, "event"));

    const unsubscribeEvents = onSnapshot(
      q,
      (querySnapshot: any) => {
        const eventList = querySnapshot.docs.map(
          (doc: any) => doc.data() as Event
        );
        setEvents(eventList);
        setLoading(false);
        console.log("Events fetched:", eventList);
      },
      (error) => {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    );
    return unsubscribeEvents;
  };

  const fetchAllAlumni = async () => {
    const alumniSnapshot = await getDocs(collection(db, "alumni"));
    return alumniSnapshot.docs.map(doc => doc.data() as Alumnus);
  };
  
  const addEvent = async (newEvent: Event) => {
    try {
      const docRef = doc(collection(db, "event"));
      newEvent.eventId = docRef.id;
  
      if (isAdmin) {
        newEvent.creatorName = "Admin";
        newEvent.creatorType = "admin";
        newEvent.creatorId = "admin";
      } else {
        const lastName = alumInfo?.lastName || "";
        const firstName = alumInfo?.firstName || "";
        const middleName = alumInfo?.middleName || "";
        const fullName = `${lastName}, ${firstName} ${middleName}`.trim();
  
        newEvent.creatorName = fullName || "Unknown";
        newEvent.creatorType = "alumni";
        newEvent.creatorId = user!.uid;
      }
  
      await setDoc(docRef, newEvent);  // reuse docRef directly
      return { success: true, message: "Event added successfully" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleSave = async (e: React.FormEvent, selectedGuests: string[], inviteType: string) => {
    e.preventDefault();

    const newEvent: Event = {
      datePosted: new Date(),
      title,
      description,
      date,
      time,
      location,
      image,
      inviteType,
      numofAttendees,
      targetGuests: selectedGuests,
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
      setnumofAttendees(0);
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
      deleteNewsLetter(eventId);
      setEvents((prev) => prev.filter((event) => event.eventId !== eventId));
      return { success: true, message: "Event successfully deleted" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleEdit = async (eventId: string, updatedData: Partial<Event>, ) => {
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
    const alums = await fetchAllAlumni();
    console.log("Alumni data:", alums); // Debugging line
    try {
      const eventRef = doc(db, "event", eventId);
      const updatedRSVPIds: string[] = [];
      const updatedTargetGuests: string[] = [];
  
      // Helper function to create a new RSVP
      const createRSVP = async (alumniId: string) => {
        const docRef = doc(collection(db, "RSVP"));
        const newRSVP: RSVP = {
          rsvpId: docRef.id,
          status: "Pending",
          alumniId,
          postId: eventId,
        };
        await setDoc(docRef, newRSVP);
        updatedRSVPIds.push(docRef.id);
        updatedTargetGuests.push(alumniId);
      };
      
      // Find the specific event once
      const event = events.find((e) => e.eventId === eventId);

      if (!event) {
        throw new Error("Event not found.");
      }

      if (event.inviteType === "batch") {
        for (const alumni of alums) {
          const batchYear = alumni.studentNumber?.slice(0, 4).trim();
          if (batchYear && event.targetGuests.includes(batchYear)) {
            await createRSVP(alumni.alumniId);
          }
        }
      } else if (event.inviteType === "alumni") {

        const targetEmails = event.targetGuests.map(email => email.trim().toLowerCase());

        for (const alumni of alums) {
          const alumniEmail = alumni.email?.trim().toLowerCase();
          if (alumniEmail && targetEmails.includes(alumniEmail)) {
            await createRSVP(alumni.alumniId);
          }
        }
      } else if (event.inviteType === "all") {
        for (const alumni of alums) {
          await createRSVP(alumni.alumniId);
        }
      }

      if (event.inviteType !== "all") {
        // Update both rsvps and targetGuests if inviteType is not "all"
        await updateDoc(eventRef, {
          rsvps: updatedRSVPIds,
          targetGuests: updatedTargetGuests,
          status: "Accepted" 
        });
      } else {
        // Only update rsvps if inviteType is "all"
        await updateDoc(eventRef, {
          rsvps: updatedRSVPIds,
          status: "Accepted" 
        });
      }

      await addNewsLetter(eventId, "event");
      
      return { success: true, message: "Event successfully finalized" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleViewEventAdmin = (event: Event) => {
    router.push(`/admin-dashboard/organize-events/${event.eventId}`);
  };

  const handleViewEventAlumni = (event: Event) => {
    router.push(`/events/${event.eventId}`);
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
        numofAttendees,
        setnumofAttendees,
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
