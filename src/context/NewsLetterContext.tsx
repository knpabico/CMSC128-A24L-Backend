"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { useSearchParams } from "next/navigation";
import { NewsletterItem } from "@/models/models";
import { FirebaseError } from "firebase-admin";

const NewsLetterContext = createContext<any>(null);

export function NewsLetterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort"); //get current sort param
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

  }, [user, sort]);

  const subscribeToNewsLetters = () => {
    setLoading(true);

    //default (newest first)
    let q = query(
      collection(db, "newsletter_items"),
      orderBy("dateSent", "desc")
    );

    //oldest first
    if (sort === "of") {
      q = query(collection(db, "newsletter_items"), orderBy("dateSent", "asc"));
    }

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

  const addNewsLetter = async (newsLetter: NewsletterItem, referenceId: string, category: string) => {
      try {
        const docRef = doc(collection(db, "newsletter"));
        newsLetter.newsletterId = docRef.id;
        newsLetter.referenceId = referenceId;
        newsLetter.category = category;
        newsLetter.timestamp = new Date();
        await setDoc(docRef, newsLetter);
        return { success: true, message: "success" };
      } catch (error) {
        return { success: false, message: (error as FirebaseError).message };
      }
    };

  return (
    <NewsLetterContext.Provider value={{ newsLetters, isLoading, addNewsLetter}}>
      {children}
    </NewsLetterContext.Provider>
  );
}

export const useNewsLetters = () => useContext(NewsLetterContext);
