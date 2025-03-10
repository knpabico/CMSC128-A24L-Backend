"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot, query, setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { Alumnus } from "@/models/models";
import { FirebaseError } from "firebase/app";
const AlumContext = createContext<any>(null);

export function AlumProvider({ children }: { children: React.ReactNode }) {
  const [alums, setAlums] = useState<any[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    let unsubscribe: (() => void) | null;

    if (user) {
      unsubscribe = subscribeToUsers(); //maglilisten sa firestore
    } else {
      setAlums([]); //reset once logged out
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe(); //stops listening after logg out
      }
    };
  }, [user]);

  const addAlumnus = async (alum: Alumnus, userId: string) => {
    try {
      alum.alumniId = userId;
      alum.activeStatus = true;
      alum.regStatus = "Pending";
      console.log(alum);
      await setDoc(doc(db, "alumni", userId), alum);
      return { success: true, message: "success" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const subscribeToUsers = () => {
    setLoading(true);
    const q = query(collection(db, "alumni"));

    //listener for any changes
    const unsubscribeUsers = onSnapshot(
      q,
      (querySnapshot: any) => {
        const userList = querySnapshot.docs.map((doc: any) => doc.data());
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
  return (
    <AlumContext.Provider value={{ alums, isLoading, addAlumnus }}>
      {children}
    </AlumContext.Provider>
  );
}

export const useAlums = () => useContext(AlumContext);

/*
References:
https://firebase.google.com/docs/firestore/query-data/listen
*/
