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
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { useSearchParams } from "next/navigation";

// type of context
type DonationContextType = {
  userDonations: Donation[] | null;
  isLoading: boolean;
  error: string | null;
  getDonationsBySponsorship: (sponsorshipId: string) => Promise<Donation[]>;
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

  const { alumInfo, user } = useAuth();

  const alumniId = user?.uid;

  useEffect(() => {
    let unsubscribe: (() => void) | null | undefined;

    if (user) {
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

  const getDonationsBySponsorship = async (sponsorshipId: string): Promise<Donation[]> => {
    try {
      // First, get all donations for this sponsorship without ordering
      const sponsorshipQuery = query(
        collection(db, "donation"),
        where("sponsorshipId", "==", sponsorshipId)
      );
  
      const snapshot = await getDocs(sponsorshipQuery);
  
      const sponsorshipDonations: Donation[] = snapshot.docs.map((doc) => ({
        donationId: doc.id,
        ...(doc.data() as Omit<Donation, "donationId" | "date">),
        date: doc.data().date.toDate().toISOString(), // convert Firestore timestamp
      }));
  
      // Sort the donations client-side by date in descending order
      return sponsorshipDonations.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (err) {
      console.error("Error fetching sponsorship donations:", err);
      throw new Error("Failed to fetch sponsorship donations.");
    }
  };

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
        getDonationsBySponsorship,
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