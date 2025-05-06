"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  setDoc,
  doc,
  where,
  getDoc,
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
import { uploadImage } from "@/lib/upload";
import { messaging } from "firebase-admin";


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

  //for updateing changes of alumni

  const updateAlumniDetails = async (
    alum: Alumnus,
    firstName: string,
    middleName: string,
    lastName: string,
    suffix: string,
    email: string,
    studentNumber: string,
    address: string[],
    fieldOfInterest: string[],
    contactPrivacy: boolean
  ) => {
    try {
      const alumniRef = doc(db, "alumni", alum.alumniId);
      const docSnap = await getDoc(alumniRef);  // Fetch current data to check for existing fields
  
      const updatedData: any = {};  // Will hold fields to update
  
      if (docSnap.exists()) {
        const currentData = docSnap.data();
        
        // Only update fields that have changed
        if (firstName !== currentData.firstName) updatedData.firstName = firstName ?? "";
        if (middleName !== currentData.middleName) updatedData.middleName = middleName ?? "";
        if (lastName !== currentData.lastName) updatedData.lastName = lastName ?? "";
        if (suffix !== currentData.suffix) updatedData.suffix = suffix ?? "";
        if (email !== currentData.email) updatedData.email = email ?? "";
        if (studentNumber !== currentData.studentNumber) updatedData.studentNumber = studentNumber ?? "";
        if (address !== currentData.address) updatedData.address = address ?? [];
        if (fieldOfInterest !== currentData.fieldOfInterest) updatedData.fieldOfInterest = fieldOfInterest ?? [];
        if (contactPrivacy !== currentData.contactPrivacy) updatedData.contactPrivacy = contactPrivacy ?? false;
  
        // If there's any updated data, update the document
        if (Object.keys(updatedData).length > 0) {
          await updateDoc(alumniRef, updatedData);
        }
      }
  
      return { success: true, message: "Your changes are successfully saved" };
    } catch (error) {
      console.error("Error:", error);
      return { success: false, error: error.message };
    }
  };

  //for fetching the photo of alumni
  const uploadAlumniPhoto = async (alum:Alumnus, imageFile:any) => {
    try {
      //uploading
      const data = await uploadImage(imageFile, `alumni/${user?.uid}`);
      if (!data.success) {
        throw new Error(data.result);
      }

      // Update the Firestore document with the image URL
      const alumniRef = doc(db, "alumni", alum.alumniId);
      await updateDoc(alumniRef, { image: data.url });

      return { success: true, url: data.url };
    } catch (error) {
      console.error("Error uploading alumni photo:", error);
      return { success: false, error: error.message };
    }
  };

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

  //birthdayy
  const handleUpdateBirthday = async (alumniId: string, birthDate: Date) => {
    try {
      const alumniRef = doc(db, "alumni", alumniId);
      await updateDoc(alumniRef, { birthDate });
      return { success: true };
    } catch (error) {
      console.error("Failed to update birthday:", error);
      return { success: false, message: (error as Error).message };
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
        uploadAlumniPhoto,
        handleUpdateBirthday,
        updateAlumniDetails,
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
