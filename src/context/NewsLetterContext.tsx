"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
const NewsLetterContext = createContext<any>(null);

export function NewsLetterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [newsLetters, setNewsLetters] = useState<any[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const { user } = useAuth();
  useEffect(() => {
    let unsubscribe: (() => void) | null;

    if (user) {
      unsubscribe = subscribeToNewsLetters(); //maglilisten sa firestore
    } else {
      setNewsLetters([]); //reset once logged out
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe(); //stops listening after logg out
      }
    };
  }, [user]);

  const subscribeToNewsLetters = () => {
    setLoading(true);
    const q = query(collection(db, "newsletter_items"));

    //listener for any changes
    const unsubscribeNewsLetters = onSnapshot(
      q,
      (querySnapshot: any) => {
        const userList = querySnapshot.docs.map((doc: any) => doc.data());
        setNewsLetters(userList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching newsletters:", error);
        setLoading(false);
      }
    );

    return unsubscribeNewsLetters;
  };
  return (
    <NewsLetterContext.Provider value={{ newsLetters, isLoading }}>
      {children}
    </NewsLetterContext.Provider>
  );
}

export const useNewsLetters = () => useContext(NewsLetterContext);
