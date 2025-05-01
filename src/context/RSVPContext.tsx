"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";

export function useRsvpDetails(events) {
  const [rsvpDetails, setRsvpDetails] = useState({});
  const [alumniDetails, setAlumniDetails] = useState({});
  const [isLoadingRsvp, setIsLoadingRsvp] = useState(false);

  useEffect(() => {
    async function fetchRsvpDetails() {
      if (!events || !events.length) return;
      
      setIsLoadingRsvp(true);
      
      const rsvpData = {};
      const alumniData = {};
      
      // Collect all unique RSVP IDs from all events
      const allRsvpIds = [];
      events.forEach(event => {
        if (!event.rsvps) return;
        event.rsvps.forEach(rsvpId => {
          if (!allRsvpIds.includes(rsvpId)) {
            allRsvpIds.push(rsvpId);
          }
        });
      });
      
      // Process RSVPs sequentially with async/await
      for (const rsvpId of allRsvpIds) {
        try {
          const docSnap = await getDoc(doc(db, "RSVP", rsvpId));
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            rsvpData[rsvpId] = data;
            
            // Fetch alumni details if alumniId exists
            if (data.alumniId) {
              try {
                const alumniSnap = await getDoc(doc(db, "alumni", data.alumniId));
                if (alumniSnap.exists()) {
                  alumniData[data.alumniId] = alumniSnap.data();
                }
              } catch (err) {
                console.error(`Error fetching alumni ${data.alumniId}:`, err);
              }
            }
          } else {
            console.log(`RSVP with ID ${rsvpId} does not exist`);
            rsvpData[rsvpId] = { error: "RSVP not found" };
          }
        } catch (err) {
          console.error(`Error fetching RSVP ${rsvpId}:`, err);
          rsvpData[rsvpId] = { error: "Error loading RSVP" };
        }
      }
      
      setRsvpDetails(rsvpData);
      setAlumniDetails(alumniData);
      setIsLoadingRsvp(false);
    }
    
    fetchRsvpDetails();
  }, [events]);

  const handleAlumAccept = async (eventId: string, alumniId: string) => {
    try {
      let rsvpFound = false;
  
      for (const rsvpId in rsvpDetails) {
        const rsvp = rsvpDetails[rsvpId];
  
        if (rsvp.alumniId === alumniId && rsvp.postId === eventId) {
          const rsvpRef = doc(db, "RSVP", rsvpId);
          await updateDoc(rsvpRef, { status: "Accepted" });
          console.log(`RSVP ${rsvpId} updated to Accepted`); // Log confirmation
          rsvpFound = true;
          break;
        }
      }
  
      if (rsvpFound) {
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
      let rsvpFound = false;  // Flag to track if RSVP is found
  
      // Loop through RSVP details
      for (const rsvpId in rsvpDetails) {
        const rsvp = rsvpDetails[rsvpId];  // Assuming rsvpDetails is an object of RSVPs
  
        if (rsvp.alumniId === alumniId && rsvp.postId === eventId) {
          const rsvpRef = doc(db, "RSVP", rsvpId); // Dynamically create the reference for each RSVP
          await updateDoc(rsvpRef, { status: "Rejected" });
          rsvpFound = true; // Mark as found
          break;  // Exit the loop once the RSVP is found and updated
        }
      }
  
      if (rsvpFound) {
        return { success: true, message: "RSVP successfully rejected" };
      } else {
        return { success: false, message: "RSVP not found" };
      }
  
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  return { rsvpDetails, alumniDetails, isLoadingRsvp, handleAlumAccept, handleAlumReject };
}