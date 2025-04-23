"use client";
import { Donation } from "@/models/models";
import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  doc,
  where,
  getDocs
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";

// type of context
type DonationContextType = {
  userDonations: Donation[] | null;
  isLoading: boolean;
  error: string | null;
  getAllDonations: () => Promise<Donation[]>;
  getDonationsByAlumni: (alumniId: string) => Promise<Donation[]>;
  getDonationsByDonationDrive: (donationDriveId: string) => Promise<Donation[]>;
};

const DonationContext = createContext<DonationContextType | null>(null);

export const DonationContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userDonations, setUserDonations] = useState<Donation[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const alumniId = user?.uid;

  useEffect(() => {
    let unsubscribe: (() => void) | null | undefined;

    if (user) {
      unsubscribe = subscribeToDonations();
    } else {
      setUserDonations([]);
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const subscribeToDonations = () => {
    if (!alumniId) {
      return;
    }
    setIsLoading(true);

    // Basic query to get all donations for the current user
    const donationsQuery = query(
      collection(db, "donation"),
      where("alumniId", "==", alumniId)
    );

    console.log("FETCHING DONATIONS");

    const unsubscribeDonation = onSnapshot(
      donationsQuery,
      (snapshot) => {
        const donations = snapshot.docs.map(
          (doc) => ({
            donationId: doc.id,
            ...doc.data(),
            date: doc.data().date.toDate(),
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

  // Get all donations (for admin use)
  const getAllDonations = async (): Promise<Donation[]> => {
    setIsLoading(true);
    
    try {
      const donationsQuery = query(collection(db, "donation"));
      const snapshot = await getDocs(donationsQuery);
      
      const donations = snapshot.docs.map(
        (doc) => ({
          donationId: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
        } as Donation)
      );
      
      setIsLoading(false);
      return donations;
    } catch (error) {
      console.error("Error fetching all donations:", error);
      setError("Failed to fetch all donations.");
      setIsLoading(false);
      throw error;
    }
  };

  // Get donations by alumni
  const getDonationsByAlumni = async (alumniId: string): Promise<Donation[]> => {
    if (!alumniId) {
      console.error("No alumni ID provided");
      return Promise.reject("No alumni ID provided");
    }

    setIsLoading(true);
    
    try {
      const donationsQuery = query(
        collection(db, "donation"),
        where("alumniId", "==", alumniId)
      );
      
      const snapshot = await getDocs(donationsQuery);
      
      const donations = snapshot.docs.map(
        (doc) => ({
          donationId: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
        } as Donation)
      );
      
      setIsLoading(false);
      return donations;
    } catch (error) {
      console.error("Error fetching donations by alumni:", error);
      setError("Failed to fetch donations for this alumni.");
      setIsLoading(false);
      throw error;
    }
  };

  // Get donations by donation drive (sponsorship)
  const getDonationsByDonationDrive = async (donationDriveId: string): Promise<Donation[]> => {
    if (!donationDriveId) {
      console.error("No sponsorship ID provided");
      return Promise.reject("No sponsorship ID provided");
    }

    // setIsLoading(true);
    
    try {
      const donationsQuery = query(
        collection(db, "donation"),
        where("donationDriveId", "==", donationDriveId)
      );
      
      const snapshot = await getDocs(donationsQuery);
      
      const donations = snapshot.docs.map(
        (doc) => ({
          donationId: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
        } as Donation)
      );
      
      // setIsLoading(false);
      return donations;
    } catch (error) {
      console.error("Error fetching donations by drive:", error);
      setError("Failed to fetch donations for this drive.");
      // setIsLoading(false);
      throw error;
    }
  };

  return (
    <DonationContext.Provider
      value={{
        userDonations,
        isLoading,
        error,
        getAllDonations,
        getDonationsByAlumni,
        getDonationsByDonationDrive
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