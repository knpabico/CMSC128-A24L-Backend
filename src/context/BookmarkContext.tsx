"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot, query, addDoc, where, doc, getDoc, deleteDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { Bookmark } from "@/models/models";
import { FirebaseError } from "firebase/app";

// Define types for context values
type BookmarkContextType = {
  bookmarks: Bookmark[];
  entries: { [key: string]: any };
  isLoading: boolean;
  addBookmark: (entryId: string, type: string) => Promise<{ success: boolean; message: string }>;
  removeBookmark: (bookmarkId: string) => Promise<{ success: boolean; message: string }>;
  toggleBookmark: (entryId: string, type: string) => Promise<{ success: boolean; message: string }>;
  isBookmarked: (entryId: string) => boolean;
  getBookmarkId: (entryId: string) => string | null;
  filteredBookmarks: (filterType: string) => Bookmark[];
  sortedBookmarks: (bookmarks: Bookmark[], sortOption: string) => Bookmark[];
};

const BookmarkContext = createContext<BookmarkContextType | null>(null);

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [entries, setEntries] = useState<{ [key: string]: any }>({});
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

  // Subscribe to user's bookmarks in Firestore
  const subscribeToBookmarks = () => {
    setLoading(true);
    const q = query(collection(db, "bookmark"), where("alumniId", "==", user?.uid));

    const unsubscribeBookmarks = onSnapshot(
      q,
      (querySnapshot: any) => {
        const bookmarkList = querySnapshot.docs.map((doc: any) => ({
          id: doc.id,
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

  // Fetch all referenced entries from their respective collections
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
          case "announcement":
            collectionName = "announcement";
            break;
          case "job_offering":
            collectionName = "job_offering";
            break;
          case "event":
            collectionName = "event";
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

  // Check if a bookmark already exists to avoid duplicates
  const getBookmarkId = (entryId: string): string | null => {
    const bookmark = bookmarks.find(b => b.entryId === entryId);
    return bookmark ? bookmark.bookmarkId : null;
  };

  // Check if an entry is bookmarked
  const isBookmarked = (entryId: string): boolean => {
    return bookmarks.some(b => b.entryId === entryId);
  };

  // Add a new bookmark (with duplication check)
  const addBookmark = async (entryId: string, type: string) => {
    if (!user) {
      return { success: false, message: "User not logged in" };
    }

    // Check if already bookmarked
    if (isBookmarked(entryId)) {
      return { success: false, message: "Item already bookmarked" };
    }

    try { // Add bookmark to Firestore with its attributes 
      await addDoc(collection(db, "bookmark"), {
        alumniId: user.uid,
        entryId,
        type,
        timestamp: serverTimestamp(),
      });
      return { success: true, message: "Bookmark added successfully" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  // Remove a bookmark
  const removeBookmark = async (bookmarkId: string) => {
    if (!user) {
      return { success: false, message: "User not logged in" };
    }

    try {
      await deleteDoc(doc(db, "bookmark", bookmarkId));
      return { success: true, message: "Bookmark removed successfully" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  // Toggle bookmark (add if not bookmarked, remove if bookmarked)
  const toggleBookmark = async (entryId: string, type: string) => {
    const bookmarkId = getBookmarkId(entryId);
    
    if (bookmarkId) {
      // Item is already bookmarked, remove it
      return await removeBookmark(bookmarkId);
    } else {
      // Item is not bookmarked, add it
      return await addBookmark(entryId, type);
    }
  };

  // Filter bookmarks by type
  const filteredBookmarks = (filterType: string) => {
    if (filterType === "all") return bookmarks;
    
    return bookmarks.filter((bookmark) => {
      if (filterType === "events" && bookmark.type === "event") return true;
      if (filterType === "donation_drive" && bookmark.type === "donation_drive") return true;
      if (filterType === "announcements" && bookmark.type === "announcement") return true;
      if (filterType === "job_offer" && bookmark.type === "job_offering") return true;
      return false;
    });
  };

  // Sort bookmarks by different criteria
  const sortedBookmarks = (bookmarksToSort: Bookmark[], sortOption: string) => {
    return [...bookmarksToSort].sort((a, b) => {
      const entryA = entries[a.entryId];
      const entryB = entries[b.entryId];

      if (!entryA || !entryB) return 0;

      switch (sortOption) {
        case "oldest":
          return entryA.datePosted?.toDate().getTime() - entryB.datePosted?.toDate().getTime();
        case "latest":
          return entryB.datePosted?.toDate().getTime() - entryA.datePosted?.toDate().getTime();
        case "bookmark_oldest":
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case "bookmark_latest":
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case "alphabetical":
          const getTitle = (entry: any) => {
            return entry.campaignName || entry.title || entry.position || ""; // Ensures correct field selection
          };
          const titleA = getTitle(entryA).toLowerCase();
          const titleB = getTitle(entryB).toLowerCase();
          return titleA.localeCompare(titleB);
        default:
          return 0;
      }
    });
  };

  // Context value
  const contextValue = {
    bookmarks,
    entries,
    isLoading,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    getBookmarkId,
    filteredBookmarks,
    sortedBookmarks,
  };

  return (
    <BookmarkContext.Provider value={contextValue}>
      {children}
    </BookmarkContext.Provider>
  );
}

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error("useBookmarks must be used within a BookmarkProvider");
  }
  return context;
};