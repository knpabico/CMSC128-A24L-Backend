"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  addDoc,
  where,
  doc,
  getDocs,
  deleteDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { Education } from "@/models/models";
import { FirebaseError } from "firebase/app";

const EducationContext = createContext<any>(null);

export function EducationProvider({ children }: { children: React.ReactNode }) {
  const [userEducation, setUserEducation] = useState<Education[]>([]);

  const [selectedAlumniId, setSelectedAlumniId] = useState<string | null>(null);
  const [selectedAlumEducation, setSelectedAlumEducation] = useState<
    Education[]
  >([]);

  const [allEducation, setAllEducation] = useState<Education[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    let unsubscribe: (() => void) | null;
    let unsubscribeUser: (() => void) | null;

    if (user) {
      unsubscribe = subscribeToEducation(); //for work experience of all users
      unsubscribeUser = subscribeToUserEducation(); //for work experience of current user
    } else {
      setUserEducation([]); //reset current user's work experience
      setAllEducation([]); //reset all work experience
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }

      if (unsubscribeUser) {
        unsubscribeUser();
      }
    };
  }, [user]);

  //sort by year graduated
  //   const sortEducationList = (experienceList: Education[]): Education[] => {
  //     const sortedList = [...experienceList]; // Copy to avoid modifying the original

  //     // Sort by startingDate (oldest to newest)
  //     sortedList.sort((a, b) => a.yearGraduated.seconds - b.startingDate.seconds);
  //     // Log the sorted list to the console
  //     console.log("Sorted Work Experience List:", sortedList);

  //     return sortedList;
  //   };
  //   alumniId: string;
  //   university: string;
  //   type: string;
  //   yearGraduated: string;
  //   major: string;
  //function for adding work experience
  const addEducation = async (EducationEntry: Education, userId: string) => {
    try {
      const newDocRef = doc(collection(db, "education"));
      EducationEntry.educationId = newDocRef.id;
      EducationEntry.alumniId = userId;
      await setDoc(newDocRef, EducationEntry);
      return { success: true, message: "success" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  //function to fetch the working experience of the clicked alumni
  const fetchEducation = async (alumniId: string): Promise<Education[]> => {
    setLoading(true);
    setSelectedAlumniId(alumniId);

    try {
      const q = query(
        collection(db, "education"),
        where("alumniId", "==", alumniId)
      );

      const querySnapshot = await getDocs(q);

      console.log(
        "firestore Data:",
        querySnapshot.docs.map((doc) => doc.data())
      );

      const EducationList: Education[] = querySnapshot.docs.map(
        (doc) => doc.data() as Education
      );

      console.log("Fetched Work Experience:", EducationList);
      // sortExperienceList(EducationList);
      setSelectedAlumEducation(EducationList);
      return EducationList;
    } catch (error) {
      console.error("Error fetching work experience:", error);
      setSelectedAlumEducation([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const editEducation = async (EducationEntry: { EducationId: string }) => {
    try {
      console.log(EducationEntry);
      const workExpRef = doc(db, "education", EducationEntry.EducationId);
      await updateDoc(workExpRef, EducationEntry);
      return { success: true, message: "Edited Successfully" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const deleteEducation = async (id: string) => {
    try {
      await deleteDoc(doc(db, "education", id));
      return { success: true, message: `Successfully Deleted!` };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  //for fetching work experience of all users
  const subscribeToEducation = () => {
    setLoading(true);
    const q = query(collection(db, "education"));

    //listener for any changes
    const unsubscribeAllEducation = onSnapshot(
      q,
      (querySnapshot: any) => {
        const allEducationList = querySnapshot.docs.map(
          (doc: any) => doc.data() as Education
        );

        setAllEducation(allEducationList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching work experience of all users:", error);
        setLoading(false);
      }
    );

    return unsubscribeAllEducation;
  };

  //for fetching work experience of current user
  const subscribeToUserEducation = () => {
    setLoading(true);
    const q = query(
      collection(db, "education"),
      where("alumniId", "==", user?.uid)
    );

    //listener for any changes
    const unsubscribeUserEducation = onSnapshot(
      q,
      (querySnapshot: any) => {
        const userEducationList = querySnapshot.docs.map(
          (doc: any) => doc.data() as Education
        );
        // sortExperienceList(userEducationList);

        setUserEducation(userEducationList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching work experience of current user:", error);
        setLoading(false);
      }
    );

    return unsubscribeUserEducation;
  };

  return (
    <EducationContext.Provider
      value={{
        userEducation,
        allEducation,
        isLoading,
        addEducation,
        deleteEducation,
        editEducation,
        fetchEducation,
        setUserEducation
      }}
    >
      {children}
    </EducationContext.Provider>
  );
}

export const useEducation = () => useContext(EducationContext);
