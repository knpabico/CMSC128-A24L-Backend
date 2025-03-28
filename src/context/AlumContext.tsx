"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  setDoc,
  doc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { Alumnus } from "@/models/models";
import { FirebaseError } from "firebase-admin/app";
const AlumContext = createContext<any>(null);

export function AlumProvider({ children }: { children: React.ReactNode }) {
  const [alums, setAlums] = useState<Alumnus[]>([]);
  const [activeAlums, setActiveAlums] = useState<Alumnus[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    let unsubscribe: (() => void) | null;
    let unsubscribeActive: (() => void) | null;

    if (user) {
      unsubscribe = subscribeToUsers(); //maglilisten sa firestore
      unsubscribeActive = subscribeToActiveUsers();
    } else {
      setAlums([]); //reset once logged out
      setActiveAlums([]);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe(); //stops listening after logg out
      }
      if (unsubscribeActive) {
        unsubscribeActive();
      }
    };
  }, [user]);

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
    <AlumContext.Provider value={{ alums, isLoading, addAlumnus, activeAlums }}>
      {children}
    </AlumContext.Provider>
  );
}

export const useAlums = () => useContext(AlumContext);

/*
References:
https://firebase.google.com/docs/firestore/query-data/listen
*/
