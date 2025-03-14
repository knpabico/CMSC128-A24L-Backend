"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot, query, setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { Announcement } from "@/models/models";
import { FirebaseError } from "firebase/app";
const AnnouncementContext = createContext<any>(null);

export function AnnouncementProvider({ children }: { children: React.ReactNode }) {
  const [announces, setAnnounce] = useState<any[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    let unsubscribe: (() => void) | null;

    if (user) {
      unsubscribe = subscribeToUsers(); //maglilisten sa firestore
    } else {
        setAnnounce([]); //reset once logged out
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe(); //stops listening after logg out
      }
    };
  }, [user]);

  const addAnnouncement = async (announce: Announcement, userId: string) => {
    try {
        announce.announcementId = userId;
        announce.datePosted = new Date();
        announce.type = [];
      console.log(announce);
      await setDoc(doc(db, "Announcement", userId), announce);
      return { success: true, message: "success" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const subscribeToUsers = () => {
    setLoading(true);
    const q = query(collection(db, "Announcement"));

    //listener for any changes
    const unsubscribeUsers = onSnapshot(
      q,
      (querySnapshot: any) => {
        const userList = querySnapshot.docs.map((doc: any) => doc.data());
        setAnnounce(userList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    );

    return unsubscribeUsers;
  };
  return (
    <AnnouncementContext.Provider value={{ announces, isLoading, addAnnouncement }}>
      {children}
    </AnnouncementContext.Provider>
  );
}

export const useAnnouncement = () => useContext(AnnouncementContext);

/*
References:
https://firebase.google.com/docs/firestore/query-data/listen
*/
