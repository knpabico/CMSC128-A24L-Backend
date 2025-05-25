"use client";

import { createContext, useContext, useState, useEffect } from "react";

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, 
  collection,
  onSnapshot,
  increment,
  query} from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { useAuth } from "./AuthContext";
import { useEvents } from "./EventContext";
import { RSVP } from "@/models/models";
import { toastError, toastSuccess } from "@/components/ui/sonner";

const RsvpContext = createContext<any>({
  rsvpDetails: [], 
  isLoadingRsvp: false,
  handleAlumAccept: () => {},
  handleAlumReject: () => {},
});

export function RsvpProvider({ children }: { children: React.ReactNode }) {
  const [rsvpDetails, setRsvpDetails] = useState<any[]>([]);
  const [isLoadingRsvp, setIsLoadingRsvp] = useState<boolean>(false);
  const { user, isAdmin } = useAuth();
  const { events } = useEvents();

  useEffect(() => {
    let unsubscribe: (() => void) | null;

    if (user || isAdmin) {
      unsubscribe = subscribeToRSVP();
    } else {
      setRsvpDetails([]);
      setIsLoadingRsvp(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, isAdmin]);

  const subscribeToRSVP = () => {
    setIsLoadingRsvp(true);
    const q = query(collection(db, "RSVP"));

    const unsubscribeEvents = onSnapshot(
      q,
      (querySnapshot: any) => {
        const rsvpData = querySnapshot.docs.map(
          (doc: any) => doc.data() as RSVP
        );
        setRsvpDetails(rsvpData);
        setIsLoadingRsvp(false);
        console.log("RSVP fetched:", rsvpData);
      },

      (error) => {
        console.error("Error fetching events:", error);
        setIsLoadingRsvp(false);
      }
    );
    return unsubscribeEvents;
  };

  const handleAlumAccept = async (eventId: string, alumniId: string) => {
    try {
      const rsvp = rsvpDetails.find(
        (r: any) => r.postId === eventId && Object.keys(r.alums || {}).includes(alumniId)
      );

      if (rsvp) {
        const rsvpRef = doc(db, "RSVP", rsvp.rsvpId);
        await updateDoc(rsvpRef, {
          [`alums.${alumniId}`]: { status: "Accepted" }
        });
        console.log(`RSVP ${rsvp.id} updated to Accepted`);
        toastSuccess("RSVP successfully accepted")

        const event = events.find(
          (e: any) => e.eventId === eventId && e.rsvps === rsvp.rsvpId
        );
  
        if (event) {
          const eventRef = doc(db, "event", event.eventId);
          await updateDoc(eventRef, {
            numofAttendees: increment(1)
          });
        }
        
        return { success: true, message: "RSVP successfully accepted" };
      } else {
        toastError("RSVP not found")
        return { success: false, message: "RSVP not found" };
      }
  
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };
  
  
  const handleAlumReject = async (eventId: string, alumniId: string) => {
    try {
      const rsvp = rsvpDetails.find(
        (r: any) => r.postId === eventId && Object.keys(r.alums || {}).includes(alumniId)
      );
  
      if (rsvp) {
        const rsvpRef = doc(db, "RSVP", rsvp.rsvpId);
        await updateDoc(rsvpRef, {
          [`alums.${alumniId}`]: { status: "Rejected" }
        });
        console.log(`RSVP ${rsvp.id} updated to Rejected`);
        toastSuccess("RSVP successfully rejected");
        return { success: true, message: "RSVP successfully rejected" };
      } else {
        toastError("RSVP not found")
        return { success: false, message: "RSVP not found" };
      }
  
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  return (
    <RsvpContext.Provider value={{ rsvpDetails, setRsvpDetails, isLoadingRsvp, setIsLoadingRsvp, handleAlumAccept, handleAlumReject }}>
      {children}
    </RsvpContext.Provider>
  );
}

export const useRsvpDetails = () => useContext(RsvpContext);