"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  Suspense,
} from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { useSearchParams } from "next/navigation";
import { NewsletterItem } from "@/models/models";
import { FirebaseError } from "firebase-admin";
import { emailNewsLettertoAlums } from "@/lib/emailTemplate";

const NewsLetterContext = createContext<any>(null);

// Context implementation separated from the provider wrapper
function NewsLetterContextProvider({
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
    let q = query(collection(db, "newsletter"), orderBy("timestamp", "desc"));

    //oldest first
    if (sort === "of") {
      q = query(collection(db, "newsletter"), orderBy("timestamp", "asc"));
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

  const addNewsLetter = async (referenceId: string, category: string) => {
    try {
      const docRef = doc(collection(db, "newsletter"));
      const newsLetter: NewsletterItem = {
        newsletterId: docRef.id,
        referenceId: referenceId,
        category: category,
        timestamp: new Date(),
      };
      await setDoc(docRef, newsLetter);
      await emailNewsLettertoAlums(referenceId, category);
      return { success: true, message: "Newsletter created successfully" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  const deleteNewsLetter = async (referenceId: string) => {
    try {
      const q = query(
        collection(db, "newsletter"),
        orderBy("timestamp", "desc")
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach(async (doc) => {
          if (doc.data().referenceId === referenceId) {
            await deleteDoc(doc.ref);
          }
        });
      });

      return { success: true, message: "Newsletter deleted successfully" };
    } catch (error) {
      return { success: false, message: (error as FirebaseError).message };
    }
  };

  return (
    <NewsLetterContext.Provider
      value={{ newsLetters, isLoading, addNewsLetter, deleteNewsLetter }}
    >
      {children}
    </NewsLetterContext.Provider>
  );
}

// Wrapper component with Suspense
export function NewsLetterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div>Loading newsletter data...</div>}>
      <NewsLetterContextProvider>{children}</NewsLetterContextProvider>
    </Suspense>
  );
}

export const useNewsLetters = () => useContext(NewsLetterContext);
