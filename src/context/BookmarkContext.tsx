"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot, query, addDoc, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { Bookmark } from "@/models/models";
import { FirebaseError } from "firebase/app";

const BookmarkContext = createContext<any>(null);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [entries, setEntries] = useState<{ [key: string]: any }>({}); // Holds fetched entry details
  const [isLoading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    if (user) {
      unsubscribe = subscribeToBookmarks();
    } else {
      setBookmarks([]);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  useEffect(() => {
    if (bookmarks.length > 0) fetchEntries();
  }, [bookmarks]);

  const subscribeToBookmarks = () => {
    setLoading(true);
    const q = query(collection(db, "bookmark"), where("alumniId", "==", user?.uid));

    const unsubscribeBookmarks = onSnapshot(
      q,
      (querySnapshot: any) => {
        const bookmarkList = querySnapshot.docs.map((doc: any) => ({
          id: doc.id, // ✅ Add Firestore document ID
          ...doc.data(),
        })) as Bookmark[];
        setBookmarks(bookmarkList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching bookmarks:", error);
        setLoading(false);
      }
    );

    return unsubscribeBookmarks;
  };

  const fetchEntries = async () => {
    const newEntries: { [key: string]: any } = {};
  
    for (const bookmark of bookmarks) {
      if (!bookmark.entryId) continue;
  
      try {
        let collectionName: string;
  
        // Determine the Firestore collection based on the bookmark type
        switch (bookmark.type) {
          case "donation_drive":
            collectionName = "donation_drive";
            break;
          case "Announcement":
            collectionName = "Announcement";
            break;
          case "job_offering":
            collectionName = "job_offering"; // Add the new collection name
            break;
          default:
            console.warn(`Unsupported bookmark type: ${bookmark.type}`);
            continue;
        }
  
        const docRef = doc(db, collectionName, bookmark.entryId);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          newEntries[bookmark.entryId] = docSnap.data();
        } else {
          console.warn(`Entry not found: ${bookmark.entryId} (Type: ${bookmark.type})`);
        }
      } catch (error) {
        console.error(`Error fetching ${bookmark.entryId}:`, error);
      }
    }
  
    setEntries(newEntries);
  };

  const addBookmark = async (entryId: string, type: string) => {
    console.log("addBookmark called with:", entryId, type);
    if (!user) {
      console.error("User not logged in");
      return;
    }

    try {
      console.log(`Attempting to bookmark: ${entryId} (${type})`);
      await addDoc(collection(db, "bookmark"), {
        alumniId: user.uid,
        entryId,
        type,
      });
      console.log(`Bookmark added successfully: ${entryId} (${type})`);
      return { success: true, message: "success" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks, entries, isLoading, addBookmark }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export const useBookmarks = () => useContext(BookmarkContext);