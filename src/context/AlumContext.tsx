"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  setDoc,
  doc,
  where,
  getDocs,
  orderBy,
  addDoc,
  updateDoc,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { Alumnus, Career, Education } from "@/models/models";
import { FirebaseError } from "firebase-admin/app";
import { sendEmailTemplateForNewsletter } from "@/lib/emailTemplate";
import { sendEmailTemplate } from "@/lib/emailTemplate";
import { toastError, toastSuccess } from "@/components/ui/sonner";
const AlumContext = createContext<any>(null);

export function AlumProvider({ children }: { children: React.ReactNode }) {
  const [alums, setAlums] = useState<Alumnus[]>([]);
  const [activeAlums, setActiveAlums] = useState<Alumnus[]>([]);
  const [myCareer, setCareer] = useState<Career[]>([]);
  const [myEducation, setEducation] = useState<Education[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    let unsubscribe: (() => void) | null;
    let unsubscribeActive: (() => void) | null;
    let unsubscribeCareer: (() => void) | null;
    let unsubscribeEducation: (() => void) | null;

    if (user) {
      unsubscribe = subscribeToUsers(); //maglilisten sa firestore
      unsubscribeCareer = subscribeToMyCareer();
      unsubscribeEducation = subscribeToMyEducation();
    } else if (isAdmin) {
      unsubscribe = subscribeToUsers();
      unsubscribeActive = subscribeToActiveUsers();
    } else {
      setAlums([]); //reset once logged out
      setActiveAlums([]);
      setCareer([]);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe(); //stops listening after logg out
      }
      if (unsubscribeActive) {
        unsubscribeActive();
      }

      if (unsubscribeCareer) {
        unsubscribeCareer();
      }

      if (unsubscribeEducation) {
        unsubscribeEducation();
      }
    };
  }, [user, isAdmin]);

  //for fetching career of current user
  const subscribeToMyCareer = () => {
    setLoading(true);
    const q = query(
      collection(db, "career"),
      where("alumniId", "==", user?.uid)
    );

    //listener for any changes
    const unsubscribeToMyCareer = onSnapshot(
      q,
      (querySnapshot: any) => {
        const careerList = querySnapshot.docs.map(
          (doc: any) => doc.data() as Career
        );
        setCareer(careerList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching career of current user:", error);
        setLoading(false);
      }
    );

    return unsubscribeToMyCareer;
  };

  //for fetching education of current user
  const subscribeToMyEducation = () => {
    setLoading(true);
    const q = query(
      collection(db, "education"),
      where("alumniId", "==", user?.uid),
      orderBy("yearGraduated", "desc")
    );

    //listener for any changes
    const unsubscribeToMyEducation = onSnapshot(
      q,
      (querySnapshot: any) => {
        const educationList = querySnapshot.docs.map(
          (doc: any) => doc.data() as Education
        );
        setEducation(educationList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching education of current user:", error);
        setLoading(false);
      }
    );

    return unsubscribeToMyEducation;
  };

  const addAlumnus = async (alum: Alumnus, userId: string) => {
    try {
      alum.alumniId = userId;
      alum.activeStatus = true;
      alum.regStatus = "pending";
      console.log(alum);
      await setDoc(doc(db, "alumni", userId), alum);
      return { success: true, message: "success" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const updateAlumnus = async (
    alumniId: string,
    alumniEmail: string,
    regStatus: string,
    alumniName: string
  ) => {
    try {
      const alumRef = doc(db, "alumni", alumniId);
      await setDoc(
        alumRef,
        {
          regStatus: regStatus,
          activeStatus: regStatus === "approved" ? true : false,
        },
        { merge: true }
      );
      const isApproved = regStatus === "approved";
      const data = await sendEmailTemplate(alumniEmail, alumniName, isApproved);
      if (data.success) {
        toastSuccess(data.message);
      } else toastError(data.message);

      return { success: true, message: "success" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const emailNewsLettertoAlums = async (
    title: string,
    content: string,
    photoURL: string,
    category: string
  ) => {
    try {
      const q = query(
        collection(db, "alumni"),
        where("activeStatus", "==", true),
        where("subscribeToNewsletter", "==", true)
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.docs.map(
        async (doc: QueryDocumentSnapshot<DocumentData, DocumentData>) =>
          await sendEmailTemplateForNewsletter(
            photoURL,
            title,
            content,
            doc.data().email,
            category
          )
      );
      // const data =
      // if (data.success) {
      //   toastSuccess(data.message);
      // } else toastError(data.message);
    } catch (error) {
      console.error("Error sending newsletter:", error);
    }
  };

  const subscribeToUsers = () => {
    setLoading(true);
    const q = query(collection(db, "alumni"));

    //listener for any changes
    const unsubscribeUsers = onSnapshot(
      q,
      (querySnapshot: any) => {
        const userList = querySnapshot.docs.map(
          (doc: any) => doc.data() as Alumnus
        );
        setAlums(userList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    );

    return unsubscribeUsers;
  };

  const subscribeToActiveUsers = () => {
    setLoading(true);
    const q = query(
      collection(db, "alumni"),
      where("activeStatus", "==", true)
    );

    //listener for any changes
    const unsubscribeActiveUsers = onSnapshot(
      q,
      (querySnapshot: any) => {
        const activeUserList = querySnapshot.docs.map(
          (doc: any) => doc.data() as Alumnus
        );
        setActiveAlums(activeUserList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    );

    return unsubscribeActiveUsers;
  };
  return (
    <AlumContext.Provider
      value={{
        alums,
        isLoading,
        addAlumnus,
        activeAlums,
        myCareer,
        myEducation,
        updateAlumnus,
        emailNewsLettertoAlums,
      }}
    >
      {children}
    </AlumContext.Provider>
  );
}

export const useAlums = () => useContext(AlumContext);

/*
References:
https://firebase.google.com/docs/firestore/query-data/listen
*/
