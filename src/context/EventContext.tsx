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
import { uploadImage } from "@/lib/upload";

const EventContext = createContext<any>(null);

export function EventProvider({ children }: { children: React.ReactNode })
{
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [showForm, setShowForm] = useState(false);
  

  // event form fields
  const [title, setEventTitle] = useState("");
  const [description, setEventDescription] = useState("");
  const [date, setEventDate] = useState("");
  const [time, setEventTime] = useState("");
  const [location, setEventLocation] = useState("");
  const [numofAttendees, setnumofAttendees] = useState(0);
  const [targetGuests, setTargetGuests] = useState<string[]>([]);
  const [stillAccepting, setStillAccepting] = useState(false);
  const [needSponsorship, setNeedSponsorship] = useState(false);
  const router = useRouter();

  const { rsvpDetails, alumniDetails} = useRsvpDetails(events);
  const { user, alumInfo, isAdmin } = useAuth();
  const { addNewsLetter } = useNewsLetters();

  const [image, setEventImage] = useState(null);
  const [fileName, setFileName] = useState<string>("");
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  
  useEffect(() =>
  {
    let unsubscribe: (() => void) | null;

    if (user || isAdmin)
    {
      unsubscribe = subscribeToEvents();
    } 
    
    else
    {
      setEvents([]);
      setLoading(false);
    }

    return () =>
    {
      if (unsubscribe)
      {
        unsubscribe();
      }
    };
  }, [user, isAdmin]);

  const subscribeToEvents = () =>
  {
    setLoading(true);
    const q = query(collection(db, "event"));

    const unsubscribeEvents = onSnapshot(
      q,
      (querySnapshot: any) =>
      {
        const eventList = querySnapshot.docs.map(
          (doc: any) => doc.data() as Event
        );
        setEvents(eventList);
        setLoading(false);
        console.log("Events fetched:", eventList);
      },
      
      (error) =>
      {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    );
    return unsubscribeEvents;
  };

  const fetchAllAlumni = async () =>
  {
    const alumniSnapshot = await getDocs(collection(db, "alumni"));
    return alumniSnapshot.docs.map(doc => doc.data() as Alumnus);
  };

  const addEvent = async (newEvent: Event, finalize: boolean, create: boolean) => {
    try {
      let docRef;
  
      if (!finalize || create) {
        docRef = doc(collection(db, "event"));
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
  
        if (!image) {
          setMessage("No image selected.");
          setIsError(true);
          return { success: false, message: "No image provided" };
        }
  
        const uploadResult = await uploadImage(image, `event/${newEvent.eventId}`);
        if (!uploadResult.success) {
          setMessage(uploadResult.result || "Failed to upload image.");
          setIsError(true);
          return { success: false, message: "Image upload failed" };
        }
  
        newEvent.image = uploadResult.url;
  
        await setDoc(docRef, newEvent);
      } else {
        docRef = doc(db, "event", newEvent.eventId);
      }
  
      // If finalizing, embed the RSVP and event update logic here
      if (finalize || create) {
        const alums = await fetchAllAlumni();
        const updatedRSVPIds: string[] = [];
        const updatedTargetGuests: string[] = [];
  
        const createRSVP = async (alumniId: string) => {
          const rsvpRef = doc(collection(db, "RSVP"));
          const newRSVP: RSVP = {
            rsvpId: rsvpRef.id,
            status: "Pending",
            alumniId,
            postId: newEvent.eventId,
          };
          await setDoc(rsvpRef, newRSVP);
          updatedRSVPIds.push(rsvpRef.id);
          updatedTargetGuests.push(alumniId);
        };
  
        if (newEvent.inviteType === "batch") {
          for (const alumni of alums) {
            const batchYear = alumni.studentNumber?.slice(0, 4).trim();
            if (batchYear && newEvent.targetGuests.includes(batchYear)) {
              await createRSVP(alumni.alumniId);
            }
          }
        } else if (newEvent.inviteType === "alumni") {
          const targetEmails = newEvent.targetGuests.map((email) => email.trim().toLowerCase());
          for (const alumni of alums) {
            const email = alumni.email?.trim().toLowerCase();
            if (email && targetEmails.includes(email)) {
              await createRSVP(alumni.alumniId);
            }
          }
        } else if (newEvent.inviteType === "all") {
          for (const alumni of alums) {
            await createRSVP(alumni.alumniId);
          }
        }
  
        // Update the event document
        const updateData: any = {
          rsvps: updatedRSVPIds,
          status: "Accepted",
          datePosted: new Date(),
        };
        if (newEvent.inviteType !== "all") {
          updateData.targetGuests = updatedTargetGuests;
        }
  
        await updateDoc(docRef, updateData);
        await addNewsLetter(newEvent.eventId, "event");
      }
  
      // Cleanup UI
      setIsError(false);
      setMessage(finalize ? "Event finalized!" : "Event and image uploaded successfully!");
      setEventImage(null);
      setPreview(null);
  
      return { success: true, message: "Event processed successfully" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };  

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventImage(file);
      setFileName(file.name); // Store the filename
      setPreview(URL.createObjectURL(file)); //preview
    }
  };

  const handleSave = async (e: React.FormEvent, image: File, selectedGuests: string[], inviteType: string, status: string) => {
    e.preventDefault();

    if (!image) {
      setMessage("No image uploaded.");
      setIsError(true);
      return;
    }

    const newEvent: Event =
    {
      datePosted: new Date(),
      title,
      description,
      date,
      time,
      location,
      image: "",
      inviteType,
      numofAttendees,
      targetGuests: selectedGuests,
      stillAccepting,
      needSponsorship,
      rsvps: [],
      eventId: "",
      status,
      creatorId: "",
      creatorName: "",
      creatorType: "",
      donationDriveId: ""
    };

    const response = await addEvent(newEvent, false, false);

    if (response.success)
    {
      setShowForm(false);
      setEventTitle("");
      setEventDescription("");
      setEventDate("");
      setEventTime("");
      setEventLocation("");
      setEventImage(null);
      setnumofAttendees(0);
      setTargetGuests([]);
      setStillAccepting(false);
      setNeedSponsorship(false);
      return { success: true };
    }
    
    else
    {
      console.error("Error adding event:", response.message);
    }
  };

  const handleDelete = async (eventId: string) =>
  {
    try
    {
      const rsvps = Object.values(rsvpDetails) as RSVP[];
      
      for (const rsvp of rsvps)
      {
        if (rsvp.postId === eventId)
        {
          await deleteDoc(doc(db, "RSVP", rsvp.rsvpId));
        }
      }

      await deleteDoc(doc(db, "event", eventId));
      setEvents((prev) => prev.filter((event) => event.eventId !== eventId));
      return { success: true, message: "Event successfully deleted" };
    } 
    
    catch (error)
    {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleEdit = async (eventId: string, updatedData: Partial<Event>, ) =>
  {
    try
    {
      await updateDoc(doc(db, "event", eventId), updatedData);
      setEvents((prev) =>
        prev.map((event) =>
          event.eventId === eventId ? { ...event, ...updatedData } : event
        )
      );
      return { success: true, message: "Event successfully updated" };
    } 
    
    catch (error)
    {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleReject = async (eventId: string) =>
  {
    try
    {
      const eventRef = doc(db, "event", eventId);
      await updateDoc(eventRef, { status: "Rejected" });
      return { success: true, message: "Event successfully rejected" };
    } 
    
    catch (error)
    {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleViewEventAdmin = (event: Event) =>
  {
    router.push(`/admin-dashboard/organize-events/${event.eventId}`);
  };

  const handleViewEventAlumni = (event: Event) =>
  {
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
        handleViewEventAdmin,
        handleViewEventAlumni,
        handleImageChange,
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
        fileName,
        setFileName,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export const useEvents = () => useContext(EventContext);
