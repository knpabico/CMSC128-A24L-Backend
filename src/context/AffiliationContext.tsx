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
import { Affiliation } from "@/models/models";
import { FirebaseError } from "firebase/app";
import { toast } from "sonner";

const AffiliationContext = createContext<any>(null);




export function AffiliationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userAffiliation, setUserAffiliation] = useState<
    Affiliation[]
  >([]);

  const [selectedAlumniId, setSelectedAlumniId] = useState<string | null>(null);
  const [selectedAlumAffiliation, setSelectedAlumAffiliation] = useState<Affiliation[]>([]);

  const [allAffiliation, setAllAffiliation] = useState<Affiliation[]>(
    []
  );
  const [isLoading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    let unsubscribe: (() => void) | null;
    let unsubscribeUser: (() => void) | null;

    if (user) {
      unsubscribe = subscribeToAffiliation(); //for work experience of all users
      unsubscribeUser = subscribeToUserAffiliation(); //for work experience of current user
    } else {
      setUserAffiliation([]); //reset current user's work experience
      setAllAffiliation([]); //reset all work experience
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

  const addAffiliation = async (
    AffiliationEntry: Affiliation,
    userId: string
  ) => {
    try {
      const newDocRef = doc(collection(db, "affiliation"));
      AffiliationEntry.affiliationId = newDocRef.id;
      AffiliationEntry.alumniId = userId;
      await setDoc(newDocRef, AffiliationEntry);

      toast.success("Affiliation added successfully!");
      return { success: true, message: "success" };
    } catch (error) {

      toast.error((error as FirebaseError).message);
      return { success: false, message: (error as FirebaseError).message };
    }
  };


  //function to fetch the working experience of the clicked alumni
  const fetchAffiliation = async (alumniId: string): Promise<Affiliation[]> => {
    setLoading(true);
    setSelectedAlumniId(alumniId);
  
    try {
      const q = query(collection(db, "affiliation"), where("alumniId", "==", alumniId));
        
      const querySnapshot = await getDocs(q);
      
      console.log("firestore Data:", querySnapshot.docs.map(doc => doc.data()));
  
      const AffiliationList: Affiliation[] = querySnapshot.docs.map((doc) => doc.data() as Affiliation);
      
      console.log("Fetched Work Experience:", AffiliationList);
      // sortExperienceList(AffiliationList);
      setSelectedAlumAffiliation(AffiliationList);  
      return AffiliationList;
    } catch (error) {
      console.error("Error fetching work experience:", error);
      setSelectedAlumAffiliation([]);
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  

  const editAffiliation = async (AffiliationEntry: { AffiliationId: string; }) => {
    try {
      console.log(AffiliationEntry);
      const workExpRef = doc(
        db,
        "affiliation",
        AffiliationEntry.AffiliationId
      );
      await updateDoc(workExpRef, AffiliationEntry);
      return { success: true, message: "Edited Successfully" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const deleteAffiliation = async (id: string) => {
    try {
      await deleteDoc(doc(db, "affiliation", id));
      return { success: true, message: `Successfully Deleted!` };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  //for fetching work experience of all users
  const subscribeToAffiliation = () => {
    setLoading(true);
    const q = query(collection(db, "affiliation"));

    //listener for any changes
    const unsubscribeAllAffiliation = onSnapshot(
      q,
      (querySnapshot: any) => {
        const allAffiliationList = querySnapshot.docs.map(
          (doc: any) => doc.data() as Affiliation
        );

        setAllAffiliation(allAffiliationList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching work experience of all users:", error);
        setLoading(false);
      }
    );

    return unsubscribeAllAffiliation;
  };

  //for fetching work experience of current user
  const subscribeToUserAffiliation = () => {
    setLoading(true);
    const q = query(
      collection(db, "affiliation"),
      where("alumniId", "==", user?.uid)
    );

    //listener for any changes
    const unsubscribeUserAffiliation = onSnapshot(
      q,
      (querySnapshot: any) => {
        const userAffiliationList = querySnapshot.docs.map(
          (doc: any) => doc.data() as Affiliation
        );
        // sortExperienceList(userAffiliationList);

        setUserAffiliation(userAffiliationList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching work experience of current user:", error);
        setLoading(false);
      }
    );

    return unsubscribeUserAffiliation;
  };

  return (
    <AffiliationContext.Provider
      value={{
        userAffiliation,
        allAffiliation,
        isLoading,
        addAffiliation,
        deleteAffiliation,
        editAffiliation,
        fetchAffiliation
      }}
    >
      {children}
    </AffiliationContext.Provider>
  );
}

export const useAffiliation = () => useContext(AffiliationContext);
