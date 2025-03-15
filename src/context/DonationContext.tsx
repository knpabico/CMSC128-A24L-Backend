"use client";
import { Donation } from "@/models/models";
import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot, query, setDoc, doc, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";

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
  const [userDonations, setUserDonations] = useState<Donation[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { alumInfo } = useAuth();
  const alumniId = alumInfo?.alumniId;

  useEffect(() => {
    if (!alumniId) return;
    setIsLoading(true);

    const donationsQuery = query(
      collection(db, "donation"),
      where("alumniId", "==", alumniId),
      orderBy("date", "desc"),
    );

    // set up the real time data collection listener
    const unsubscribe =  onSnapshot(
      donationsQuery,
      (snapshot) => {
        const donations = snapshot.docs.map((doc) => ({
          donationId: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate().toISOString(), // Convert Firestore Timestamp
        } as Donation));

        setUserDonations(donations);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching donations:", error);
        setError("Failed to fetch donations.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [alumniId]);

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
