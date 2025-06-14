"use client";

import { toastError, toastSuccess } from "@/components/ui/sonner";
import { sendEmailTemplate } from "@/lib/emailTemplate";
import { db } from "@/lib/firebase";
import { uploadImage } from "@/lib/upload";
import { Alumnus, Career, Education } from "@/models/models";
import { RegStatus } from "@/types/alumni/regStatus";
import { FirebaseError } from "firebase/app";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
const AlumContext = createContext<any>(null);

export function AlumProvider({ children }: { children: React.ReactNode }) {
  const [alums, setAlums] = useState<Alumnus[]>([]);
  const [activeAlums, setActiveAlums] = useState<Alumnus[]>([]);
  const [myCareer, setCareer] = useState<Career[]>([]);
  const [myEducation, setEducation] = useState<Education[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const { user, isAdmin } = useAuth();
  const [totalAlums, setTotalAlums] = useState<number>(0);
  const [activeAlumsTotal, setActiveAlumsTotal] = useState<number>(0);

  useEffect(() => {
    let unsubscribe: (() => void) | null;
    let unsubscribeActive: (() => void) | null;
    let unsubscribeCareer: (() => void) | null;
    let unsubscribeEducation: (() => void) | null;

    if (isAdmin) {
      unsubscribe = subscribeToUsers();
      unsubscribeActive = subscribeToActiveUsers();
    } else if (user) {
      unsubscribe = subscribeToUsers(); //maglilisten sa firestore
      unsubscribeCareer = subscribeToMyCareer();
      unsubscribeEducation = subscribeToMyEducation();
    } else {
      setAlums([]); //reset once logged out
      setActiveAlums([]);
      setCareer([]);
      setLoading(false);
      setTotalAlums(0);
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
      const docSnap = await getDoc(alumniRef); // Fetch current data to check for existing fields

      const updatedData: any = {}; // Will hold fields to update

      if (docSnap.exists()) {
        const currentData = docSnap.data();

        // Only update fields that have changed
        if (firstName !== currentData.firstName)
          updatedData.firstName = firstName ?? "";
        if (middleName !== currentData.middleName)
          updatedData.middleName = middleName ?? "";
        if (lastName !== currentData.lastName)
          updatedData.lastName = lastName ?? "";
        if (suffix !== currentData.suffix) updatedData.suffix = suffix ?? "";
        if (email !== currentData.email) updatedData.email = email ?? "";
        if (studentNumber !== currentData.studentNumber)
          updatedData.studentNumber = studentNumber ?? "";
        if (address !== currentData.address)
          updatedData.address = address ?? [];
        if (fieldOfInterest !== currentData.fieldOfInterest)
          updatedData.fieldOfInterest = fieldOfInterest ?? [];
        if (contactPrivacy !== currentData.contactPrivacy)
          updatedData.contactPrivacy = contactPrivacy ?? false;

        // If there's any updated data, update the document
        if (Object.keys(updatedData).length > 0) {
          await updateDoc(alumniRef, updatedData);
        }
      }
      toast.success("Profile updated successfully!");
      return { success: true, message: "Your changes are successfully saved" };
    } catch (error) {
      console.error("Error:", error);

      toast.error("Profile update failed. Please try again.");
      return { success: false, error: error.message };
    }
  };

  //for fetching the photo of alumni
  const uploadAlumniPhoto = async (alum: Alumnus, imageFile: any) => {
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

    // Listener for any changes
    const unsubscribeUsers = onSnapshot(
      q,
      (querySnapshot: any) => {
        const userList = querySnapshot.docs.map(
          (doc: any) => doc.data() as Alumnus
        );
        setAlums(userList);

        const nonPendingAlums = userList.filter(
          (user: Alumnus) =>
            user.regStatus !== "pending" && user.regStatus !== "rejected"
        );
        console.log(nonPendingAlums.length, "non-pending total");
        setTotalAlums(nonPendingAlums.length);

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
        setActiveAlumsTotal(activeUserList.length);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching users:", error);
        setLoading(false);
      }
    );

    return unsubscribeActiveUsers;
  };

  const getActiveAlums = (alums: Alumnus[]) => {
    if (!alums) {
      return 0;
    } else {
      const activeAlums = alums.filter((alum) => alum.activeStatus === true);
      console.log(activeAlums, "this is activeAlums");
      return activeAlums;
    }
  };
  const getInactiveAlums = (alums: Alumnus[]) => {
    if (!alums) {
      return 0;
    } else {
      const inactiveAlums = alums.filter((alum) => alum.activeStatus === false);
      console.log(activeAlums, "this is activeAlums");
      return inactiveAlums;
    }
  };

  //use to handle approve and rejecion
  const onUpdateRegStatus = async (alumniId: string, regStatus: RegStatus) => {
    try {
      const alumniRef = doc(db, "alumni", alumniId);

      const updateData = {
        regStatus: regStatus,
      };
      if (regStatus === "approved") {
        await updateDoc(alumniRef, { activeStatus: true });
        console.log("TOTOO ANG HIMALA");
      }
      await updateDoc(alumniRef, { regStatus: regStatus });

      return { success: true };
    } catch (error) {
      console.error("Failed to update alumni registration status:", error);
      return { success: false, message: (error as Error).message };
    }
  };

  const getPendingAlums = (alums: Alumnus[]) => {
    if (!alums) {
      return 0;
    } else {
      const pendingAlums = alums.filter((alum) => alum.regStatus === "pending");
      console.log(pendingAlums, "this is pending Alums");
      return pendingAlums;
    }
  };
  const updateAlumnusActiveStatus = (alumniId: string, newStatus: boolean) => {
    // Update in your database/backend
    // Then update your local state
    setAlums((prevAlums) =>
      prevAlums.map((alum) =>
        alum.alumniId === alumniId ? { ...alum, activeStatus: newStatus } : alum
      )
    );
  };

  //update the registration status from pending to approved
  const updateAlumnusRegStatus = async (
    alumniId: string,
    newStatus: RegStatus
  ) => {
    try {
      const alumnusRef = doc(db, "alumni", alumniId);
      await updateDoc(alumnusRef, { regStatus: newStatus });

      setAlums((prevAlums) =>
        prevAlums.map((alum) =>
          alum.alumniId === alumniId ? { ...alum, regStatus: newStatus } : alum
        )
      );

      console.log(`Updated regStatus for ${alumniId} to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update regStatus in Firebase:", error);
    }
  };

  const getAlumEmailById = async (alumniId: string) => {
    const alumRef = doc(db, "alumni", alumniId);
    const docSnap = await getDoc(alumRef);
    return docSnap.data()?.email;
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
        updateAlumnusActiveStatus,
        totalAlums,
        getActiveAlums,
        getInactiveAlums,
        getPendingAlums,
        updateAlumnusRegStatus,
        onUpdateRegStatus,
        getAlumEmailById,
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
