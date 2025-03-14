"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot, query, setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";
import { JobOffering } from "@/models/models";
import { FirebaseError } from "firebase/app";
const JobOfferContext = createContext<any>(null);

export function JobOfferProvider({ children }: { children: React.ReactNode }) {
    const [jobOffers, setJobOffers] = useState<any[]>([]);
    const [isLoading, setLoading] = useState<boolean>(false);
    const { user } = useAuth();

    useEffect(() => {
        let unsubscribe: (() => void) | null;

        if (user) {
            unsubscribe = subscribeToJobOffers(); //maglilisten sa firestore
        } else {
            setJobOffers([]); //reset once logged out
            setLoading(false);
        }

        return () => {
            if (unsubscribe) {
                unsubscribe(); //stops listening after logg out
            }
        };
    }, [user]);

    const addJobOffer = async (jobOffer: JobOffering, userId: string) => {
        try{ 
            jobOffer.jobId = userId;
            jobOffer.status = "Pending";
            console.log(jobOffer);
            await setDoc(doc(db, "job_offering", userId), jobOffer);
            return { success: true, message: "success" };
        } catch (error) {
            return { success: false, message: (error as  FirebaseError).message };
        }
    };

    const subscribeToJobOffers = () => {
        setLoading(true);
        const q = query(collection(db, "job_offering"));

        //listener for any changes
        const unsubscribeJobOfffers = onSnapshot(q, (querySnapshot: any) => {
            const offers = querySnapshot.docs.map((doc: any) => doc.data() as JobOffering);
            setJobOffers(offers);
            setLoading(false);
        },
        (error) => {
            console.error("Error fetching job offers:", error);
            setLoading(false);
        }
    );

        return unsubscribeJobOfffers;
    };

    return (
        <JobOfferContext.Provider value={{ jobOffers, isLoading, addJobOffer }}>
            {children}
        </JobOfferContext.Provider>
    );
}

export const useJobOffer = () => useContext(JobOfferContext);