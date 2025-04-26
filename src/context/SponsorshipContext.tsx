"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs, doc, getDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from "@/lib/firebase"; 
import { Sponsorship } from '@/models/models';

// Define the context interface
interface SponsorshipContextType {
  sponsorships: Sponsorship[];
  loading: boolean;
  error: string | null;
  getSponsorshipById: (id: string) => Promise<Sponsorship | null>;
  getSponsorshipsByCreatorId: (creatorId: string) => Promise<Sponsorship[]>;
  getSponsorshipsByStatus: (status: string) => Promise<Sponsorship[]>;
  refreshSponsorships: () => Promise<void>;
}

// Create the context with a default value
const SponsorshipContext = createContext<SponsorshipContextType>({
  sponsorships: [],
  loading: false,
  error: null,
  getSponsorshipById: async () => null,
  getSponsorshipsByCreatorId: async () => [],
  getSponsorshipsByStatus: async () => [],
  refreshSponsorships: async () => {}
});

// Provider component
export const SponsorshipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all sponsorships
  const fetchSponsorships = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const sponsorshipCollection = collection(db, 'sponsorship');
      const sponsorshipSnapshot = await getDocs(sponsorshipCollection);
      
      const sponsorshipList = sponsorshipSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          sponsorshipId: doc.id,
        } as Sponsorship;
      });
      
      setSponsorships(sponsorshipList);
    } catch (err) {
      console.error('Error fetching sponsorships:', err);
      setError('Failed to fetch sponsorships. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Get a single sponsorship by ID
  const getSponsorshipById = async (id: string): Promise<Sponsorship | null> => {
    try {
      const sponsorshipDoc = doc(db, 'sponsorship', id);
      const sponsorshipSnap = await getDoc(sponsorshipDoc);
      
      if (sponsorshipSnap.exists()) {
        return { ...sponsorshipSnap.data(), sponsorshipId: sponsorshipSnap.id } as Sponsorship;
      } else {
        return null;
      }
    } catch (err) {
      console.error('Error fetching sponsorship by ID:', err);
      setError('Failed to fetch sponsorship details.');
      return null;
    }
  };

  // Get sponsorships by creator ID
  const getSponsorshipsByCreatorId = async (creatorId: string): Promise<Sponsorship[]> => {
    try {
      const q = query(
        collection(db, 'sponsorship'),
        where('creatorId', '==', creatorId)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        sponsorshipId: doc.id
      } as Sponsorship));
    } catch (err) {
      console.error('Error fetching sponsorships by creator:', err);
      setError('Failed to fetch creator sponsorships.');
      return [];
    }
  };

  // Get sponsorships by status
  const getSponsorshipsByStatus = async (status: string): Promise<Sponsorship[]> => {
    try {
      const q = query(
        collection(db, 'sponsorship'),
        where('status', '==', status),
        orderBy('dateSuggested', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        sponsorshipId: doc.id
      } as Sponsorship));
    } catch (err) {
      console.error('Error fetching sponsorships by status:', err);
      setError('Failed to fetch sponsorships by status.');
      return [];
    }
  };

  // Function to refresh sponsorships data
  const refreshSponsorships = async (): Promise<void> => {
    await fetchSponsorships();
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchSponsorships();
  }, []);

  // Context value
  const value = {
    sponsorships,
    loading,
    error,
    getSponsorshipById,
    getSponsorshipsByCreatorId,
    getSponsorshipsByStatus,
    refreshSponsorships
  };

  return (
    <SponsorshipContext.Provider value={value}>
      {children}
    </SponsorshipContext.Provider>
  );
};

export const useSponsorships = () => useContext(SponsorshipContext);

// Custom hook for using the context
// export const useSponsorships = (): SponsorshipContextType => {
//   const context = useContext(SponsorshipContext);
//   return context;
// };