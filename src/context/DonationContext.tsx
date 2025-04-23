"use client";
import { Donation } from "@/models/models";
import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  setDoc,
  doc,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { useSearchParams } from "next/navigation";

// type of context
type DonationContextType = {
  userDonations: Donation[] | null;
  isLoading: boolean;
  error: string | null;
};

const DonationContext = createContext<DonationContextType | null>(null);

export const DonationContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort"); //get current sort param
  const [userDonations, setUserDonations] = useState<Donation[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { alumInfo, user, isAdmin } = useAuth();

  const alumniId = user?.uid;

  useEffect(() => {
    let unsubscribe: (() => void) | null | undefined;

    if (user || isAdmin) {
      unsubscribe = subscribeToDonations(); //maglilisten sa firestore
    } else {
      setUserDonations([]); //reset once logged out
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe(); //stops listening after logg out
      }
    };
  }, [user, sort]);

  const subscribeToDonations = () => {
    if (!alumniId) {
      console.log("HAAAAAAAAAAA");
      return;
    }
    setIsLoading(true);

    //default most recent first
    let donationsQuery = query(
      collection(db, "donation"),
      where("alumniId", "==", alumniId),
      orderBy("date", "desc")
    );

    if (sort === "odf") {
      //oldest donation first
      donationsQuery = query(
        collection(db, "donation"),
        where("alumniId", "==", alumniId),
        orderBy("date", "asc")
      );
    } else if (sort === "asc") {
      //amount donated (asc)
      donationsQuery = query(
        collection(db, "donation"),
        where("alumniId", "==", alumniId),
        orderBy("amount", "asc")
      );
    } else if (sort === "desc") {
      //amount donated (desc)
      donationsQuery = query(
        collection(db, "donation"),
        where("alumniId", "==", alumniId),
        orderBy("amount", "desc")
      );
    }

    console.log("DONATIONS:", donationsQuery);

    const unsubscribeDonation = onSnapshot(
      donationsQuery,
      (snapshot) => {
        const donations = snapshot.docs.map(
          (doc) =>
            ({
              donationId: doc.id,
              ...doc.data(),
              date: doc.data().date.toDate().toISOString(), // Convert Firestore Timestamp
            } as Donation)
        );

        setUserDonations(donations);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching donations:", error);
        setError("Failed to fetch donations.");
        setIsLoading(false);
      }
    );

    return unsubscribeDonation;
  };

  return (
    <DonationContext.Provider
      value={{
        userDonations,
        isLoading,
        error,
      }}
    >
      {children}
    </DonationContext.Provider>
  );
};

export const useDonationContext = () => {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error(
      "useDonationContext must be used within a DonationContextProvider"
    );
  }
  return context;
};
