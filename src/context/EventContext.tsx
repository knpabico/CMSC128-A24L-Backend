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
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { Event, RSVP, Alumnus } from "@/models/models";
import { useRsvpDetails } from "@/context/RSVPContext";
import { NewsLetterProvider, useNewsLetters } from "./NewsLetterContext";
import { toastError, toastSuccess } from "@/components/ui/sonner";
import { FirebaseError } from "firebase/app";
import { useRouter } from "next/navigation";
import { uploadImage } from "@/lib/upload";
import { deleteObject, ref, getStorage, listAll } from "firebase/storage";

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
  const [numofAttendees, setnumofAttendees] = useState(0);
  const [targetGuests, setTargetGuests] = useState<string[]>([]);
  const [stillAccepting, setStillAccepting] = useState(false);
  const [needSponsorship, setNeedSponsorship] = useState(false);
  const router = useRouter();

  const { rsvpDetails } = useRsvpDetails();
  const { user, alumInfo, isAdmin } = useAuth();
  const { addNewsLetter, deleteNewsLetter } = useNewsLetters();

  const [image, setEventImage] = useState(null);
  const [fileName, setFileName] = useState<string>("");
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const storage = getStorage();

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
    return alumniSnapshot.docs.map((doc) => doc.data() as Alumnus);
  };

  const addEvent = async (
    newEvent: Event,
    finalize: boolean,
  ) => {
    try {
      let docRef;

      if (!newEvent.eventId) {
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
          newEvent.image = "https://firebasestorage.googleapis.com/v0/b/cmsc-128-a24l.firebasestorage.app/o/default%2Ftemp_event_image.jpg?alt=media&token=49ed44c0-225c-45d3-9bd2-e7e44d0fb2d0"
        } else {
          const uploadResult = await uploadImage(
            image,
            `event/${newEvent.eventId}`
          );
          if (!uploadResult.success) {
            setMessage(uploadResult.result || "Failed to upload image.");
            setIsError(true);
            return { success: false, message: "Image upload failed" };
          }
  
          newEvent.image = uploadResult.url;
        }

        await setDoc(docRef, newEvent);
      }

      // If finalizing, embed the RSVP and event update logic here
      if (finalize) {
        docRef = doc(db, "event", newEvent.eventId);

        const alums = await fetchAllAlumni();
        const updatedTargetGuests: string[] = [];

        const createRSVP = async () => {
          const rsvpRef = doc(collection(db, "RSVP"));

          // Convert updatedTargetGuests (string[]) to the correct object structure
          const alumsData: Record<string, { status: string }> = {};
          updatedTargetGuests.forEach((alumniId) => {
            alumsData[alumniId] = { status: "Pending" };
          });

          const newRSVP: RSVP = {
            rsvpId: rsvpRef.id,
            alums: alumsData,
            postId: newEvent.eventId,
          };

          await setDoc(rsvpRef, newRSVP);
          return rsvpRef.id;
        };

        if (newEvent.inviteType === "batch") {
          for (const alumni of alums) {
            const batchYear = alumni.studentNumber?.slice(0, 4).trim();
            if (batchYear && newEvent.targetGuests.includes(batchYear)) {
              updatedTargetGuests.push(alumni.alumniId);
            }
          }
        } else if (newEvent.inviteType === "alumni") {
          const targetEmails = newEvent.targetGuests.map((email) =>
            email.trim().toLowerCase()
          );
          for (const alumni of alums) {
            const email = alumni.email?.trim().toLowerCase();
            if (email && targetEmails.includes(email)) {
              updatedTargetGuests.push(alumni.alumniId);
            }
          }
        } else if (newEvent.inviteType === "all") {
          for (const alumni of alums) {
            updatedTargetGuests.push(alumni.alumniId);
          }
        }

        const rsvpId = await createRSVP();

        // Update the event document
        const updateData: any = {
          rsvps: rsvpId,
          status: "Accepted",
          datePosted: new Date(),
          numofAttendees: increment(1)
        };

        if (newEvent.inviteType !== "all") {
          updateData.targetGuests = updatedTargetGuests;
        }

        await updateDoc(docRef, updateData);
        await addNewsLetter(newEvent.eventId, "event");
      }

      // Cleanup UI
      setIsError(false);
      setMessage(
        finalize ? "Event finalized!" : "Event and image uploaded successfully!"
      );
      setEventImage(null);
      setPreview(null);

      toastSuccess("Event processed successfully");
      return { success: true, message: "Event processed successfully" };
    } catch (error) {
      toastError("Error adding event");
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleImageChange = (e:any) => {
    const file = e.target.files[0];
    if (file) {
      setEventImage(file);
      setFileName(file.name); // Store the filename
      setPreview(URL.createObjectURL(file)); //preview
    }
  };

  const handleSave = async (
    e: React.FormEvent,
    image: File,
    selectedGuests: string[],
    inviteType: string,
    status: string
  ) => {
    e.preventDefault();

    if (!image) {
      setMessage("No image uploaded.");
      setIsError(true);
      return;
    }

    const newEvent: Event = {
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
      stillAccepting: true,
      needSponsorship: false,
      rsvps: [],
      eventId: "",
      status,
      creatorId: "",
      creatorName: "",
      creatorType: "",
      donationDriveId: "",
    };

    const response = await addEvent(newEvent, false);

    if (response.success) {
      toastSuccess("Event saved successfully!");
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
    } else {
      console.error("Error adding event:", response.message);
      toastError("Error saving event");
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      const rsvps = rsvpDetails as RSVP[];

      for (const rsvp of rsvps) {
        if (rsvp.postId === eventId) {
          await deleteDoc(doc(db, "RSVP", rsvp.rsvpId));
        }
      }

      await deleteDoc(doc(db, "event", eventId));
      setEvents((prev) => prev.filter((event) => event.eventId !== eventId));
      
      await deleteNewsLetter(eventId);
      
      toastSuccess("Event successfully deleted!");
      return { success: true, message: "Event successfully deleted" };
    } catch (error) {
      toastError("Error deleting event");
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const deleteAllImagesInEventFolder = async (eventId: string) => {
    const folderRef = ref(storage, `event/${eventId}`);
  
    try {
      const listResult = await listAll(folderRef);
      const deletionPromises = listResult.items.map((itemRef) => deleteObject(itemRef));
      await Promise.all(deletionPromises);
      console.log(`Deleted all files in event/${eventId}`);
    } catch (err) {
      console.warn("Error deleting old images:", err);
    }
  };

  const handleEdit = async (
    eventId: string,
    updatedData: Partial<Event>,
    newImageFile?: File
  ) => {
    try {
      const currentEvent = events.find((e) => e.eventId === eventId);
      let newImageUrl: string | undefined = undefined;

      console.log("Current Event:", newImageFile);
  
      if (newImageFile && newImageFile !== currentEvent.image) {

        // Delete all files inside the event folder
        await deleteAllImagesInEventFolder(eventId);
  
        // Upload new image
        const uploadResult = await uploadImage(newImageFile, `event/${eventId}`);
        if (!uploadResult.success || !uploadResult.url) {
          

          toastError("Failed to upload new image");
          return { success: false, message: "Failed to upload new image" };
        }
        newImageUrl = uploadResult.url;
      }
  
      // Update Firestore
      const updatePayload = {
        ...updatedData,
        ...(newImageUrl && { image: newImageUrl }),
      };
  
      await updateDoc(doc(db, "event", eventId), updatePayload);
  
      setEvents((prev) =>
        prev.map((event) =>
          event.eventId === eventId ? { ...event, ...updatePayload } : event
        )
      );
  
      toastSuccess("Event updated successfully!");
      return { success: true, message: "Event successfully updated" };
    } catch (error) {
      toastError("Error updating event");
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const handleReject = async (eventId: string) => {
    try {
      const eventRef = doc(db, "event", eventId);
      await updateDoc(eventRef, { status: "Rejected" });
      toastSuccess("Event successfully rejected.");
      return { success: true, message: "Event successfully rejected" };
    } catch (error) {
      toastError("Error rejecting event");
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
        preview,
        setPreview
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export const useEvents = () => useContext(EventContext);
