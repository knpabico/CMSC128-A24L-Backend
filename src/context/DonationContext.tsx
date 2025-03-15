"use client";
import { Donation } from "@/models/models";
import { createContext, useContext, useEffect, useState } from "react";
import { getUserDonations } from "@/data/donation";
import { useAuth } from "./AuthContext";

// type of context
type DonationContextType = {
  userDonations: Donation[] | null;
  isLoading: boolean;
};

const DonationContext = createContext<DonationContextType | null>(null);

export const DonationContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userDonations, setUserDonations] = useState<Donation[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { alumInfo } = useAuth();
  const alumniId = alumInfo?.alumniId;

  useEffect(() => {
    if (!alumniId) return;

    setIsLoading(true);
    getUserDonations(alumniId).then((data) => {
      setUserDonations(data);
      setIsLoading(false);
    });
  }, [alumniId]);

  return (
    <DonationContext.Provider
      value={{
        userDonations,
        isLoading,
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
