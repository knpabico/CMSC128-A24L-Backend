"use client";

import { createContext, useContext, useState, useEffect } from "react";

import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, 
  collection,
  onSnapshot,
  query} from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import { useAuth } from "./AuthContext";
import { RSVP } from "@/models/models";

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
        (r: any) => r.alumniId === alumniId && r.postId === eventId
      );
  
      if (rsvp) {
        const rsvpRef = doc(db, "RSVP", rsvp.id);
        await updateDoc(rsvpRef, {
          [`alums.${alumniId}`]: { status: "Accepted" }
        });
        console.log(`RSVP ${rsvp.id} updated to Accepted`);
        return { success: true, message: "RSVP successfully accepted" };
      } else {
        return { success: false, message: "RSVP not found" };
      }
  
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };
  
  
  const handleAlumReject = async (eventId: string, alumniId: string) => {
    try {
      const rsvp = rsvpDetails.find(
        (r: any) => r.postId === eventId && r.alums?.includes(alumniId)
      );
  
      if (rsvp) {
        const rsvpRef = doc(db, "RSVP", rsvp.id);
        await updateDoc(rsvpRef, {
          [`alums.${alumniId}`]: { status: "Rejected" }
        });
        console.log(`RSVP ${rsvp.id} updated to Rejected`);
        return { success: true, message: "RSVP successfully rejected" };
      } else {
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