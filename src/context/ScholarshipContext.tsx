"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  setDoc,
  doc,
  deleteDoc,
  updateDoc,
  Timestamp,
  getDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { FirebaseError } from "firebase/app";
import { Scholarship } from "@/models/models";
import { useNewsLetters } from "./NewsLetterContext";

const ScholarshipContext = createContext<any>(null);

export function ScholarshipProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuth();
  const { addNewsLetter } = useNewsLetters();

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    if (user || isAdmin) {
      unsubscribe = subscribeToScholarships();
    } else {
      setScholarships([]);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, isAdmin]);

  const subscribeToScholarships = () => {
    setLoading(true);
    setError(null);

    // Only fetch active scholarships by default
    const q = query(
      collection(db, "scholarship"),
      where("status", "in", ["active", "closed"])
    );

    // Listener for any changes
    const unsubscribeScholarships = onSnapshot(
      q,
      (querySnapshot) => {
        try {
          const scholarshipList = querySnapshot.docs.map((doc) => {
            const data = doc.data();

            // Convert Firestore Timestamp to JavaScript Date
            return {
              ...data,
              datePosted:
                data.datePosted instanceof Timestamp
                  ? data.datePosted.toDate()
                  : new Date(data.datePosted),
            } as Scholarship;
          });

          setScholarships(scholarshipList);
          setLoading(false);
        } catch (err) {
          console.error("Error processing scholarships data:", err);
          setError("Failed to process scholarships data");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error fetching scholarships:", err);
        setError("Failed to fetch scholarships");
        setLoading(false);
      }
    );

    return unsubscribeScholarships;
  };

  const checkUserRole = async (userId: string) => {
    const adminRef = doc(db, "admin", userId);
    const alumniRef = doc(db, "alumni", userId);

    const [adminSnap, alumniSnap] = await Promise.all([
      getDoc(adminRef),
      getDoc(alumniRef),
    ]);

    if (adminSnap.exists()) {
      return { role: "Admin", name: null };
    } else {
      const alumnusData = alumniSnap.data();
      return { role: "Alumni", name: alumnusData?.name || "Unknown" };
    }
  };

  const addScholarship = async (scholarship: Scholarship) => {
    try {
      const docRef = doc(collection(db, "scholarship"));
      scholarship.scholarshipId = docRef.id;
      scholarship.datePosted = new Date();
      scholarship.status = "active"; // Set default status to active
      await setDoc(docRef, scholarship);
      await addNewsLetter(scholarship.scholarshipId, "scholarship");

      return { success: true, message: "Scholarship added successfully" };
    } catch (error) {
      console.error("Error adding scholarship:", error);
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const updateScholarship = async (
    scholarshipId: string,
    updates: Partial<Scholarship>
  ) => {
    try {
      const scholarshipRef = doc(db, "scholarship", scholarshipId);

      // Convert Date to Timestamp if datePosted is provided in updates
      const firestoreUpdates = { ...updates };
      if (updates.datePosted) {
        firestoreUpdates.datePosted = Timestamp.fromDate(updates.datePosted);
      }

      await updateDoc(scholarshipRef, firestoreUpdates);
      return { success: true, message: "Scholarship updated successfully" };
    } catch (error) {
      console.error("Error updating scholarship:", error);
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  // Soft delete - update status to "deleted" instead of removing from database
  const deleteScholarship = async (scholarshipId: string) => {
    try {
      const scholarshipRef = doc(db, "scholarship", scholarshipId);
      await updateDoc(scholarshipRef, { status: "deleted" });
      return { success: true, message: "Scholarship deleted successfully" };
    } catch (error) {
      console.error("Error deleting scholarship:", error);
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  // Get all scholarships including deleted ones (for admin purposes)
  const getAllScholarships = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "scholarship"));

      return new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            try {
              const scholarshipList = querySnapshot.docs.map((doc) => {
                const data = doc.data();

                return {
                  ...data,
                  datePosted:
                    data.datePosted instanceof Timestamp
                      ? data.datePosted.toDate()
                      : new Date(data.datePosted),
                } as Scholarship;
              });

              setLoading(false);
              resolve(scholarshipList);
              // Unsubscribe after getting the data once
              unsubscribe();
            } catch (err) {
              console.error("Error processing all scholarships data:", err);
              setError("Failed to process all scholarships data");
              setLoading(false);
              reject(err);
              unsubscribe();
            }
          },
          (err) => {
            console.error("Error fetching all scholarships:", err);
            setError("Failed to fetch all scholarships");
            setLoading(false);
            reject(err);
            unsubscribe();
          }
        );
      });
    } catch (error) {
      setLoading(false);
      console.error("Error in getAllScholarships:", error);
      throw error;
    }
  };

  const getScholarshipById = async (
    id: string
  ): Promise<Scholarship | null> => {
    try {
      const scholarshipDoc = doc(db, "scholarship", id);
      const scholarshipSnapshot = await getDoc(scholarshipDoc);

      if (scholarshipSnapshot.exists()) {
        const data = scholarshipSnapshot.data();
        return {
          scholarshipId: scholarshipSnapshot.id,
          title: data.title,
          description: data.description,
          datePosted: data.datePosted.toDate(),
          alumList: data.alumList || [],
          image: data.image,
          status: data.status || "active", // Default to active if status is not present
        };
      }
      return null;
    } catch (err) {
      console.error("Error fetching scholarship by ID:", err);
      throw new Error("Failed to load scholarship details");
    }
  };

  return (
    <ScholarshipContext.Provider
      value={{
        scholarships,
        loading,
        error,
        addScholarship,
        updateScholarship,
        deleteScholarship,
        getScholarshipById,
        getAllScholarships,
      }}
    >
      {children}
    </ScholarshipContext.Provider>
  );
}

export const useScholarship = () => {
  const context = useContext(ScholarshipContext);
  if (!context) {
    throw new Error("useScholarship must be used within a ScholarshipProvider");
  }
  return context;
};
