"use client";
import { Donation, DonationDrive } from "@/models/models";
import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  doc,
  where,
  getDocs,
  updateDoc,
  getDoc,
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
  getCampaignName: (donationDriveId: string) => Promise<string>;
  updateDonationAnonymity: (
    donationId: string,
    isAnonymous: boolean
  ) => Promise<void>;
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
  const [campaignNameCache, setCampaignNameCache] = useState<
    Record<string, string>
  >({});

  const { alumInfo, user, isAdmin } = useAuth();

  const alumniId = user?.uid;

  useEffect(() => {
    let unsubscribe: (() => void) | null | undefined;

    if (user || isAdmin) {
      unsubscribe = subscribeToDonations(); //maglilisten sa firestore
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
          (doc) =>
            ({
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
        (doc) =>
          ({
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
  const getDonationsByAlumni = async (
    alumniId: string
  ): Promise<Donation[]> => {
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
        (doc) =>
          ({
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
  const getDonationsByDonationDrive = async (
    donationDriveId: string
  ): Promise<Donation[]> => {
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
        (doc) =>
          ({
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

  // Get campaign name by donation drive ID
  const getCampaignName = async (donationDriveId: string): Promise<string> => {
    if (!donationDriveId) {
      return "Unknown campaign";
    }

    // Check if we have this campaign name cached
    if (campaignNameCache[donationDriveId]) {
      return campaignNameCache[donationDriveId];
    }

    try {
      // Get the donation drive document
      const driveDocRef = doc(db, "donationDrive", donationDriveId);
      const driveDoc = await getDoc(driveDocRef);

      if (driveDoc.exists()) {
        const driveData = driveDoc.data() as DonationDrive;
        const campaignName = driveData.campaignName || "Unnamed Campaign";

        // Cache the result for future use
        setCampaignNameCache((prev) => ({
          ...prev,
          [donationDriveId]: campaignName,
        }));

        return campaignName;
      } else {
        return "Unknown campaign";
      }
    } catch (error) {
      console.error("Error fetching campaign name:", error);
      return "Unknown campaign";
    }
  };

  // Update donation anonymity
  const updateDonationAnonymity = async (
    donationId: string,
    isAnonymous: boolean
  ): Promise<void> => {
    if (!donationId) {
      throw new Error("No donation ID provided");
    }

    try {
      // Update the donation document
      const donationRef = doc(db, "donation", donationId);
      await updateDoc(donationRef, {
        isAnonymous: isAnonymous,
      });

      // Update local state if this donation is in userDonations
      if (userDonations) {
        const updatedDonations = userDonations.map((donation) =>
          donation.donationId === donationId
            ? { ...donation, isAnonymous }
            : donation
        );
        setUserDonations(updatedDonations);
      }
    } catch (error) {
      console.error("Error updating donation anonymity:", error);
      setError("Failed to update donation anonymity status.");
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
        getDonationsByDonationDrive,
        getCampaignName,
        updateDonationAnonymity,
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
