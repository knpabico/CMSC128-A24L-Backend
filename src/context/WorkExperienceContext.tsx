"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  getDocs,
  deleteDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { WorkExperience } from "@/models/models";
import { FirebaseError } from "firebase/app";
import { toast } from "sonner";

const WorkExperienceContext = createContext<any>(null);

export function WorkExperienceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userWorkExperience, setUserWorkExperience] = useState<
    WorkExperience[]
  >([]);

  const [selectedAlumniId, setSelectedAlumniId] = useState<string | null>(null);
  const [selectedAlumWorkExperience, setSelectedAlumWorkExperience] = useState<
    WorkExperience[]
  >([]);

  const [allWorkExperience, setAllWorkExperience] = useState<WorkExperience[]>(
    []
  );
  const [isLoading, setLoading] = useState<boolean>(false);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    console.log("useEffect - user:", user, "isAdmin:", isAdmin);

    if (user === null && isAdmin === null) return; // wait for auth to initialize

    let unsubscribe: (() => void) | null = null;

    if (isAdmin) {
      console.log("Admin detected - subscribing to all work experience");
      unsubscribe = subscribeToWorkExperience(); // Admin sees all
    } else if (user) {
      console.log("Regular user detected - subscribing to own work experience");
      unsubscribe = subscribeToUserWorkExperience(); // Regular user sees own
    } else {
      console.log("No user logged in - resetting work experience state");
      setUserWorkExperience([]);
      setAllWorkExperience([]);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, isAdmin]);

  const sortExperienceList = (
    experienceList: WorkExperience[]
  ): WorkExperience[] => {
    const sortedList = [...experienceList]; // Copy to avoid modifying the original

    // Sort by startingDate (oldest to newest)
    sortedList.sort((a, b) => {
      const currentYear = new Date().getFullYear();

      const startA =
        a.endYear === "present" ? 100000 : parseInt(a.endYear);
      const startB =
        b.endYear === "present" ? 100000 : parseInt(b.endYear);

      return startB - startA;
    });
    // Log the sorted list to the console
    console.log("Sorted Work Experience List:", sortedList);

    return sortedList;
  };

  //function for adding work experience
  const addWorkExperience = async (
    workExperienceEntry: WorkExperience,
    userId: string
  ) => {
    try {
      const newDocRef = doc(collection(db, "work_experience"));
      workExperienceEntry.workExperienceId = newDocRef.id;
      workExperienceEntry.alumniId = userId;
      await setDoc(newDocRef, workExperienceEntry);

      toast.success("Work added successfully!");
      return {
        success: true,
        message: "success",
        workExperienceId: newDocRef.id,
      };
    } catch (error) {
      toast.error((error as FirebaseError).message);
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  //function to fetch the working experience of the clicked alumni
  const fetchWorkExperience = async (
    alumniId: string
  ): Promise<WorkExperience[]> => {
    setLoading(true);
    setSelectedAlumniId(alumniId);

    try {
      const q = query(
        collection(db, "work_experience"),
        where("alumniId", "==", alumniId)
      );
      const querySnapshot = await getDocs(q);

      console.log(
        "firestore Data:",
        querySnapshot.docs.map((doc) => doc.data())
      );

      const workExperienceList: WorkExperience[] = querySnapshot.docs.map(
        (doc) => doc.data() as WorkExperience
      );

      console.log("Fetched Work Experience:", workExperienceList);
      // sortExperienceList(workExperienceList);
      setSelectedAlumWorkExperience(sortExperienceList(workExperienceList));
      return sortExperienceList(workExperienceList);
    } catch (error) {
      console.error("Error fetching work experience:", error);
      setSelectedAlumWorkExperience([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const editWorkExperience = async (workExperienceEntry:any) => {
    try {
      console.log(workExperienceEntry);
      const workExpRef = doc(
        db,
        "work_experience",
        workExperienceEntry.workExperienceId
      );
      await updateDoc(workExpRef, workExperienceEntry);
      toast.success("Work updated successfully!");
      return { success: true, message: "Edited Successfully" };
    } catch (error) {
      toast.error((error as FirebaseError).message);
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const deleteWorkExperience = async (id: string) => {
    try {
      await deleteDoc(doc(db, "work_experience", id));
      return { success: true, message: `Successfully Deleted!` };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  //for fetching work experience of all users
  const subscribeToWorkExperience = () => {
    setLoading(true);
    const q = query(collection(db, "work_experience"));

    //listener for any changes
    const unsubscribeAllWorkExperience = onSnapshot(
      q,
      (querySnapshot: any) => {
        const allWorkExperienceList = querySnapshot.docs.map(
          (doc: any) => doc.data() as WorkExperience
        );

        setAllWorkExperience(allWorkExperienceList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching work experience of all users:", error);
        setLoading(false);
      }
    );

    return unsubscribeAllWorkExperience;
  };

  //for fetching work experience of current user
  const subscribeToUserWorkExperience = () => {
    setLoading(true);
    const q = query(
      collection(db, "work_experience"),
      where("alumniId", "==", user?.uid)
    );

    //listener for any changes
    const unsubscribeUserWorkExperience = onSnapshot(
      q,
      (querySnapshot: any) => {
        const userWorkExperienceList = querySnapshot.docs.map(
          (doc: any) => doc.data() as WorkExperience
        );
        // sortExperienceList(userWorkExperienceList);

        setUserWorkExperience(sortExperienceList(userWorkExperienceList));
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching work experience of current user:", error);
        setLoading(false);
      }
    );

    return unsubscribeUserWorkExperience;
  };

  return (
    <WorkExperienceContext.Provider
      value={{
        userWorkExperience,
        allWorkExperience,
        isLoading,
        addWorkExperience,
        deleteWorkExperience,
        editWorkExperience,
        fetchWorkExperience,
      }}
    >
      {children}
    </WorkExperienceContext.Provider>
  );
}

export const useWorkExperience = () => useContext(WorkExperienceContext);
