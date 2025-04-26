"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

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
            if (data.alumni_id) {
              try {
                const alumniSnap = await getDoc(doc(db, "alumni", data.alumni_id));
                if (alumniSnap.exists()) {
                  alumniData[data.alumni_id] = alumniSnap.data();
                }
              } catch (err) {
                console.error(`Error fetching alumni ${data.alumni_id}:`, err);
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

  return { rsvpDetails, alumniDetails, isLoadingRsvp };
}