"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Define the Scholarship interface
export interface Scholarship {
  scholarshipId: string;
  title: string;
  description: string;
  alumList: string[];
  datePosted: Date;
}

interface ScholarshipContextType {
  scholarships: Scholarship[];
  loading: boolean;
  error: string | null;
  refreshScholarships: () => Promise<void>;
}

const ScholarshipContext = createContext<ScholarshipContextType | undefined>(undefined);

export const useScholarship = () => {
  const context = useContext(ScholarshipContext);
  if (context === undefined) {
    throw new Error('useScholarship must be used within a ScholarshipProvider');
  }
  return context;
};

interface ScholarshipProviderProps {
  children: ReactNode;
}

export const ScholarshipProvider: React.FC<ScholarshipProviderProps> = ({ children }) => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch scholarships
  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const scholarshipsRef = collection(db, 'scholarship');
      const q = query(scholarshipsRef, orderBy('datePosted', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const scholarshipsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          scholarshipId: doc.id,
          title: data.title,
          description: data.description,
          alumList: data.alumList || [],
          datePosted: data.datePosted?.toDate() || new Date(),
        } as Scholarship;
      });
      
      setScholarships(scholarshipsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching scholarships:", err);
      setError("Failed to load scholarships");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  const value = {
    scholarships,
    loading,
    error,
    refreshScholarships: fetchScholarships
  };

  return (
    <ScholarshipContext.Provider value={value}>
      {children}
    </ScholarshipContext.Provider>
  );
};