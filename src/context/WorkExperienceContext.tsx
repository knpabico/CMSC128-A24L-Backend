"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  addDoc,
  where,
  doc,
  getDoc,
  deleteDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { WorkExperience } from "@/models/models";
import { FirebaseError } from "firebase/app";

const WorkExperienceContext = createContext<any>(null);

export function WorkExperienceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userWorkExperience, setUserWorkExperience] = useState<
    WorkExperience[]
  >([]);
  const [allWorkExperience, setAllWorkExperience] = useState<WorkExperience[]>(
    []
  );
  const [isLoading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    let unsubscribe: (() => void) | null;
    let unsubscribeUser: (() => void) | null;

    if (user) {
      unsubscribe = subscribeToWorkExperience(); //for work experience of all users
      unsubscribeUser = subscribeToUserWorkExperience(); //for work experience of current user
    } else {
      setUserWorkExperience([]); //reset current user's work experience
      setAllWorkExperience([]); //reset all work experience
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
      return { success: true, message: "success" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const editWorkExperience = async (workExperienceEntry) => {
    try {
      console.log(workExperienceEntry);
      const workExpRef = doc(
        db,
        "work_experience",
        workExperienceEntry.workExperienceId
      );
      await updateDoc(workExpRef, workExperienceEntry);
      return { success: true, message: "Edited Successfully" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const deleteWorkExperience = async (id) => {
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
        setUserWorkExperience(userWorkExperienceList);
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
      }}
    >
      {children}
    </WorkExperienceContext.Provider>
  );
}

export const useWorkExperience = () => useContext(WorkExperienceContext);
